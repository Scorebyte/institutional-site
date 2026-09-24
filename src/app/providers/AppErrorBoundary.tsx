import { Component, type ErrorInfo, type PropsWithChildren } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
}

export class AppErrorBoundary extends Component<
  PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Falha ao renderizar o site institucional.', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal-error">
          <div className="fatal-error__card">
            <span className="fatal-error__mark" aria-hidden="true">!</span>
            <p className="fatal-error__eyebrow">Não foi possível exibir esta página</p>
            <h1>Algo saiu do esperado</h1>
            <p>Recarregue a página para tentar novamente.</p>
            <button
              type="button"
              className="fatal-error__button"
              onClick={() => window.location.reload()}
            >
              Recarregar página
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
