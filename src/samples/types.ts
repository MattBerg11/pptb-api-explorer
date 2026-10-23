import type { ApiTarget, HttpMethod } from "../api";

/** A documented example request with a sample response. */
export interface SampleEndpoint {
    api: ApiTarget;
    group: string;
    method: HttpMethod;
    path: string;
    summary: string;
    notes: string[];
    docUrl?: string;
    requestHeaders?: Record<string, string>;
    body?: unknown;
    response: {
        status: number;
        headers: Record<string, string>;
        body: unknown;
    };
}
