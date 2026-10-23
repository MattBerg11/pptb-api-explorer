import "./style.css";
import { PP_CATEGORIES, send, type ApiTarget, type HttpMethod, type RequestSpec, type ResponseView } from "./api";
import { loadCatalog, type CatalogItem } from "./csdl";
import { findSample, isSampleOnly, samplesFor, type SampleEndpoint } from "./samples";
import { addHistory, getHistory, getSaved, loadStore, removeSaved, saveRequest, type SavedRequest } from "./store";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const apiSel = $<HTMLSelectElement>("api");
const connSel = $<HTMLSelectElement>("connection");
const methodSel = $<HTMLSelectElement>("method");
const pathInput = $<HTMLInputElement>("path");
const headersInput = $<HTMLTextAreaElement>("headers");
const bodyInput = $<HTMLTextAreaElement>("body");
const filterInput = $<HTMLInputElement>("filter");
const list = $<HTMLUListElement>("list");
const output = $<HTMLPreElement>("output");

type Tab = "endpoints" | "history" | "saved";
let tab: Tab = "endpoints";
let catalog: CatalogItem[] = [];
let lastBody = "";

const PLACEHOLDERS: Record<string, string> = {
    dataverse: "accounts?$select=name&$top=10",
    sharepoint: "_api/web",
    pp: "environments?api-version=2024-10-01",
};

function currentSpec(): RequestSpec {
    let headers: Record<string, string> = {};
    const raw = headersInput.value.trim();
    if (raw) headers = JSON.parse(raw);
    return {
        api: apiSel.value as ApiTarget,
        method: methodSel.value as HttpMethod,
        path: pathInput.value.trim(),
        headers,
        body: bodyInput.value,
        connection: Number(connSel.value) || 0,
    };
}

function applySpec(spec: Pick<RequestSpec, "method" | "path" | "body"> & Partial<RequestSpec>): void {
    if (spec.api) apiSel.value = spec.api;
    if (spec.connection !== undefined) connSel.value = String(spec.connection);
    methodSel.value = spec.method;
    pathInput.value = spec.path;
    bodyInput.value = spec.body;
    headersInput.value = spec.headers && Object.keys(spec.headers).length ? JSON.stringify(spec.headers, null, 2) : "";
    ($("body-wrap") as HTMLDetailsElement).open = !!spec.body;
    onApiChange(false);
    showDocs(findSample(apiSel.value, spec.method, spec.path) ?? null);
}

function onApiChange(reload = true): void {
    pathInput.placeholder = PLACEHOLDERS[apiSel.value] ?? PLACEHOLDERS.pp;
    connSel.disabled = apiSel.value === "sharepoint";
    if (reload) showDocs(null);
    if (reload && tab === "endpoints") void renderList();
}

async function renderList(): Promise<void> {
    const q = filterInput.value.toLowerCase();
    list.innerHTML = "";

    if (tab === "endpoints") {
        const samples = samplesFor(apiSel.value);
        if (samples.length) {
            let group = "";
            for (const sample of samples.filter((x) => `${x.summary} ${x.path}`.toLowerCase().includes(q))) {
                if (sample.group !== group) {
                    group = sample.group;
                    const h = document.createElement("li");
                    h.className = "group";
                    h.textContent = group;
                    list.appendChild(h);
                }
                addItem(sample.summary, `${sample.method} ${sample.path}`, () => applySample(sample), sample.method.toLowerCase());
            }
            return;
        }
        if (!catalog.length) {
            list.innerHTML = `<li class="hint">Loading Dataverse metadata...</li>`;
            try {
                catalog = await loadCatalog(Number(connSel.value) || 0);
            } catch (err) {
                list.innerHTML = `<li class="hint error">Could not load metadata: ${String(err)}</li>`;
                return;
            }
            list.innerHTML = "";
        }
        const matches = catalog.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 300);
        for (const item of matches) {
            addItem(item.name, `${item.kind} ${item.detail}`, () => applySpec({ method: item.method, path: item.path, body: item.body }), item.kind);
        }
        return;
    }

    const entries: SavedRequest[] = tab === "history" ? getHistory() : getSaved();
    for (const e of entries.filter((s) => s.name.toLowerCase().includes(q))) {
        const li = addItem(e.name, `${e.spec.api} · ${new Date(e.at).toLocaleString()}`, () => applySpec(e.spec));
        if (tab === "saved") {
            const del = document.createElement("button");
            del.textContent = "x";
            del.className = "del";
            del.title = "Delete";
            del.onclick = async (ev) => {
                ev.stopPropagation();
                await removeSaved(e.id);
                void renderList();
            };
            li.appendChild(del);
        }
    }
    if (!list.children.length) list.innerHTML = `<li class="hint">Nothing here yet.</li>`;
}

function applySample(sample: SampleEndpoint): void {
    applySpec({
        api: sample.api,
        method: sample.method,
        path: sample.path,
        headers: sample.requestHeaders ?? {},
        body: sample.body === undefined ? "" : typeof sample.body === "string" ? sample.body : JSON.stringify(sample.body, null, 2),
    });
}

