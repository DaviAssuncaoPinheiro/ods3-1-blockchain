# ProductPass

Passaporte digital verificável para produtos, construído sobre uma blockchain Ethereum local.

O ProductPass registra a vida de um produto (fabricação, venda, garantia e manutenção) em um contrato inteligente. Cada participante assina as próprias operações com a própria carteira, e qualquer pessoa pode consultar o histórico completo de um produto sem precisar de carteira.

Este é um projeto acadêmico da disciplina **Oficina de Desenvolvimento 3**. Ele roda inteiramente na sua máquina: sem serviços externos, sem dinheiro real, sem rede pública.

---

## Sumário

1. [Problema](#problema)
2. [Por que blockchain](#por-que-blockchain)
3. [Como funciona](#como-funciona)
4. [Arquitetura](#arquitetura)
5. [Dados on-chain e off-chain](#dados-on-chain-e-off-chain)
6. [Regras do contrato](#regras-do-contrato)
7. [Tecnologias](#tecnologias)
8. [Estrutura do projeto](#estrutura-do-projeto)
9. [Instalação](#instalação)
10. [Executando o projeto](#executando-o-projeto)
11. [Configurando a MetaMask](#configurando-a-metamask)
12. [Executando os testes](#executando-os-testes)
13. [Roteiro de demonstração](#roteiro-de-demonstração)
14. [Solução de problemas](#solução-de-problemas)

---

## Problema

Quando um produto passa de mão em mão (fabricante, varejista, assistência técnica, consumidor), seu histórico fica espalhado nos sistemas privados de cada empresa. Quem compra um produto não consegue verificar com facilidade:

- se o produto foi realmente registrado pelo fabricante;
- quando foi vendido e até quando vale a garantia;
- quais manutenções foram feitas, e por quem.

Cada empresa pode mostrar os próprios registros, mas nenhuma consegue provar às outras que esses registros não foram alterados depois.

## Por que blockchain

Um banco de dados tradicional bastaria se uma única organização controlasse todo o processo. Nesse caso, todos simplesmente confiariam nela.

O ProductPass usa blockchain porque **vários participantes independentes escrevem no histórico do mesmo produto**, e nenhum deles deveria ser o dono único desse histórico. A blockchain oferece:

- **Integridade:** os registros são validados pelas regras do contrato e não podem ser editados silenciosamente.
- **Rastreabilidade:** cada evento fica ligado ao ID do produto e ordenado no tempo.
- **Auditabilidade:** qualquer pessoa pode reler e verificar todo o histórico.
- **Imutabilidade histórica:** cada bloco guarda o hash do anterior, então alterar um registro antigo quebraria todos os blocos seguintes.
- **Responsabilização:** toda operação é assinada, então o endereço (e o nome registrado) do responsável por cada evento é sempre conhecido.

### O que a blockchain não resolve

A blockchain protege o **registro digital**, não o objeto físico. Ela não impede, por si só, que um item falsificado seja produzido ou que uma etiqueta verdadeira seja copiada para um produto falso. Ela garante que o histórico associado a um ID foi escrito por participantes autorizados e não foi alterado. Ligar o item físico ao seu ID com segurança (etiquetas invioláveis, chips NFC, inspeção) é outro problema.

## Como funciona

```text
Administrador ──concede papéis (com nome)──▶ Fabricante, Varejista, Assistência técnica

Fabricante ──registra produto──▶ Varejista ──registra venda──▶ Assistência ──registra manutenção
                                                                                   │
Consumidor ◀────────── consulta o histórico do produto (sem carteira) ◀───────────┘
```

| Participante        | Papel no contrato | O que pode fazer                              |
| ------------------- | ----------------- | --------------------------------------------- |
| Administrador       | `Admin`           | Autorizar participantes (`grantRole`)         |
| Fabricante          | `Manufacturer`    | Registrar produtos                            |
| Varejista           | `Retailer`        | Registrar vendas e iniciar a garantia         |
| Assistência técnica | `ServiceCenter`   | Registrar manutenções                         |
| Consumidor          | nenhum            | Consultar qualquer produto e seu histórico    |

Todo participante tem um **nome público obrigatório**, informado quando recebe um papel. A interface mostra esse nome ao lado do endereço, para que o consumidor saiba, por exemplo, que o produto foi registrado pela "Aurora Eletrônicos S.A." e não apenas por `0x7099...79C8`.

## Arquitetura

```text
┌──────────────────────────── Navegador ───────────────────────────┐
│  App Next.js (React + Tailwind)                                  │
│                                                                  │
│  Páginas ──▶ hooks ──▶ lib/blockchain ──┬──▶ JsonRpcProvider ────┼──▶ leituras (sem carteira)
│                                         └──▶ signer MetaMask ────┼──▶ transações
└──────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                 ┌─────────── Nó Hardhat (localhost:8545) ────────────┐
                 │  ProductPass.sol                                   │
                 │   • papéis e nomes  • produtos  • histórico        │
                 │   • eventos: RoleGranted, ProductRegistered,       │
                 │             ProductSold, MaintenanceRegistered     │
                 └────────────────────────────────────────────────────┘
```

- **Leituras** (consulta de produto, painel, explorador) vão direto ao nó local por um `JsonRpcProvider` somente leitura, então o consumidor não precisa de carteira.
- **Escritas** (registrar produto, venda, manutenção, conceder papel) são assinadas na MetaMask e enviadas via `ethers.js`. Antes de pedir a assinatura, a interface aplica as mesmas validações do contrato, para que o usuário não assine uma transação que será rejeitada.
- O **histórico do produto** vem de `getProductHistory` e é enriquecido com o hash da transação de cada evento, obtido filtrando os eventos do contrato pelo produto.
- Os **nomes dos participantes** vêm dos eventos `RoleGranted`, carregados uma vez por bloco e compartilhados por todas as telas.
- O **explorador** lê os blocos mais recentes (número, hash, hash anterior, data, quantidade de transações) e os eventos do contrato.
- Os scripts de deploy gravam o endereço e a ABI do contrato em `lib/contracts/`, que é como o frontend encontra o contrato.

## Dados on-chain e off-chain

**On-chain (armazenado no contrato):**

- ID, número de série, nome e modelo do produto;
- endereço do fabricante;
- datas de fabricação, venda e fim da garantia;
- status atual do produto e quantidade de manutenções;
- histórico de eventos, cada um com o status do produto após o evento e, na manutenção, uma descrição curta;
- os endereços, papéis e nomes públicos dos participantes.

Nenhum dado pessoal é armazenado on-chain. O consumidor nunca é identificado. Os nomes registrados são de empresas participantes, não de pessoas físicas.

**Off-chain (evolução futura, não implementada):**

- imagens, manuais e documentos grandes;
- dados pessoais do consumidor;
- notas fiscais.

Esses dados pertencem ao off-chain porque uma blockchain é pública, permanente e cara por byte. Uma versão futura poderia guardá-los em armazenamento comum e manter on-chain apenas o hash, para provar que não foram modificados.

## Regras do contrato

Contrato: [`contracts/ProductPass.sol`](contracts/ProductPass.sol)

| Função                | Quem pode chamar    | Regras                                                                                                        |
| --------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `constructor`         | Quem faz o deploy   | Recebe o nome do primeiro Administrador (obrigatório).                                                         |
| `grantRole`           | Administrador       | Rejeita o endereço zero e papéis já concedidos. Nome do participante obrigatório; substitui o nome anterior.   |
| `registerProduct`     | Fabricante          | ID, número de série, nome e modelo obrigatórios. Rejeita IDs duplicados.                                       |
| `registerSale`        | Varejista           | O produto deve existir e ainda não ter sido vendido. Garantia entre 1 e 120 meses (1 mês = 30 dias).           |
| `registerMaintenance` | Assistência técnica | O produto deve existir. Descrição obrigatória, até 140 bytes. Incrementa o contador de manutenções.            |
| `getProduct`          | Qualquer um         | Retorna os dados do produto. Rejeita produtos desconhecidos.                                                   |
| `getProductHistory`   | Qualquer um         | Retorna todos os eventos (tipo, status após o evento, responsável, data, detalhes) em ordem.                   |
| `hasRole`             | Qualquer um         | Informa se um endereço possui um papel.                                                                        |
| `participantNames`    | Qualquer um         | Retorna o nome público de um endereço.                                                                         |

### Validação de textos

Todo campo de texto (ID, número de série, nome, modelo, nome do participante e descrição) segue as mesmas regras, **aplicadas no contrato** e repetidas na interface:

- é obrigatório;
- tem no máximo **64 bytes** (descrição da manutenção: **140 bytes**);
- não pode começar nem terminar com espaço, tabulação ou quebra de linha (o que também rejeita textos só com espaços).

Os limites são em **bytes UTF-8**, não em caracteres, porque é o que o contrato consegue medir de forma barata e determinística. Letras sem acento ocupam 1 byte e letras acentuadas (ç, ã, é) ocupam 2. O formulário de manutenção mostra o contador em bytes para evitar surpresas.

### Status do produto

O status atual é sempre o do **último evento**:

- `Fabricado` após o registro;
- `Vendido` após a venda;
- `Com manutenção` após qualquer manutenção.

Manutenção antes da venda é permitida (por exemplo, inspeção em estoque). Nesse caso a venda posterior muda o status atual para `Vendido`, mas **nenhum status vivido se perde**: cada entrada do histórico guarda o status do produto logo após aquele evento. A página do produto mostra a trilha completa, por exemplo `Fabricado → Com manutenção → Vendido → Com manutenção`.

### Erros

Operações rejeitadas revertem com erros customizados curtos, que a interface traduz em mensagens legíveis:

| Erro                      | Mensagem exibida no app                                                   |
| ------------------------- | ------------------------------------------------------------------------- |
| `MissingRole`             | Apenas contas com o papel *Papel* podem fazer isso.                       |
| `RoleAlreadyGranted`      | Esta conta já possui o papel *Papel*.                                     |
| `InvalidAccount`          | Informe um endereço de conta válido.                                      |
| `EmptyField`              | O campo "*Campo*" é obrigatório.                                          |
| `FieldTooLong`            | O campo "*Campo*" deve ter no máximo *N* bytes.                           |
| `UntrimmedField`          | O campo "*Campo*" não pode começar nem terminar com espaços.              |
| `ProductAlreadyExists`    | O produto "*ID*" já está registrado.                                      |
| `ProductNotFound`         | O produto "*ID*" não foi encontrado.                                      |
| `ProductAlreadySold`      | O produto "*ID*" já foi vendido.                                          |
| `InvalidWarrantyDuration` | A garantia deve ter entre 1 e 120 meses.                                  |

## Tecnologias

| Camada               | Tecnologia                                                     |
| -------------------- | -------------------------------------------------------------- |
| Contrato inteligente | Solidity 0.8.28                                                |
| Blockchain           | Nó local Hardhat 3 (chain ID 31337)                            |
| Testes               | Hardhat + Mocha + Chai (matchers do ethers)                    |
| Frontend             | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4  |
| Web3                 | ethers.js 6, MetaMask                                          |

## Estrutura do projeto

```text
contracts/
  ProductPass.sol           Contrato inteligente
scripts/
  deploy.ts                 Faz o deploy do contrato
  setupDemo.ts              Faz o deploy, concede os papéis de demonstração e registra um produto de exemplo
  lib/                      Funções compartilhadas de deploy
test/
  ProductPass.test.ts       Testes do contrato
app/                        Páginas Next.js
  dashboard/  products/  explorer/  register-product/  register-sale/
  register-maintenance/  roles/
components/
  dashboard/  explorer/  forms/  layout/  participants/  products/
  providers/  roles/  transactions/  ui/  wallet/
hooks/                      Hooks React (dados assíncronos, transações, conexão da carteira)
lib/
  blockchain/               Leituras do contrato, transações, carteira, mensagens de erro
  contracts/                ABI gerada + endereço do deploy (escritos pelos scripts de deploy)
  utils/                    Formatação, validação e utilitários
constants/                  Papéis, rotas, limites e configurações de rede
types/                      Tipos TypeScript compartilhados
```

## Instalação

Requisitos:

- [Node.js](https://nodejs.org/) **22.13 ou mais recente** (exigência do Hardhat 3; testado com Node 24)
- [Google Chrome](https://www.google.com/chrome/) ou outro navegador com a extensão [MetaMask](https://metamask.io/)

```bash
git clone <url-do-repositorio>
cd <pasta-do-repositorio>
npm install
```

A primeira compilação baixa o compilador Solidity, então precisa de internet uma vez. Depois disso tudo roda offline.

## Executando o projeto

Use **dois terminais**.

**Terminal 1: inicie a blockchain local** (deixe rodando):

```bash
npm run blockchain
```

Isso inicia um nó Hardhat em `http://127.0.0.1:8545` e imprime 20 contas de teste com suas chaves privadas. Essas contas têm ETH falso e existem apenas na sua máquina.

**Terminal 2: faça o deploy e prepare a demonstração:**

```bash
npm run setup
```

Isso faz o deploy do contrato, concede os papéis de demonstração (com nomes) e registra o produto de exemplo `PP-0001`. As contas de demonstração são:

| Conta Hardhat | Papel               | Nome                         | Endereço                                     |
| ------------- | ------------------- | ---------------------------- | -------------------------------------------- |
| #0            | Administrador       | Administrador da Rede        | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` |
| #1            | Fabricante          | Aurora Eletrônicos S.A.      | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| #2            | Varejista           | Loja Centro Tech             | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` |
| #3            | Assistência técnica | Assistência Técnica Rápida   | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` |

Para fazer o deploy sem o produto de exemplo: `SKIP_SAMPLE_PRODUCT=true npm run setup`.
Para fazer apenas o deploy, sem papéis além do Administrador: `npm run deploy` (o nome do Administrador pode ser definido com a variável `ADMIN_NAME`).

Depois inicie o frontend:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Comandos disponíveis

| Comando              | O que faz                                                |
| -------------------- | -------------------------------------------------------- |
| `npm run blockchain` | Inicia o nó Hardhat local                                |
| `npm run setup`      | Faz o deploy do contrato e prepara os dados de demonstração |
| `npm run deploy`     | Faz apenas o deploy do contrato                          |
| `npm run dev`        | Inicia o frontend Next.js em modo de desenvolvimento     |
| `npm run test`       | Executa os testes do contrato                            |
| `npm run compile`    | Compila o contrato                                       |
| `npm run typecheck`  | Verifica os tipos de todo o projeto                      |
| `npm run build`      | Gera o build de produção do frontend                     |

> A blockchain local vive em memória. Sempre que reiniciar `npm run blockchain`, execute `npm run setup` novamente.

## Configurando a MetaMask

1. **Adicione a rede local.** Clique em *Conectar carteira* no app: se a rede não existir, o app oferece *Trocar para Hardhat Local* e a adiciona para você. Para adicionar manualmente, use:

   | Campo             | Valor                   |
   | ----------------- | ----------------------- |
   | Nome da rede      | Hardhat Local           |
   | URL RPC           | `http://127.0.0.1:8545` |
   | Chain ID          | `31337`                 |
   | Símbolo da moeda  | `ETH`                   |

2. **Importe as contas de demonstração.** Na MetaMask, escolha *Adicionar conta ou carteira de hardware → Importar conta* e cole a chave privada das contas **#0 a #3** impressas por `npm run blockchain`. Renomeie-as como *Administrador*, *Fabricante*, *Varejista* e *Assistência* para alternar entre elas durante a demonstração.

   > Essas são chaves de teste do Hardhat, conhecidas publicamente. Nunca envie fundos reais para elas e nunca as use em uma rede real.

3. **Conecte.** Clique em *Conectar carteira*. O cabeçalho mostra o nome do participante, o endereço conectado e o papel. Trocar de conta na MetaMask atualiza tudo automaticamente.

## Executando os testes

```bash
npm run test
```

Os testes rodam em uma rede Hardhat em memória (não é preciso iniciar o nó) e cobrem:

- **Papéis e nomes:** concessão de cada papel com nome, nome do Administrador no deploy, substituição do nome, rejeição de não administradores, papel duplicado, endereço zero, nome vazio, longo demais ou só com espaços.
- **Registro de produto:** registro válido, campos no limite exato, produto duplicado, conta sem papel, cada campo vazio ou longo demais, espaços nas pontas, limite contado em bytes com acentos.
- **Venda:** venda válida com argumentos do evento, garantias mínima e máxima, conta sem papel, produto inexistente, venda duplicada, garantia 0 e 121 meses.
- **Manutenção:** manutenção válida, várias manutenções, descrição de exatamente 140 bytes com acentos, conta sem papel, produto inexistente, descrição vazia ou acima do limite.
- **Histórico de status:** manutenção antes da venda mantém `Vendido` como status atual e registra `Fabricado → Com manutenção → Vendido` no histórico.
- **Consultas:** dados do produto, histórico completo em ordem, produto inexistente.

Cada teste parte do próprio snapshot de fixture, então os testes são independentes.

## Roteiro de demonstração

Cerca de cinco minutos, com `npm run blockchain`, `npm run setup` e `npm run dev` rodando.

1. **Conecte a carteira.** Selecione a conta *Fabricante* na MetaMask e clique em *Conectar carteira*. O painel mostra "Aurora Eletrônicos S.A.", o papel *Fabricante* e o status da rede.
2. **Registre um produto.** Vá em *Registrar produto*, preencha `PP-0002`, `SN-2026-000002`, `Smartwatch Aurora`, `AW-200` e clique em *Registrar produto*. Confirme na MetaMask.
3. **Veja a confirmação.** A página mostra o número do bloco e o hash da transação.
4. **Consulte o produto.** Clique em *Ver produto*. Status *Fabricado*, garantia *Não iniciada*, e a linha do tempo mostra *Produto registrado* com o nome do fabricante.
5. **Registre uma manutenção antes da venda.** Troque para a conta *Assistência*, clique em *Registrar manutenção*, descreva `Inspeção de qualidade` e confirme.
6. **Registre a venda.** Troque para a conta *Varejista*, clique em *Registrar venda* na página do produto (o ID já vem preenchido), mantenha 12 meses e confirme.
7. **Consulte de novo.** O status atual é *Vendido*, a garantia está *Ativa* com data de fim, e a trilha de status mostra *Fabricado → Com manutenção → Vendido*: a manutenção anterior não se perdeu.
8. **Veja a linha do tempo.** Cada evento mostra data, status após o evento, nome e endereço do responsável e hash da transação.
9. **Tente um produto duplicado.** Volte para *Fabricante*, abra *Registrar produto* e envie `PP-0002` novamente.
10. **Veja a rejeição.** O app mostra *Operação rejeitada: O produto "PP-0002" já está registrado.* Nada é gravado na blockchain.

Pontos extras para mostrar:

- Com a conta *Varejista* em *Registrar produto*, o app avisa que a conta não tem o papel, e o contrato rejeita a transação se você enviar mesmo assim.
- Uma descrição de manutenção com muitos acentos mostra o contador em bytes e é bloqueada antes de pedir assinatura.
- O *Explorador da blockchain* mostra que o *Hash anterior* de cada bloco é igual ao *Hash* do bloco abaixo, a cadeia que torna o histórico à prova de adulteração.
- A *Consulta de produto* funciona com a MetaMask desconectada: o consumidor não precisa de carteira.
- Em *Participantes* (conta Administrador) é possível autorizar um novo endereço informando seu nome, e a lista mostra todos os papéis concedidos.

## Solução de problemas

| Sintoma                                                    | Solução                                                                                                                                         |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `You are using Node.js ... which is not supported by Hardhat` | Atualize o Node.js para 22.13 ou mais recente.                                                                                               |
| "A blockchain local não está disponível"                   | Inicie-a com `npm run blockchain`.                                                                                                               |
| "Contrato ProductPass não encontrado"                      | O nó foi reiniciado. Execute `npm run setup` novamente.                                                                                          |
| "A MetaMask está conectada à rede errada"                  | Clique em *Trocar para Hardhat Local*.                                                                                                           |
| A MetaMask mostra *nonce too high* ou as transações travam | O nó foi reiniciado, mas a MetaMask manteve o histórico antigo. Na MetaMask: *Configurações → Avançado → Limpar dados da aba de atividades*, em cada conta. |
| "A MetaMask não está instalada"                            | Instale a extensão MetaMask. A consulta e o explorador funcionam sem ela.                                                                        |
