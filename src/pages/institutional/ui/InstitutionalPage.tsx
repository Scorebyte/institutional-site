import { Link } from 'react-router-dom'
import { MarketingIcon } from '@/shared/ui/MarketingIcon'
import { useInstitutionalTheme } from '@/widgets/site-chrome/lib/useInstitutionalTheme'
import { SiteHeader } from '@/widgets/site-chrome/ui/SiteHeader'
import { SiteFooter } from '@/widgets/site-chrome/ui/SiteFooter'

const capabilities = [
  {
    icon: 'wallet' as const,
    title: 'Visão financeira integrada',
    copy: 'Reúne as movimentações autorizadas para mostrar como o dinheiro realmente circula no negócio.',
  },
  {
    icon: 'brain' as const,
    title: 'Pessoal e negócio separados',
    copy: 'Organiza receitas e despesas para diferenciar o que pertence à empresa e o que faz parte da vida pessoal.',
  },
  {
    icon: 'chart' as const,
    title: 'Visão de fluxo de caixa',
    copy: 'Transforma lançamentos dispersos em recorrência, estabilidade, capacidade de pagamento e pontos de atenção.',
  },
  {
    icon: 'spark' as const,
    title: 'Recomendação com contexto',
    copy: 'Apresenta uma sugestão de crédito acompanhada dos motivos que ajudam a equipe a avaliar cada caso.',
  },
  {
    icon: 'users' as const,
    title: 'Decisão sempre humana',
    copy: 'Mantém o analista no controle, com uma visão organizada dos casos e o registro de cada decisão.',
  },
  {
    icon: 'shield' as const,
    title: 'Histórico de cada análise',
    copy: 'Mantém as informações e decisões organizadas para consultas, revisões e acompanhamento da operação.',
  },
]

const journey = [
  ['01', 'Conexão', 'O cliente autoriza o compartilhamento das informações financeiras.'],
  ['02', 'Organização', 'Receitas e despesas são reunidas em uma visão simples.'],
  ['03', 'Leitura do negócio', 'As movimentações pessoais e empresariais são separadas.'],
  ['04', 'Visão financeira', 'A equipe enxerga caixa, recorrência e capacidade de pagamento.'],
  ['05', 'Recomendação', 'Os principais sinais são apresentados para a decisão do analista.'],
]

const audiences = [
  {
    icon: 'building' as const,
    label: 'Bancos e instituições financeiras',
    copy: 'Tenha uma visão mais completa do negócio do MEI e motivos claros para apoiar cada decisão.',
  },
  {
    icon: 'layers' as const,
    label: 'Fintechs e cooperativas',
    copy: 'Ofereça uma jornada de crédito mais clara, sem aumentar a complexidade para a equipe ou para o cliente.',
  },
  {
    icon: 'users' as const,
    label: 'Times de crédito e risco',
    copy: 'Priorize a fila, revise casos sensíveis e justifique decisões com o mesmo contexto operacional.',
  },
]

const chartBars = [68, 76, 73, 84, 79, 88]

