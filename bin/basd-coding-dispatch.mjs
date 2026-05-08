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
  basd-coding-dispatch init [--target <target>] [--dir <path>] [--force]
  basd-coding-dispatch doctor
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
  basd-coding-dispatch init --dir ~/.hermes
  basd-coding-dispatch init --target openclaw --dir ~/openclaw-workspace
  basd-coding-dispatch init --target generic-agent --dir ./my-project
  basd-coding-dispatch doctor
`);
}

function parseInitArgs(args) {
  const options = {
    target: DEFAULT_TARGET,
    dir: undefined,
    dirProvided: false,
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
      options.dirProvided = true;
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

  const createdFiles = [];
  for (const file of plannedFiles) {
    const content = await readFile(path.join(packageRoot, file.sourceFile), "utf8");
    await mkdir(path.dirname(file.destinationPath), { recursive: true });
    await writeFile(file.destinationPath, content, "utf8");
    createdFiles.push(file.outputFile);
  }

  process.stdout.write(`target: ${options.target}\n`);
  process.stdout.write(`root: ${root}\n`);
  process.stdout.write(`dir: ${installDir}\n`);
  printFileList("created", createdFiles);
  printFileList("skipped", []);
  printFileList("refused", []);
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

function printInstallStatus(label, root, skillPath, rootLabel = "root") {
  process.stdout.write(`${label} ${rootLabel}: ${root}\n`);
  process.stdout.write(
    `${label} skill: ${existsSync(skillPath) ? "installed" : "missing"} at ${skillPath}\n`
  );
}

async function doctor() {
  const validationErrors = [];
  const validationStatus = await runValidation({
    rootDir: packageRoot,
    stdout: { write: () => true },
    stderr: {
      write: (chunk) => {
        validationErrors.push(String(chunk));
        return true;
      }
    }
  });
  const targetErrors = TARGETS.flatMap((target) => {
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

  const hasSourceErrors = validationStatus !== 0 || targetErrors.length > 0;

  process.stdout.write(`source: ${hasSourceErrors ? "failed" : "ok"}\n`);

  if (hasSourceErrors) {
    process.stderr.write(validationErrors.join(""));
    for (const error of targetErrors) {
      process.stderr.write(`${error}\n`);
    }
    return 1;
  }

  const hermesRoot = resolveNativeRoot("hermes", { dirProvided: false });
  const openclawRoot = resolveNativeRoot("openclaw", { dirProvided: false });

  process.stdout.write(`hermes cli: ${commandStatus("hermes", ["--version"])}\n`);
  printInstallStatus(
    "hermes",
    hermesRoot,
    path.join(hermesRoot, "skills", "basd-coding-dispatch", "SKILL.md"),
    "home"
  );
  process.stdout.write(`openclaw cli: ${commandStatus("openclaw", ["--version"], { nodeFallback: true })}\n`);
  process.stdout.write(`openclaw workspace: ${openclawRoot}\n`);
  process.stdout.write(
    `openclaw skill: ${
      existsSync(path.join(openclawRoot, "skills", "basd-coding-dispatch", "SKILL.md"))
        ? "installed"
        : "missing"
    } at ${path.join(openclawRoot, "skills", "basd-coding-dispatch", "SKILL.md")}\n`
  );
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
