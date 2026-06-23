#!/usr/bin/env node
// Import Apollo CSV → content/companies/ markdown files
// Usage: node scripts/import-apollo.js [csv-path]
// Reads all unique companies, generates descriptions via Claude Haiku, saves markdown

const fs = require("fs");
const path = require("path");
const https = require("https");

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const CSV_PATH = process.argv[2] || path.join(process.env.HOME, "Downloads/apollo-contacts-export-4.csv");
const OUT_DIR = path.join(__dirname, "../content/companies");
const DELAY_MS = 500;

const CATEGORIES = [
  "Consumer DNA Testing", "Clinical Diagnostics", "Oncology Genomics",
  "Pharmacogenomics", "Prenatal Testing", "Ancestry & Genealogy",
  "Research Tools", "Genetic Counseling",
];

function parseCsvLine(line) {
  const cells = []; let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
    else if (ch === "," && !inQ) { cells.push(cur); cur = ""; }
    else cur += ch;
  }
  cells.push(cur);
  return cells;
}

function loadCsv(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.trim().split("\n");
  const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const companies = new Map();
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, j) => (row[h] = (cells[j] || "").trim()));
    const name = row["company_name"] || "";
    if (!name || companies.has(name)) continue;
    const city = row["company_city"] || "";
    const state = row["company_state"] || "";
    const country = row["company_country"] || "";
    const loc = [city, state, country].filter(Boolean).join(", ");
    const funding = row["total_funding"] ? `$${Number(row["total_funding"]).toLocaleString()}` : "";
    companies.set(name, {
      name,
      website: row["website"] || "",
      keywords: (row["keywords"] || "").split(",").slice(0, 12).join(", "),
      funding,
      location: loc,
    });
  }
  return [...companies.values()];
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function fetchJson(url, options, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: options.method || "GET",
      headers: options.headers || {},
    }, res => {
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => { try { resolve(JSON.parse(data)); } catch { resolve({ raw: data }); } });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function generateCompanyInfo(company) {
  const data = await fetchJson(
    "https://api.anthropic.com/v1/messages",
    { method: "POST", headers: { "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" } },
    {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `You are categorizing a company for GeneticTesting.com, a genetic testing and genomics industry directory.

Company: ${company.name}
Website: ${company.website}
Keywords: ${company.keywords}

1. Write a 1-sentence description (max 160 chars) of what this company does in genetic testing/genomics.
2. Pick the best category from: ${CATEGORIES.join(" | ")}

Return JSON only: {"description": "...", "category": "..."}`,
      }],
    }
  );
  let text = (data.content?.[0]?.text || "{}").trim()
    .replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(text);
  } catch {
    return { description: `${company.name} is a genetic testing company.`, category: "Clinical Diagnostics" };
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  if (!ANTHROPIC_KEY) {
    console.error("❌ Missing ANTHROPIC_API_KEY");
    process.exit(1);
  }
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV not found: ${CSV_PATH}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const companies = loadCsv(CSV_PATH);
  const existing = new Set(fs.readdirSync(OUT_DIR).map(f => f.replace(".md", "")));

  const toImport = companies.filter(c => !existing.has(slugify(c.name)));
  console.log(`\n🧬 GeneticTesting.com — Apollo Company Importer`);
  console.log(`─`.repeat(50));
  console.log(`📋 Unique companies in CSV:  ${companies.length}`);
  console.log(`✅ Already in directory:     ${existing.size}`);
  console.log(`📥 To import:                ${toImport.length}\n`);

  let created = 0, skipped = 0;

  for (let i = 0; i < toImport.length; i++) {
    const c = toImport[i];
    const slug = slugify(c.name);
    const filePath = path.join(OUT_DIR, `${slug}.md`);

    process.stdout.write(`[${i + 1}/${toImport.length}] ${c.name}... `);

    let info;
    try {
      info = await generateCompanyInfo(c);
    } catch (err) {
      console.log(`⚠️  ${err.message}`);
      skipped++;
      continue;
    }

    const safeName = c.name.includes(":") ? `"${c.name}"` : c.name;
    const content = `---
name: ${safeName}
slug: ${slug}
category: ${info.category}
description: ${info.description}
website: ${c.website}
funding: ${c.funding || "Unknown"}
location: ${c.location}
tier: free
featured: false
date: ${new Date().toISOString().split("T")[0]}
---
`;
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${info.category}`);
    created++;
    await sleep(DELAY_MS);
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`✨ Done! Created: ${created} | Skipped: ${skipped}`);
  console.log(`\nCommit and deploy to publish:`);
  console.log(`  cd ~/genetic-testing-hub && git add content/companies/ && git commit -m "feat: import ${created} companies from Apollo" && git push`);
}

main().catch(err => { console.error("\n❌ Fatal:", err.message); process.exit(1); });
