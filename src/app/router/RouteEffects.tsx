import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/': 'Crédito MEI com inteligência e clareza',
  '/sandbox': 'Sandbox de demonstração',
  '/acesso': 'Acessar minha conta',
  '/mei': 'Portal do MEI',
}

export function RouteEffects() {
  const location = useLocation()

  useEffect(() => {
    document.title = `${pageTitles[location.pathname] ?? 'Página'} | ScoreByte`
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>('#main-content')?.focus())
  }, [location.pathname])

  return <Outlet />
}
