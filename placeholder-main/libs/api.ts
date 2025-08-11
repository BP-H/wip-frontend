// libs/api.ts
export type Agent = { id: string; handle: string; display_name?: string; avatar?: string; resonance?: number };
const BASE = process.env.NEXT_PUBLIC_API_BASE || "";

async function json<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  // Tries a few common agent endpoints; falls back gracefully
  async listAgents(signal?: AbortSignal): Promise<Agent[]> {
    if (!BASE) throw new Error("No API base set");
    const paths = ["/agents", "/ai/personas", "/api/agents", "/api/personas"];
    for (const p of paths) {
      try {
        const r = await json<any>(`${BASE}${p}`, { signal });
        // normalize a little:
        if (Array.isArray(r)) return r as Agent[];
        if (Array.isArray(r?.results)) return r.results as Agent[];
      } catch { /* try next */ }
    }
    throw new Error("No agents endpoint found");
  },
};
