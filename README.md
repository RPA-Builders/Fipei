# Fipei

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E?logo=javascript&logoColor=000)
![CSS](https://img.shields.io/badge/CSS-Modern-0ea5e9?logo=css3&logoColor=white)

Aplicativo web de consulta rapida FIPE para veiculos. O usuario informa codigos FIPE (manual ou arquivo `.txt`) e o app retorna valor, marca, modelo e todos os dados fornecidos pela API publica. Os resultados podem ser exportados em JSON completo ou CSV resumido.

## Preview

![Preview do Fipei](docs/screenshot.svg)

## Por que este projeto e util

- **Economiza tempo** na busca de valores FIPE.
- **Fluxo direto**: entrada simples, resposta rapida e exportacao.
- **Foco em UX**: interface moderna, responsiva e clara.

## Conhecimento tecnico demonstrado

- **Node.js + Express** com API interna, validacao e controle de concorrencia.
- **Frontend vanilla** (HTML/CSS/JS) com foco em performance e simplicidade.
- **UX/UI**: layout moderno, responsivo e com feedback de estado.
- **Exportacao de dados** para JSON (completo) e CSV (resumo).
- **Integracao com API externa** com tratamento de erros.

## Funcionalidades

- Entrada de codigos FIPE por texto ou arquivo `.txt`
- Validacao e normalizacao de codigos (formato `000000-0`)
- Consulta em lote com limitador de concorrencia
- Interface moderna e responsiva
- Exportacao de resultados em **JSON** ou **CSV**

## Tecnologias

- **Node.js + Express** (backend e API interna)
- **HTML, CSS e JavaScript** (front-end)
- **Fetch API** (consumo da API FIPE)

## Estrutura do projeto

```
public/
  index.html
  styles.css
  app.js
  logo-fipei.svg
  favicon.svg
server.js
docs/
  screenshot.svg
package.json
```

## Requisitos

- Node.js 18+

## Como rodar localmente

```bash
npm install
npm start
```

Acesse: `http://localhost:3000`.

### Observacao para Windows (PowerShell)
Se o `npm` estiver bloqueado por policy, use:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
npm start
```

Ou rode diretamente:

```powershell
& "C:\Program Files\nodejs\npm.cmd" install
& "C:\Program Files\nodejs\npm.cmd" start
```

## Configuracao

Variaveis suportadas:

- `FIPE_API_BASE` (padrao: `https://brasilapi.com.br/api/fipe/preco/v1`)
- `FIPE_CONCURRENCY` (padrao: `5`)

Exemplo:

```powershell
$env:FIPE_API_BASE = "https://sua-api.com/fipe"
$env:FIPE_CONCURRENCY = "3"
node server.js
```

## API interna

- `POST /api/fipe`
  - Body: `{ "codes": ["000000-0", "111111-1"] }`
- `GET /api/health`
  - Retorna status e timestamp

## Exportacao

- **JSON**: todos os dados retornados pela API.
- **CSV**: resumo (codigo, marca, modelo, ano, combustivel, valor, mes de referencia).

## Sobre o autor

Desenvolvedor focado em automacao, integracoes e produtos web. Este projeto demonstra capacidade de criar uma solucao completa do zero: interface, backend, integracao com API e exportacao de dados.

- GitHub: https://github.com/luizvinicius2219
- LinkedIn: https://www.linkedin.com/in/devluizvinicius/

## Deploy rapido

### Vercel
1. Suba o repositorio no GitHub.
2. Importe o projeto no Vercel.
3. (Opcional) Configure `FIPE_API_BASE` nas Environment Variables.

### Render
1. Crie um **Web Service** no Render e conecte o repo.
2. Build command: `npm install`
3. Start command: `npm start`
