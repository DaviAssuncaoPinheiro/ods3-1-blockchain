# Relatório de Revisão e Pontos de Melhoria: ProductPass

Revisão feita sobre o commit `bc2fa30` (branch `main`). Todos os arquivos versionados foram lidos: contrato, testes, scripts de deploy, camada `lib/`, hooks, componentes e páginas.

---

## 0. Atualização: decisões da equipe e status

| # | Item | Decisão | Status |
| --- | --- | --- | --- |
| 1 | ODS | "ODS" é a disciplina Oficina de Desenvolvimento 3, não um Objetivo de Desenvolvimento Sustentável. Item descartado; o README agora cita a disciplina. | Resolvido |
| 2 | Idioma | Traduzir para português. | Feito: interface, mensagens de erro, datas (`pt-BR`), scripts e README. Nomes no código continuam em inglês. |
| 3 | Versão do Node | Manter; cada integrante atualiza o próprio Node. | README corrigido para "22.13 ou mais recente". `engines`/`.nvmrc` não adicionados. |
| 4 | Ordem das etapas | Status atual = último evento, sem perder os status já vividos. | Feito: cada entrada do histórico grava o status após o evento; a página do produto mostra a trilha (ex.: Fabricado → Com manutenção → Vendido). |
| 5 | Limite da descrição | Recomendado manter bytes no contrato e ajustar o frontend (ver justificativa abaixo). | Feito: contador e validação em bytes na interface. |
| 6 | Validações | Levar as validações do frontend para o contrato. | Feito: limite de 64 bytes e proibição de espaços nas pontas no contrato, com erros `FieldTooLong` e `UntrimmedField`. |
| 7 | Nome do participante | Obrigatório. | Feito: `grantRole(account, role, name)`, construtor recebe o nome do Administrador, nomes exibidos em todas as telas. |
| 8 | Governança | Aguardando decisão sobre a recomendação. | Pendente |
| 11 | Testes | Consequência dos itens acima. | Parcial: de 23 para 45 testes no contrato, cobrindo as lacunas listadas. Frontend continua sem testes. |

**Por que manter o limite em bytes no contrato (item 5):** o Solidity não tem noção de "caractere"; `bytes(texto).length` é barato e determinístico. Contar caracteres UTF-8 no contrato exigiria percorrer o texto byte a byte, gastando gas proporcional ao tamanho, só para reproduzir algo que o frontend calcula de graça com `TextEncoder`. O contrato é a regra; a interface apenas mostra a mesma medida ao usuário.

---

## 1. Entendimento do projeto

**Intuito:** um "passaporte digital de produto" em blockchain. Vários participantes independentes (fabricante, varejista, assistência técnica) escrevem o histórico do mesmo produto, e qualquer consumidor consulta esse histórico sem precisar de carteira.

**Como está elaborado:**

| Camada | Implementação |
| --- | --- |
| Contrato | `contracts/ProductPass.sol`: papéis (Admin, Manufacturer, Retailer, ServiceCenter), cadastro de produto, venda com garantia, manutenção, histórico em storage e em eventos |
| Rede | Nó Hardhat local (chain 31337), tudo em memória |
| Deploy | `scripts/deploy.ts` e `scripts/setupDemo.ts` gravam endereço e ABI em `lib/contracts/` |
| Frontend | Next.js 16 + React 19 + Tailwind 4; leituras via `JsonRpcProvider` (sem carteira), escritas via MetaMask |
| Testes | `test/ProductPass.test.ts` com Mocha/Chai e fixtures |

**Pontos fortes (manter):**

- Separação de camadas limpa: páginas -> hooks -> `lib/blockchain` -> contrato.
- Erros customizados no contrato (`error ProductNotFound(...)`) traduzidos em mensagens legíveis (`lib/blockchain/contractErrors.ts`).
- Consulta pública sem carteira, que é exatamente o caso de uso do consumidor.
- README muito completo, com seção honesta "What blockchain does not solve".
- Explorer que mostra `parentHash`, ótimo recurso didático para a apresentação.
- Fixtures encadeadas nos testes (`deployFixture` -> `configuredRolesFixture` -> ...), deixando os testes independentes.

