#!/usr/bin/env node

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runValidation } from "../scripts/validate.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillDirectory = "skills/basd-coding-dispatch";
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
const skillFiles = [
  `${skillDirectory}/SKILL.md`,
  `${skillDirectory}/references/README.md`,
  ...skillReferenceFiles.map((file) => `${skillDirectory}/references/${file}`)
];
const rootReferenceFiles = skillReferenceFiles.map((file) => `references/${file}`);
const companionManifestFile = "integrations/companion-skills.json";

const TARGETS = [
  "hermes",
  "openclaw",
  "codex",
  "claude-code",
  "opencode",
  "cursor",
  "generic-agent"
];
const DEFAULT_TARGET = "hermes";
const NATIVE_SKILL_TARGETS = new Set(["hermes", "openclaw"]);

const REQUIRED_SOURCE_FILES = [
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
  ...skillFiles,
  ...rootReferenceFiles,
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

const BASE_SCAFFOLD_FILES = [
  "llms.txt",
  ...skillFiles,
  ...rootReferenceFiles
];

const TARGET_FILES = {
  codex: [
    "AGENTS.md",
    ...BASE_SCAFFOLD_FILES,
    "integrations/codex/install.md"
  ],
  "claude-code": [
    "CLAUDE.md",
    ...BASE_SCAFFOLD_FILES,
    "integrations/claude-code/install.md"
  ],
  opencode: [
    "AGENTS.md",
    ...BASE_SCAFFOLD_FILES,
    "integrations/opencode/install.md"
  ],
  cursor: [
    "AGENTS.md",
    ...BASE_SCAFFOLD_FILES,
    "integrations/cursor/install.md"
  ],
  "generic-agent": [
    "AGENTS.md",
    "CLAUDE.md",
    ...BASE_SCAFFOLD_FILES,
    "integrations/generic-agent/install.md"
  ]
};

const ALL_SCAFFOLD_FILES = [...new Set(Object.values(TARGET_FILES).flat())].sort();

function printHelp(stream = process.stdout) {
  stream.write(`basd-coding-dispatch

Usage:
  basd-coding-dispatch init [--target <target>] [--dir <path>] [--force] [--skip-companion-skills]
  basd-coding-dispatch doctor [--json]
  basd-coding-dispatch validate
  basd-coding-dispatch help

Targets:
  hermes        Native Hermes skill install under $HERMES_HOME/skills or ~/.hermes/skills (default)
  openclaw      OpenClaw workspace skill install under ~/openclaw-workspace/skills
  generic-agent Manual project scaffold
  codex         Experimental manual adapter scaffold
  claude-code   Experimental manual adapter scaffold
  opencode      Experimental manual adapter scaffold
  cursor        Experimental manual adapter scaffold

Examples:
  basd-coding-dispatch init
  basd-coding-dispatch init --skip-companion-skills
  basd-coding-dispatch init --dir ~/.hermes
  basd-coding-dispatch init --target openclaw --dir ~/openclaw-workspace
  basd-coding-dispatch init --target generic-agent --dir ./my-project
  basd-coding-dispatch doctor
  basd-coding-dispatch doctor --json

Options:
  --skip-companion-skills  Do not fetch default companion skills for native targets
  --no-companion-skills    Alias for --skip-companion-skills
`);
}

function parseInitArgs(args) {
  const options = {
    target: DEFAULT_TARGET,
    dir: undefined,
    dirProvided: false,
    force: false,
    installCompanionSkills: true
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--target") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("--target requires a value");
      }
      options.target = value;
      index += 1;
    } else if (arg === "--dir") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("--dir requires a value");
      }
      options.dir = value;
      options.dirProvided = true;
      index += 1;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--skip-companion-skills" || arg === "--no-companion-skills") {
      options.installCompanionSkills = false;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown init option: ${arg}`);
    }
  }

  if (!TARGETS.includes(options.target)) {
    throw new Error(`Unknown target: ${options.target}`);
  }

  return options;
}

function parseDoctorArgs(args) {
  const options = {
    json: false,
    help: false
  };

  for (const arg of args) {
    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown doctor option: ${arg}`);
    }
  }

  return options;
}

