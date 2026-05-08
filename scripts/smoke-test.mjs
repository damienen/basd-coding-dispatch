#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../bin/basd-coding-dispatch.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(packageRoot, "bin", "basd-coding-dispatch.mjs");

const manualAdapterTargets = [
  "codex",
  "claude-code",
  "opencode",
  "cursor",
  "generic-agent"
];

const skillReferenceFiles = [
  "quality-gates.md",
  "provider-command-recipes.md",
  "session-topology.md",
  "review-orchestration.md",
  "subagent-skill-bundles.md"
];

function captureWrite(chunks) {
  return (chunk, encoding, callback) => {
    chunks.push(String(chunk));

    if (typeof encoding === "function") {
      encoding();
    }
    if (typeof callback === "function") {
      callback();
    }

    return true;
  };
}

async function run(args) {
  const stdoutChunks = [];
  const stderrChunks = [];
  const originalStdoutWrite = process.stdout.write;
  const originalStderrWrite = process.stderr.write;

  process.stdout.write = captureWrite(stdoutChunks);
  process.stderr.write = captureWrite(stderrChunks);

  try {
    const status = await main(args);
    const stdout = stdoutChunks.join("");
    const stderr = stderrChunks.join("");

    return {
      status,
      stdout,
      stderr,
      combined: `${stdout}${stderr}`
    };
  } finally {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  }
}

function assertSuccess(result, label) {
  assert.equal(
    result.status,
    0,
    `${label} failed with status ${result.status}\n${result.combined}`
  );
}

function assertFailure(result, label) {
  assert.notEqual(result.status, 0, `${label} unexpectedly succeeded`);
}

function assertInstalledSkill(root, label) {
  const skillRoot = path.join(root, "skills", "basd-coding-dispatch");

  assert.ok(
    existsSync(path.join(skillRoot, "SKILL.md")),
    `skill missing for ${label}`
  );

  for (const reference of skillReferenceFiles) {
    assert.ok(
      existsSync(path.join(skillRoot, "references", reference)),
      `skill reference ${reference} missing for ${label}`
    );
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function runSubprocess(args, options = {}) {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd: options.cwd ?? packageRoot,
    env: options.env ?? process.env,
    encoding: "utf8",
    timeout: 10000
  });

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    combined: `${result.stdout}${result.stderr}`
  };
}

function canRunNodeSubprocess() {
  const result = spawnSync(process.execPath, ["-e", "process.stdout.write('ok')"], {
    encoding: "utf8",
    timeout: 10000
  });

  return result.status === 0 && result.stdout === "ok";
}

const scratch = await mkdtemp(path.join(os.tmpdir(), "basd-smoke-"));

