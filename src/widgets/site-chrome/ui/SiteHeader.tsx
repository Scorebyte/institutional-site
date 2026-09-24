import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Brand } from '@/shared/ui/Brand'
import { MarketingIcon } from '@/shared/ui/MarketingIcon'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()
  // Os links de âncora (#solucao etc.) só existem na página inicial; em outras rotas
  // precisam apontar de volta para lá antes do fragmento.
  const homeAnchor = pathname === '/' ? '' : '/'

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 921px)')
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        window.requestAnimationFrame(() => menuButtonRef.current?.focus({ preventScroll: true }))
      }
    }
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    desktopQuery.addEventListener('change', closeOnDesktop)

    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      desktopQuery.removeEventListener('change', closeOnDesktop)
    }
  }, [])

  const closeMenu = (restoreFocus = false) => {
    setMenuOpen(false)
    if (restoreFocus) {
      window.requestAnimationFrame(() => menuButtonRef.current?.focus({ preventScroll: true }))
    }
  }

  return (
    <header className="institutional-header">
      <div className="institutional-container institutional-header__inner">
        <Link to="/" aria-label="ScoreByte — página inicial" onClick={() => closeMenu()}>
          <Brand />
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          className="institutional-menu-button"
          aria-expanded={menuOpen}
          aria-controls="institutional-navigation"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MarketingIcon name={menuOpen ? 'close' : 'menu'} />
        </button>

        <nav
          id="institutional-navigation"
          className={`institutional-nav ${menuOpen ? 'is-open' : ''}`}
          aria-label="Navegação institucional"
        >
          <a href={`${homeAnchor}#solucao`} onClick={() => closeMenu(true)}>Solução</a>
          <a href={`${homeAnchor}#como-funciona`} onClick={() => closeMenu(true)}>Como funciona</a>
          <a href={`${homeAnchor}#para-quem`} onClick={() => closeMenu(true)}>Para quem</a>
          <a href={`${homeAnchor}#confianca`} onClick={() => closeMenu(true)}>Confiança</a>
          <Link className="institutional-nav__cta" to="/sandbox" onClick={() => closeMenu()}>
            Acessar demonstração
            <MarketingIcon name="arrow" size={18} />
          </Link>
        </nav>
      </div>
    </header>
  )
}
