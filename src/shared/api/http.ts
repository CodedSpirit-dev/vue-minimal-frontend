type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'
type Opts = { method?: Method; body?: unknown; cacheTtlMs?: number }

const API_BASE_URL = 'http://localhost:5175'
const API = import.meta.env.API
const mem = new Map<string, { t: number; d: any }>()
let getToken: () => string | null = () => null
export const setTokenProvider = (fn: () => string | null) => {
  getToken = fn
}

export async function http<T>(url: string, o: Opts = {}): Promise<T> {
  const m = o.method ?? 'GET'
  const k = `${m}:${url}:${o.body ? JSON.stringify(o.body) : ''}`
  const ttl = o.cacheTtlMs ?? 120_000

  if (m === 'GET') {
    const hit = mem.get(k)
    if (hit && Date.now() - hit.t < ttl) return hit.d as T
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE_URL}${url}`, {
    method: m,
    headers,
    body: o.body ? JSON.stringify(o.body) : undefined,
    // // credentials: 'include',
  })

  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP_${res.status}`))

  const data = (await res.json()) as T
  if (m === 'GET') mem.set(k, { t: Date.now(), d: data })
  return data
}
