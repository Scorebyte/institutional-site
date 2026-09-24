import type { CreditAnalysis, DemoScenario } from '@scorbyte/shared-kernel'

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
const API_BASE_URL = configuredApiUrl ?? (import.meta.env.DEV
  ? 'http://localhost:3333/api/v1'
  : '/api/v1')

export interface SandboxAccount {
  id: string
  companyName: string
  contactName: string
  email: string
  useCase: string | null
  apiKeyHint: string
  requestLimit: number
  requestsUsed: number
  status: 'ACTIVE' | 'REVOKED'
  expiresAt: string
  createdAt: string
  lastUsedAt: string | null
}

export interface SandboxHistoryEntry {
  id: string
  analysisId: string | null
  scenario: string | null
  companyName: string | null
  statusCode: number
  creditScore: number | null
  recommendation: string | null
  createdAt: string
}

export interface SandboxSignupInput {
  companyName: string
  contactName: string
  email: string
  useCase?: string
}

export interface SandboxAnalysisInput {
  cnpj: string
  companyName?: string
  scenario?: DemoScenario
}

interface ProblemDetail {
  title?: string
  detail?: string
  code?: string
}

export class SandboxApiError extends Error {
  readonly status: number
  readonly code: string | undefined

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'SandboxApiError'
    this.status = status
    this.code = code
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

async function apiError(response: Response): Promise<SandboxApiError> {
  let problem: ProblemDetail = {}
  try {
    problem = (await response.json()) as ProblemDetail
  } catch {
    // Mantém a mensagem segura baseada no status quando a resposta não é JSON.
  }
  return new SandboxApiError(
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
      throw new SandboxApiError('A requisição excedeu o tempo limite.', 504)
    }
    throw caught
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function signUpForSandbox(
  input: SandboxSignupInput,
): Promise<{ account: SandboxAccount; apiKey: string }> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/sandbox/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw await apiError(response)
  const payload = (await response.json()) as unknown
  if (!isRecord(payload) || !isRecord(payload.account) || typeof payload.apiKey !== 'string') {
    throw new SandboxApiError('A API retornou uma resposta de cadastro inválida.', 502)
  }
  return payload as unknown as { account: SandboxAccount; apiKey: string }
}

export async function exchangeSandboxBootstrapToken(
  token: string,
): Promise<{ account: SandboxAccount; apiKey: string }> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/sandbox/bootstrap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  if (!response.ok) throw await apiError(response)
  const payload = (await response.json()) as unknown
  if (!isRecord(payload) || !isRecord(payload.account) || typeof payload.apiKey !== 'string') {
    throw new SandboxApiError('A API retornou uma resposta de troca de link inválida.', 502)
  }
  return payload as unknown as { account: SandboxAccount; apiKey: string }
}

export async function getSandboxAccount(apiKey: string): Promise<SandboxAccount> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/sandbox/account`, {
    headers: { 'X-Sandbox-Api-Key': apiKey },
  })
  if (!response.ok) throw await apiError(response)
  return (await response.json()) as SandboxAccount
}

export async function getSandboxHistory(apiKey: string, limit = 20): Promise<SandboxHistoryEntry[]> {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/sandbox/account/history?limit=${limit}`,
    { headers: { 'X-Sandbox-Api-Key': apiKey } },
  )
  if (!response.ok) throw await apiError(response)
  const payload = (await response.json()) as unknown
  return Array.isArray(payload) ? (payload as SandboxHistoryEntry[]) : []
}

export async function runSandboxAnalysis(
  apiKey: string,
  input: SandboxAnalysisInput,
): Promise<CreditAnalysis> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/sandbox/account/analyses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Sandbox-Api-Key': apiKey },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw await apiError(response)
  return (await response.json()) as CreditAnalysis
}
