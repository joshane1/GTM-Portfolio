import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, '..');
const packageName = process.argv[2] ?? 'GTM-Portfolio-Netlify-Drop';
const root = path.join(projectDir, 'handoff', packageName);
const allowedFiles = packageName === 'GTM-Portfolio-Single-Page'
  ? new Set(['README-FIRST.txt', 'index.html'])
  : new Set(['README-FIRST.txt', 'about/index.html', 'index.html']);

async function listFiles(directory, prefix = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path.join(directory, entry.name), relative));
    else files.push(relative);
  }
  return files;
}

const files = (await listFiles(root)).sort();
const findings = [];

for (const file of files) {
  if (!allowedFiles.has(file)) findings.push(`${file}: unexpected file in upload package`);
  if (/(^|\/)(\.env|\.DS_Store|id_rsa|credentials)(\.|$)|\.(pem|key|p12|pfx)$/i.test(file)) {
    findings.push(`${file}: sensitive filename pattern`);
  }

  const content = await fs.readFile(path.join(root, file), 'utf8');
  const patterns = [
    ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
    ['AWS access key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
    ['GitHub token', /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/],
    ['OpenAI-style key', /\bsk-[A-Za-z0-9_-]{20,}\b/],
    ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
    ['Google API key', /\bAIza[A-Za-z0-9_-]{30,}\b/],
    ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
    ['assigned credential', /(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[:=]\s*["'][^"']{8,}["']/i],
    ['local user path', /\/Users\/[^/]+\/|\.codex\/|file:\/\/|localhost(?::\d+)?/i],
  ];
  for (const [label, pattern] of patterns) {
    if (pattern.test(content)) findings.push(`${file}: ${label} pattern`);
  }
}

if (findings.length) {
  console.error('Public-package audit failed:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Public-package audit passed: ${files.length} expected files, no secret or local-path patterns found.`);
