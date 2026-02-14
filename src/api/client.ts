const BASE_URL = 'https://example.com/api';

async function request<T>(
  path: string,
  method: 'GET' | 'POST',
  body?: unknown
): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path, 'GET');
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, 'POST', body);
}
