#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runValidation } from "../scripts/validate.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const TARGETS = [
  "hermes",
  "codex",
  "claude-code",
  "opencode",
  "cursor",
  "generic-agent"
];

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
  "skills/basd-coding-dispatch/SKILL.md",
  "skills/basd-coding-dispatch/references/README.md",
  "references/quality-gates.md",
  "references/provider-command-recipes.md",
  "references/session-topology.md",
  "references/review-orchestration.md",
  "references/subagent-skill-bundles.md",
  "integrations/hermes/install.md",
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
  "skills/basd-coding-dispatch/SKILL.md",
  "skills/basd-coding-dispatch/references/README.md",
  "references/quality-gates.md",
  "references/provider-command-recipes.md",
  "references/session-topology.md",
  "references/review-orchestration.md",
  "references/subagent-skill-bundles.md"
];

const TARGET_FILES = {
  hermes: [
    "AGENTS.md",
    ...BASE_SCAFFOLD_FILES,
    "integrations/hermes/install.md"
  ],
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
  basd-coding-dispatch init [--target <target>] [--dir <path>] [--force]
  basd-coding-dispatch doctor
  basd-coding-dispatch validate
  basd-coding-dispatch help

Targets:
  hermes
  codex
  claude-code
  opencode
  cursor
  generic-agent

Examples:
  basd-coding-dispatch init
  basd-coding-dispatch init --target codex --dir ./my-project
  basd-coding-dispatch doctor
`);
}

function parseInitArgs(args) {
  const options = {
    target: "generic-agent",
    dir: process.cwd(),
    force: false
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
      index += 1;
    } else if (arg === "--force") {
      options.force = true;
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

  const selectedFiles = TARGET_FILES[options.target];
  const selectedSet = new Set(selectedFiles);
  const skippedFiles = ALL_SCAFFOLD_FILES.filter((file) => !selectedSet.has(file));
  const destinationRoot = path.resolve(process.cwd(), options.dir);
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

function doctor() {
  const missing = REQUIRED_SOURCE_FILES.filter((file) => {
    return !existsSync(path.join(packageRoot, file));
  });

  const targetErrors = TARGETS.flatMap((target) => {
    const files = TARGET_FILES[target] ?? [];
    if (files.length === 0) {
      return [`target ${target} has no scaffold files`];
    }
    return files
      .filter((file) => !REQUIRED_SOURCE_FILES.includes(file))
      .map((file) => `target ${target} references unknown source file ${file}`);
  });

  if (missing.length > 0 || targetErrors.length > 0) {
    for (const file of missing) {
      process.stderr.write(`missing: ${file}\n`);
    }
    for (const error of targetErrors) {
      process.stderr.write(`${error}\n`);
    }
    return 1;
  }

  process.stdout.write("Doctor passed\n");
  return 0;
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
    return doctor();
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