function printFileList(label, files) {
  process.stdout.write(`${label}:\n`);
  if (files.length === 0) {
    process.stdout.write("  none\n");
    return;
  }
  for (const file of files) {
    process.stdout.write(`  ${file}\n`);
  }
}

async function copyScaffoldFile(relativeFile, destinationRoot) {
  const sourcePath = path.join(packageRoot, relativeFile);
  const destinationPath = path.join(destinationRoot, relativeFile);
  const content = await readFile(sourcePath, "utf8");
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await writeFile(destinationPath, content, "utf8");
}

async function listSourceFiles(relativeDirectory) {
  const fullDirectory = path.join(packageRoot, relativeDirectory);
  const entries = await readdir(fullDirectory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listSourceFiles(relativePath));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files.sort();
}

async function loadCompanionSkillManifest() {
  const content = await readFile(path.join(packageRoot, companionManifestFile), "utf8");
  return JSON.parse(content);
}

function defaultCompanionSkills(manifest) {
  return (manifest.skills ?? []).filter((skill) => skill.installByDefault === true);
}

function formatFile(file) {
  return file.split(path.sep).join("/");
}

function expandHomePath(value) {
  if (value === "~") {
    return os.homedir();
  }

  if (value.startsWith("~/") || value.startsWith("~\\")) {
    return path.join(os.homedir(), value.slice(2));
  }

  return value;
}

function resolveUserPath(value) {
  return path.resolve(process.cwd(), expandHomePath(value));
}