---

## 2. Resumo das melhorias por prioridade

| # | Melhoria | Prioridade | Tipo |
| --- | --- | --- | --- |
| 1 | Alinhamento com o ODS não aparece em lugar nenhum | Alta | Escopo acadêmico |
| 2 | Idioma do projeto (tudo em inglês) | Alta | Escopo acadêmico |
| 3 | Versão mínima do Node está errada no README | Alta | Ambiente |
| 4 | Máquina de estados do produto inconsistente | Alta | Bug no contrato |
| 5 | Limite da descrição conta bytes no contrato e caracteres na UI | Alta | Bug |
| 6 | Validações existem só no frontend | Alta | Segurança/Integridade |
| 7 | Consumidor vê apenas endereços, não nomes de participantes | Alta | Conceito/UX |
| 8 | Não existe revogação de papéis; Admin é ponto único de controle | Alta | Segurança/Governança |
| 9 | Garantia não é usada em nenhuma regra | Média | Regra de negócio |
| 10 | `productId` sensível a maiúsculas; `serialNumber` não é único | Média | Integridade |
| 11 | Lacunas nos testes e README promete mais do que é testado | Média | Qualidade |
| 12 | Constantes duplicadas e TypeChain configurado mas não usado | Média | Manutenibilidade |
| 13 | Ações da página do produto ignoram papel e estado | Média | UX |
| 14 | `npm run setup` não é idempotente e altera arquivos versionados | Média | Fluxo de equipe |
| 15 | Sem ESLint, Prettier ou CI | Média | Qualidade |
| 16 | Cadeia de custódia incompleta (qualquer varejista vende qualquer produto) | Baixa | Evolução |
| 17 | Leituras de eventos varrem tudo desde o deploy a cada bloco | Baixa | Desempenho |
| 18 | Histórico duplicado em storage e em eventos | Baixa | Custo/Justificativa |
| 19 | QR Code para consulta do produto | Baixa | Demonstração |
| 20 | Pequenos ajustes no frontend | Baixa | Robustez |
| 21 | Documentação acadêmica complementar | Baixa | Documentação |

---

## 3. Detalhamento

### 1. Alinhamento com o ODS não aparece em lugar nenhum (Alta)

**O que:** o repositório se chama `ods3-1-blockchain`, mas nem o README, nem o código, nem a interface mencionam qualquer ODS (Objetivo de Desenvolvimento Sustentável). O ODS 3 da ONU é "Saúde e Bem-Estar", e o domínio atual (smartwatch, smartphone, garantia) não conversa diretamente com ele.

**Por que:** se o trabalho exige vínculo com um ODS, esse é provavelmente o primeiro critério que o avaliador vai procurar. Hoje a justificativa social do projeto não está escrita.

**Sugestão (confirmar com a equipe qual ODS é o alvo):**

- **Se for ODS 3:** a arquitetura atual serve quase sem mudanças para rastreabilidade de **medicamentos ou equipamentos médicos**. O mapeamento é direto: Manufacturer = laboratório/fabricante, Retailer = farmácia/distribuidor/hospital, ServiceCenter = engenharia clínica (manutenção e calibração de equipamentos). Benefícios que dialogam com o ODS 3: combate a medicamentos falsificados, recall de lotes, comprovação de manutenção preventiva de equipamentos hospitalares. Bastaria trocar exemplos, textos e talvez adicionar campos como lote e validade.
- **Se for outro ODS (por exemplo ODS 12, consumo e produção responsáveis):** adicionar uma seção no README explicando como o histórico de manutenção incentiva reparo e reuso e reduz descarte.
- Em qualquer caso, criar uma seção "Relação com o ODS" no README e um texto curto no Dashboard.

