const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
const API_BASE_URL = configuredApiUrl ?? (import.meta.env.DEV
  ? 'http://localhost:3333/api/v1'
  : '/api/v1')

export interface MeiAccount {
  email: string
  cnpj: string
  createdAt: string
  lastLoginAt: string | null
}

export type MeiConnectionStatus =
  | 'created'
  | 'awaiting_user_action'
  | 'not_auth'
  | 'connected'
  | 'collecting'
  | 'collected'
  | 'normalizing'
  | 'normalized'
  | 'dispatching'
  | 'dispatched'
  | 'revoked'
  | 'disconnected'
  | 'error'

export interface MeiConnectionSummary {
  connectionId: string
  cnpj: string
  documentType: 'CPF' | 'CNPJ'
  status: MeiConnectionStatus
  lastSyncedAt: string | null
}

export interface MeiConnectionStatusDetail {
  status: MeiConnectionStatus
  history: string[]
}

export interface MeiStartConnectionResult {
  connectionId: string
  connectUrl: string
}

interface ProblemDetail {
  title?: string
  detail?: string
  code?: string
}

export class MeiApiError extends Error {
  readonly status: number
  readonly code: string | undefined

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'MeiApiError'
    this.status = status
    this.code = code
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

async function apiError(response: Response): Promise<MeiApiError> {
  let problem: ProblemDetail = {}
  try {
    problem = (await response.json()) as ProblemDetail
  } catch {
    // Mantém a mensagem segura baseada no status quando a resposta não é JSON.
  }
  return new MeiApiError(
    problem.detail ?? problem.title ?? `A API respondeu com status ${response.status}`,
    response.status,
    problem.code,
  )
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs = 20_000,
): Promise<Response> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch (caught) {
    if (caught instanceof DOMException && caught.name === 'AbortError') {
      throw new MeiApiError('A requisição excedeu o tempo limite.', 504)
    }
    throw caught
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function signUpMei(email: string, cnpj: string): Promise<MeiAccount> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/mei/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, cnpj }),
  })
  if (!response.ok) throw await apiError(response)
  return (await response.json()) as MeiAccount
}

export async function requestMeiLogin(email: string): Promise<void> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/mei/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!response.ok) throw await apiError(response)
}

export async function consumeMeiLoginToken(
  token: string,
): Promise<{ sessionToken: string; account: MeiAccount }> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/mei/login/consume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  if (!response.ok) throw await apiError(response)
  const payload = (await response.json()) as unknown
  if (!isRecord(payload) || typeof payload.sessionToken !== 'string' || !isRecord(payload.account)) {
    throw new MeiApiError('A API retornou uma resposta de login inválida.', 502)
  }
  return payload as unknown as { sessionToken: string; account: MeiAccount }
}

export async function logoutMei(sessionToken: string): Promise<void> {
  await fetchWithTimeout(`${API_BASE_URL}/mei/logout`, {
    method: 'POST',
    headers: { 'X-Mei-Session-Token': sessionToken },
  })
}

export async function getMeiAccount(sessionToken: string): Promise<MeiAccount> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/mei/me`, {
    headers: { 'X-Mei-Session-Token': sessionToken },
  })
  if (!response.ok) throw await apiError(response)
  return (await response.json()) as MeiAccount
}

export async function startMeiConnection(sessionToken: string): Promise<MeiStartConnectionResult> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/mei/connections`, {
    method: 'POST',
    headers: { 'X-Mei-Session-Token': sessionToken },
  })
  if (!response.ok) throw await apiError(response)
  return (await response.json()) as MeiStartConnectionResult
}

export async function listMeiConnections(sessionToken: string): Promise<MeiConnectionSummary[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/mei/connections`, {
    headers: { 'X-Mei-Session-Token': sessionToken },
  })
  if (!response.ok) throw await apiError(response)
  const payload = (await response.json()) as unknown
  if (!isRecord(payload) || !Array.isArray(payload.items)) return []
  return payload.items as MeiConnectionSummary[]
}

export async function getMeiConnectionStatus(
  sessionToken: string,
  connectionId: string,
): Promise<MeiConnectionStatusDetail> {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/mei/connections/${encodeURIComponent(connectionId)}/status`,
    { headers: { 'X-Mei-Session-Token': sessionToken } },
  )
  if (!response.ok) throw await apiError(response)
  return (await response.json()) as MeiConnectionStatusDetail
}
