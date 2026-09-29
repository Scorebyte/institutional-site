import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { formatDateTime } from '@scorbyte/shared-kernel'
import { MarketingIcon } from '@/shared/ui/MarketingIcon'
import { useInstitutionalTheme } from '@/widgets/site-chrome/lib/useInstitutionalTheme'
import { SiteHeader } from '@/widgets/site-chrome/ui/SiteHeader'
import { SiteFooter } from '@/widgets/site-chrome/ui/SiteFooter'
import {
  consumeMeiLoginToken,
  getMeiAccount,
  getMeiConnectionStatus,
  listMeiConnections,
  logoutMei,
  MeiApiError,
  requestMeiLogin,
  signUpMei,
  startMeiConnection,
  type MeiAccount,
  type MeiConnectionStatus,
  type MeiConnectionSummary,
} from '@/features/mei/api/meiApi'

const STORAGE_KEY = 'scorebyte-mei-session-token'

const statusLabels: Record<MeiConnectionStatus, string> = {
  created: 'Conexão iniciada',
  awaiting_user_action: 'Aguardando ação no banco',
  not_auth: 'Não autorizada',
  connected: 'Conectada',
  collecting: 'Coletando dados',
  collected: 'Dados coletados',
  normalizing: 'Processando dados',
  normalized: 'Dados processados',
  dispatching: 'Enviando análise',
  dispatched: 'Análise concluída',
  revoked: 'Consentimento revogado',
  disconnected: 'Desconectada',
  error: 'Erro na conexão',
}

const statusTones: Record<MeiConnectionStatus, 'success' | 'warning' | 'danger'> = {
  created: 'warning',
  awaiting_user_action: 'warning',
  not_auth: 'danger',
  connected: 'success',
  collecting: 'warning',
  collected: 'success',
  normalizing: 'warning',
  normalized: 'success',
  dispatching: 'warning',
  dispatched: 'success',
  revoked: 'danger',
  disconnected: 'danger',
  error: 'danger',
}

function readStoredSessionToken(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function storeSessionToken(token: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, token)
  } catch {
    // Armazenamento indisponível (ex.: navegação privada): a sessão simplesmente não persiste.
  }
}

function clearStoredSessionToken(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignorado — nada para limpar se o storage já não está disponível.
  }
}

function errorMessage(caught: unknown, fallback: string): string {
  if (caught instanceof MeiApiError) return caught.message
  if (caught instanceof Error) return caught.message
  return fallback
}

