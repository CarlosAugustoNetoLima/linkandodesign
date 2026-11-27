import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(process.cwd(), ".next", "static", "chunks");
const needles = [
  "PRICING_BASE",
  "priceFloor",
  "bandLine",
  "HOURLY_MIN",
  "URGENCY_PCT",
  "PIX_DISCOUNT_PCT",
  "site_domain",
  "brand_availability",
  "deadline_short",
  "budget_low",
  "Lembrete final",
  "Final reminder",
];

async function files(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await files(path)));
    else if (entry.name.endsWith(".js")) out.push(path);
  }
  return out;
}

const found = [];
for (const file of await files(root)) {
  const text = await readFile(file, "utf8");
  for (const needle of needles) {
    if (text.includes(needle)) found.push({ file, needle });
  }
}

if (found.length) {
  for (const { file, needle } of found) {
    console.error(`[segredos] "${needle}" vazou em ${file.replace(`${process.cwd()}/`, "")}`);
  }
  process.exit(1);
}

console.log("[segredos] bundle do cliente limpo");
