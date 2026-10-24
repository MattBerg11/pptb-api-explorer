import type { HttpMethod } from "../api";
import { POWERPLATFORM_SAMPLES } from "./powerplatform";
import { SHAREPOINT_SAMPLES } from "./sharepoint";
import type { SampleEndpoint } from "./types";

export type { SampleEndpoint };

/** APIs PPTB cannot call live; Send answers from the sample instead. */
export const isSampleOnly = (api: string) => api === "sharepoint";

/** Samples to list for the selected API. All Power Platform areas share one list. */
export function samplesFor(api: string): SampleEndpoint[] {
    if (api === "sharepoint") return SHAREPOINT_SAMPLES;
    if (api.startsWith("pp:")) return POWERPLATFORM_SAMPLES;
    return [];
}

function normalize(path: string): string {
    const trimmed = path.trim().replace(/^\//, "");
    // A literal % (e.g. in a filter value) is not a valid escape; compare the raw text then.
    try {
        return decodeURIComponent(trimmed).toLowerCase();
    } catch {
        return trimmed.toLowerCase();
    }
}

export function findSample(api: string, method: HttpMethod, path: string): SampleEndpoint | undefined {
    return samplesFor(api).find((s) => s.api === api && s.method === method && normalize(s.path) === normalize(path));
}
