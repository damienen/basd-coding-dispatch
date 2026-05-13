#!/usr/bin/env node

import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultRepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let repoRoot = defaultRepoRoot;
let errors = [];
const companionManifestFile = "integrations/companion-skills.json";

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
  "scripts/workflow-evals.mjs",
  companionManifestFile,
  "skills/basd-coding-dispatch/SKILL.md",
  "skills/basd-coding-dispatch/references/README.md",
  "skills/basd-coding-dispatch/references/quality-gates.md",
  "skills/basd-coding-dispatch/references/quality-profiles.md",
  "skills/basd-coding-dispatch/references/edge-case-packs.md",
  "skills/basd-coding-dispatch/references/review-packets.md",
  "skills/basd-coding-dispatch/references/superpowers-integration.md",
  "skills/basd-coding-dispatch/references/prompt-templates.md",
  "skills/basd-coding-dispatch/references/plan-linter.md",
  "skills/basd-coding-dispatch/references/provider-command-recipes.md",
  "skills/basd-coding-dispatch/references/session-topology.md",
  "skills/basd-coding-dispatch/references/review-orchestration.md",
  "skills/basd-coding-dispatch/references/subagent-skill-bundles.md",
  "references/quality-gates.md",
  "references/quality-profiles.md",
  "references/edge-case-packs.md",
  "references/review-packets.md",
  "references/superpowers-integration.md",
  "references/prompt-templates.md",
  "references/plan-linter.md",
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
  "quality-profiles.md",
  "edge-case-packs.md",
  "review-packets.md",
  "superpowers-integration.md",
  "prompt-templates.md",
  "plan-linter.md",
  "provider-command-recipes.md",
  "session-topology.md",
  "review-orchestration.md",
  "subagent-skill-bundles.md"
];

const expectedCompanionSkills = [
  "codex",
  "claude-code",
  "using-superpowers",
  "brainstorming",
  "writing-plans",
  "subagent-driven-development",
  "requesting-code-review",
  "verification-before-completion",
  "test-driven-development",
  "systematic-debugging"
];

const verifiedCompanionRefs = {
  "NousResearch/hermes-agent": "faa13e49f81480771ceeb55991bb0c27edf1a5fb",
  "obra/superpowers": "f2cbfbefebbfef77321e4c9abc9e949826bea9d7"
};

function addError(message) {
  errors.push(message);
}

