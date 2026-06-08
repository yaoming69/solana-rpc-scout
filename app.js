const DEFAULT_ENDPOINTS = [
  {
    name: "Solana Labs Mainnet",
    url: "https://api.mainnet-beta.solana.com",
    cluster: "mainnet-beta",
  },
  {
    name: "Solana Labs Devnet",
    url: "https://api.devnet.solana.com",
    cluster: "devnet",
  },
  {
    name: "Solana Labs Testnet",
    url: "https://api.testnet.solana.com",
    cluster: "testnet",
  },
];

let endpoints = [...DEFAULT_ENDPOINTS];
let latestResults = [];

const endpointList = document.querySelector("#endpointList");
const runScanButton = document.querySelector("#runScan");
const endpointForm = document.querySelector("#endpointForm");
const reportOutput = document.querySelector("#reportOutput");
const healthyCount = document.querySelector("#healthyCount");
const medianLatency = document.querySelector("#medianLatency");
const bestEndpoint = document.querySelector("#bestEndpoint");
const copyReportButton = document.querySelector("#copyReport");

function rpcPayload(method) {
  return {
    jsonrpc: "2.0",
    id: `${method}-${Date.now()}`,
    method,
  };
}

async function callRpc(endpoint, method) {
  const start = performance.now();
  const payload = rpcPayload(method);
  const useProxy = window.location.protocol !== "file:";
  const response = await fetch(useProxy ? "/rpc" : endpoint.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(useProxy ? { url: endpoint.url, payload } : payload),
  });
  const latencyMs = Math.round(performance.now() - start);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const body = await response.json();
  if (body.error) {
    throw new Error(body.error.message || "RPC error");
  }
  return { body, latencyMs };
}

async function scanEndpoint(endpoint) {
  try {
    const health = await callRpc(endpoint, "getHealth");
    const slot = await callRpc(endpoint, "getSlot");
    const blockhash = await callRpc(endpoint, "getLatestBlockhash");
    const latencyMs = Math.round((health.latencyMs + slot.latencyMs + blockhash.latencyMs) / 3);
    return {
      ...endpoint,
      ok: true,
      status: health.body.result,
      slot: slot.body.result,
      blockhash: blockhash.body.result?.value?.blockhash || "-",
      latencyMs,
      error: "",
    };
  } catch (error) {
    return {
      ...endpoint,
      ok: false,
      status: "unavailable",
      slot: "-",
      blockhash: "-",
      latencyMs: null,
      error: error.message,
    };
  }
}

function statusClass(result) {
  if (result.ok === null) return "status-warn";
  if (result.ok && result.latencyMs <= 350) return "status-good";
  if (result.ok) return "status-warn";
  return "status-bad";
}

function statusText(result) {
  if (result.ok === null) return "idle";
  if (!result.ok) return "fail";
  if (result.latencyMs <= 350) return "fast";
  return "slow";
}

function renderEndpoints(results = latestResults) {
  endpointList.innerHTML = "";
  const source = results.length ? results : endpoints.map((endpoint) => ({ ...endpoint, ok: null }));
  source.forEach((result) => {
    const card = document.createElement("article");
    card.className = "endpoint-card";

    const details = document.createElement("div");
    const title = document.createElement("div");
    title.className = "endpoint-title";
    title.innerHTML = `<strong>${escapeHtml(result.name)}</strong><span class="status-pill ${statusClass(result)}">${statusText(result)}</span>`;
    const meta = document.createElement("p");
    meta.className = "endpoint-meta";
    meta.textContent = `${result.cluster || "custom"} | ${result.url}`;
    const line = document.createElement("p");
    line.className = "status-line";
    line.textContent =
      result.ok === null
        ? "Not scanned yet"
        : result.ok
          ? `slot ${result.slot} | blockhash ${String(result.blockhash).slice(0, 12)}...`
          : result.error;
    details.append(title, meta, line);

    const score = document.createElement("div");
    score.className = "endpoint-score";
    score.textContent = result.latencyMs === null || result.latencyMs === undefined ? "-" : `${result.latencyMs} ms`;
    card.append(details, score);
    endpointList.append(card);
  });
}

function updateSummary(results) {
  const healthy = results.filter((result) => result.ok);
  healthyCount.textContent = String(healthy.length);
  const latencies = healthy.map((result) => result.latencyMs).sort((a, b) => a - b);
  medianLatency.textContent = latencies.length ? `${latencies[Math.floor(latencies.length / 2)]} ms` : "-";
  bestEndpoint.textContent = latencies.length
    ? healthy.reduce((best, result) => (result.latencyMs < best.latencyMs ? result : best), healthy[0]).name
    : "-";
}

function buildReport(results) {
  const lines = [
    "# Solana RPC Scout Report",
    `Generated: ${new Date().toISOString()}`,
    "",
    "| Endpoint | Cluster | Status | Avg latency | Slot | Notes |",
    "| --- | --- | --- | ---: | ---: | --- |",
  ];
  results.forEach((result) => {
    lines.push(
      `| ${result.name} | ${result.cluster || "custom"} | ${result.ok ? result.status : "failed"} | ${
        result.latencyMs ?? "-"
      } ms | ${result.slot} | ${result.ok ? "ok" : result.error.replaceAll("|", "/")} |`,
    );
  });
  lines.push("");
  lines.push("This browser-only tool calls public Solana JSON-RPC methods and never asks for wallet keys.");
  return lines.join("\n");
}

async function runScan() {
  runScanButton.disabled = true;
  runScanButton.textContent = "Scanning...";
  latestResults = await Promise.all(endpoints.map(scanEndpoint));
  latestResults.sort((a, b) => {
    if (a.ok !== b.ok) return a.ok ? -1 : 1;
    return (a.latencyMs ?? Number.MAX_SAFE_INTEGER) - (b.latencyMs ?? Number.MAX_SAFE_INTEGER);
  });
  renderEndpoints(latestResults);
  updateSummary(latestResults);
  reportOutput.value = buildReport(latestResults);
  runScanButton.disabled = false;
  runScanButton.textContent = "Run Scan";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

endpointForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#endpointName").value.trim() || "Custom RPC";
  const url = document.querySelector("#endpointUrl").value.trim();
  if (!url.startsWith("https://")) {
    alert("Use an https:// RPC endpoint.");
    return;
  }
  endpoints = [...endpoints, { name, url, cluster: "custom" }];
  endpointForm.reset();
  renderEndpoints([]);
});

runScanButton.addEventListener("click", runScan);
copyReportButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(reportOutput.value);
  copyReportButton.textContent = "Copied";
  setTimeout(() => {
    copyReportButton.textContent = "Copy Report";
  }, 1200);
});

renderEndpoints([]);