function assertSafeRelativePath(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty relative path`);
  }

  if (path.isAbsolute(value) || value.split(/[\\/]+/).includes("..")) {
    throw new Error(`${label} must stay inside the install root: ${value}`);
  }
}

function resolveNativeRoot(target, options = {}) {
  if (options.dirProvided) {
    return resolveUserPath(options.dir);
  }

  if (target === "hermes") {
    return resolveUserPath(process.env.HERMES_HOME || path.join(os.homedir(), ".hermes"));
  }

  if (target === "openclaw") {
    return resolveUserPath(
      process.env.OPENCLAW_WORKSPACE || path.join(os.homedir(), "openclaw-workspace")
    );
  }

  throw new Error(`Unsupported native target: ${target}`);
}

function printNativeNextStep(target) {
  if (target === "hermes") {
    process.stdout.write("next: hermes skills list\n");
    process.stdout.write("next: /skill basd-coding-dispatch\n");
    return;
  }

  process.stdout.write("next: openclaw skills list\n");
  process.stdout.write("next: /skill basd-coding-dispatch\n");
}

function companionOutputFile(skill, file) {
  assertSafeRelativePath(skill.name, "companion skill name");
  assertSafeRelativePath(file.destinationPath, "companion destinationPath");
  return formatFile(path.join("skills", skill.name, file.destinationPath));
}

function companionFixturePath(skill, file) {
  assertSafeRelativePath(file.sourcePath, "companion sourcePath");
  const fixtureRoot = resolveUserPath(process.env.BASD_COMPANION_SKILLS_FIXTURE_DIR);
  return path.join(fixtureRoot, skill.sourceRepo, file.sourcePath);
}

async function fetchCompanionFile(skill, file) {
  if (process.env.BASD_COMPANION_SKILLS_FIXTURE_DIR) {
    return readFile(companionFixturePath(skill, file), "utf8");
  }

  if (typeof fetch !== "function") {
    throw new Error("global fetch is unavailable; Node 22 or newer is required");
  }

  const response = await fetch(file.rawUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
  }

  return response.text();
}

async function prepareCompanionSkillInstall(root, options) {
  const manifest = await loadCompanionSkillManifest();
  const skills = defaultCompanionSkills(manifest);
  const result = {
    created: [],
    completed: [],
    skipped: [],
    overwritten: [],
    writePlans: []
  };

  for (const skill of skills) {
    const plannedFiles = skill.files.map((file) => {
      const outputFile = companionOutputFile(skill, file);

      return {
        sourcePath: file.sourcePath,
        outputFile,
        destinationPath: path.join(root, outputFile),
        rawUrl: file.rawUrl
      };
    });
    const existingFiles = plannedFiles.filter((file) => existsSync(file.destinationPath));
    const missingFiles = plannedFiles.filter((file) => !existsSync(file.destinationPath));

    if (!options.force && missingFiles.length === 0) {
      result.skipped.push(skill.name);
      continue;
    }

    const filesToInstall = options.force ? plannedFiles : missingFiles;
    const filesWithContent = [];
    for (const file of filesToInstall) {
      try {
        const content = await fetchCompanionFile(skill, file);
        filesWithContent.push({ ...file, content });
      } catch (error) {
        throw new Error(
          `failed to fetch companion skill ${skill.name} file ${file.sourcePath} from ${file.rawUrl}: ${error.message}`
        );
      }
    }

    result.writePlans.push({
      skillName: skill.name,
      files: filesWithContent
    });

    if (options.force && existingFiles.length > 0) {
      result.overwritten.push(skill.name);
    } else if (!options.force && existingFiles.length > 0) {
      result.completed.push(skill.name);
    } else {
      result.created.push(skill.name);
    }
  }

  return result;
}

async function writeCompanionSkillInstall(plan) {
  for (const skillPlan of plan.writePlans) {
    for (const file of skillPlan.files) {
      await mkdir(path.dirname(file.destinationPath), { recursive: true });
      await writeFile(file.destinationPath, file.content, "utf8");
    }
  }
}

async function initNativeSkill(options) {
  const root = resolveNativeRoot(options.target, options);
  const installDir = path.join(root, "skills", "basd-coding-dispatch");
  const sourceFiles = await listSourceFiles(skillDirectory);
  const plannedFiles = sourceFiles.map((sourceFile) => {
    const skillRelativeFile = path.relative(skillDirectory, sourceFile);
    const outputFile = path.join("skills", "basd-coding-dispatch", skillRelativeFile);

    return {
      sourceFile,
      outputFile: formatFile(outputFile),
      destinationPath: path.join(root, outputFile)
    };
  });

  const refusedFiles = plannedFiles
    .filter((file) => existsSync(file.destinationPath) && !options.force)
    .map((file) => file.outputFile);

  if (refusedFiles.length > 0) {
    process.stdout.write(`target: ${options.target}\n`);
    process.stdout.write(`root: ${root}\n`);
    process.stdout.write(`dir: ${installDir}\n`);
    printFileList("created", []);
    printFileList("skipped", []);
    printFileList("refused", refusedFiles);
    printNativeNextStep(options.target);
    process.stderr.write("Refusing to overwrite existing skill files without --force.\n");
    return 1;
  }

  let companionPlan;
  if (options.installCompanionSkills) {
    try {
      companionPlan = await prepareCompanionSkillInstall(root, options);
    } catch (error) {
      process.stdout.write(`target: ${options.target}\n`);
      process.stdout.write(`root: ${root}\n`);
      process.stdout.write(`dir: ${installDir}\n`);
      printFileList("created", []);
      printFileList("skipped", []);
      printFileList("refused", []);
      printFileList("companion created", []);
      printFileList("companion completed", []);
      printFileList("companion skipped", []);
      printFileList("companion overwritten", []);
      process.stderr.write(`${error.message}\n`);
      return 1;
    }
  }

  const createdFiles = [];
  for (const file of plannedFiles) {
    const content = await readFile(path.join(packageRoot, file.sourceFile), "utf8");
    await mkdir(path.dirname(file.destinationPath), { recursive: true });
    await writeFile(file.destinationPath, content, "utf8");
    createdFiles.push(file.outputFile);
  }

  if (companionPlan) {
    await writeCompanionSkillInstall(companionPlan);
  }

  process.stdout.write(`target: ${options.target}\n`);
  process.stdout.write(`root: ${root}\n`);
  process.stdout.write(`dir: ${installDir}\n`);
  printFileList("created", createdFiles);
  printFileList("skipped", []);
  printFileList("refused", []);
  if (options.installCompanionSkills) {
    printFileList("companion created", companionPlan.created);
    printFileList("companion completed", companionPlan.completed);
    printFileList("companion skipped", companionPlan.skipped);
    printFileList("companion overwritten", companionPlan.overwritten);
  } else {
    process.stdout.write("companion skills: skipped by flag\n");
  }
  printNativeNextStep(options.target);

  return 0;
}

async function init(args) {
  let options;
  try {
    options = parseInitArgs(args);
  } catch (error) {
    process.stderr.write(`${error.message}\n\n`);
    printHelp(process.stderr);
    return 1;
  }

  if (options.help) {
    printHelp();
    return 0;
  }

  if (NATIVE_SKILL_TARGETS.has(options.target)) {
    return initNativeSkill(options);
  }

  const selectedFiles = TARGET_FILES[options.target];
  const selectedSet = new Set(selectedFiles);
  const skippedFiles = ALL_SCAFFOLD_FILES.filter((file) => !selectedSet.has(file));
  const destinationRoot = resolveUserPath(options.dir ?? ".");
  const refusedFiles = selectedFiles.filter((file) => {
    return existsSync(path.join(destinationRoot, file)) && !options.force;
  });

  if (refusedFiles.length > 0) {
    process.stdout.write(`target: ${options.target}\n`);
    process.stdout.write(`dir: ${destinationRoot}\n`);
    printFileList("created", []);
    printFileList("skipped", skippedFiles);
    printFileList("refused", refusedFiles);
    process.stderr.write("Refusing to overwrite existing files without --force.\n");
    return 1;
  }

  const createdFiles = [];
  for (const file of selectedFiles) {
    await copyScaffoldFile(file, destinationRoot);
    createdFiles.push(file);
  }

  process.stdout.write(`target: ${options.target}\n`);
  process.stdout.write(`dir: ${destinationRoot}\n`);
  printFileList("created", createdFiles);
  printFileList("skipped", skippedFiles);
  printFileList("refused", []);

  return 0;
}

function commandCandidates(command) {
  if (path.isAbsolute(command) || command.includes("/") || command.includes("\\")) {
    return [command];
  }

  const directories = (process.env.PATH || "")
    .split(path.delimiter)
    .filter(Boolean);
  const extensions = process.platform === "win32"
    ? (process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM")
      .split(";")
      .filter(Boolean)
    : [""];

  return directories.flatMap((directory) => {
    return extensions.map((extension) => path.join(directory, `${command}${extension}`));
  });
}

function findCommand(command) {
  return commandCandidates(command).find((candidate) => existsSync(candidate));
}

function firstOutputLine(value) {
  return (value || "").trim().split(/\r?\n/)[0]?.trim() || "";
}

function nodeFallbackOutputLines(executable, args) {
  const fallback = spawnSync(process.execPath, [executable, ...args], {
    encoding: "utf8",
    timeout: 5000
  });

  return {
    succeeded: fallback.status === 0 && !fallback.error,
    stdoutLine: firstOutputLine(fallback.stdout),
    stderrLine: firstOutputLine(fallback.stderr)
  };
}

function commandStatus(command, args, options = {}) {
  const executable = findCommand(command);

  if (!executable) {
    return "missing";
  }

  const result = spawnSync(executable, args, {
    encoding: "utf8",
    timeout: 5000
  });

  if (result.error?.code === "ENOENT") {
    return "missing";
  }

  if (result.error) {
    if (options.nodeFallback) {
      const fallbackLines = nodeFallbackOutputLines(executable, args);

      if (fallbackLines.succeeded && fallbackLines.stdoutLine) {
        return `present (${fallbackLines.stdoutLine})`;
      }

      if (fallbackLines.succeeded && fallbackLines.stderrLine) {
        return `present (${fallbackLines.stderrLine})`;
      }
    }

    return `error (${result.error.code || result.error.message || "unknown spawn error"})`;
  }

  const stdoutLine = firstOutputLine(result.stdout);

  if (stdoutLine) {
    return `present (${stdoutLine})`;
  }

  let fallbackStderrLine = "";
  if (options.nodeFallback) {
    const fallbackLines = nodeFallbackOutputLines(executable, args);

    if (fallbackLines.succeeded && fallbackLines.stdoutLine) {
      return `present (${fallbackLines.stdoutLine})`;
    }

    if (fallbackLines.succeeded) {
      fallbackStderrLine = fallbackLines.stderrLine;
    }
  }

  const stderrLine = firstOutputLine(result.stderr);

  if (stderrLine) {
    return `present (${stderrLine})`;
  }

  if (fallbackStderrLine) {
    return `present (${fallbackStderrLine})`;
  }

  return `present (${executable})`;
}

function installedStatus(filePath) {
  return existsSync(filePath) ? "installed" : "missing";
}

function companionMetadataIssues(manifest) {
  const issues = [];

  for (const skill of manifest.skills ?? []) {
    if (!/^[a-f0-9]{40}$/i.test(skill.ref ?? "")) {
      issues.push(`${skill.name || "unnamed"} uses a non-pinned ref`);
    }

    for (const file of skill.files ?? []) {
      if (typeof file.rawUrl !== "string") {
        issues.push(`${skill.name || "unnamed"} has a companion file without a rawUrl`);
        continue;
      }

      if (!file.rawUrl.includes(`/${skill.ref}/`)) {
        issues.push(`${skill.name || "unnamed"} rawUrl does not include its pinned ref`);
      }

      if (/\/(main|master|HEAD)\//.test(file.rawUrl)) {
        issues.push(`${skill.name || "unnamed"} rawUrl appears to use a moving default ref`);
      }
    }
  }

  return issues;
}

function companionSkillInstallStatus(root, skill) {
  const files = (skill.files ?? []).map((file) => {
    const outputFile = companionOutputFile(skill, file);
    const filePath = path.join(root, outputFile);

    return {
      sourcePath: file.sourcePath,
      destinationPath: file.destinationPath,
      outputFile,
      path: filePath,
      status: installedStatus(filePath)
    };
  });
  const skillPath = path.join(root, "skills", skill.name, "SKILL.md");
  const missingFiles = files
    .filter((file) => file.status !== "installed")
    .map((file) => file.outputFile);
  const status = missingFiles.length === 0
    ? "installed"
    : existsSync(skillPath)
      ? "partial"
      : "missing";

  return {
    name: skill.name,
    status,
    path: skillPath,
    sourceRepo: skill.sourceRepo,
    ref: skill.ref,
    metadataStatus: /^[a-f0-9]{40}$/i.test(skill.ref ?? "") ? "pinned" : "review",
    missingFiles,
    files
  };
}

function nativeTargetStatus(target, companionSkills) {
  const root = resolveNativeRoot(target, { dirProvided: false });
  const skillPath = path.join(root, "skills", "basd-coding-dispatch", "SKILL.md");
  const cli = target === "openclaw"
    ? commandStatus("openclaw", ["--version"], { nodeFallback: true })
    : commandStatus("hermes", ["--version"]);

  return {
    cli,
    root,
    rootLabel: target === "hermes" ? "home" : "workspace",
    skill: {
      status: installedStatus(skillPath),
      path: skillPath
    },
    companionSkills: companionSkills.map((skill) => companionSkillInstallStatus(root, skill))
  };
}

function targetInstallOk(targetStatus) {
  return targetStatus.skill.status === "installed"
    && targetStatus.companionSkills.every((skill) => skill.status === "installed");
}

function doctorInstallOk(status) {
  const targets = Object.values(status.targets ?? {});
  return status.ok === true
    && status.source.status === "ok"
    && status.companionManifest.status === "ok"
    && targets.length > 0
    && targets.every((target) => targetInstallOk(target));
}

function validationOutputToErrors(chunks) {
  return chunks
    .join("")
    .split(/\r?\n/)
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter(Boolean);
}

function targetSourceErrors() {
  return TARGETS.flatMap((target) => {
    if (NATIVE_SKILL_TARGETS.has(target)) {
      return [];
    }

    const files = TARGET_FILES[target] ?? [];
    if (files.length === 0) {
      return [`target ${target} has no scaffold files`];
    }
    return files
      .filter((file) => !REQUIRED_SOURCE_FILES.includes(file))
      .map((file) => `target ${target} references unknown source file ${file}`);
  });
}

async function buildDoctorStatus() {
  const validationChunks = [];
  const validationStatus = await runValidation({
    rootDir: packageRoot,
    stdout: { write: () => true },
    stderr: {
      write: (chunk) => {
        validationChunks.push(String(chunk));
        return true;
      }
    }
  });
  const errors = [
    ...validationOutputToErrors(validationChunks),
    ...targetSourceErrors()
  ];
  const source = {
    status: validationStatus === 0 && errors.length === 0 ? "ok" : "failed",
    errors
  };
  const status = {
    ok: source.status === "ok",
    installOk: false,
    source,
    companionManifest: {
      status: "not-checked",
      file: companionManifestFile,
      defaultSkillCount: 0,
      metadataStatus: "not-checked",
      metadataIssues: []
    },
    targets: {}
  };

  if (source.status !== "ok") {
    return status;
  }

  try {
    const companionManifest = await loadCompanionSkillManifest();
    const companionSkills = defaultCompanionSkills(companionManifest);
    const metadataIssues = companionMetadataIssues(companionManifest);

    status.companionManifest = {
      status: "ok",
      file: companionManifestFile,
      defaultSkillCount: companionSkills.length,
      metadataStatus: metadataIssues.length === 0 ? "ok" : "review",
      metadataIssues
    };
    status.targets = {
      hermes: nativeTargetStatus("hermes", companionSkills),
      openclaw: nativeTargetStatus("openclaw", companionSkills)
    };
    status.installOk = doctorInstallOk(status);
  } catch (error) {
    status.ok = false;
    status.companionManifest = {
      status: "failed",
      file: companionManifestFile,
      defaultSkillCount: 0,
      metadataStatus: "not-checked",
      metadataIssues: [],
      errors: [error.message]
    };
  }

  return status;
}

function renderCompanionInstallStatus(label, skills) {
  process.stdout.write(`${label} companion skills:\n`);
  for (const skill of skills) {
    process.stdout.write(`  ${skill.name}: ${skill.status} at ${skill.path}\n`);
    if (skill.missingFiles.length > 0) {
      process.stdout.write(`    missing files: ${skill.missingFiles.join(", ")}\n`);
    }
  }
}

function renderDoctorText(status) {
  process.stdout.write(`source: ${status.source.status}\n`);

  if (status.source.status !== "ok") {
    for (const error of status.source.errors) {
      process.stderr.write(`- ${error}\n`);
    }
    return;
  }

  if (status.companionManifest.status !== "ok") {
    process.stdout.write(`companion manifest: ${status.companionManifest.status}\n`);
    for (const error of status.companionManifest.errors ?? []) {
      process.stderr.write(`- ${error}\n`);
    }
    return;
  }

  process.stdout.write(
    `companion manifest: ok (${status.companionManifest.defaultSkillCount} default skills at ${status.companionManifest.file})\n`
  );
  process.stdout.write(`hermes cli: ${status.targets.hermes.cli}\n`);
  process.stdout.write(`hermes home: ${status.targets.hermes.root}\n`);
  process.stdout.write(
    `hermes skill: ${status.targets.hermes.skill.status} at ${status.targets.hermes.skill.path}\n`
  );
  renderCompanionInstallStatus("hermes", status.targets.hermes.companionSkills);
  process.stdout.write(`openclaw cli: ${status.targets.openclaw.cli}\n`);
  process.stdout.write(`openclaw workspace: ${status.targets.openclaw.root}\n`);
  process.stdout.write(
    `openclaw skill: ${status.targets.openclaw.skill.status} at ${status.targets.openclaw.skill.path}\n`
  );
  renderCompanionInstallStatus("openclaw", status.targets.openclaw.companionSkills);
  process.stdout.write("Doctor passed\n");
}

async function doctor(args = []) {
  let options;
  try {
    options = parseDoctorArgs(args);
  } catch (error) {
    process.stderr.write(`${error.message}\n\n`);
    printHelp(process.stderr);
    return 1;
  }

  if (options.help) {
    printHelp();
    return 0;
  }

  const status = await buildDoctorStatus();

  if (options.json) {
    process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
  } else {
    renderDoctorText(status);
  }

  return status.ok ? 0 : 1;
}

function validate() {
  return runValidation({ rootDir: packageRoot });
}

export async function main(argv = process.argv.slice(2)) {
  const [command = "help", ...args] = argv;

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return 0;
  }

  if (command === "init") {
    return init(args);
  }

  if (command === "doctor") {
    return doctor(args);
  }

  if (command === "validate") {
    return validate();
  }

  process.stderr.write(`Unknown command: ${command}\n\n`);
  printHelp(process.stderr);
  return 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
const currentPath = path.resolve(fileURLToPath(import.meta.url));

if (invokedPath === currentPath) {
  const exitCode = await main();
  process.exitCode = exitCode;
}
