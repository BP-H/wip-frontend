// lib/api.ts
const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function getStatus() {
  let r: Response;
  try {
    r = await fetch(`${BASE}/status`, { cache: 'no-store' });
  } catch (err) {
    throw new Error(
      `Network error while fetching status: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`status ${r.status}: ${body.slice(0, 100)}`);
  }
  return r.json();
}

export async function getEntropy() {
  let r: Response;
  try {
    r = await fetch(`${BASE}/system/collective-entropy`, { cache: 'no-store' });
  } catch (err) {
    throw new Error(
      `Network error while fetching entropy: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`entropy ${r.status}: ${body.slice(0, 100)}`);
  }
  return r.json();
}

export async function aiAssist(vibenodeId: number, prompt: string, token: string) {
  let r: Response;
  try {
    r = await fetch(`${BASE}/ai-assist/${vibenodeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ prompt }),
    });
  } catch (err) {
    throw new Error(
      `Network error while calling ai-assist: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`ai-assist ${r.status}: ${body.slice(0, 100)}`);
  }
  return r.json();
}