export function InstitutionalPage() {
  useInstitutionalTheme()

  return (
    <div className="institutional-page" id="inicio">
      <a className="institutional-skip-link" href="#main-content">Pular para o conteúdo</a>

      <SiteHeader />

      <main id="main-content" tabIndex={-1}>
        <section className="institutional-hero" aria-labelledby="hero-title">
          <div className="institutional-hero__glow" aria-hidden="true" />
          <div className="institutional-container institutional-hero__grid">
            <div className="institutional-hero__content">
              <p className="institutional-kicker">
                <span /> Crédito para quem move o Brasil
              </p>
              <h1 id="hero-title">
                Crédito MEI com <em>contexto</em>, clareza e decisão humana.
              </h1>
              <p className="institutional-hero__lead">
                A ScoreByte transforma informações financeiras autorizadas em uma visão clara do negócio — do fluxo de caixa à recomendação de crédito — para apoiar decisões mais consistentes e responsáveis.
              </p>
              <div className="institutional-hero__actions">
                <Link className="institutional-button institutional-button--primary" to="/sandbox">
                  Conhecer a plataforma
                  <MarketingIcon name="arrow" size={19} />
                </Link>
                <a className="institutional-button institutional-button--secondary" href="#como-funciona">
                  Ver como funciona
                </a>
              </div>
              <ul className="institutional-proof-list" aria-label="Diferenciais da plataforma">
                <li><MarketingIcon name="check" size={16} /> Dados autorizados</li>
                <li><MarketingIcon name="check" size={16} /> Critérios claros</li>
                <li><MarketingIcon name="check" size={16} /> Revisão humana</li>
              </ul>
            </div>

            <div
              className="hero-flow"
              role="img"
              aria-label="Ilustração animada do motor da ScoreByte: dados do Open Finance e da BrasilAPI alimentam a classificação híbrida por regras e IA, que gera uma recomendação para decisão humana."
            >
              <div className="hero-flow__orbit hero-flow__orbit--one" aria-hidden="true" />
              <div className="hero-flow__orbit hero-flow__orbit--two" aria-hidden="true" />

              <div className="hero-flow__card">
                <div className="hero-flow__sources" aria-hidden="true">
                  <span className="hero-flow__avatar">OF</span>
                  <span className="hero-flow__avatar hero-flow__avatar--lead"><MarketingIcon name="spark" size={17} /></span>
                  <span className="hero-flow__avatar">MEI</span>
                </div>

                <svg className="hero-flow__lines" aria-hidden="true" viewBox="0 0 320 46" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="heroFlowGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b3d" />
                      <stop offset="100%" stopColor="#ff3d68" />
                    </linearGradient>
                  </defs>
                  <path d="M40 0 C40 24, 160 14, 160 46" />
                  <path d="M160 0 L160 46" />
                  <path d="M280 0 C280 24, 160 14, 160 46" />
                </svg>

                <div className="hero-flow__nodes" aria-hidden="true">
                  <span className="hero-flow__node"><MarketingIcon name="api" size={14} /> Coleta</span>
                  <span className="hero-flow__node hero-flow__node--active">
                    <i className="hero-flow__dot" />
                    <MarketingIcon name="brain" size={14} /> IA híbrida
                  </span>
                  <span className="hero-flow__node"><MarketingIcon name="wallet" size={14} /> Decisão</span>
                </div>

                <div className="hero-flow__chat" aria-hidden="true">
                  <p>Qual é a saúde financeira desse CNPJ?<span className="hero-flow__cursor" /></p>
                  <div className="hero-flow__suggestions">
                    <span><MarketingIcon name="chart" size={13} /> Fluxo de caixa</span>
                    <span><MarketingIcon name="shield" size={13} /> Score de crédito</span>
                  </div>
                </div>

                <ul className="hero-flow__stack" aria-hidden="true">
                  <li>Open Finance</li>
                  <li>Pluggy</li>
                  <li>BrasilAPI</li>
                  <li>PostgreSQL</li>
                  <li>RabbitMQ</li>
                </ul>
              </div>

              <div className="hero-flow__float hero-flow__float--top">
                <span><MarketingIcon name="spark" size={15} /></span>
                <div><small>Leitura</small><strong>Pessoal + negócio</strong></div>
              </div>
              <div className="hero-flow__float hero-flow__float--bottom">
                <span><MarketingIcon name="shield" size={15} /></span>
                <div><small>Decisão</small><strong>Revisão humana</strong></div>
              </div>
            </div>
          </div>

          <div className="institutional-container institutional-hero__footer">
            <p>Uma camada inteligente entre os dados financeiros e a decisão de crédito.</p>
            <div>
              <span><strong>5</strong> etapas de análise</span>
              <span><strong>6</strong> meses de visão</span>
              <span><strong>1</strong> decisão humana</span>
            </div>
          </div>
        </section>

        <section className="institutional-section showcase-section" id="produto" aria-labelledby="showcase-title">
          <div className="institutional-container showcase-grid">
            <div className="showcase-copy">
              <p className="institutional-eyebrow">Em ação</p>
              <h2 id="showcase-title">Da conversa aos números, em poucos passos.</h2>
              <p>Um cenário demonstrativo mostra como a ScoreByte transforma transações autorizadas em uma leitura clara do negócio.</p>

              <div className="showcase-stats">
                <div><strong>758</strong><span>pontuação no cenário de exemplo</span></div>
                <div><strong>R$ 10,5 mil</strong><span>limite sugerido no exemplo</span></div>
                <div><strong>6 meses</strong><span>de fluxo de caixa analisados</span></div>
              </div>

              <blockquote className="showcase-quote">
                <p>“A recomendação orienta. A decisão de crédito continua sendo humana.”</p>
                <cite>Princípio de design da ScoreByte</cite>
              </blockquote>
            </div>

            <div
              className="product-stage"
              role="img"
              aria-label="Ilustração da visão financeira ScoreByte em um cenário demonstrativo, com avaliação geral, limite sugerido, fluxo de caixa e pontos positivos do negócio."
            >
              <div className="product-stage__orbit product-stage__orbit--one" aria-hidden="true" />
              <div className="product-stage__orbit product-stage__orbit--two" aria-hidden="true" />
              <div className="product-window">
                <div className="product-window__topbar">
                  <span className="product-window__mini-brand"><b>S</b> ScoreByte</span>
                  <span className="product-window__status"><i /> Cenário demonstrativo</span>
                </div>
                <div className="product-window__body">
                  <aside className="product-window__sidebar" aria-hidden="true">
                    <span className="is-active" />
                    <span />
                    <span />
                    <span />
                  </aside>
                  <div className="product-window__dashboard">
                    <div className="product-window__heading">
                      <div>
                        <span>Visão financeira</span>
                        <strong>Silva &amp; Co. Ferragens</strong>
                      </div>
                      <em>Cenário favorável para análise</em>
                    </div>
                    <div className="product-window__metrics">
                      <article className="product-score">
                        <div className="product-score__ring"><strong>758</strong><small>de 950</small></div>
                        <div><span>Avaliação geral</span><strong>Bom perfil</strong><small>Dados de demonstração</small></div>
                      </article>
                      <article className="product-limit">
                        <span>Limite sugerido</span>
                        <strong>R$ 10.500</strong>
                        <small>Exemplo demonstrativo</small>
                      </article>
                    </div>
                    <div className="product-window__lower">
                      <article className="product-chart">
                        <div className="product-card-heading">
                          <span>Fluxo de caixa</span>
                          <i>6 meses</i>
                        </div>
                        <div className="product-chart__bars" aria-hidden="true">
                          {chartBars.map((height, index) => (
                            <span key={height}>
                              <i style={{ height: `${height}%` }} />
                              <b style={{ height: `${Math.max(22, height - 42)}%` }} />
                              <small>{['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][index]}</small>
                            </span>
                          ))}
                        </div>
                      </article>
                      <article className="product-evidence">
                        <div className="product-card-heading"><span>Pontos positivos</span><i>Motivos claros</i></div>
                        <ul>
                          <li><MarketingIcon name="check" size={13} /> Caixa positivo em 6 meses</li>
                          <li><MarketingIcon name="check" size={13} /> Receita recorrente</li>
                          <li><MarketingIcon name="check" size={13} /> Estabilidade financeira</li>
                        </ul>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
              <div className="product-float-card product-float-card--top">
                <span><MarketingIcon name="spark" size={15} /></span>
                <div><small>Leitura</small><strong>Pessoal + negócio</strong></div>
              </div>
              <div className="product-float-card product-float-card--bottom">
                <span><MarketingIcon name="shield" size={15} /></span>
                <div><small>Decisão</small><strong>Revisão humana</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className="institutional-section challenge-section" id="solucao" aria-labelledby="challenge-title">
          <div className="institutional-container">
            <div className="institutional-section-heading institutional-section-heading--split">
              <div>
                <p className="institutional-eyebrow">O desafio</p>
                <h2 id="challenge-title">O MEI não cabe em uma análise tradicional.</h2>
              </div>
              <p>
                Movimentações pessoais e empresariais se misturam, documentos contam apenas parte da história e o analista precisa decidir com pouco contexto. A ScoreByte organiza essa complexidade e mostra com clareza os motivos da análise.
              </p>
            </div>

            <div className="challenge-comparison">
              <article className="challenge-card challenge-card--muted">
                <span className="challenge-card__number">Sem contexto</span>
                <h3>Uma fotografia incompleta do negócio</h3>
                <ul>
                  <li>Dados financeiros fragmentados</li>
                  <li>Renda declarada sem dinâmica de caixa</li>
                  <li>Análises manuais difíceis de comparar</li>
                  <li>Baixa clareza para justificar a decisão</li>
                </ul>
              </article>
              <div className="challenge-comparison__arrow" aria-hidden="true">
                <MarketingIcon name="arrow" size={28} />
              </div>
              <article className="challenge-card challenge-card--brand">
                <span className="challenge-card__number">Com ScoreByte</span>
                <h3>O negócio visto em movimento</h3>
                <ul>
                  <li>Fluxo financeiro consolidado</li>
                  <li>Separação entre vida pessoal e empresa</li>
                  <li>Critérios claros e consistentes</li>
                  <li>Evidências acessíveis ao analista</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="institutional-section capability-section" aria-labelledby="capability-title">
          <div className="institutional-container">
            <div className="institutional-section-heading">
              <p className="institutional-eyebrow">A plataforma</p>
              <h2 id="capability-title">O que muda na sua análise de crédito.</h2>
              <p>Mais clareza para entender o negócio, comparar cenários e tomar decisões com confiança.</p>
            </div>

            <div className="capability-grid">
              {capabilities.map((capability, index) => (
                <article className={`capability-card capability-card--${index + 1}`} key={capability.title}>
                  <span className="capability-card__icon"><MarketingIcon name={capability.icon} /></span>
                  <span className="capability-card__index">0{index + 1}</span>
                  <h3>{capability.title}</h3>
                  <p>{capability.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="institutional-section journey-section" id="como-funciona" aria-labelledby="journey-title">
          <div className="institutional-container">
            <div className="institutional-section-heading institutional-section-heading--light">
              <p className="institutional-eyebrow">Como funciona</p>
              <h2 id="journey-title">Dos dados à decisão, etapa por etapa.</h2>
              <p>Uma jornada simples, com informações claras do início à recomendação.</p>
            </div>

            <ol className="journey-list">
              {journey.map(([number, title, copy], index) => (
                <li key={title}>
                  <span className="journey-list__number">{number}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                  {index < journey.length - 1 && <span className="journey-list__connector" aria-hidden="true" />}
                </li>
              ))}
            </ol>

            <div className="journey-note">
              <span><MarketingIcon name="eye" /></span>
              <div>
                <strong>Os motivos acompanham a recomendação.</strong>
                <p>O analista entende os pontos positivos, os sinais de atenção e o que sustenta a sugestão antes de decidir.</p>
              </div>
              <Link to="/sandbox">Ver análise completa <MarketingIcon name="arrow" size={17} /></Link>
            </div>
          </div>
        </section>

        <section className="institutional-section audience-section" id="para-quem" aria-labelledby="audience-title">
          <div className="institutional-container">
            <div className="institutional-section-heading institutional-section-heading--split">
              <div>
                <p className="institutional-eyebrow">Para quem</p>
                <h2 id="audience-title">Mais clareza para a operação, sem complicar a rotina.</h2>
              </div>
              <p>A ScoreByte reúne as informações que a equipe precisa em uma experiência simples, organizada e fácil de acompanhar.</p>
            </div>

            <div className="audience-grid">
              {audiences.map((audience) => (
                <article key={audience.label}>
                  <span><MarketingIcon name={audience.icon} size={25} /></span>
                  <h3>{audience.label}</h3>
                  <p>{audience.copy}</p>
                </article>
              ))}
            </div>

            <div className="offer-strip">
              <div className="offer-strip__intro">
                <p className="institutional-eyebrow">O que sua equipe recebe</p>
                <h3>Mais clareza em cada etapa da decisão.</h3>
              </div>
              <div className="offer-strip__items">
                <span><b>01</b> Visão financeira</span>
                <span><b>02</b> Análise orientada</span>
                <span><b>03</b> Recomendação com contexto</span>
                <span><b>04</b> Histórico das decisões</span>
              </div>
            </div>
          </div>
        </section>

        <section className="institutional-section governance-section" id="confianca" aria-labelledby="governance-title">
          <div className="institutional-container governance-grid">
            <div className="governance-copy">
              <p className="institutional-eyebrow">Decisões com responsabilidade</p>
              <h2 id="governance-title">A ScoreByte recomenda. Sua equipe decide.</h2>
              <p>
                Cada recomendação vem acompanhada dos motivos que importam. Assim, o analista mantém o controle e decide com mais contexto, consistência e segurança.
              </p>
              <div className="governance-links">
                <Link to="/sandbox">
                  Ver a ScoreByte em ação <MarketingIcon name="arrow" size={17} />
                </Link>
              </div>
            </div>

            <div className="governance-card">
              <div className="governance-card__seal">
                <MarketingIcon name="shield" size={31} />
                <div><span>Nosso compromisso</span><strong>Decisão sempre humana</strong></div>
              </div>
              <ul>
                <li><MarketingIcon name="check" size={17} /><span><strong>Decisão sempre humana</strong> — a plataforma orienta, o analista decide</span></li>
                <li><MarketingIcon name="check" size={17} /><span><strong>Motivos claros</strong> — pontos positivos e sinais de atenção ficam visíveis</span></li>
                <li><MarketingIcon name="check" size={17} /><span><strong>Critérios consistentes</strong> — todos os casos seguem a mesma lógica de avaliação</span></li>
                <li><MarketingIcon name="check" size={17} /><span><strong>Histórico preservado</strong> — cada análise e decisão podem ser consultadas</span></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="institutional-section faq-section" id="duvidas" aria-labelledby="faq-title">
          <div className="institutional-container faq-grid">
            <div className="faq-intro">
              <p className="institutional-eyebrow">Perguntas frequentes</p>
              <h2 id="faq-title">Transparência também faz parte da oferta.</h2>
              <p>Respostas diretas sobre como a ScoreByte apoia sua equipe e participa da decisão.</p>
            </div>
            <div className="faq-list">
              <details>
                <summary>A ScoreByte aprova ou recusa crédito automaticamente?<span aria-hidden="true">+</span></summary>
                <p>Não. A plataforma apresenta uma recomendação e os principais motivos da análise. A decisão final continua sendo do analista responsável.</p>
              </details>
              <details>
                <summary>Como a ScoreByte ajuda na análise?<span aria-hidden="true">+</span></summary>
                <p>A plataforma organiza as movimentações, separa o que é pessoal do que pertence ao negócio e destaca os sinais mais importantes para a avaliação.</p>
              </details>
              <details>
                <summary>Como a solução entra na rotina da equipe?<span aria-hidden="true">+</span></summary>
                <p>O analista acompanha os casos em um único ambiente, consulta a visão financeira, entende a recomendação e registra sua decisão no mesmo fluxo.</p>
              </details>
              <details>
                <summary>A ScoreByte já pode ser usada com dados reais?<span aria-hidden="true">+</span></summary>
                <p>A versão atual está em fase de demonstração e validação. O uso real depende das aprovações, cuidados de privacidade e validações exigidas por cada instituição.</p>
              </details>
              <details>
                <summary>O que acontece quando os dados são insuficientes?<span aria-hidden="true">+</span></summary>
                <p>A ScoreByte sinaliza que o caso precisa de revisão e não apresenta uma sugestão de limite até que existam informações suficientes.</p>
              </details>
            </div>
          </div>
        </section>

        <section className="institutional-cta" id="contato" aria-labelledby="cta-title">
          <div className="institutional-container institutional-cta__card">
            <div className="institutional-cta__pattern" aria-hidden="true" />
            <div>
              <p className="institutional-eyebrow">Veja em funcionamento</p>
              <h2 id="cta-title">Uma decisão melhor começa com uma visão mais completa.</h2>
              <p>Explore a jornada ScoreByte com cenários demonstrativos de crédito MEI e acompanhe cada etapa da análise.</p>
            </div>
            <div className="institutional-cta__actions">
              <Link className="institutional-button institutional-button--light" to="/sandbox">
                Iniciar demonstração <MarketingIcon name="arrow" size={19} />
              </Link>
              <a href="#como-funciona">Rever como funciona</a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