export function MeiPortalPage() {
  useInstitutionalTheme()

  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [account, setAccount] = useState<MeiAccount | null>(null)
  const [bootLoading, setBootLoading] = useState(true)
  const [sessionNotice, setSessionNotice] = useState('')

  const [formMode, setFormMode] = useState<'login' | 'signup'>('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupCnpj, setSignupCnpj] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const [connections, setConnections] = useState<MeiConnectionSummary[]>([])
  const [connectionsLoading, setConnectionsLoading] = useState(false)
  const [connectionsError, setConnectionsError] = useState('')
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState('')
  const [lastConnectUrl, setLastConnectUrl] = useState<string | null>(null)
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [statusDetails, setStatusDetails] = useState<Record<string, string[]>>({})

  // O token de magic-link é de uso único: o StrictMode do React roda os efeitos duas vezes em
  // desenvolvimento, e uma segunda troca do mesmo token falharia (o servidor já o invalidou na
  // primeira). O ref sobrevive às duas execuções e garante uma única tentativa por token.
  const tokenExchangeRef = useRef<string | null>(null)

  const loadConnections = useCallback(async (token: string) => {
    setConnectionsLoading(true)
    setConnectionsError('')
    try {
      setConnections(await listMeiConnections(token))
    } catch (caught) {
      setConnectionsError(errorMessage(caught, 'Não foi possível carregar suas conexões.'))
    } finally {
      setConnectionsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Permite abrir o link recebido por e-mail direto no dashboard, sem digitar nada: o token
    // some da URL imediatamente (antes mesmo da troca terminar) para nunca aparecer numa
    // captura de tela, no histórico do navegador ou nos logs do servidor de estáticos — mesmo
    // padrão já usado no bootstrap do sandbox.
    const url = new URL(window.location.href)
    const token = url.searchParams.get('token')
    if (token) {
      url.searchParams.delete('token')
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
    }

    if (token && tokenExchangeRef.current !== token) {
      tokenExchangeRef.current = token
      consumeMeiLoginToken(token)
        .then(({ sessionToken: issuedToken, account: loadedAccount }) => {
          storeSessionToken(issuedToken)
          setSessionToken(issuedToken)
          setAccount(loadedAccount)
          setSessionNotice('')
          void loadConnections(issuedToken)
        })
        .catch((caught: unknown) => {
          setSessionNotice(errorMessage(caught, 'Este link de acesso já foi usado ou expirou. Solicite um novo link.'))
        })
        .finally(() => {
          setBootLoading(false)
        })
      return
    }
    if (token) return

    const stored = readStoredSessionToken()
    if (!stored) {
      setBootLoading(false)
      return
    }
    let active = true
    void getMeiAccount(stored)
      .then((loadedAccount) => {
        if (!active) return
        setSessionToken(stored)
        setAccount(loadedAccount)
        void loadConnections(stored)
      })
      .catch((caught: unknown) => {
        if (!active) return
        clearStoredSessionToken()
        setSessionNotice(errorMessage(caught, 'Sua sessão expirou. Solicite um novo link de acesso.'))
      })
      .finally(() => {
        if (active) setBootLoading(false)
      })
    return () => {
      active = false
    }
  }, [loadConnections])

  const handleLoginSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError('')
    setFormSuccess('')
    setFormSubmitting(true)
    try {
      await requestMeiLogin(loginEmail.trim())
      setFormSuccess('Se o e-mail informado estiver cadastrado, enviamos um novo link de acesso.')
    } catch (caught) {
      setFormError(errorMessage(caught, 'Não foi possível solicitar o link de acesso.'))
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleSignupSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError('')
    setFormSuccess('')
    setFormSubmitting(true)
    try {
      await signUpMei(signupEmail.trim(), signupCnpj.replace(/\D/g, ''))
      setFormSuccess('Cadastro criado! Enviamos um link de acesso para o seu e-mail.')
    } catch (caught) {
      setFormError(errorMessage(caught, 'Não foi possível concluir o cadastro.'))
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleLogout = async () => {
    if (sessionToken) await logoutMei(sessionToken).catch(() => {})
    clearStoredSessionToken()
    setSessionToken(null)
    setAccount(null)
    setConnections([])
    setLastConnectUrl(null)
    setSessionNotice('')
  }

  const handleStartConnection = async () => {
    if (!sessionToken) return
    setStartError('')
    setStarting(true)
    try {
      const result = await startMeiConnection(sessionToken)
      setLastConnectUrl(result.connectUrl)
      window.open(result.connectUrl, '_blank', 'noopener')
      void loadConnections(sessionToken)
    } catch (caught) {
      setStartError(errorMessage(caught, 'Não foi possível iniciar a conexão bancária.'))
    } finally {
      setStarting(false)
    }
  }

  const handleCheckStatus = async (connectionId: string) => {
    if (!sessionToken) return
    setCheckingId(connectionId)
    try {
      const detail = await getMeiConnectionStatus(sessionToken, connectionId)
      setStatusDetails((current) => ({ ...current, [connectionId]: detail.history }))
      void loadConnections(sessionToken)
    } catch {
      // O status em si já aparece na lista — uma falha aqui só deixa de atualizar o detalhe.
    } finally {
      setCheckingId(null)
    }
  }

  return (
    <div className="sandbox-page mei-page">
      <a className="institutional-skip-link" href="#main-content">Pular para o conteúdo</a>
      <SiteHeader />

      <main id="main-content" tabIndex={-1}>
        <section className="sandbox-intro">
          <div className="institutional-container">
            <p className="sandbox-intro__eyebrow"><MarketingIcon name="wallet" size={16} /> Portal do MEI</p>
            <h1>Acompanhe sua conta e sua conexão bancária.</h1>
            <p>
              Acesse com o link enviado por e-mail, conecte seu banco pelo Open Finance e acompanhe o status
              da sua análise de crédito.
            </p>
          </div>
        </section>

        <section className="sandbox-main">
          <div className="institutional-container">
            {bootLoading ? (
              <p style={{ color: 'var(--sb-ink-faint)' }}>Carregando…</p>
            ) : !account ? (
              <>
                {sessionNotice && (
                  <div className="sandbox-alert sandbox-alert--warning" role="status">
                    <MarketingIcon name="warning" size={18} />
                    <span>{sessionNotice}</span>
                  </div>
                )}

                <div className="sandbox-result__tabs" role="tablist" aria-label="Como você quer entrar">
                  <button
                    aria-selected={formMode === 'login'}
                    className={`sandbox-result__tab ${formMode === 'login' ? 'is-active' : ''}`}
                    onClick={() => { setFormMode('login'); setFormError(''); setFormSuccess('') }}
                    role="tab"
                    type="button"
                  >
                    Já tenho cadastro
                  </button>
                  <button
                    aria-selected={formMode === 'signup'}
                    className={`sandbox-result__tab ${formMode === 'signup' ? 'is-active' : ''}`}
                    onClick={() => { setFormMode('signup'); setFormError(''); setFormSuccess('') }}
                    role="tab"
                    type="button"
                  >
                    Ainda não tenho cadastro
                  </button>
                </div>

                {formError && (
                  <div className="sandbox-alert sandbox-alert--danger" role="alert">
                    <MarketingIcon name="warning" size={18} />
                    <span>{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div className="sandbox-alert sandbox-alert--success" role="status">
                    <MarketingIcon name="check" size={18} />
                    <span>{formSuccess}</span>
                  </div>
                )}

                {formMode === 'login' ? (
                  <form className="sandbox-signup-card" onSubmit={(event) => void handleLoginSubmit(event)}>
                    <h2>Entrar no portal MEI</h2>
                    <p>Informe o e-mail cadastrado para receber um novo link de acesso.</p>
                    <div className="sandbox-form-grid">
                      <label className="sandbox-field sandbox-field--full">
                        E-mail
                        <input
                          required
                          maxLength={254}
                          onChange={(event) => setLoginEmail(event.target.value)}
                          placeholder="voce@email.com"
                          type="email"
                          value={loginEmail}
                        />
                      </label>
                    </div>
                    <div className="sandbox-form-actions">
                      <button className="sandbox-button sandbox-button--primary" disabled={formSubmitting} type="submit">
                        <MarketingIcon name="key" size={17} />
                        {formSubmitting ? 'Enviando…' : 'Enviar link de acesso'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form className="sandbox-signup-card" onSubmit={(event) => void handleSignupSubmit(event)}>
                    <h2>Cadastrar meu MEI</h2>
                    <p>Preencha os dados abaixo. Vamos enviar um link de acesso para o seu e-mail.</p>
                    <div className="sandbox-form-grid">
                      <label className="sandbox-field">
                        E-mail
                        <input
                          required
                          maxLength={254}
                          onChange={(event) => setSignupEmail(event.target.value)}
                          placeholder="voce@email.com"
                          type="email"
                          value={signupEmail}
                        />
                      </label>
                      <label className="sandbox-field">
                        CNPJ
                        <input
                          required
                          maxLength={18}
                          onChange={(event) => setSignupCnpj(event.target.value)}
                          placeholder="Só números"
                          value={signupCnpj}
                        />
                      </label>
                    </div>
                    <div className="sandbox-form-actions">
                      <button className="sandbox-button sandbox-button--primary" disabled={formSubmitting} type="submit">
                        <MarketingIcon name="spark" size={17} />
                        {formSubmitting ? 'Cadastrando…' : 'Criar cadastro'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <>
                <div className="sandbox-dashboard__header">
                  <div>
                    <h2>{account.email}</h2>
                    <p>
                      CNPJ {account.cnpj} · Cadastrado em {formatDateTime(account.createdAt)}
                      {account.lastLoginAt ? ` · Último acesso em ${formatDateTime(account.lastLoginAt)}` : ''}
                    </p>
                  </div>
                  <button className="sandbox-button--ghost" onClick={() => void handleLogout()} type="button">
                    Sair
                  </button>
                </div>

                <div className="mei-connections-panel">
                  <div className="mei-connections-panel__header">
                    <div>
                      <h3>Conexão bancária</h3>
                      <p>Conecte seu banco pelo Open Finance para que a ScoreByte possa analisar seu crédito.</p>
                    </div>
                    <button
                      className="sandbox-button sandbox-button--primary"
                      disabled={starting}
                      onClick={() => void handleStartConnection()}
                      type="button"
                    >
                      <MarketingIcon name="building" size={17} />
                      {starting ? 'Iniciando…' : 'Conectar meu banco'}
                    </button>
                  </div>

                  {startError && (
                    <div className="sandbox-alert sandbox-alert--danger" role="alert">
                      <MarketingIcon name="warning" size={18} />
                      <span>{startError}</span>
                    </div>
                  )}

                  {lastConnectUrl && (
                    <div className="sandbox-alert sandbox-alert--success" role="status">
                      <MarketingIcon name="check" size={18} />
                      <span>
                        Abrimos a conexão bancária em outra aba. Depois de concluir no banco, volte aqui e
                        clique em "Atualizar" para ver o status.
                      </span>
                    </div>
                  )}

                  {connectionsError && (
                    <div className="sandbox-alert sandbox-alert--danger" role="alert">
                      <MarketingIcon name="warning" size={18} />
                      <span>{connectionsError}</span>
                    </div>
                  )}

                  <div className="mei-connections-panel__list-header">
                    <h4>Minhas conexões</h4>
                    <button
                      className="sandbox-button--ghost"
                      disabled={connectionsLoading}
                      onClick={() => sessionToken && void loadConnections(sessionToken)}
                      type="button"
                    >
                      {connectionsLoading ? 'Atualizando…' : 'Atualizar'}
                    </button>
                  </div>

                  {connectionsLoading && connections.length === 0 ? (
                    <p style={{ color: 'var(--sb-ink-faint)' }}>Carregando conexões…</p>
                  ) : connections.length === 0 ? (
                    <p style={{ color: 'var(--sb-ink-faint)' }}>Nenhuma conexão bancária ainda.</p>
                  ) : (
                    <ul className="mei-connections-list">
                      {connections.map((connection) => (
                        <li key={connection.connectionId}>
                          <div className="mei-connections-list__row">
                            <div>
                              <strong>{connection.documentType} {connection.cnpj}</strong>
                              <span>
                                {connection.lastSyncedAt
                                  ? `Última sincronização em ${formatDateTime(connection.lastSyncedAt)}`
                                  : 'Ainda sem sincronização'}
                              </span>
                            </div>
                            <span className={`sandbox-status-badge sandbox-status-badge--${statusTones[connection.status]}`}>
                              {statusLabels[connection.status]}
                            </span>
                            <button
                              className="sandbox-button--ghost"
                              disabled={checkingId === connection.connectionId}
                              onClick={() => void handleCheckStatus(connection.connectionId)}
                              type="button"
                            >
                              {checkingId === connection.connectionId ? 'Verificando…' : 'Verificar status'}
                            </button>
                          </div>
                          {(statusDetails[connection.connectionId] ?? []).length > 0 && (
                            <ol className="mei-connections-list__history">
                              {(statusDetails[connection.connectionId] ?? []).map((entry, index) => (
                                <li key={`${connection.connectionId}-${index}`}>{entry}</li>
                              ))}
                            </ol>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
