# @scorbyte/institutional-site

Site institucional da ScoreByte (React 19 + TypeScript + Vite): apresenta a
oferta e expõe um sandbox público de demonstração do pipeline de análise de
crédito.

Depende de `@scorbyte/shared-kernel` para tipos e formatadores compartilhados
com a `analyst-platform`.

## Executar

```bash
npm install
npm run dev
```

Aplicação local: `http://localhost:5175`.

## Fluxos

- `/`: página institucional;
- `/sandbox`: demonstração pública do pipeline de análise de crédito.

## Qualidade

```bash
npm run lint
npm run build
```
