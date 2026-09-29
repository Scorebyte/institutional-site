import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MarketingIcon } from '@/shared/ui/MarketingIcon'
import { useInstitutionalTheme } from '@/widgets/site-chrome/lib/useInstitutionalTheme'
import { SiteHeader } from '@/widgets/site-chrome/ui/SiteHeader'
import { SiteFooter } from '@/widgets/site-chrome/ui/SiteFooter'

type Persona = 'mei' | 'bank'

export function AccessPage() {
  useInstitutionalTheme()
  const [persona, setPersona] = useState<Persona>('mei')

  return (
    <div className="sandbox-page access-page">
      <a className="institutional-skip-link" href="#main-content">Pular para o conteúdo</a>
      <SiteHeader />

      <main id="main-content" tabIndex={-1}>
        <section className="sandbox-intro">
          <div className="institutional-container">
            <p className="sandbox-intro__eyebrow"><MarketingIcon name="key" size={16} /> Acesso</p>
            <h1>Como você quer acessar a ScoreByte?</h1>
            <p>Escolha uma opção abaixo para ir direto para o lugar certo.</p>
          </div>
        </section>

        <section className="sandbox-main">
          <div className="institutional-container">
            <div className="sandbox-result__tabs access-page__tabs" role="tablist" aria-label="Escolha seu perfil">
              <button
                aria-selected={persona === 'mei'}
                className={`sandbox-result__tab ${persona === 'mei' ? 'is-active' : ''}`}
                onClick={() => setPersona('mei')}
                role="tab"
                type="button"
              >
                <MarketingIcon name="wallet" size={16} /> Sou MEI
              </button>
              <button
                aria-selected={persona === 'bank'}
                className={`sandbox-result__tab ${persona === 'bank' ? 'is-active' : ''}`}
                onClick={() => setPersona('bank')}
                role="tab"
                type="button"
              >
                <MarketingIcon name="building" size={16} /> Sou banco ou fintech
              </button>
            </div>

            {persona === 'mei' ? (
              <div className="access-page__card">
                <MarketingIcon name="wallet" size={28} />
                <h2>Portal do MEI</h2>
                <p>
                  Entre com o e-mail cadastrado (ou faça seu cadastro), conecte seu banco pelo Open
                  Finance e acompanhe o status da sua conexão e da sua análise de crédito.
                </p>
                <Link className="sandbox-button sandbox-button--primary" to="/mei">
                  <MarketingIcon name="arrow" size={17} /> Entrar no portal MEI
                </Link>
              </div>
            ) : (
              <div className="access-page__card">
                <MarketingIcon name="building" size={28} />
                <h2>Sandbox para bancos e fintechs</h2>
                <p>
                  Teste a API de inteligência de crédito da ScoreByte em um ambiente isolado, com dados
                  100% fictícios, antes de integrar em produção.
                </p>
                <Link className="sandbox-button sandbox-button--primary" to="/sandbox">
                  <MarketingIcon name="arrow" size={17} /> Acessar sandbox
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