async function readJson(relativePath) {
  const content = await readFile(path.join(repoRoot, relativePath), "utf8");
  return JSON.parse(content);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSafeRelativePath(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !path.isAbsolute(value) &&
    !value.split(/[\\/]+/).includes("..")
  );
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

  if (packageJson.scripts?.["workflow-evals"] !== "node scripts/workflow-evals.mjs") {
    addError("package.json scripts.workflow-evals must run node scripts/workflow-evals.mjs");
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

async function validateReferenceMirrors() {
  for (const file of skillReferenceFiles) {
    const skillLocalPath = `skills/basd-coding-dispatch/references/${file}`;
    const rootPath = `references/${file}`;

    if (!existsSync(path.join(repoRoot, skillLocalPath)) || !existsSync(path.join(repoRoot, rootPath))) {
      continue;
    }

    const skillLocalContent = await readFile(path.join(repoRoot, skillLocalPath), "utf8");
    const rootContent = await readFile(path.join(repoRoot, rootPath), "utf8");

    if (skillLocalContent !== rootContent) {
      addError(`${rootPath} must be byte-identical to ${skillLocalPath}`);
    }
  }
}

async function validateCompanionManifest() {
  let manifest;
  try {
    manifest = await readJson(companionManifestFile);
  } catch (error) {
    addError(`${companionManifestFile} could not be parsed: ${error.message}`);
    return;
  }

  if (!isPlainObject(manifest)) {
    addError(`${companionManifestFile} must contain a JSON object`);
    return;
  }

  if (manifest.schemaVersion !== 1) {
    addError(`${companionManifestFile} schemaVersion must be 1`);
  }

  if (!Array.isArray(manifest.skills) || manifest.skills.length === 0) {
    addError(`${companionManifestFile} must include a non-empty skills array`);
    return;
  }

  const seenNames = new Set();
  const defaultSkills = [];

  for (const [index, skill] of manifest.skills.entries()) {
    const label = `${companionManifestFile} skills[${index}]`;

    if (!isPlainObject(skill)) {
      addError(`${label} must be an object`);
      continue;
    }

    for (const field of [
      "name",
      "sourceRepo",
      "ref",
      "sourceDirectory",
      "license",
      "licenseNotes",
      "updateNotes"
    ]) {
      if (typeof skill[field] !== "string" || skill[field].length === 0) {
        addError(`${label}.${field} must be a non-empty string`);
      }
    }

    if (typeof skill.installByDefault !== "boolean") {
      addError(`${label}.installByDefault must be a boolean`);
    }

    if (typeof skill.name === "string") {
      if (seenNames.has(skill.name)) {
        addError(`${label}.name duplicates ${skill.name}`);
      }
      seenNames.add(skill.name);

      if (skill.installByDefault === true) {
        defaultSkills.push(skill.name);
      }
    }

    if (!isSafeRelativePath(skill.sourceDirectory)) {
      addError(`${label}.sourceDirectory must be a safe relative path`);
    }

    if (!/^[a-f0-9]{40}$/i.test(skill.ref ?? "")) {
      addError(`${label}.ref must be a 40-character commit hash`);
    }

    if (!Object.hasOwn(verifiedCompanionRefs, skill.sourceRepo)) {
      addError(`${label}.sourceRepo is not one of the approved upstream repositories`);
    } else if (verifiedCompanionRefs[skill.sourceRepo] !== skill.ref) {
      addError(`${label}.ref must match the verified ref for ${skill.sourceRepo}`);
    }

    if (!Array.isArray(skill.files) || skill.files.length === 0) {
      addError(`${label}.files must be a non-empty array`);
      continue;
    }

    let hasSkillFile = false;
    for (const [fileIndex, file] of skill.files.entries()) {
      const fileLabel = `${label}.files[${fileIndex}]`;

      if (!isPlainObject(file)) {
        addError(`${fileLabel} must be an object`);
        continue;
      }

      for (const field of ["sourcePath", "destinationPath", "rawUrl"]) {
        if (typeof file[field] !== "string" || file[field].length === 0) {
          addError(`${fileLabel}.${field} must be a non-empty string`);
        }
      }

      if (!isSafeRelativePath(file.sourcePath)) {
        addError(`${fileLabel}.sourcePath must be a safe relative path`);
      }

      if (!isSafeRelativePath(file.destinationPath)) {
        addError(`${fileLabel}.destinationPath must be a safe relative path`);
      }

      if (
        typeof file.sourcePath === "string" &&
        typeof skill.sourceDirectory === "string" &&
        !file.sourcePath.startsWith(`${skill.sourceDirectory}/`)
      ) {
        addError(`${fileLabel}.sourcePath must live under ${skill.sourceDirectory}`);
      }

      const expectedRawUrl =
        `https://raw.githubusercontent.com/${skill.sourceRepo}/${skill.ref}/${file.sourcePath}`;
      if (file.rawUrl !== expectedRawUrl) {
        addError(`${fileLabel}.rawUrl must equal ${expectedRawUrl}`);
      }

      if (file.destinationPath === "SKILL.md") {
        hasSkillFile = true;
      }
    }

    if (!hasSkillFile) {
      addError(`${label}.files must install SKILL.md`);
    }
  }

  for (const skillName of expectedCompanionSkills) {
    if (!seenNames.has(skillName)) {
      addError(`${companionManifestFile} is missing companion skill ${skillName}`);
    }

    if (!defaultSkills.includes(skillName)) {
      addError(`${companionManifestFile} must install ${skillName} by default`);
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

    if (
      ["integrations/hermes/install.md", "integrations/openclaw/install.md"].includes(file) &&
      (
        !content.includes("companion skills") ||
        !content.includes("raw.githubusercontent.com") ||
        !content.includes("--skip-companion-skills") ||
        !content.includes("--no-companion-skills")
      )
    ) {
      addError(
        `${file} must document companion skills, raw.githubusercontent.com network access, and skip flags`
      );
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
    "Prerequisites",
    "What gets installed",
    "What this does not install/configure",
    "companion skills",
    "raw.githubusercontent.com",
    "--skip-companion-skills",
    "--no-companion-skills",
    "Telegram",
    "mobile",
    "worker-routing",
    "Codex",
    "Claude",
    "OpenClaw",
    "Hermes is the maintained home",
    "quality gates",
    "quality profiles",
    "doctor --json",
    "workflow-evals",
    "Superpowers evidence",
    "compensation"
  ]) {
    if (!content.includes(requiredText)) {
      addError(`README.md must include ${requiredText}`);
    }
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractWorkflowStep(content, stepName) {
  const lines = content.split("\n");
  const stepStartPattern = new RegExp(`^(\\s*)-\\s+name:\\s+${escapeRegExp(stepName)}\\s*$`);
  const startIndex = lines.findIndex((line) => stepStartPattern.test(line));

  if (startIndex === -1) {
    return "";
  }

  const stepIndent = lines[startIndex].match(stepStartPattern)?.[1] ?? "";
  let endIndex = lines.length;

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (lines[index].startsWith(`${stepIndent}- name:`)) {
      endIndex = index;
      break;
    }
  }

  return lines.slice(startIndex, endIndex).join("\n");
}

async function validateReleaseWorkflow() {
  const content = await readFile(path.join(repoRoot, ".github/workflows/release.yml"), "utf8");

  for (const requiredText of [
    "workflow_dispatch:",
    "id-token: write",
    "Check tag matches package version",
    "github.event_name == 'push'",
    "GITHUB_REF_NAME",
    "workflow_dispatch runs validation, smoke test, and pack dry run only",
    "npm publish --access public --provenance"
  ]) {
    if (!content.includes(requiredText)) {
      addError(`.github/workflows/release.yml must include ${requiredText}`);
    }
  }

  if (/^\s*NPM_TOKEN\s*:/m.test(content)) {
    addError(".github/workflows/release.yml must not define NPM_TOKEN as a workflow environment key");
  }

  if (content.includes("env.NPM_TOKEN")) {
    addError(".github/workflows/release.yml must not gate publish behavior on env.NPM_TOKEN");
  }

  const publishStep = extractWorkflowStep(content, "Publish to npm");
  if (!publishStep) {
    addError(".github/workflows/release.yml must include a Publish to npm step");
  } else {
    for (const requiredText of [
      "if: github.event_name == 'push' && startsWith(github.ref, 'refs/tags/v')",
      "NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}",
      "npm publish --access public --provenance"
    ]) {
      if (!publishStep.includes(requiredText)) {
        addError(`.github/workflows/release.yml Publish to npm step must include ${requiredText}`);
      }
    }

    const workflowOutsidePublishStep = content.replace(publishStep, "");
    if (/NODE_AUTH_TOKEN|secrets\.NPM_TOKEN/.test(workflowOutsidePublishStep)) {
      addError(
        ".github/workflows/release.yml must expose the npm secret only as NODE_AUTH_TOKEN in the Publish to npm step"
      );
    }
  }

  for (const stepName of ["Install", "Validate", "Smoke test", "Pack dry run"]) {
    const step = extractWorkflowStep(content, stepName);
    if (!step) {
      addError(`.github/workflows/release.yml must include a ${stepName} step`);
    } else if (/^\s+if:\s*/m.test(step)) {
      addError(`.github/workflows/release.yml ${stepName} step must run for workflow_dispatch`);
    }
  }

  const manualSkipStep = extractWorkflowStep(content, "Skip publish for manual run");
  if (!manualSkipStep) {
    addError(".github/workflows/release.yml must include a Skip publish for manual run step");
  } else if (
    !manualSkipStep.includes("if: github.event_name == 'workflow_dispatch'") ||
    !manualSkipStep.includes(
      "workflow_dispatch runs validation, smoke test, and pack dry run only; skipping npm publish."
    )
  ) {
    addError(".github/workflows/release.yml manual skip step must clearly skip npm publish");
  }
}

export async function runValidation(options = {}) {
  repoRoot = path.resolve(options.rootDir ?? defaultRepoRoot);
  errors = [];

  await validateRequiredFiles();
  await validatePackageJson();
  await validateSkillFrontmatter();
  await validateSkillReferences();
  await validateReferenceMirrors();
  await validateCompanionManifest();
  await validateLeakageScan();
  await validateExampleReferences();
  await validateIntegrationStatuses();
  validateForbiddenPublicFiles();
  await validateReadme();
  await validateReleaseWorkflow();

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
