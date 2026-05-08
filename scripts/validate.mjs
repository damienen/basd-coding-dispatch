#!/usr/bin/env node

import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultRepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let repoRoot = defaultRepoRoot;
let errors = [];

const requiredFiles = [
  "README.md",
  "LICENSE",
  "NOTICE",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
  "AGENTS.md",
  "CLAUDE.md",
  "llms.txt",
  "package.json",
  "bin/basd-coding-dispatch.mjs",
  "scripts/validate.mjs",
  "scripts/smoke-test.mjs",
  "skills/basd-coding-dispatch/SKILL.md",
  "skills/basd-coding-dispatch/references/README.md",
  "skills/basd-coding-dispatch/references/quality-gates.md",
  "skills/basd-coding-dispatch/references/provider-command-recipes.md",
  "skills/basd-coding-dispatch/references/session-topology.md",
  "skills/basd-coding-dispatch/references/review-orchestration.md",
  "skills/basd-coding-dispatch/references/subagent-skill-bundles.md",
  "references/quality-gates.md",
  "references/provider-command-recipes.md",
  "references/session-topology.md",
  "references/review-orchestration.md",
  "references/subagent-skill-bundles.md",
  "integrations/hermes/install.md",
  "integrations/openclaw/install.md",
  "integrations/codex/install.md",
  "integrations/claude-code/install.md",
  "integrations/opencode/install.md",
  "integrations/cursor/install.md",
  "integrations/generic-agent/install.md",
  "examples/small-fix.md",
  "examples/feature-build.md",
  "examples/dual-provider-review.md",
  "examples/telegram-agent-workflow.md",
  "assets/logo.svg",
  "assets/flow-diagram.svg",
  ".github/workflows/ci.yml",
  ".github/workflows/release.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/provider_adapter_request.yml",
  ".github/ISSUE_TEMPLATE/workflow_improvement.yml",
  ".github/ISSUE_TEMPLATE/docs_install_issue.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/pull_request_template.md"
];

const forbiddenPublicFiles = [
  ".claude-plugin",
  ".codex-plugin",
  ".cursor-plugin",
  ".opencode",
  "gemini-extension.json"
];

const leakageTerms = [
  ["/root", "/openclaw-workspace"].join(""),
  ["/root/.", "hermes"].join(""),
  ["Da", "mian"].join(""),
  ["oc", "_basd"].join(""),
  ["fast", ".xyz"].join(""),
  ["SL", "ACK_"].join(""),
  ["TELE", "GRAM_"].join(""),
  ["GITHUB", "_TOKEN"].join(""),
  ["OPENAI", "_API_KEY"].join(""),
  ["ANTHROPIC", "_API_KEY"].join("")
];

const scannedExtensions = new Set([
  ".md",
  ".mjs",
  ".js",
  ".yml",
  ".yaml",
  ".json",
  ".txt",
  ".svg"
]);

const ignoredDirectories = new Set([".git", "node_modules"]);

const exampleReferences = {
  "examples/small-fix.md": [
    "references/quality-gates.md",
    "references/provider-command-recipes.md"
  ],
  "examples/feature-build.md": [
    "references/quality-gates.md",
    "references/session-topology.md"
  ],
  "examples/dual-provider-review.md": [
    "references/review-orchestration.md",
    "references/session-topology.md"
  ],
  "examples/telegram-agent-workflow.md": [
    "skills/basd-coding-dispatch/references/quality-gates.md",
    "integrations/hermes/install.md"
  ]
};

const integrationDocs = [
  "integrations/hermes/install.md",
  "integrations/openclaw/install.md",
  "integrations/codex/install.md",
  "integrations/claude-code/install.md",
  "integrations/opencode/install.md",
  "integrations/cursor/install.md",
  "integrations/generic-agent/install.md"
];

const skillReferenceFiles = [
  "quality-gates.md",
  "provider-command-recipes.md",
  "session-topology.md",
  "review-orchestration.md",
  "subagent-skill-bundles.md"
];

function addError(message) {
  errors.push(message);
}

async function readJson(relativePath) {
  const content = await readFile(path.join(repoRoot, relativePath), "utf8");
  return JSON.parse(content);
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function validateRequiredFiles() {
  for (const file of requiredFiles) {
    const fullPath = path.join(repoRoot, file);
    if (!existsSync(fullPath)) {
      addError(`Required file is missing: ${file}`);
      continue;
    }

    const info = await stat(fullPath);
    if (!info.isFile()) {
      addError(`Required path is not a file: ${file}`);
    }
  }
}

async function validatePackageJson() {
  let packageJson;
  try {
    packageJson = await readJson("package.json");
  } catch (error) {
    addError(`package.json could not be parsed: ${error.message}`);
    return;
  }

  const expectations = {
    name: "basd-coding-dispatch",
    version: "0.1.0",
    type: "module",
    license: "MIT"
  };

  for (const [key, value] of Object.entries(expectations)) {
    if (packageJson[key] !== value) {
      addError(`package.json ${key} must be ${value}`);
    }
  }

  if (packageJson.bin?.["basd-coding-dispatch"] !== "./bin/basd-coding-dispatch.mjs") {
    addError("package.json bin must map basd-coding-dispatch to ./bin/basd-coding-dispatch.mjs");
  }

  if (packageJson.scripts?.validate !== "node scripts/validate.mjs") {
    addError("package.json scripts.validate must run node scripts/validate.mjs");
  }

  if (packageJson.scripts?.["smoke-test"] !== "node scripts/smoke-test.mjs") {
    addError("package.json scripts.smoke-test must run node scripts/smoke-test.mjs");
  }

  if (!packageJson.description?.includes("Hermes/OpenClaw")) {
    addError("package.json description must lead with Hermes/OpenClaw positioning");
  }

  for (const keyword of ["hermes", "openclaw", "telegram", "mobile", "codex", "claude"]) {
    if (!packageJson.keywords?.includes(keyword)) {
      addError(`package.json keywords must include ${keyword}`);
    }
  }
}

async function validateSkillFrontmatter() {
  const skillPath = "skills/basd-coding-dispatch/SKILL.md";
  const content = await readFile(path.join(repoRoot, skillPath), "utf8");
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---\n/);

  if (!frontmatter) {
    addError(`${skillPath} must start with YAML frontmatter`);
    return;
  }

  const fields = Object.fromEntries(
    frontmatter[1]
      .split("\n")
      .map((line) => line.match(/^([a-zA-Z0-9_-]+):\s*(.+)$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2].trim()])
  );

  if (!fields.name) {
    addError(`${skillPath} frontmatter is missing name`);
  }

  if (!fields.description) {
    addError(`${skillPath} frontmatter is missing description`);
  }
}

