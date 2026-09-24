# Guia da IA — ScoreByte

> Desenho complementar: [abra a arquitetura técnica em uma página separada](./arquitetura-tecnica.html).

## Resposta curta para apresentação

> A IA não aprova crédito diretamente. Ela classifica as transações financeiras usando um modelo supervisionado combinado com regras explicáveis. As classificações alimentam a consolidação do fluxo de caixa e uma política consultiva de score. A decisão final continua sendo humana.

## Fluxo completo

```text
Open Finance
→ normalização dos dados
→ classificação com IA + regras
→ consolidação do fluxo de caixa
→ política consultiva de score
→ revisão humana
```

## Que tipo de IA é utilizada?

O sistema utiliza **machine learning supervisionado**, e não IA generativa ou um LLM.

O classificador é composto por:

- modelo **Multinomial Naive Bayes**;
- regras determinísticas para padrões financeiros conhecidos;
- oito classes de transações;
- confiança e explicação por transação.

O Naive Bayes é adequado para este protótipo porque é rápido, reproduzível e funciona bem com textos curtos e variáveis categóricas.

## O que a IA recebe como entrada?

A transação é normalizada e transformada em características:

- palavras da descrição;
- tipo `CREDIT` ou `DEBIT`;
- conta `PF` ou `PJ`;
- categoria financeira;
- faixa do valor: pequeno, médio, grande ou muito grande.

O código responsável está em:

```text
scor-data-clearing/src/domain/naive-bayes-classifier.ts
Funções: tokenize, train e predict
```

## O que a IA devolve?

Cada transação recebe:

- classificação financeira;
- confiança entre 0 e 1;
- indicador de transação empresarial;
- origem da decisão;
- explicação textual.

As oito classes são:

- `BUSINESS_REVENUE` — receita empresarial;
- `BUSINESS_EXPENSE` — despesa empresarial;
- `PERSONAL_EXPENSE` — despesa pessoal;
- `PERSONAL_TRANSFER` — transferência pessoal;
- `TAX_PAYMENT` — imposto ou tributo;
- `LOAN_PAYMENT` — empréstimo ou financiamento;
- `SUPPLIER_PAYMENT` — pagamento de fornecedor;
- `UNKNOWN` — movimentação não reconhecida.

## Como funciona a decisão híbrida?

O modelo sempre calcula uma previsão. Em seguida, o motor verifica se existe uma regra conhecida.

- `ML`: somente o modelo decidiu.
- `RULE`: uma regra conhecida foi aplicada e não houve concordância com o modelo.
- `HYBRID`: modelo e regra chegaram à mesma classificação.

As regras reconhecem termos como DAS, DARF, fornecedor, capital de giro, maquininha, conta pessoal e serviços empresariais. Esses termos agora são personalizáveis na tela **Políticas de crédito**, separados entre movimentações do negócio e pessoais.

Ao publicar uma alteração:

- o backend normaliza os termos, ignorando acentos e maiúsculas;
- termos repetidos em classes diferentes são bloqueados para evitar ambiguidade;
- uma nova versão imutável da política é criada no PostgreSQL;
- a versão ativa passa a valer nas análises seguintes;
- análises já concluídas mantêm a versão que foi usada originalmente;
- a publicação fica registrada na trilha de auditoria.

O código está em:

```text
scor-data-clearing/src/domain/classifier.ts
scor-data-clearing/src/domain/rules-engine.ts
scor-data-clearing/src/infrastructure/database/classification-policy-repository.ts
```

## A IA calcula o score de crédito?

Não diretamente. Esta separação é importante durante a apresentação.

A IA classifica as transações. Depois, uma política determinística utiliza os valores consolidados para calcular um score entre 300 e 950.

A política considera:

- margem financeira;
- recorrência das receitas;
- estabilidade mensal;
- tendência de crescimento ou queda;
- meses com caixa positivo;
- proporção de gastos pessoais;
- capacidade estimada de pagamento.

Limites atuais:

- score igual ou superior a 700: `APPROVE`;
- score entre 540 e 699: `MANUAL_REVIEW`;
- score abaixo de 540: `DECLINE`.

O score é uma **política heurística consultiva**, e não um modelo estatístico de inadimplência.

O cálculo está em:

```text
scor-data-clearing/src/domain/report-generator.ts
Função: generateCreditReport
```

## Qualidade mínima dos dados

A análise espera:

- pelo menos seis meses observados;
- no mínimo 30 transações;
- receitas empresariais em pelo menos três meses.

Quando a qualidade é insuficiente, o sistema força revisão manual e não sugere limite de crédito.

## Treinamento e validação

O projeto mantém conjuntos separados de treinamento e validação holdout.

O modelo ativo expõe:

- versão do modelo;
- versão e fingerprint do dataset;
- data de treinamento;
- quantidade de amostras;
- acurácia;
- F1 macro;
- precisão, recall e F1 por classe.

### Snapshot do modelo ativo — 02/09/2026