### 2. Idioma do projeto (Alta)

**O que:** README, interface, mensagens de erro, `lang="en"` em `app/layout.tsx:19` e datas formatadas em `en-US` (`lib/utils/format.ts:4`).

**Por que:** trabalho de faculdade brasileira normalmente é apresentado e avaliado em português. Uma interface em inglês na demonstração pode soar desalinhada, e o avaliador pode ter dificuldade com o README.

**Sugestão:** decidir com a equipe. Se for português: traduzir textos da UI (estão concentrados em `constants/`, `lib/blockchain/contractErrors.ts`, `lib/blockchain/errors.ts` e nas páginas), trocar para `lang="pt-BR"` e `Intl.DateTimeFormat("pt-BR", ...)`, e traduzir o README. Nomes no código (variáveis, funções, contrato) podem continuar em inglês.

### 3. Versão mínima do Node está errada no README (Alta)

**O que:** o README diz "Node.js 22 or newer". Nesta máquina (Node 22.12.0) o Hardhat recusa rodar:

```text
ERROR: You are using Node.js 22.12.0 which is not supported by Hardhat.
Please upgrade to Node.js 22.13.0 or later.
```

Não existe campo `engines` no `package.json` nem `.nvmrc`.

**Por que:** qualquer integrante da equipe (ou o professor) com Node 22.0 a 22.12 segue o README e não consegue rodar nada. Por esse motivo **não foi possível executar os testes nesta revisão**.

**Sugestão:** corrigir o README para "22.13 ou mais recente", adicionar `"engines": { "node": ">=22.13" }` ao `package.json` e um arquivo `.nvmrc` com a versão usada.

### 4. Máquina de estados do produto inconsistente (Alta)

**O que:** em `contracts/ProductPass.sol`:

- `registerMaintenance` (linha 157) não exige que o produto tenha sido vendido.
- `registerSale` (linha 147) verifica só `soldAt != 0` e sobrescreve `status = Sold` (linha 151).

**Cenário concreto:**

1. Fabricante registra `PP-0002` -> status `Manufactured`.
2. Assistência registra manutenção -> status `Serviced`, garantia "Not started".
3. Varejista registra a venda -> status volta para `Sold`, apagando a informação de que houve manutenção.

O README documenta `Manufactured -> Sold -> Serviced`, mas o contrato permite `Manufactured -> Serviced -> Sold`.

**Por que:** o status passa a não representar o estado real do produto. Numa banca, é o tipo de inconsistência que aparece quando alguém pergunta "e se fizer fora de ordem?".

**Sugestão (escolher uma):**

- Exigir venda antes de manutenção (`if (product.soldAt == 0) revert ProductNotSold(productId);`) e adicionar o erro e o teste correspondentes; ou
- Manter manutenção pré-venda como regra válida (reparo em estoque), mas **remover o campo `status`** e derivá-lo no frontend a partir de `soldAt` e `maintenanceCount`, que já existem. Assim o estado nunca fica contraditório.

Em ambos os casos, documentar a regra no README e testar o caso.

### 5. Limite da descrição: bytes no contrato, caracteres na UI (Alta)

**O que:** o contrato valida `bytes(description).length > 140` (`ProductPass.sol:162`), ou seja, **bytes UTF-8**. A UI usa `maxLength={140}` e mostra o contador `values.description.length` (`components/forms/RegisterMaintenanceForm.tsx:42-43`), que conta **caracteres**.

**Por que:** em português, letras acentuadas (ç, ã, é, õ) ocupam 2 bytes. Uma descrição de 140 caracteres com acentos passa na UI, o usuário assina na MetaMask e a transação é rejeitada com `DescriptionTooLong`. Isso é praticamente certo de acontecer se a demo for em português (ver item 2).