try {
  const help = await run(["help"]);
  assertSuccess(help, "help");
  assert.match(help.stdout, /basd-coding-dispatch init/);
  assert.match(help.stdout, /hermes\s+Native Hermes skill install.*\(default\)/);
  assert.match(help.stdout, /openclaw/);

  const unknown = await run(["missing-command"]);
  assertFailure(unknown, "unknown command");
  assert.match(unknown.combined, /Unknown command/);
  assert.match(unknown.combined, /basd-coding-dispatch help/);

  const doctor = await run(["doctor"]);
  assertSuccess(doctor, "doctor");
  assert.match(doctor.stdout, /source: ok/);
  assert.match(doctor.stdout, /hermes cli:/);
  assert.match(doctor.stdout, /hermes root:/);
  assert.match(doctor.stdout, /openclaw cli:/);
  assert.match(doctor.stdout, /openclaw workspace:/);
  assert.match(doctor.stdout, /Doctor passed/);

  const validate = await run(["validate"]);
  assertSuccess(validate, "validate");
  assert.match(validate.stdout, /Validation passed/);

  const cliSource = await readFile(cliPath, "utf8");
  assert.doesNotMatch(cliSource, /function shellQuote/);
  assert.doesNotMatch(cliSource, /shell:\s*true/);
  assert.doesNotMatch(cliSource, /command -v/);

  const originalCwd = process.cwd();
  const originalHome = process.env.HOME;
  const originalHermesHomeForTilde = process.env.HERMES_HOME;
  const originalOpenClawWorkspaceForTilde = process.env.OPENCLAW_WORKSPACE;
  const fakeHome = path.join(scratch, "fake-home");

  try {
    process.chdir(scratch);
    process.env.HOME = fakeHome;
    process.env.HERMES_HOME = "~/.hermes-from-env";
    process.env.OPENCLAW_WORKSPACE = "~/openclaw-from-env";

    const hermesTildeEnv = await run(["init"]);
    assertSuccess(hermesTildeEnv, "bare init expands HERMES_HOME tilde");
    assert.match(
      hermesTildeEnv.stdout,
      new RegExp(`root: ${escapeRegExp(path.join(fakeHome, ".hermes-from-env"))}`)
    );
    assertInstalledSkill(path.join(fakeHome, ".hermes-from-env"), "hermes tilde env");

    const openclawTildeEnv = await run(["init", "--target", "openclaw"]);
    assertSuccess(openclawTildeEnv, "openclaw init expands OPENCLAW_WORKSPACE tilde");
    assert.match(
      openclawTildeEnv.stdout,
      new RegExp(`root: ${escapeRegExp(path.join(fakeHome, "openclaw-from-env"))}`)
    );
    assertInstalledSkill(path.join(fakeHome, "openclaw-from-env"), "openclaw tilde env");

    const openclawTildeDir = await run([
      "init",
      "--target",
      "openclaw",
      "--dir",
      "~/openclaw-from-dir"
    ]);
    assertSuccess(openclawTildeDir, "openclaw init expands --dir tilde");
    assert.match(
      openclawTildeDir.stdout,
      new RegExp(`root: ${escapeRegExp(path.join(fakeHome, "openclaw-from-dir"))}`)
    );
    assertInstalledSkill(path.join(fakeHome, "openclaw-from-dir"), "openclaw tilde dir");
  } finally {
    process.chdir(originalCwd);

    if (originalHome === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = originalHome;
    }

    if (originalHermesHomeForTilde === undefined) {
      delete process.env.HERMES_HOME;
    } else {
      process.env.HERMES_HOME = originalHermesHomeForTilde;
    }

    if (originalOpenClawWorkspaceForTilde === undefined) {
      delete process.env.OPENCLAW_WORKSPACE;
    } else {
      process.env.OPENCLAW_WORKSPACE = originalOpenClawWorkspaceForTilde;
    }
  }

  if (canRunNodeSubprocess()) {
    const subprocessHome = path.join(scratch, "fake-home-subprocess");
    const subprocessEnv = {
      ...process.env,
      HOME: subprocessHome,
      HERMES_HOME: "~/.hermes-from-env-subprocess",
      OPENCLAW_WORKSPACE: "~/openclaw-from-env-subprocess"
    };

    const hermesTildeEnv = runSubprocess(["init"], { env: subprocessEnv, cwd: scratch });
    assertSuccess(hermesTildeEnv, "subprocess bare init expands HERMES_HOME tilde");
    assert.match(
      hermesTildeEnv.stdout,
      new RegExp(`root: ${escapeRegExp(path.join(subprocessHome, ".hermes-from-env-subprocess"))}`)
    );
    assertInstalledSkill(
      path.join(subprocessHome, ".hermes-from-env-subprocess"),
      "subprocess hermes tilde env"
    );

    const openclawTildeEnv = runSubprocess(["init", "--target", "openclaw"], {
      env: subprocessEnv,
      cwd: scratch
    });
    assertSuccess(
      openclawTildeEnv,
      "subprocess openclaw init expands OPENCLAW_WORKSPACE tilde"
    );
    assert.match(
      openclawTildeEnv.stdout,
      new RegExp(`root: ${escapeRegExp(path.join(subprocessHome, "openclaw-from-env-subprocess"))}`)
    );
    assertInstalledSkill(
      path.join(subprocessHome, "openclaw-from-env-subprocess"),
      "subprocess openclaw tilde env"
    );

    const openclawTildeDir = runSubprocess(
      ["init", "--target", "openclaw", "--dir", "~/openclaw-from-dir-subprocess"],
      { env: { ...process.env, HOME: subprocessHome }, cwd: scratch }
    );
    assertSuccess(openclawTildeDir, "subprocess openclaw init expands --dir tilde");
    assert.match(
      openclawTildeDir.stdout,
      new RegExp(`root: ${escapeRegExp(path.join(subprocessHome, "openclaw-from-dir-subprocess"))}`)
    );
    assertInstalledSkill(
      path.join(subprocessHome, "openclaw-from-dir-subprocess"),
      "subprocess openclaw tilde dir"
    );
  }

  const hermesHome = path.join(scratch, "hermes-home");
  const hermesInit = await run(["init", "--target", "hermes", "--dir", hermesHome]);
  assertSuccess(hermesInit, "init hermes");
  assert.match(hermesInit.stdout, /target: hermes/);
  assert.match(hermesInit.stdout, /root:/);
  assert.match(hermesInit.stdout, /next: hermes skills list/);
  assertInstalledSkill(hermesHome, "hermes");
  assert.ok(
    !existsSync(path.join(hermesHome, "AGENTS.md")),
    "hermes target should install only the native skill directory"
  );

  const openclawWorkspace = path.join(scratch, "openclaw-workspace");
  const openclawInit = await run(["init", "--target", "openclaw", "--dir", openclawWorkspace]);
  assertSuccess(openclawInit, "init openclaw");
  assert.match(openclawInit.stdout, /target: openclaw/);
  assert.match(openclawInit.stdout, /next: openclaw skills list/);
  assertInstalledSkill(openclawWorkspace, "openclaw");

  const originalHermesHome = process.env.HERMES_HOME;
  const originalOpenClawWorkspace = process.env.OPENCLAW_WORKSPACE;
  try {
    const hermesEnvHome = path.join(scratch, "hermes-env-home");
    process.env.HERMES_HOME = hermesEnvHome;
    const hermesEnvInit = await run(["init"]);
    assertSuccess(hermesEnvInit, "bare init hermes from HERMES_HOME");
    assert.match(hermesEnvInit.stdout, /target: hermes/);
    assert.match(hermesEnvInit.stdout, new RegExp(`root: ${escapeRegExp(hermesEnvHome)}`));
    assertInstalledSkill(hermesEnvHome, "hermes env");

    const openclawEnvWorkspace = path.join(scratch, "openclaw-env-workspace");
    process.env.OPENCLAW_WORKSPACE = openclawEnvWorkspace;
    const openclawEnvInit = await run(["init", "--target", "openclaw"]);
    assertSuccess(openclawEnvInit, "init openclaw from OPENCLAW_WORKSPACE");
    assertInstalledSkill(openclawEnvWorkspace, "openclaw env");
  } finally {
    if (originalHermesHome === undefined) {
      delete process.env.HERMES_HOME;
    } else {
      process.env.HERMES_HOME = originalHermesHome;
    }

    if (originalOpenClawWorkspace === undefined) {
      delete process.env.OPENCLAW_WORKSPACE;
    } else {
      process.env.OPENCLAW_WORKSPACE = originalOpenClawWorkspace;
    }
  }

  for (const target of manualAdapterTargets) {
    const destination = path.join(scratch, target);
    const init = await run(["init", "--target", target, "--dir", destination]);
    assertSuccess(init, `init ${target}`);
    assert.match(init.stdout, /created:/);
    assert.match(init.stdout, /skipped:/);
    assertInstalledSkill(destination, target);
  }

  const nativeConflictRoot = path.join(scratch, "native-conflict");
  const firstNative = await run(["init", "--target", "hermes", "--dir", nativeConflictRoot]);
  assertSuccess(firstNative, "initial hermes install");

  const secondNative = await run(["init", "--target", "hermes", "--dir", nativeConflictRoot]);
  assertFailure(secondNative, "conflicting hermes install");
  assert.match(secondNative.stdout, /refused:/);

  const forcedNative = await run(["init", "--target", "hermes", "--dir", nativeConflictRoot, "--force"]);
  assertSuccess(forcedNative, "forced hermes install");
  assert.match(forcedNative.stdout, /created:/);

  const openclawConflictRoot = path.join(scratch, "openclaw-native-conflict");
  const firstOpenClawNative = await run([
    "init",
    "--target",
    "openclaw",
    "--dir",
    openclawConflictRoot
  ]);
  assertSuccess(firstOpenClawNative, "initial openclaw install");

  const secondOpenClawNative = await run([
    "init",
    "--target",
    "openclaw",
    "--dir",
    openclawConflictRoot
  ]);
  assertFailure(secondOpenClawNative, "conflicting openclaw install");
  assert.match(secondOpenClawNative.stdout, /refused:/);

  const forcedOpenClawNative = await run([
    "init",
    "--target",
    "openclaw",
    "--dir",
    openclawConflictRoot,
    "--force"
  ]);
  assertSuccess(forcedOpenClawNative, "forced openclaw install");
  assert.match(forcedOpenClawNative.stdout, /created:/);

  const conflictDir = path.join(scratch, "conflict");
  const first = await run(["init", "--target", "generic-agent", "--dir", conflictDir]);
  assertSuccess(first, "initial generic scaffold");

  const second = await run(["init", "--target", "generic-agent", "--dir", conflictDir]);
  assertFailure(second, "conflicting generic scaffold");
  assert.match(second.stdout, /refused:/);

  const forced = await run(["init", "--target", "generic-agent", "--dir", conflictDir, "--force"]);
  assertSuccess(forced, "forced generic scaffold");
  assert.match(forced.stdout, /created:/);

  const agentsPath = path.join(conflictDir, "AGENTS.md");
  const agents = await readFile(agentsPath, "utf8");
  assert.match(agents, /Anti-Slop Governance/);

  const customFile = path.join(conflictDir, "custom.txt");
  await writeFile(customFile, "keep me\n", "utf8");
  const afterForce = await readFile(customFile, "utf8");
  assert.equal(afterForce, "keep me\n");

  console.log("Smoke test passed");
} finally {
  await rm(scratch, { recursive: true, force: true });
}