- Versão do modelo: `3.4.0-db-ceecb2bd`.
- Acurácia no holdout: **98,88%**.
- F1 macro: **98,89%**.
- Amostras de treinamento: **529**.
- Amostras de validação: **178**.
- Alvo da avaliação: pipeline híbrido (`HYBRID_PIPELINE`).

Esses números medem a classificação de transações no conjunto sintético de validação separado do treino. Eles não representam taxa de aprovação de crédito nem desempenho comprovado com dados financeiros reais.

Os valores atuais aparecem automaticamente no painel **Modelo ativo** desta página e também no endpoint:

```text
GET http://127.0.0.1:3333/api/v1/models/current
```

As métricas atuais foram obtidas com dados sintéticos. Elas não comprovam desempenho em produção com dados reais.

## Como o sistema aprende com correções?

O analista pode corrigir uma classificação na tabela de transações.

O fluxo é:

```text
correção humana
→ feedback aprovado no PostgreSQL
→ inclusão no próximo conjunto de treinamento
→ execução auditável de treinamento
→ nova versão do modelo
```

O modelo não se retreina silenciosamente após cada correção. O treinamento é iniciado explicitamente com:

```powershell
npm run model:train
```

O holdout de validação permanece separado do feedback usado no treinamento.

## Explicabilidade e auditoria

Para cada transação, a interface apresenta:

- classe escolhida;
- confiança;
- fonte `ML`, `RULE` ou `HYBRID`;
- explicação da classificação.

A análise também registra:

- versão do modelo;
- fingerprint do dataset;
- versão das regras;
- versão da política de crédito;
- duração de cada etapa;
- identificador e hash da requisição;
- evidências positivas e pontos de atenção.

## Limitações que devem ser declaradas

- O modelo foi treinado e validado com dados sintéticos.
- A confiança ainda não foi calibrada com dados reais.
- O sistema não está validado para decisão automática.
- Ainda são necessárias avaliações de viés, drift e estabilidade em produção.
- Descrições financeiras precisam de tratamento adequado de privacidade e governança.
- O uso atual é restrito ao apoio de análise de crédito para MEI.

## Perguntas frequentes

### É ChatGPT ou IA generativa?

Não. É um modelo supervisionado de classificação de transações.

### A IA aprova ou recusa o crédito?

Não. Ela classifica movimentações. A recomendação é produzida por uma política consultiva e exige revisão humana.

### Por que utilizar regras junto com o modelo?

As regras aumentam a previsibilidade para padrões conhecidos. O modelo cobre descrições que não correspondem diretamente a essas regras.

### Como demonstrar que a IA está realmente integrada?

Na terceira etapa da esteira são exibidos o nome e a versão do modelo, a confiança média e a quantidade de decisões provenientes de IA, regras e concordância híbrida.

### A acurácia elevada significa que está pronto para produção?

Não. A métrica foi calculada em holdout sintético. É necessário validar o modelo com dados reais representativos antes de qualquer uso produtivo.

### Existe intervenção humana?

Sim. O analista confirma a decisão final e pode corrigir classificações para futuros treinamentos.

## Roteiro recomendado para a demonstração

1. Cole um dos CNPJs de teste.
2. Execute a análise.
3. Mostre a terceira etapa da esteira e a versão do modelo.
4. Abra a tabela de transações.
5. Mostre classificação, confiança, fonte e explicação.
6. Abra **Políticas de crédito** e mostre a separação editável entre negócio e pessoal.
7. Acrescente um termo, publique a nova versão e execute outra análise para demonstrar a regra ativa.
8. Explique que o score é consultivo e que a decisão final é humana.
9. Demonstre a correção de uma classificação como feedback supervisionado.

## Principais arquivos do código

```text
scor-data-clearing/src/domain/naive-bayes-classifier.ts
Implementação, treinamento e inferência do Naive Bayes.

scor-data-clearing/src/domain/classifier.ts
Combinação entre modelo e regras, confiança e model card.

scor-data-clearing/src/domain/rules-engine.ts
Regras financeiras explicáveis.

scor-data-clearing/src/infrastructure/database/classification-policy-repository.ts
Persistência, versionamento e auditoria das regras personalizadas.

scor-data-clearing/database/migrations/003_classification_policies.sql
Tabela que mantém o histórico das políticas por tenant.

scor-data-clearing/src/application/pipeline-service.ts
Integração da IA com a esteira de análise.

scor-data-clearing/src/domain/report-generator.ts
Política determinística do score consultivo.

scor-data-clearing/src/infrastructure/database/model-repository.ts
Treinamento, versionamento, feedback e ativação do modelo.

scor-data-clearing/src/infrastructure/database/review-repository.ts
Decisão humana e correções supervisionadas.

FrontEnd/src/features/credit-analysis/ui/PipelineJourney.tsx
Evidência visual da execução da IA.

FrontEnd/src/features/transactions/ui/TransactionsTable.tsx
Confiança, origem, explicação e correção por transação.
```
