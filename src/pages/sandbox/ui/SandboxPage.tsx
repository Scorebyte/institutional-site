import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import type { Classification, CreditAnalysis, DemoScenario } from '@scorbyte/shared-kernel'
import { formatCurrency, formatDateTime, formatPercent } from '@scorbyte/shared-kernel'
import { MarketingIcon } from '@/shared/ui/MarketingIcon'
import { useInstitutionalTheme } from '@/widgets/site-chrome/lib/useInstitutionalTheme'
import { SiteHeader } from '@/widgets/site-chrome/ui/SiteHeader'
import { SiteFooter } from '@/widgets/site-chrome/ui/SiteFooter'
import {
  exchangeSandboxBootstrapToken,
  getSandboxAccount,
  getSandboxHistory,
  runSandboxAnalysis,
  signUpForSandbox,
  SandboxApiError,
  type SandboxAccount,
  type SandboxHistoryEntry,
} from '@/features/sandbox/api/sandboxApi'

const STORAGE_KEY = 'scorebyte-sandbox-api-key'
const DEMO_CNPJ = '45231890000180'
const SCORE_SCALE = 950

const scenarioOptions: Array<{ value: DemoScenario; label: string }> = [
  { value: 'stable', label: 'Estável' },
  { value: 'growth', label: 'Crescimento' },
  { value: 'attention', label: 'Atenção' },
]

const classificationLabels: Record<Classification, string> = {
  BUSINESS_REVENUE: 'Receita empresarial',
  BUSINESS_EXPENSE: 'Despesa empresarial',
  PERSONAL_REVENUE: 'Receita pessoal',
  PERSONAL_EXPENSE: 'Despesa pessoal',
  PERSONAL_TRANSFER: 'Transferência pessoal',
  TAX_PAYMENT: 'Imposto',
  LOAN_PAYMENT: 'Parcela de crédito',
  SUPPLIER_PAYMENT: 'Fornecedor',
  REFUND: 'Estorno / devolução',
  UNKNOWN: 'Não identificada',
}

const recommendationLabels: Record<CreditAnalysis['report']['recommendation'], string> = {
  APPROVE: 'Crédito recomendado',
  MANUAL_REVIEW: 'Revisão manual sugerida',
  DECLINE: 'Crédito não recomendado',
}

function readStoredApiKey(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function storeApiKey(apiKey: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, apiKey)
  } catch {
    // Armazenamento indisponível (ex.: navegação privada): a sessão simplesmente não persiste.
  }
}

function clearStoredApiKey(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignorado — nada para limpar se o storage já não está disponível.
  }
}

function errorMessage(caught: unknown, fallback: string): string {
  if (caught instanceof SandboxApiError) return caught.message
  if (caught instanceof Error) return caught.message
  return fallback
}

function commercialMailto(account: SandboxAccount): string {
  const subject = encodeURIComponent('Quero avançar com a ScoreByte')
  const body = encodeURIComponent(
    `Olá! Testamos o sandbox da ScoreByte com a conta "${account.companyName}" e ` +
    'gostaríamos de conversar sobre os próximos passos para produção.',
  )
  return `mailto:comercial@scorebyte.com.br?subject=${subject}&body=${body}`
}

