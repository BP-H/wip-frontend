// lib/api.ts
const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

async function request(path: string, init: RequestInit = {}) {
  try {
    const r = await fetch(`${BASE}${path}`, { cache: 'no-store', ...init });
    if (!r.ok) throw new Error(`${path} failed`);
    return r.json();
  } catch (err) {
    console.error(err);
    throw err instanceof Error ? err : new Error(String(err));
  }
}

export async function getStatus() {
  return request('/status');
}

export async function getEntropy() {
  return request('/system/collective-entropy');
}

export async function aiAssist(vibenodeId: number, prompt: string, token: string) {
  return request(`/ai-assist/${vibenodeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ prompt }),
  });
}