**Sugestão:** no formulário, contar bytes com `new TextEncoder().encode(texto).length` para o contador e para validação, e bloquear o envio acima do limite. Ajustar a mensagem de erro para "140 bytes" ou explicar na dica do campo.

### 6. Validações existem só no frontend (Alta)

**O que:**

- `MAX_TEXT_FIELD_LENGTH = 64` (`constants/product.ts:22`) limita ID, serial, nome e modelo apenas na UI. O contrato aceita strings de qualquer tamanho.
- `trimValues` (`lib/utils/strings.ts`) remove espaços apenas na UI. O contrato aceita `"   "` como nome válido, porque só verifica comprimento zero.

**Por que:** o contrato é a fonte da verdade. Qualquer participante com papel pode chamar o contrato direto (script, console do Hardhat, outro frontend) e gravar dados que a UI jamais permitiria. Isso contradiz o argumento de "integridade garantida pelas regras do contrato" do README.

**Sugestão:** adicionar limite de tamanho no contrato (por exemplo `MAX_TEXT_LENGTH = 64` com erro `FieldTooLong(field)`), expô-lo como `public constant` como já é feito com os outros limites, e testar. Rejeitar espaço em branco em Solidity é caro; basta documentar que o trim é responsabilidade do cliente.

### 7. Consumidor vê apenas endereços (Alta)

**O que:** a página do produto mostra "Manufacturer: 0x7099...79C8" e "Responsible: 0x3C44...93BC" (`components/products/ProductDetails.tsx:597`, `ProductTimeline.tsx:748`). Não há nenhum nome associado aos endereços.

**Por que:** o primeiro problema listado no README é o consumidor verificar "se o produto foi realmente registrado pelo fabricante". Com a interface atual ele não tem como saber que `0x7099...` é o fabricante verdadeiro. A proposta de autenticidade fica incompleta justamente para o usuário principal.

**Sugestão:** registrar um nome público junto com o papel. Por exemplo, `grantRole(address account, Role role, string name)` gravando `participantNames[account]`, e uma função `getParticipantName`. Na UI, mostrar "Aurora Devices Ltda. (0x7099...79C8)" e um selo "Fabricante autorizado". Ajustar `setupDemo.ts` para dar nomes aos participantes de demonstração.

### 8. Sem revogação de papéis; Admin centralizado (Alta)

**O que:** o contrato tem `grantRole` mas não tem `revokeRole` nem `renounceRole`. O Admin pode conceder o papel Admin a qualquer um, e esse papel nunca mais pode ser retirado.

**Por que:**

- Se uma assistência técnica tiver a chave vazada ou agir de má-fé, **não há como removê-la**. Ela continua podendo gravar manutenções falsas para sempre.
- O README afirma que "nenhum participante deve ser o dono único do histórico", mas o Admin decide sozinho quem pode escrever. Isso é uma centralização que deveria ao menos ser reconhecida.

**Sugestão:**

- Adicionar `revokeRole` (somente Admin), evento `RoleRevoked`, testes e a opção na página "Participants". Atualizar `RoleGrantList` para refletir revogações (hoje ela lista apenas eventos `RoleGranted`, então mostraria papéis já revogados).
- Considerar usar `AccessControl` da OpenZeppelin, que é auditado e já traz grant/revoke/renounce e hierarquia de papéis.
- Adicionar ao README um parágrafo "Limitações de governança" citando que em produção o Admin seria uma multisig ou consórcio. Isso antecipa uma pergunta provável da banca.

### 9. Garantia não é usada em nenhuma regra (Média)

**O que:** o contrato calcula `warrantyExpiresAt`, mas nenhuma operação usa esse valor. A manutenção não registra se foi feita dentro ou fora da garantia.

**Por que:** "garantia" é um dos pilares da proposta, mas hoje é só uma data exibida. O caso de uso de maior valor (provar que um reparo foi coberto pela garantia, ou detectar reparos cobrados indevidamente) não existe.

