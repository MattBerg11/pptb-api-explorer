// Builds a browsable Dataverse endpoint catalog from the $metadata (CSDL) document.

import type { HttpMethod } from "./api";

export interface CatalogItem {
    kind: "table" | "function" | "action";
    name: string;
    method: HttpMethod;
    path: string;
    body: string;
    detail: string;
}

const cache = new Map<number, CatalogItem[]>();

function params(op: Element): Array<{ name: string; type: string }> {
    return Array.from(op.getElementsByTagName("Parameter")).map((p) => ({
        name: p.getAttribute("Name") ?? "",
        type: p.getAttribute("Type") ?? "",
    }));
}

export function parseCsdl(xml: string): CatalogItem[] {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const items: CatalogItem[] = [];

    for (const set of Array.from(doc.getElementsByTagName("EntitySet"))) {
        const name = set.getAttribute("Name") ?? "";
        items.push({
            kind: "table",
            name,
            method: "GET",
            path: `${name}?$top=10`,
            body: "",
            detail: set.getAttribute("EntityType") ?? "",
        });
    }

    // v1 lists unbound operations only; bound ones need a record or collection in the path.
    for (const fn of Array.from(doc.getElementsByTagName("Function"))) {
        if (fn.getAttribute("IsBound") === "true") continue;
        const name = fn.getAttribute("Name") ?? "";
        const ps = params(fn);
        const path = ps.length
            ? `${name}(${ps.map((p) => `${p.name}=@${p.name}`).join(",")})?${ps.map((p) => `@${p.name}=`).join("&")}`
            : `${name}()`;
        items.push({ kind: "function", name, method: "GET", path, body: "", detail: ps.map((p) => `${p.name}: ${p.type}`).join(", ") });
    }

    for (const act of Array.from(doc.getElementsByTagName("Action"))) {
        if (act.getAttribute("IsBound") === "true") continue;
        const name = act.getAttribute("Name") ?? "";
        const ps = params(act);
        const body = ps.length ? JSON.stringify(Object.fromEntries(ps.map((p) => [p.name, null])), null, 2) : "";
        items.push({ kind: "action", name, method: "POST", path: name, body, detail: ps.map((p) => `${p.name}: ${p.type}`).join(", ") });
    }

    return items.sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadCatalog(connection: number): Promise<CatalogItem[]> {
    const cached = cache.get(connection);
    if (cached) return cached;
    const xml = await window.dataverseAPI.getCSDLDocument(connection);
    const items = parseCsdl(xml);
    cache.set(connection, items);
    return items;
}
