// Sends a request through the PPTB host. Tools never see tokens, so every call goes
// through window.dataverseAPI or window.powerplatformAPI. SharePoint has no host API,
// so its requests are answered from documented samples.

import { findSample } from "./samples";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export const PP_CATEGORIES = [
    "Analytics",
    "AppManagement",
    "Authorization",
    "Connectivity",
    "CopilotStudio",
    "Dynamics",
    "EnvironmentManagement",
    "Governance",
    "Licensing",
    "PowerApps",
    "PowerAutomate",
    "PowerPages",
    "ResourceQuery",
    "UserManagement",
    "WorkflowAgents",
] as const;

export type PPCategory = (typeof PP_CATEGORIES)[number];

/** "dataverse", "sharepoint" (samples) or "pp:<Category>" */
export type ApiTarget = "dataverse" | "sharepoint" | `pp:${PPCategory}`;

export interface RequestSpec {
    api: ApiTarget;
    method: HttpMethod;
    path: string;
    headers: Record<string, string>;
    body: string;
    /** Zero-based connection slot. */
    connection: number;
}

export interface ResponseView {
    ok: boolean;
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
    body: unknown;
    ms: number;
    /** True when the response is sample data, not a live call. */
    sample?: boolean;
}

function parseBody(body: string): unknown {
    const trimmed = body.trim();
    if (!trimmed) return undefined;
    try {
        return JSON.parse(trimmed);
    } catch {
        return trimmed;
    }
}

function errorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return typeof err === "string" ? err : JSON.stringify(err);
}

export async function send(spec: RequestSpec): Promise<ResponseView> {
    const started = performance.now();
    const headers = Object.keys(spec.headers).length ? spec.headers : undefined;
    const body = parseBody(spec.body);

    if (spec.api === "sharepoint") return sampleResponse(spec, started);

    try {
        if (spec.api === "dataverse") {
            // A one-operation $batch is the host's only Dataverse call that takes any
            // method and URL and returns status and headers.
            const [result] = await window.dataverseAPI.executeBatch(
                [{ method: spec.method, url: spec.path.replace(/^\//, ""), headers, body }],
                spec.connection,
            );
            return {
                ok: result.status < 400,
                status: result.status,
                statusText: result.statusText,
                headers: result.headers,
                body: result.body,
                ms: performance.now() - started,
            };
        }

        const category = spec.api.slice(3) as PPCategory;
        const client = window.powerplatformAPI[category];
        const path = spec.path.replace(/^\//, "");
        let result: unknown;
        switch (spec.method) {
            case "GET":
                result = await client.Get(path, spec.connection, headers);
                break;
            case "POST":
                result = await client.Post(path, body, spec.connection, headers);
                break;
            case "PUT":
                result = await client.Put(path, body, spec.connection, headers);
                break;
            case "PATCH":
                result = await client.Patch(path, body, spec.connection, headers);
                break;
            case "DELETE":
                result = await client.Delete(path, spec.connection, headers, body);
                break;
        }
        // The Power Platform client returns only the parsed body, not status or headers.
        return { ok: true, body: result, ms: performance.now() - started };
    } catch (err) {
        return { ok: false, body: errorMessage(err), ms: performance.now() - started };
    }
}

function sampleResponse(spec: RequestSpec, started: number): ResponseView {
    const match = findSample(spec.api, spec.method, spec.path);
    if (!match) {
        return {
            ok: false,
            sample: true,
            body: "No sample for this method and path. SharePoint calls are not live yet; pick one of the documented endpoints.",
            ms: performance.now() - started,
        };
    }
    return {
        ok: match.response.status < 400,
        sample: true,
        status: match.response.status,
        headers: match.response.headers,
        body: match.response.body,
        ms: performance.now() - started,
    };
}