async function validateSkillReferences() {
  const skillPath = "skills/basd-coding-dispatch/SKILL.md";
  const content = await readFile(path.join(repoRoot, skillPath), "utf8");

  for (const file of skillReferenceFiles) {
    const skillReference = `references/${file}`;
    const skillLocalPath = `skills/basd-coding-dispatch/references/${file}`;

    if (!existsSync(path.join(repoRoot, skillLocalPath))) {
      addError(`Installed skill reference is missing: ${skillLocalPath}`);
    }

    if (!content.includes(skillReference)) {
      addError(`${skillPath} should mention ${skillReference}`);
    }
  }

  const referenceReadme = await readFile(
    path.join(repoRoot, "skills/basd-coding-dispatch/references/README.md"),
    "utf8"
  );

  for (const file of skillReferenceFiles) {
    if (!referenceReadme.includes(file)) {
      addError(`skills/basd-coding-dispatch/references/README.md should mention ${file}`);
    }
  }
}

async function validateLeakageScan() {
  const files = await listFiles(repoRoot);

  for (const file of files) {
    const relativeFile = path.relative(repoRoot, file);
    const extension = path.extname(file);

    if (!scannedExtensions.has(extension)) {
      continue;
    }

    const content = await readFile(file, "utf8");
    for (const term of leakageTerms) {
      if (content.includes(term)) {
        addError(`Private leakage pattern found in ${relativeFile}: ${term}`);
      }
    }
  }
}

async function validateExampleReferences() {
  for (const [exampleFile, references] of Object.entries(exampleReferences)) {
    const content = await readFile(path.join(repoRoot, exampleFile), "utf8");
    for (const reference of references) {
      if (!existsSync(path.join(repoRoot, reference))) {
        addError(`${exampleFile} references missing file ${reference}`);
      }
      if (!content.includes(reference)) {
        addError(`${exampleFile} should mention ${reference}`);
      }
    }
  }
}

async function validateIntegrationStatuses() {
  for (const file of integrationDocs) {
    if (!existsSync(path.join(repoRoot, file))) {
      continue;
    }

    const content = await readFile(path.join(repoRoot, file), "utf8");
    if (!/^Status:\s*(tested|experimental|planned)$/m.test(content)) {
      addError(`${file} must include a status label of tested, experimental, or planned`);
    }
  }
}

function validateForbiddenPublicFiles() {
  for (const file of forbiddenPublicFiles) {
    if (existsSync(path.join(repoRoot, file))) {
      addError(`Do not include unvalidated native metadata: ${file}`);
    }
  }
}

async function validateReadme() {
  const content = await readFile(path.join(repoRoot, "README.md"), "utf8");
  const firstLine = content.split("\n")[0];
  const requiredFirstSentence = "`basd-coding-dispatch` is a native Hermes/OpenClaw coding-dispatch skill for approval-gated coding from Telegram and mobile chat.";

  if (firstLine !== requiredFirstSentence) {
    addError("README.md first sentence does not match the required text");
  }

  for (const requiredText of [
    "npx basd-coding-dispatch init",
    "Telegram",
    "mobile",
    "worker-routing",
    "Codex",
    "Claude",
    "OpenClaw",
    "Hermes is the maintained home",
    "quality gates"
  ]) {
    if (!content.includes(requiredText)) {
      addError(`README.md must include ${requiredText}`);
    }
  }
}

export async function runValidation(options = {}) {
  repoRoot = path.resolve(options.rootDir ?? defaultRepoRoot);
  errors = [];

  await validateRequiredFiles();
  await validatePackageJson();
  await validateSkillFrontmatter();
  await validateSkillReferences();
  await validateLeakageScan();
  await validateExampleReferences();
  await validateIntegrationStatuses();
  validateForbiddenPublicFiles();
  await validateReadme();

  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;

  if (errors.length > 0) {
    for (const error of errors) {
      stderr.write(`- ${error}\n`);
    }
    return 1;
  }

  stdout.write("Validation passed\n");
  return 0;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
const currentPath = path.resolve(fileURLToPath(import.meta.url));

if (invokedPath === currentPath) {
  process.exitCode = await runValidation();
}