**Sugestão:** em `registerMaintenance`, calcular `bool underWarranty = product.soldAt != 0 && block.timestamp <= product.warrantyExpiresAt;` e gravar no histórico e no evento. Na timeline, mostrar um selo "Coberto pela garantia". Testar com `networkHelpers.time.increase(...)` para simular a expiração.

### 10. `productId` sensível a maiúsculas e `serialNumber` não único (Média)

**O que:**

- A chave é `keccak256(bytes(productId))` (`ProductPass.sol:205`). `PP-0001` e `pp-0001` são produtos diferentes.
- Nada impede dois produtos com o mesmo `serialNumber`, nem do mesmo fabricante.

**Por que:** um consumidor que digita `pp-0001` recebe "produto não registrado" e pode concluir que o item é falso. E um fabricante pode, por erro, cadastrar o mesmo número de série duas vezes, o que enfraquece a rastreabilidade.

**Sugestão:** normalizar o ID no frontend (maiúsculas + trim) nos formulários e na busca, e documentar o formato. Se quiserem reforçar no contrato, manter um `mapping(bytes32 => bool)` de `keccak256(abi.encode(manufacturer, serialNumber))` para garantir serial único por fabricante.

### 11. Lacunas nos testes (Média)

**O que:** o README afirma que os testes cobrem "empty fields" e "invalid warranty", mas:

| Caso | Situação |
| --- | --- |
| Nome vazio / modelo vazio | Não testado (só `productId` e `serialNumber`) |
| Descrição de manutenção vazia | Não testado |
| Garantia de 121 meses (acima do máximo) | Não testado (só 0) |
| Limites válidos: 1 e 120 meses, descrição com exatamente 140 bytes | Não testado |
| `grantRole` para `address(0)` (`InvalidAccount`) | Não testado |
| Admin concedendo papel Admin | Não testado |
| Argumentos do evento `ProductSold` | Não verificados (só `.to.emit`) |
| `getProductHistory` de produto inexistente | Não testado |
| Várias manutenções (contador > 1) | Não testado |
| Manutenção antes da venda (item 4) | Não testado |
| Descrição com acentos (item 5) | Não testado |
| Frontend (`contractErrors`, `getWarrantyStatus`, `shorten`) | Nenhum teste |

**Por que:** testes de limite (0, 1, 120, 121; 140, 141) são os que pegam erros de "maior que" vs "maior ou igual". E o README não deve prometer cobertura que não existe, pois o avaliador pode conferir.

**Sugestão:** completar os casos acima (cada um é um `it` curto usando as fixtures existentes), adicionar testes unitários simples para as funções puras do frontend e, se a versão do Hardhat suportar, gerar relatório de cobertura para citar no README.

### 12. Constantes duplicadas e TypeChain não aproveitado (Média)

**O que:**

- O enum `Role` está definido em 4 lugares: contrato, `constants/roles.ts`, `test/ProductPass.test.ts:6` e `scripts/setupDemo.ts:4`.
- `MAX_WARRANTY_MONTHS` e `MAX_DESCRIPTION_LENGTH` estão no contrato e repetidos em `constants/product.ts`.
- `ProductStatus` e `HistoryEventType` dependem da ordem dos enums no Solidity (`PRODUCT_STATUSES[Number(raw.status)]`).
- O TypeChain está configurado (`hardhat.config.ts`) e usado nos scripts, mas o frontend usa `Contract` sem tipo e interfaces escritas à mão (`RawProduct`, `RawHistoryEntry` em `lib/blockchain/products.ts`).

**Por que:** se alguém alterar a ordem de um enum ou um limite no contrato, o frontend continua compilando e passa a exibir dados errados silenciosamente. Em trabalho em equipe, esse tipo de divergência é comum.

