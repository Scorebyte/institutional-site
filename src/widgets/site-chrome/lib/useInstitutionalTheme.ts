import { useLayoutEffect } from 'react'

/** Aplica o tema escuro institucional ao body enquanto a página estiver montada. */
export function useInstitutionalTheme(): void {
  useLayoutEffect(() => {
    document.body.classList.add('institutional-body')
    return () => {
      document.body.classList.remove('institutional-body')
    }
  }, [])
}
