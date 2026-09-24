import { Link, useLocation } from 'react-router-dom'
import { Brand } from '@/shared/ui/Brand'

export function SiteFooter() {
  const { pathname } = useLocation()
  const homeAnchor = pathname === '/' ? '' : '/'

  return (
    <footer className="institutional-footer">
      <div className="institutional-container institutional-footer__top">
        <div>
          <Brand inverted />
          <p>Inteligência financeira para decisões de crédito MEI mais claras, consistentes e responsáveis.</p>
        </div>
        <div className="institutional-footer__nav">
          <div>
            <strong>Produto</strong>
            <a href={`${homeAnchor}#solucao`}>Solução</a>
            <a href={`${homeAnchor}#como-funciona`}>Como funciona</a>
            <Link to="/sandbox">Sandbox</Link>
          </div>
          <div>
            <strong>ScoreByte</strong>
            <a href={`${homeAnchor}#para-quem`}>Para quem</a>
            <a href={`${homeAnchor}#confianca`}>Confiança</a>
            <a href={`${homeAnchor}#duvidas`}>Perguntas frequentes</a>
          </div>
        </div>
      </div>
      <div className="institutional-container institutional-footer__bottom">
        <span>© {new Date().getFullYear()} ScoreByte. Todos os direitos reservados.</span>
        <span>Crédito responsável começa com transparência.</span>
      </div>
    </footer>
  )
}