**Sugestão:** centralizar os enums em um único módulo TypeScript compartilhado por testes, scripts e frontend; ler os limites do contrato (já são `public constant`) ou pelo menos adicionar um teste que compara os valores. Avaliar usar os tipos gerados pelo TypeChain no frontend (exige que `typechain-types/` exista no build, então verificar o impacto antes).

### 13. Ações da página do produto ignoram papel e estado (Média)

**O que:** `ProductActions` (`components/products/ProductDetails.tsx:619`) mostra "Register sale" e "Register maintenance" para todos, inclusive para o consumidor sem carteira e para produtos já vendidos.

**Por que:** o consumidor é o público principal dessa página e não deveria ver botões de operação. Um varejista clicando em "Register sale" num produto já vendido só descobre o erro após assinar na MetaMask.

**Sugestão:** exibir cada botão apenas se `wallet.hasRole(...)` for verdadeiro e, no caso da venda, apenas se `product.soldAt` for nulo. Aproveitar para mostrar na timeline os detalhes da venda (duração da garantia e data de expiração), que hoje aparecem vazios porque `details` é `""` para os eventos de cadastro e venda.

### 14. `npm run setup` não é idempotente (Média)

**O que:** rodar `npm run setup` duas vezes no mesmo nó faz um novo deploy com endereço diferente e reescreve `lib/contracts/deployment.json`, que está versionado no git. Os dados do contrato anterior ficam órfãos.

**Por que:** em equipe, cada pessoa que roda o setup em sequência diferente gera diffs nesse arquivo e conflitos de merge. Durante a demo, rodar o setup de novo "some" com os produtos cadastrados sem aviso.

**Sugestão:** no `setupDemo.ts`, verificar se já existe código no endereço de `deployment.json` e, nesse caso, avisar e sair (ou exigir uma flag `--force`). Documentar no README que `deployment.json` só muda quando o nó é reiniciado, e combinar na equipe não commitar mudanças nesse arquivo.

### 15. Sem ESLint, Prettier ou CI (Média)

**O que:** não há configuração de lint, formatação nem pipeline de integração contínua.

**Por que:** com várias pessoas mexendo no código, o estilo tende a divergir. Além disso, `hooks/useAsyncData.ts` recebe a lista de dependências manualmente; sem a regra `react-hooks/exhaustive-deps` erros de dependência passam despercebidos. Uma CI simples impede que alguém faça push quebrando testes.

**Sugestão:** adicionar ESLint (configuração do Next) e Prettier com scripts `lint` e `format`, e um workflow do GitHub Actions rodando `npm ci`, `npm test` e `npm run typecheck` em cada push/PR.

### 16. Cadeia de custódia incompleta (Baixa)

**O que:** qualquer varejista pode registrar a venda de qualquer produto de qualquer fabricante. Não existe etapa "fabricante envia para varejista", nem registro de dono/consumidor, nem revenda.

**Por que:** para um projeto de rastreabilidade, a pergunta "como garantir que esse varejista realmente recebeu esse produto?" é previsível.

**Sugestão:** não precisa implementar tudo. Ou adicionar uma etapa simples de transferência (`transferToRetailer(productId, retailer)` e exigir que só esse varejista registre a venda), ou citar explicitamente no README como limitação e evolução futura.

### 17. Leituras varrem todos os eventos a cada bloco (Baixa)

**O que:** `fetchApplicationTransactions` e `fetchHistoryTransactions` fazem `getLogs` desde o bloco de deploy, e `useChainQuery` recarrega em todo bloco novo. O Explorer busca tudo e depois corta com `slice`.

**Por que:** no nó local isso é irrelevante, mas numa rede real ficaria lento e provedores RPC limitam o intervalo de blocos em `getLogs`. Vale saber explicar na apresentação.

**Sugestão:** manter como está para o escopo acadêmico, mas citar no README que em produção seria usado um indexador (por exemplo The Graph) ou paginação por intervalo de blocos.

