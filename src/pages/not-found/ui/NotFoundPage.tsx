import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="not-found" id="main-content" tabIndex={-1}>
      <p className="not-found__eyebrow">Página não encontrada</p>
      <h1>Essa página não existe.</h1>
      <p>Volte para a página inicial da ScoreByte.</p>
      <Link className="not-found__button" to="/">
        Voltar ao início
      </Link>
    </main>
  )
}
