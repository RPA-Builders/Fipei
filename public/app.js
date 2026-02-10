const form = document.getElementById("fipe-form");
const textarea = document.getElementById("codes");
const fileInput = document.getElementById("file");
const submitButton = document.getElementById("submit");
const statusEl = document.getElementById("status");
const summaryEl = document.getElementById("summary");
const resultsEl = document.getElementById("results");
const exportButton = document.getElementById("export");
const exportFormat = document.getElementById("export-format");

let lastResults = [];

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

function parseCodes(text) {
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

function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = () => reject(reader.error || new Error("Erro ao ler arquivo"));
    reader.readAsText(file, "utf-8");
  });
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function setExportState(results) {
  lastResults = Array.isArray(results) ? results : [];
  exportButton.disabled = lastResults.length === 0;
}

function extractMainData(item) {
  const data = Array.isArray(item.data) ? item.data : [item.data];
  return data[0] || {};
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (/["\n,;]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, "\"\"")}"`;
  }
  return stringValue;
}

function toCsv(results) {
  const headers = [
    "codigo",
    "status",
    "erro",
    "marca",
    "modelo",
    "anoModelo",
    "combustivel",
    "valor",
    "mesReferencia"
  ];

  const rows = results.map((item) => {
    if (!item.ok) {
      return {
        codigo: item.code,
        status: item.status || "erro",
        erro: item.error || "Falha na consulta",
        marca: "",
        modelo: "",
        anoModelo: "",
        combustivel: "",
        valor: "",
        mesReferencia: ""
      };
    }

    const main = extractMainData(item);
    return {
      codigo: item.code,
      status: "ok",
      erro: "",
      marca: main.marca || "",
      modelo: main.modelo || "",
      anoModelo: main.anoModelo || "",
      combustivel: main.combustivel || "",
      valor: main.valor || "",
      mesReferencia: main.mesReferencia || ""
    };
  });

  const lines = [headers.join(",")];
  rows.forEach((row) => {
    const line = headers.map((key) => csvEscape(row[key])).join(",");
    lines.push(line);
  });

  return lines.join("\n");
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderResults(results) {
  resultsEl.innerHTML = "";
  setExportState(results);

  if (!results.length) {
    summaryEl.textContent = "Nenhum resultado encontrado.";
    return;
  }

  const okCount = results.filter((item) => item.ok).length;
  summaryEl.textContent = `${okCount} de ${results.length} codigo(s) retornaram dados.`;

  results.forEach((item) => {
    const card = document.createElement("div");
    card.className = "result-card";

    const title = document.createElement("h3");
    title.textContent = `Codigo ${item.code}`;
    card.appendChild(title);

    if (!item.ok) {
      const error = document.createElement("p");
      error.className = "error";
      error.textContent = `Erro (${item.status || ""}): ${item.error}`;
      card.appendChild(error);
      resultsEl.appendChild(card);
      return;
    }

    const main = extractMainData(item);

    const summaryLines = [
      main.marca && `Marca: ${main.marca}`,
      main.modelo && `Modelo: ${main.modelo}`,
      main.anoModelo && `Ano: ${main.anoModelo}`,
      main.combustivel && `Combustivel: ${main.combustivel}`,
      main.valor && `Valor: ${main.valor}`,
      main.mesReferencia && `Mes ref.: ${main.mesReferencia}`
    ].filter(Boolean);

    summaryLines.forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      card.appendChild(p);
    });

    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "Dados completos";
    details.appendChild(summary);

    const pre = document.createElement("pre");
    pre.textContent = JSON.stringify(item.data, null, 2);
    details.appendChild(pre);
    card.appendChild(details);

    resultsEl.appendChild(card);
  });
}

async function collectCodes() {
  const codeText = textarea.value;
  let fileText = "";
  if (fileInput.files && fileInput.files[0]) {
    fileText = await readFileText(fileInput.files[0]);
  }

  const mergedText = `${codeText}\n${fileText}`;
  return uniquePreserveOrder(parseCodes(mergedText));
}

exportButton.addEventListener("click", () => {
  if (!lastResults.length) {
    setStatus("Nenhum resultado para exportar.", true);
    return;
  }

  const format = exportFormat?.value || "json";
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  if (format === "csv") {
    const content = toCsv(lastResults);
    downloadFile(`fipei-export-${timestamp}.csv`, content, "text/csv;charset=utf-8");
    setStatus("CSV exportado.");
    return;
  }

  const content = JSON.stringify(lastResults, null, 2);
  downloadFile(`fipei-export-${timestamp}.json`, content, "application/json;charset=utf-8");
  setStatus("JSON exportado.");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("");
  submitButton.disabled = true;
  setExportState([]);

  try {
    const codes = await collectCodes();

    if (!codes.length) {
      setStatus("Informe ao menos um codigo FIPE valido.", true);
      submitButton.disabled = false;
      return;
    }

    setStatus(`Consultando ${codes.length} codigo(s)...`);

    const response = await fetch("/api/fipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codes })
    });

    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error || "Erro na consulta.", true);
      submitButton.disabled = false;
      return;
    }

    renderResults(payload.results || []);
    setStatus("Consulta finalizada.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Erro inesperado", true);
  } finally {
    submitButton.disabled = false;
  }
});