export function SandboxPage() {
  useInstitutionalTheme()

  const [account, setAccount] = useState<SandboxAccount | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [justCreatedApiKey, setJustCreatedApiKey] = useState<string | null>(null)
  const [bootLoading, setBootLoading] = useState(true)
  const [sessionNotice, setSessionNotice] = useState('')

  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [useCase, setUseCase] = useState('')
  const [signupSubmitting, setSignupSubmitting] = useState(false)
  const [signupError, setSignupError] = useState('')

  const [history, setHistory] = useState<SandboxHistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const [runCnpj, setRunCnpj] = useState(DEMO_CNPJ)
  const [runCompanyName, setRunCompanyName] = useState('')
  const [scenario, setScenario] = useState<DemoScenario>('stable')
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState('')
  const [lastAnalysis, setLastAnalysis] = useState<CreditAnalysis | null>(null)
  const [resultTab, setResultTab] = useState<'summary' | 'raw'>('summary')
  const [pipelineRevealKey, setPipelineRevealKey] = useState(0)

  const loadHistory = useCallback(async (key: string) => {
    setHistoryLoading(true)
    try {
      setHistory(await getSandboxHistory(key, 20))
    } catch {
      // Histórico é informativo; uma falha aqui não deve travar o restante do painel.
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  // Guarda o token já em troca fora do ciclo de efeito: em desenvolvimento, o StrictMode do
  // React roda o efeito, limpa e roda de novo de propósito (para expor efeitos colaterais mal
  // escritos). Isso é seguro para uma consulta comum, mas o token de bootstrap é de uso único —
  // se a segunda execução disparasse a troca de novo, ela falharia (o servidor já teria
  // invalidado o token na primeira chamada). O ref sobrevive às duas execuções do mesmo
  // componente, então garante uma única tentativa de troca por token.
  const bootstrapExchangeRef = useRef<string | null>(null)

  useEffect(() => {
    // Permite abrir um link direto (ex.: em uma apresentação) já autenticado no sandbox, sem
    // digitar o formulário de cadastro ao vivo. O link nunca carrega a credencial real: traz
    // apenas um token de uso único que é trocado por uma chave de API nova aqui mesmo, no
    // primeiro carregamento (mesmo padrão de connect token já usado na integração Open
    // Finance deste produto). O parâmetro some da URL imediatamente, antes mesmo da troca
    // terminar, para nunca aparecer em uma captura de tela, no histórico do navegador ou nos
    // logs do servidor de estáticos.
    const url = new URL(window.location.href)
    const bootstrapToken = url.searchParams.get('bootstrap')
    if (bootstrapToken) {
      url.searchParams.delete('bootstrap')
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
    }

    if (bootstrapToken && bootstrapExchangeRef.current !== bootstrapToken) {
      bootstrapExchangeRef.current = bootstrapToken
      // Sem guarda de "componente ainda montado" aqui de propósito: a troca só acontece uma
      // vez (o ref acima garante isso) e precisa aplicar o resultado mesmo que o efeito que a
      // disparou já tenha sido "limpo" pelo StrictMode — descartar o resultado deixaria a
      // chave nova perdida (o token já foi consumido no servidor e não pode ser trocado de novo).
      exchangeSandboxBootstrapToken(bootstrapToken)
        .then(({ account: loadedAccount, apiKey: issuedKey }) => {
          storeApiKey(issuedKey)
          setAccount(loadedAccount)
          setApiKey(issuedKey)
          setSessionNotice('')
          void loadHistory(issuedKey)
        })
        .catch((caught: unknown) => {
          setSessionNotice(errorMessage(caught, 'Este link de acesso já foi usado ou expirou. Solicite um novo link.'))
        })
        .finally(() => {
          setBootLoading(false)
        })
      return
    }
    if (bootstrapToken) return

    const stored = readStoredApiKey()
    if (!stored) {
      setBootLoading(false)
      return
    }
    let active = true
    void getSandboxAccount(stored)
      .then((loadedAccount) => {
        if (!active) return
        setAccount(loadedAccount)
        setApiKey(stored)
        void loadHistory(stored)
      })
      .catch((caught: unknown) => {
        if (!active) return
        clearStoredApiKey()
        setSessionNotice(errorMessage(caught, 'Sua sessão de sandbox não é mais válida. Solicite um novo acesso.'))
      })
      .finally(() => {
        if (active) setBootLoading(false)
      })
    return () => {
      active = false
    }
  }, [loadHistory])

  const handleSignup = async (event: FormEvent) => {
    event.preventDefault()
    setSignupError('')
    setSignupSubmitting(true)
    try {
      const { account: createdAccount, apiKey: createdKey } = await signUpForSandbox({
        companyName,
        contactName,
        email,
        ...(useCase.trim() ? { useCase: useCase.trim() } : {}),
      })
      storeApiKey(createdKey)
      setAccount(createdAccount)
      setApiKey(createdKey)
      setJustCreatedApiKey(createdKey)
      setHistory([])
      setSessionNotice('')
    } catch (caught) {
      setSignupError(errorMessage(caught, 'Não foi possível concluir o cadastro no sandbox.'))
    } finally {
      setSignupSubmitting(false)
    }
  }

  const handleSignOut = () => {
    clearStoredApiKey()
    setAccount(null)
    setApiKey(null)
    setJustCreatedApiKey(null)
    setLastAnalysis(null)
    setHistory([])
    setSessionNotice('')
  }

  const handleRunAnalysis = async (event: FormEvent) => {
    event.preventDefault()
    if (!apiKey) return
    setRunError('')
    setRunning(true)
    try {
      const analysis = await runSandboxAnalysis(apiKey, {
        cnpj: runCnpj.trim(),
        scenario,
        ...(runCompanyName.trim() ? { companyName: runCompanyName.trim() } : {}),
      })
      setLastAnalysis(analysis)
      setResultTab('summary')
      setPipelineRevealKey((key) => key + 1)
      const refreshedAccount = await getSandboxAccount(apiKey).catch(() => null)
      if (refreshedAccount) setAccount(refreshedAccount)
      void loadHistory(apiKey)
    } catch (caught) {
      setRunError(errorMessage(caught, 'Não foi possível executar a análise de teste.'))
      const refreshedAccount = await getSandboxAccount(apiKey).catch(() => null)
      if (refreshedAccount) setAccount(refreshedAccount)
      void loadHistory(apiKey)
    } finally {
      setRunning(false)
    }
  }

  const quotaExhausted = account ? account.requestsUsed >= account.requestLimit : false
  const daysUntilExpiry = account
    ? Math.max(0, Math.ceil((new Date(account.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0
  const isExpired = account ? new Date(account.expiresAt).getTime() <= Date.now() : false

  return (
    <div className="sandbox-page">
      <a className="institutional-skip-link" href="#main-content">Pular para o conteúdo</a>
      <div className="sandbox-env-ribbon" role="note">
        <MarketingIcon name="code" size={13} />
        Ambiente de sandbox · dados 100% fictícios · nenhuma ação aqui afeta produção
      </div>
      <SiteHeader />

      <main id="main-content" tabIndex={-1}>
        <section className="sandbox-intro">
          <div className="institutional-container">
            <p className="sandbox-intro__eyebrow"><MarketingIcon name="code" size={16} /> Sandbox ScoreByte</p>
            <h1>Teste a API antes de integrar em produção.</h1>
            <p>
              Um ambiente isolado com dados fictícios para bancos, fintechs e credoras entenderem como funciona
              o motor de análise financeira da ScoreByte, com credencial própria e sem tocar em dados reais.
            </p>
            <div className="sandbox-intro__stats">
              <span><strong>200</strong>requisições incluídas</span>
              <span><strong>14 dias</strong>de acesso</span>
              <span><strong>100%</strong>dados fictícios</span>
            </div>
          </div>
        </section>

        <section className="sandbox-main">
          <div className="institutional-container">
            {bootLoading ? (
              <p style={{ color: 'var(--sb-ink-faint)' }}>Carregando sandbox…</p>
            ) : !account ? (
              <>
                {sessionNotice && (
                  <div className="sandbox-alert sandbox-alert--warning" role="status">
                    <MarketingIcon name="warning" size={18} />
                    <span>{sessionNotice}</span>
                  </div>
                )}
                <form className="sandbox-signup-card" onSubmit={(event) => void handleSignup(event)}>
                  <h2>Solicite acesso ao sandbox</h2>
                  <p>
                    Preencha os dados abaixo para receber uma credencial própria (X-Sandbox-Api-Key),
                    diferente da chave de produção, válida por 14 dias e limitada a 200 requisições.
                  </p>
                  {signupError && (
                    <div className="sandbox-alert sandbox-alert--danger" role="alert">
                      <MarketingIcon name="warning" size={18} />
                      <span>{signupError}</span>
                    </div>
                  )}
                  <div className="sandbox-form-grid">
                    <label className="sandbox-field">
                      Empresa
                      <input
                        required
                        maxLength={200}
                        onChange={(event) => setCompanyName(event.target.value)}
                        placeholder="Banco, fintech ou credora"
                        value={companyName}
                      />
                    </label>
                    <label className="sandbox-field">
                      Seu nome
                      <input
                        required
                        maxLength={160}
                        onChange={(event) => setContactName(event.target.value)}
                        placeholder="Quem vai testar a integração"
                        value={contactName}
                      />
                    </label>
                    <label className="sandbox-field sandbox-field--full">
                      E-mail corporativo
                      <input
                        required
                        maxLength={254}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="voce@empresa.com"
                        type="email"
                        value={email}
                      />
                    </label>
                    <label className="sandbox-field sandbox-field--full">
                      O que você quer testar? (opcional)
                      <textarea
                        maxLength={500}
                        onChange={(event) => setUseCase(event.target.value)}
                        placeholder="Ex.: avaliar a classificação de transações antes de integrar em produção."
                        value={useCase}
                      />
                    </label>
                  </div>
                  <div className="sandbox-form-actions">
                    <button className="sandbox-button sandbox-button--primary" disabled={signupSubmitting} type="submit">
                      <MarketingIcon name="key" size={17} />
                      {signupSubmitting ? 'Criando acesso…' : 'Criar acesso ao sandbox'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                {justCreatedApiKey && (
                  <div className="sandbox-key-reveal">
                    <div className="sandbox-key-reveal__header">
                      <MarketingIcon name="key" size={18} />
                      Sua credencial de sandbox (mostrada uma única vez)
                    </div>
                    <p>
                      Guarde esta chave agora. Ela fica salva neste navegador, mas não será exibida
                      novamente por aqui. Use-a no cabeçalho <code>X-Sandbox-Api-Key</code>.
                    </p>
                    <div className="sandbox-key-reveal__value">
                      <code>{justCreatedApiKey}</code>
                      <button
                        className="sandbox-button sandbox-button--secondary"
                        onClick={() => {
                          void navigator.clipboard?.writeText(justCreatedApiKey)
                        }}
                        type="button"
                      >
                        <MarketingIcon name="copy" size={15} /> Copiar
                      </button>
                    </div>
                  </div>
                )}

                <div className="sandbox-dashboard__header">
                  <div>
                    <h2>{account.companyName}</h2>
                    <p>Chave sbx_…{account.apiKeyHint} · Cadastrada em {formatDateTime(account.createdAt)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`sandbox-status-badge sandbox-status-badge--${
                      account.status === 'REVOKED' ? 'revoked' : isExpired ? 'expired' : 'active'
                    }`}
                    >
                      {account.status === 'REVOKED' ? 'Revogada' : isExpired ? 'Expirada' : 'Ativa'}
                    </span>
                    <button className="sandbox-button--ghost" onClick={handleSignOut} type="button">
                      Sair
                    </button>
                  </div>
                </div>

                {(account.status === 'REVOKED' || isExpired) && (
                  <div className="sandbox-alert sandbox-alert--danger" role="alert">
                    <MarketingIcon name="warning" size={18} />
                    <span>
                      {account.status === 'REVOKED'
                        ? 'Este acesso foi revogado.'
                        : `Este acesso expirou em ${formatDateTime(account.expiresAt)}.`} Solicite um novo
                      acesso ou fale com o time comercial para avançar para produção.
                    </span>
                  </div>
                )}

                <div className="sandbox-usage-grid">
                  <div className="sandbox-usage-card">
                    <p>Requisições usadas</p>
                    <strong>{account.requestsUsed} / {account.requestLimit}</strong>
                    <div className="sandbox-usage-bar">
                      <div
                        className={`sandbox-usage-bar__fill ${quotaExhausted ? 'sandbox-usage-bar__fill--full' : ''}`}
                        style={{ width: `${Math.min(100, (account.requestsUsed / account.requestLimit) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="sandbox-usage-card">
                    <p>Validade do acesso</p>
                    <strong>{isExpired ? 'Expirado' : `${daysUntilExpiry} dias restantes`}</strong>
                  </div>
                  <div className="sandbox-usage-card">
                    <p>Dados permitidos</p>
                    <strong>Somente fictícios</strong>
                  </div>
                </div>

                <form className="sandbox-run-panel" onSubmit={(event) => void handleRunAnalysis(event)}>
                  <h3>Rodar um teste</h3>
                  <p>Gera uma análise sintética completa: normalização, classificação híbrida e recomendação de crédito.</p>
                  {runError && (
                    <div className="sandbox-alert sandbox-alert--danger" role="alert">
                      <MarketingIcon name="warning" size={18} />
                      <span>{runError}</span>
                    </div>
                  )}
                  <div className="sandbox-run-panel__form">
                    <label className="sandbox-field">
                      CNPJ fictício
                      <input
                        maxLength={14}
                        onChange={(event) => setRunCnpj(event.target.value)}
                        value={runCnpj}
                      />
                    </label>
                    <label className="sandbox-field">
                      Nome da empresa (opcional)
                      <input
                        maxLength={200}
                        onChange={(event) => setRunCompanyName(event.target.value)}
                        placeholder="Aparece no resultado da análise"
                        value={runCompanyName}
                      />
                    </label>
                    <div className="sandbox-field sandbox-field--full">
                      Cenário
                      <div className="sandbox-scenario-picker">
                        {scenarioOptions.map((option) => (
                          <button
                            className={option.value === scenario ? 'is-active' : ''}
                            key={option.value}
                            onClick={() => setScenario(option.value)}
                            type="button"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="sandbox-run-panel__submit">
                      <button
                        className="sandbox-button sandbox-button--primary"
                        disabled={running || quotaExhausted || isExpired || account.status === 'REVOKED'}
                        type="submit"
                      >
                        <MarketingIcon name="spark" size={17} />
                        {running ? 'Executando…' : 'Executar teste'}
                      </button>
                    </div>
                  </div>
                </form>

                {quotaExhausted && (
                  <div className="sandbox-cta-banner">
                    <div>
                      <h3>Você usou os {account.requestLimit} testes incluídos no sandbox</h3>
                      <p>Fale com nosso time para avançar para uma prova de conceito com dados reais.</p>
                    </div>
                    <div className="sandbox-cta-banner__actions">
                      <a className="sandbox-button sandbox-button--primary" href={commercialMailto(account)}>
                        <MarketingIcon name="users" size={16} /> Falar com o time comercial
                      </a>
                    </div>
                  </div>
                )}

                {lastAnalysis && (
                  <section className="sandbox-result" key={pipelineRevealKey} style={{ marginTop: 24 }}>
                    <ol className="sandbox-pipeline" aria-label="Etapas do processamento">
                      {lastAnalysis.pipeline.map((step) => (
                        <li key={step.id}>
                          <span className="sandbox-pipeline__icon"><MarketingIcon name="check" size={15} /></span>
                          <strong>{step.label}</strong>
                          <span>{step.records} registros · {step.durationMs} ms</span>
                        </li>
                      ))}
                    </ol>

                    <div className="sandbox-result__tabs">
                      <button
                        className={`sandbox-result__tab ${resultTab === 'summary' ? 'is-active' : ''}`}
                        onClick={() => setResultTab('summary')}
                        type="button"
                      >
                        Resumo
                      </button>
                      <button
                        className={`sandbox-result__tab ${resultTab === 'raw' ? 'is-active' : ''}`}
                        onClick={() => setResultTab('raw')}
                        type="button"
                      >
                        Resposta técnica (JSON)
                      </button>
                    </div>

                    {resultTab === 'raw' ? (
                      <pre className="sandbox-raw-json">{JSON.stringify(lastAnalysis, null, 2)}</pre>
                    ) : (
                      <div className="sandbox-result-summary">
                        <div>
                          <div className="sandbox-score-panel">
                            <div
                              className="sandbox-score-ring"
                              style={{ '--score': (lastAnalysis.report.creditScore / SCORE_SCALE) * 100 } as React.CSSProperties}
                            >
                              <div>
                                <strong>{lastAnalysis.report.creditScore}</strong>
                                <small>de {SCORE_SCALE} · rating {lastAnalysis.report.rating}</small>
                              </div>
                            </div>
                            <div className="sandbox-score-meta">
                              <p>Recomendação consultiva</p>
                              <strong>{recommendationLabels[lastAnalysis.report.recommendation]}</strong>
                              <span className={`sandbox-recommendation-chip sandbox-recommendation-chip--${lastAnalysis.report.recommendation.toLowerCase()}`}>
                                Risco {lastAnalysis.report.riskLevel === 'LOW' ? 'baixo' : lastAnalysis.report.riskLevel === 'MEDIUM' ? 'médio' : 'alto'}
                              </span>
                            </div>
                          </div>

                          <div className="sandbox-result-stats">
                            <div><span>Limite sugerido</span><strong>{formatCurrency(lastAnalysis.report.suggestedLimit)}</strong></div>
                            <div><span>Fluxo de caixa líquido</span><strong>{formatCurrency(lastAnalysis.report.netCashFlow)}</strong></div>
                            <div><span>Receita recorrente</span><strong>{formatPercent(lastAnalysis.report.recurringRevenueRate)}</strong></div>
                            <div><span>Participação do negócio</span><strong>{formatPercent(lastAnalysis.report.businessTransactionShare)}</strong></div>
                          </div>

                          <div className="sandbox-factors">
                            {lastAnalysis.report.positiveFactors.length > 0 && (
                              <div>
                                <p>Pontos positivos</p>
                                <ul>
                                  {lastAnalysis.report.positiveFactors.map((factor) => <li key={factor}>{factor}</li>)}
                                </ul>
                              </div>
                            )}
                            {lastAnalysis.report.attentionPoints.length > 0 && (
                              <div>
                                <p>Pontos de atenção</p>
                                <ul>
                                  {lastAnalysis.report.attentionPoints.map((point) => <li key={point}>{point}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="sandbox-cashflow">
                          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--sb-ink-faint)', textTransform: 'uppercase' }}>
                            Fluxo de caixa mensal
                          </p>
                          <div className="sandbox-cashflow-bars">
                            {lastAnalysis.report.monthlyCashFlow.map((month) => {
                              const maxAbs = Math.max(
                                1,
                                ...lastAnalysis.report.monthlyCashFlow.map((entry) => Math.abs(entry.netCashFlow)),
                              )
                              const height = Math.max(4, (Math.abs(month.netCashFlow) / maxAbs) * 100)
                              return (
                                <span key={month.month} title={formatCurrency(month.netCashFlow)}>
                                  <i style={{ height: `${height}%` }} />
                                  <small>{month.month}</small>
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {resultTab === 'summary' && lastAnalysis.transactions.length > 0 && (
                      <div className="sandbox-table-scroll">
                        <table className="sandbox-table">
                          <thead>
                            <tr>
                              <th>Data</th>
                              <th>Descrição</th>
                              <th>Valor</th>
                              <th>Classificação</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lastAnalysis.transactions.slice(0, 10).map((transaction) => (
                              <tr key={transaction.id}>
                                <td>{formatDateTime(transaction.transactionDate)}</td>
                                <td>{transaction.description}</td>
                                <td>{formatCurrency(transaction.amount)}</td>
                                <td>
                                  <span className="sandbox-classification-chip">
                                    {classificationLabels[transaction.classification]}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {lastAnalysis.transactions.length > 10 && (
                          <p style={{ padding: '10px 12px', margin: 0, fontSize: '0.72rem', color: 'var(--sb-ink-faint)' }}>
                            Mostrando 10 de {lastAnalysis.transactions.length} transações classificadas.
                          </p>
                        )}
                      </div>
                    )}
                  </section>
                )}

                <div className="sandbox-history">
                  <h3>Histórico de testes</h3>
                  <p>Últimas execuções feitas com esta conta de sandbox.</p>
                  <div className="sandbox-table-scroll">
                    <table className="sandbox-table">
                      <thead>
                        <tr>
                          <th>Quando</th>
                          <th>Empresa</th>
                          <th>Cenário</th>
                          <th>Score</th>
                          <th>Resultado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyLoading ? (
                          <tr><td colSpan={5}>Carregando…</td></tr>
                        ) : history.length > 0 ? (
                          history.map((entry) => (
                            <tr key={entry.id}>
                              <td>{formatDateTime(entry.createdAt)}</td>
                              <td>{entry.companyName ?? '—'}</td>
                              <td>{entry.scenario ?? '—'}</td>
                              <td>{entry.creditScore ?? '—'}</td>
                              <td>
                                <span className={`sandbox-status-dot ${entry.statusCode < 400 ? 'sandbox-status-dot--ok' : 'sandbox-status-dot--error'}`}>
                                  {entry.statusCode < 400 ? (entry.recommendation ? recommendationLabels[entry.recommendation as CreditAnalysis['report']['recommendation']] : 'Concluído') : `Erro ${entry.statusCode}`}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={5}>Nenhum teste realizado ainda.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {!quotaExhausted && (
                  <div className="sandbox-cta-banner">
                    <div>
                      <h3>Pronto para ir além do sandbox?</h3>
                      <p>Fale com nosso time comercial para avançar para uma prova de conceito com dados reais.</p>
                    </div>
                    <div className="sandbox-cta-banner__actions">
                      <a className="sandbox-button sandbox-button--primary" href={commercialMailto(account)}>
                        <MarketingIcon name="users" size={16} /> Falar com o time comercial
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
