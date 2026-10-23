// History and saved requests, persisted through the tool's PPTB settings.

import type { RequestSpec } from "./api";

export interface SavedRequest {
    id: string;
    name: string;
    spec: RequestSpec;
    at: string;
}

const HISTORY_LIMIT = 50;

let history: SavedRequest[] = [];
let saved: SavedRequest[] = [];

export async function loadStore(): Promise<void> {
    const all = await window.toolboxAPI.settings.getAll();
    history = Array.isArray(all.history) ? all.history : [];
    saved = Array.isArray(all.saved) ? all.saved : [];
}

export const getHistory = () => history;
export const getSaved = () => saved;

function entry(name: string, spec: RequestSpec): SavedRequest {
    return { id: crypto.randomUUID(), name, spec: structuredClone(spec), at: new Date().toISOString() };
}

export async function addHistory(spec: RequestSpec): Promise<void> {
    history = [entry(`${spec.method} ${spec.path}`, spec), ...history].slice(0, HISTORY_LIMIT);
    await window.toolboxAPI.settings.set("history", history);
}

export async function saveRequest(name: string, spec: RequestSpec): Promise<void> {
    saved = [entry(name, spec), ...saved];
    await window.toolboxAPI.settings.set("saved", saved);
}

export async function removeSaved(id: string): Promise<void> {
    saved = saved.filter((s) => s.id !== id);
    await window.toolboxAPI.settings.set("saved", saved);
}