/** Swagger-style card for a sample endpoint: method, path, summary, gotchas. */
function showDocs(sample: SampleEndpoint | null): void {
    const docs = $("docs");
    docs.hidden = !sample;
    docs.innerHTML = "";
    if (!sample) return;
    const live = !isSampleOnly(sample.api);
    docs.innerHTML = `<div class="docs-head"><span class="badge"></span><code></code></div><div class="docs-summary"></div><ul></ul><div class="docs-foot"><span></span></div>`;
    const badge = docs.querySelector(".badge") as HTMLElement;
    badge.textContent = sample.method;
    badge.dataset.kind = sample.method.toLowerCase();
    const base = sample.api.startsWith("pp:") ? `https://api.powerplatform.com/${sample.group.toLowerCase()}/` : "https://{site}/";
    (docs.querySelector("code") as HTMLElement).textContent = base + sample.path;
    const foot = docs.querySelector(".docs-foot") as HTMLElement;
    (foot.querySelector("span") as HTMLElement).textContent = live
        ? "Send makes a live call. The sample is built from Microsoft's documented schema with made-up values."
        : "Sample data. SharePoint is not called live yet.";
    if (live) {
        const btn = document.createElement("button");
        btn.textContent = "Show sample response";
        btn.onclick = () => showResponse({ ok: sample.response.status < 400, sample: true, ...sample.response, ms: 0 });
        foot.appendChild(btn);
    }
    if (sample.docUrl) {
        const link = document.createElement("button");
        link.textContent = "Microsoft docs";
        link.onclick = () => void window.toolboxAPI.utils.openInConnectionBrowser(sample.docUrl!);
        foot.appendChild(link);
    }
    (docs.querySelector(".docs-summary") as HTMLElement).textContent = sample.summary;
    const ul = docs.querySelector("ul") as HTMLUListElement;
    for (const note of sample.notes) {
        const li = document.createElement("li");
        li.textContent = note;
        ul.appendChild(li);
    }
}

function addItem(title: string, sub: string, onClick: () => void, badge?: string): HTMLLIElement {
    const li = document.createElement("li");
    li.innerHTML = `<div class="title"></div><div class="sub"></div>`;
    (li.querySelector(".title") as HTMLElement).textContent = title;
    (li.querySelector(".sub") as HTMLElement).textContent = sub;
    if (badge) li.dataset.kind = badge;
    li.onclick = onClick;
    list.appendChild(li);
    return li;
}

async function onSend(): Promise<void> {
    let spec: RequestSpec;
    try {
        spec = currentSpec();
    } catch {
        output.textContent = "Headers must be a JSON object.";
        return;
    }
    if (!spec.path && spec.api === "dataverse") return;
    const placeholder = !isSampleOnly(spec.api) && spec.path.match(/\{[^}]+\}/);
    if (placeholder) {
        output.textContent = `Replace ${placeholder[0]} in the path before sending.`;
        return;
    }

    const sendBtn = $<HTMLButtonElement>("send");
    sendBtn.disabled = true;
    output.textContent = "Sending...";
    const res = await send(spec);
    sendBtn.disabled = false;
    showResponse(res);

    await addHistory(spec);
    if (tab === "history") void renderList();
}

function showResponse(res: ResponseView): void {
    const status = $("status");
    status.textContent = (res.status !== undefined ? `${res.status} ${res.statusText ?? ""}` : res.ok ? "OK" : "Error") + (res.sample ? " (sample)" : "");
    status.className = res.ok ? "ok" : "err";
    $("timing").textContent = `${Math.round(res.ms)} ms`;

    lastBody = res.body == null ? "" : typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2);
    output.textContent = lastBody || "(empty body)";
    $("copy").hidden = !lastBody;

    const hdrWrap = $("resp-headers-wrap");
    hdrWrap.hidden = !res.headers;
    $("resp-headers").textContent = res.headers ? JSON.stringify(res.headers, null, 2) : "";
}

async function onSave(): Promise<void> {
    let spec: RequestSpec;
    try {
        spec = currentSpec();
    } catch {
        output.textContent = "Headers must be a JSON object.";
        return;
    }
    // Electron has no window.prompt, so requests are saved under their method and path.
    const name = `${spec.method} ${spec.path}`;
    await saveRequest(name, spec);
    void window.toolboxAPI.utils.showNotification({ title: "Saved", body: name, type: "success", duration: 2000 });
    if (tab === "saved") void renderList();
}

async function initConnections(): Promise<void> {
    const conns = await window.toolboxAPI.connections.getConnections();
    connSel.innerHTML = "";
    conns.forEach((c, i) => {
        if (!c) return;
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = `${i === 0 ? "Primary" : "Secondary"}: ${c.name}`;
        connSel.appendChild(opt);
    });
    connSel.hidden = connSel.options.length < 2;
}

async function init(): Promise<void> {
    apiSel.innerHTML =
        `<option value="dataverse">Dataverse Web API</option>` +
        `<option value="sharepoint">SharePoint REST (sample data)</option>` +
        `<optgroup label="Power Platform API">${PP_CATEGORIES.map((c) => `<option value="pp:${c}">${c}</option>`).join("")}</optgroup>`;

    const theme = await window.toolboxAPI.utils.getCurrentTheme();
    document.documentElement.dataset.theme = theme;

    await Promise.all([initConnections(), loadStore()]);
    onApiChange(false);

    apiSel.onchange = () => onApiChange();
    connSel.onchange = () => {
        catalog = [];
        if (tab === "endpoints") void renderList();
    };
    filterInput.oninput = () => void renderList();
    $("send").onclick = () => void onSend();
    $("save").onclick = () => void onSave();
    pathInput.onkeydown = (e) => {
        if (e.key === "Enter") void onSend();
    };
    $("copy").onclick = () => void window.toolboxAPI.utils.copyToClipboard(lastBody);

    document.querySelectorAll<HTMLButtonElement>(".tabs button").forEach((btn) => {
        btn.onclick = () => {
            if (btn.dataset.tab !== "endpoints") showDocs(null);
            document.querySelectorAll(".tabs button").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            tab = btn.dataset.tab as Tab;
            void renderList();
        };
    });

    void renderList();
}

void init();
