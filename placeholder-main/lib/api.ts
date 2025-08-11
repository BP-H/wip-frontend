// lib/api.ts
const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function getStatus() {
  const url = `${BASE}/status`;
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) {
    let text: string | undefined;
    try {
      text = await r.text();
    } catch {
      // ignore
    }
    throw new Error(`${url} failed: ${r.status} ${r.statusText}${text ? ` - ${text}` : ''}`);
  }
  return r.json();
}

export async function getEntropy() {
  const url = `${BASE}/system/collective-entropy`;
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) {
    let text: string | undefined;
    try {
      text = await r.text();
    } catch {
      // ignore
    }
    throw new Error(`${url} failed: ${r.status} ${r.statusText}${text ? ` - ${text}` : ''}`);
  }
  return r.json();
}

export async function aiAssist(vibenodeId: number, prompt: string, token: string) {
  const url = `${BASE}/ai-assist/${vibenodeId}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ prompt }),
  });
  if (!r.ok) {
    let text: string | undefined;
    try {
      text = await r.text();
    } catch {
      // ignore
    }
    throw new Error(`${url} failed: ${r.status} ${r.statusText}${text ? ` - ${text}` : ''}`);
  }
  return r.json();
}