### 18. Histórico duplicado em storage e eventos (Baixa)

**O que:** cada evento é gravado no array `histories` (storage) e também emitido como evento.

**Por que:** storage é a operação mais cara do Ethereum. A duplicação é defensável (permite `getProductHistory` sem indexar eventos), mas a escolha não está justificada em lugar nenhum.

**Sugestão:** adicionar um parágrafo no README explicando a decisão e o custo. Se quiserem mostrar domínio do assunto, incluir uma tabela de gas por operação (o Hardhat consegue gerar relatório de gas; verificar como habilitar na versão usada).

### 19. QR Code para consulta do produto (Baixa)

**O que:** o consumidor precisa digitar o ID manualmente.

**Por que:** um "passaporte digital" normalmente é acessado escaneando um código na embalagem. Mostrar um QR Code na página do produto, que abre `/products?id=PP-0002` no celular, deixa a demonstração muito mais concreta e é pouco trabalho.

**Sugestão:** gerar o QR Code com uma biblioteca leve na página do produto e na tela de confirmação do cadastro. Para funcionar no celular, o frontend precisa ser acessado pelo IP da máquina na rede local.

### 20. Pequenos ajustes no frontend (Baixa)

- **`hooks/useAsyncData.ts:42`:** em caso de erro durante um recarregamento, `data` vira `null`. Uma falha momentânea de RPC durante o polling apaga a tela inteira. Sugestão: manter o dado anterior e apenas exibir o erro.
- **`lib/blockchain/chainStatus.ts`:** o `chainId` retornado pelo RPC não é comparado com `EXPECTED_CHAIN_ID`. Se `NEXT_PUBLIC_RPC_URL` apontar para outra rede, a UI mostra "online" com dados de outro contrato ou nenhum. Sugestão: tratar divergência como estado de erro.
- **`components/providers/WalletProvider.tsx`:** o objeto `value` do contexto é recriado a cada render, re-renderizando todos os consumidores. Irrelevante no tamanho atual; `useMemo` resolve se crescer.
- **Mês = 30 dias:** a simplificação está no README, mas não na UI. Sugestão: incluir na dica do campo de garantia.

### 21. Documentação acadêmica complementar (Baixa)

- Adicionar ao README: nomes dos integrantes e divisão de responsabilidades, relação com o ODS (item 1), capturas de tela e limitações conhecidas (itens 8, 16, 17).
- O contrato declara licença MIT (`SPDX-License-Identifier: MIT`), mas não há arquivo `LICENSE` no repositório.
- Adicionar comentários NatSpec (`@notice`, `@param`) nas funções públicas do contrato. É barato e costuma ser valorizado em avaliação de Solidity.

---

## 4. Ordem de execução sugerida

1. **Decisões da equipe (antes de codar):** ODS alvo e idioma (itens 1 e 2). Elas mudam textos, exemplos e possivelmente campos do contrato.
2. **Destravar o ambiente:** corrigir versão do Node (item 3).
3. **Correções no contrato, em um único ciclo de mudança + testes:** itens 4, 5, 6, 8 e, se couber, 7 e 9. Agrupar evita refazer deploy/ABI várias vezes.
4. **Testes:** item 11, cobrindo também o que foi alterado no passo 3.
5. **Frontend:** itens 7 (exibição), 10, 13, 20 e opcionalmente 19.
6. **Qualidade e fluxo de equipe:** itens 12, 14 e 15.
7. **Documentação final:** itens 16, 17, 18 e 21, atualizando o README para refletir todas as mudanças.

---

## 5. Limitações desta revisão

- Os testes e o `typecheck` **não foram executados**: `node_modules` não está instalado e o Node local (22.12.0) é inferior ao exigido pelo Hardhat 3.18 (ver item 3). As conclusões sobre o contrato vêm da leitura do código.
- A aplicação não foi executada no navegador; os pontos de UX vêm da leitura dos componentes.
