// lib/api.ts
const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

export class ApiError extends Error {
  readonly status: number;
  readonly url: string;
  readonly body?: unknown;

  constructor(url: string, status: number, statusText: string, body?: unknown) {
    const bodyStr = body === undefined
      ? ''
      : ` - ${typeof body === 'string' ? body : JSON.stringify(body)}`;
    super(`${url} failed: ${status} ${statusText}${bodyStr}`);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

async function request<T = any>(path: string, init: RequestInit = {}): Promise<T | string> {
  const url = `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  let res: Response;

  try {
    res = await fetch(url, { cache: 'no-store', ...init });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`${url} request failed: ${msg}`);
  }

  const contentType = res.headers.get('Content-Type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    let body: unknown;
    try {
      body = isJson ? await res.json() : await res.text();
    } catch {
      // ignore body read errors
    }
    throw new ApiError(url, res.status, res.statusText, body);
  }

  return isJson ? (res.json() as Promise<T>) : res.text();
}

/** GET /status */
export function getStatus(signal?: AbortSignal) {
  return request('/status', { signal });
}

/** GET /system/collective-entropy */
export function getEntropy(signal?: AbortSignal) {
  return request('/system/collective-entropy', { signal });
}

/** POST /ai-assist/:vibenodeId */
export function aiAssist(vibenodeId: number, prompt: string, token: string, signal?: AbortSignal) {
  return request(`/ai-assist/${vibenodeId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
    signal,
  });
}
