// lib/api.ts
const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function getStatus() {
  const r = await fetch(`${BASE}/status`, { cache: 'no-store' });
  if (!r.ok) throw new Error('status failed');
  return r.json();
}

export async function getEntropy() {
  const r = await fetch(`${BASE}/system/collective-entropy`, { cache: 'no-store' });
  if (!r.ok) throw new Error('entropy failed');
  return r.json();
}

export async function aiAssist(vibenodeId: number, prompt: string, token: string) {
  const r = await fetch(`${BASE}/ai-assist/${vibenodeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ prompt }),
  });
  if (!r.ok) throw new Error('ai-assist failed');
  return r.json();
}
