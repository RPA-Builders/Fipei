# Fipei — Consulta Rapida FIPE

Aplicativo web simples e moderno para consultar codigos FIPE. O usuario pode colar os codigos ou enviar um `.txt`, e o app devolve o valor e todos os dados retornados pela API publica. Inclui exportacao em JSON completo e CSV (resumo).

## Tecnologias

- **Node.js + Express** (backend e API interna)
- **HTML, CSS e JavaScript** (front-end)
- **Fetch API** (consumo da API FIPE)

## Funcionalidades

- Entrada de codigos FIPE por texto ou arquivo `.txt`
- Validacao e normalizacao de codigos (formato `000000-0`)
- Consulta em lote com limitador de concorrencia
- Visual moderno e responsivo
- Exportacao de resultados em **JSON** ou **CSV**

## Como rodar localmente

Requisitos: **Node.js 18+**.

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

## API utilizada

Por padrao, o app consulta:

```
https://brasilapi.com.br/api/fipe/preco/v1/{codigo}
```

Para trocar de provedor, defina a variavel `FIPE_API_BASE` ao iniciar o servidor:

```powershell
$env:FIPE_API_BASE = "https://sua-api.com/fipe"
node server.js
```

A rota interna do app:

```
POST /api/fipe
Body: { "codes": ["000000-0", "111111-1"] }
```

## Estrutura do projeto

```
public/
  index.html
  styles.css
  app.js
  logo-fipei.svg
  favicon.svg
server.js
package.json
```

## Deploy rapido

### Vercel
1. Suba o repositorio no GitHub.
2. Importe o projeto no Vercel.
3. (Opcional) Configure `FIPE_API_BASE` nas Environment Variables.

### Render
1. Crie um **Web Service** no Render e conecte o repo.
2. Build command: `npm install`
3. Start command: `npm start`

## Exportacao

- **JSON**: todos os dados retornados pela API.
- **CSV**: resumo (codigo, marca, modelo, ano, combustivel, valor, mes de referencia).

---

Se quiser adaptar para outra API FIPE ou adicionar filtros/relatorios, e so me chamar.
