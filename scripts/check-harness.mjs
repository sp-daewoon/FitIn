import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export function readinessFailures(readiness, assets) {
  return [
    ...readiness.checks
      .filter(
        (x) => x.status !== 'verified' || !Array.isArray(x.evidence) || x.evidence.length === 0,
      )
      .map((x) => x.id),
    ...assets.assets.filter((x) => x.status !== 'verified').map((x) => x.file),
  ];
}
export function checkHarness(base = root, release = false) {
  const errors = [];
  const requireFile = (p) => {
    if (!existsSync(resolve(base, p))) errors.push(`Missing file: ${p}`);
  };
  for (const p of [
    'AGENTS.md',
    'CLAUDE.md',
    '.github/copilot-instructions.md',
    '.agents/skills/fitin-maintenance/SKILL.md',
    '.agents/roles/implementer.md',
    '.agents/roles/reviewer.md',
    '.agents/roles/handoff.md',
    'docs/PRODUCT.md',
    'docs/HANDOFF.md',
    'docs/AI_HARNESS.md',
  ])
    requireFile(p);
  const requirements = JSON.parse(readFileSync(resolve(base, 'docs/requirements.json'), 'utf8'));
  const ids = new Set();
  for (const r of requirements.requirements) {
    if (!/^FIT-\d{3}$/.test(r.id) || ids.has(r.id))
      errors.push(`Invalid/duplicate requirement: ${r.id}`);
    ids.add(r.id);
    if (!['implemented', 'partial', 'planned'].includes(r.status) || !r.rule)
      errors.push(`Invalid requirement status/rule: ${r.id}`);
    for (const field of ['code', 'tests', 'docs']) {
      if (!Array.isArray(r[field])) errors.push(`Missing ${field}: ${r.id}`);
      else r[field].forEach(requireFile);
    }
  }
  const walk = (folder) =>
    readdirSync(folder, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory()
        ? walk(resolve(folder, e.name))
        : e.name.endsWith('.md')
          ? [resolve(folder, e.name)]
          : [],
    );
  const documents = [
    'AGENTS.md',
    'CLAUDE.md',
    ...walk(resolve(base, 'docs')),
    ...walk(resolve(base, '.agents')),
    ...walk(resolve(base, '.github')),
  ];
  for (const path of documents) {
    const file = resolve(base, path);
    for (const match of readFileSync(file, 'utf8').matchAll(/(?<!!)\[[^\]]*\]\(([^)]+)\)/g)) {
      const link = match[1].split('#')[0];
      if (!link || /^[a-z]+:/i.test(link)) continue;
      const target = resolve(dirname(file), decodeURIComponent(link));
      if (!existsSync(target)) errors.push(`Broken link: ${relative(base, file)} -> ${link}`);
    }
  }
  const readiness = JSON.parse(readFileSync(resolve(base, 'docs/release-readiness.json'), 'utf8'));
  const assets = JSON.parse(readFileSync(resolve(base, 'assets/exercises/manifest.json'), 'utf8'));
  const checkIds = new Set();
  for (const item of readiness.checks) {
    if (checkIds.has(item.id) || !['draft', 'unverified', 'verified'].includes(item.status))
      errors.push(`Invalid readiness entry: ${item.id}`);
    checkIds.add(item.id);
    if (!Array.isArray(item.evidence)) errors.push(`Invalid evidence: ${item.id}`);
    else {
      if (item.status === 'verified' && !item.evidence.length)
        errors.push(`Verified without evidence: ${item.id}`);
      item.evidence.forEach(requireFile);
    }
  }
  for (const asset of assets.assets) {
    requireFile(asset.file);
    if (!['draft', 'verified'].includes(asset.status))
      errors.push(`Invalid asset status: ${asset.file}`);
  }
  if (release)
    errors.push(...readinessFailures(readiness, assets).map((id) => `Not release ready: ${id}`));
  return errors;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const errors = checkHarness(root, process.argv.includes('--release'));
    if (errors.length) {
      errors.forEach((x) => console.error(x));
      process.exitCode = 1;
    } else
      console.log(
        'AI harness: references, requirement mappings and readiness metadata are consistent.',
      );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
