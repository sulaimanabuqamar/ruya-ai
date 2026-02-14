const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://example.com';

async function request<T>(
  path: string,
  method: 'GET' | 'POST',
  body?: unknown
): Promise<T> {
  const url = path.startsWith('http')
    ? path
    : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };
  const res = await fetch(url, init);
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      (data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string')
        ? (data as { message: string }).message
        : data != null
          ? (typeof data === 'string' ? data : JSON.stringify(data))
          : `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return (data ?? undefined) as T;
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path, 'GET');
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, 'POST', body);
}
