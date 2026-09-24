export function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={`institutional-brand ${inverted ? 'institutional-brand--inverted' : ''}`}>
      <span className="institutional-brand__mark" aria-hidden="true">
        <span>S</span>
        <i />
      </span>
      <span className="institutional-brand__wordmark">
        <strong>Score<span>Byte</span></strong>
        <small>Inteligência de crédito</small>
      </span>
    </span>
  )
}
