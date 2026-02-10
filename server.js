const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = (process.env.FIPE_API_BASE || "https://brasilapi.com.br/api/fipe/preco/v1").replace(/\/$/, "");
const CONCURRENCY = Number(process.env.FIPE_CONCURRENCY || 5);

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function normalizeCode(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  if (/^\d{6}-\d$/.test(trimmed)) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 7) {
    return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  }

  return null;
}

function parseCodesFromText(text) {
  if (!text) return [];
  const tokens = String(text).split(/[\s,;]+/g);
  const codes = [];
  for (const token of tokens) {
    const normalized = normalizeCode(token);
    if (normalized) codes.push(normalized);
  }
  return codes;
}

function uniquePreserveOrder(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (seen.has(item)) continue;
    seen.add(item);
    result.push(item);
  }
  return result;
}

async function mapWithLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (true) {
      const current = index;
      index += 1;
      if (current >= items.length) return;
      results[current] = await mapper(items[current], current);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function fetchFipe(code) {
  const url = `${API_BASE}/${encodeURIComponent(code)}`;

  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      const message = await response.text();
      return {
        code,
        ok: false,
        status: response.status,
        error: message.trim() || "Erro ao consultar codigo FIPE"
      };
    }

    const data = await response.json();
    return { code, ok: true, data };
  } catch (error) {
    return {
      code,
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : "Falha inesperada"
    };
  }
}

app.post("/api/fipe", async (req, res) => {
  const payloadCodes = Array.isArray(req.body?.codes) ? req.body.codes : [];
  const textCodes = parseCodesFromText(req.body?.text);
  const merged = uniquePreserveOrder(
    [...payloadCodes, ...textCodes].map(normalizeCode).filter(Boolean)
  );

  if (merged.length === 0) {
    return res.status(400).json({
      error: "Informe pelo menos um codigo FIPE no formato 000000-0."
    });
  }

  const results = await mapWithLimit(merged, CONCURRENCY, fetchFipe);

  res.json({
    count: results.length,
    results
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    apiBase: API_BASE,
    timestamp: new Date().toISOString()
  });
});

const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`Servidor FIPE iniciado em http://localhost:${PORT}`);
  });
}

module.exports = app;
