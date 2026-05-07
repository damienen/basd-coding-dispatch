#!/usr/bin/env node

import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { main } from "../bin/basd-coding-dispatch.mjs";

const targets = [
  "hermes",
  "codex",
  "claude-code",
  "opencode",
  "cursor",
  "generic-agent"
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

const scratch = await mkdtemp(path.join(os.tmpdir(), "basd-smoke-"));

try {
  const help = await run(["help"]);
  assertSuccess(help, "help");
  assert.match(help.stdout, /basd-coding-dispatch init/);

  const unknown = await run(["missing-command"]);
  assertFailure(unknown, "unknown command");
  assert.match(unknown.combined, /Unknown command/);
  assert.match(unknown.combined, /basd-coding-dispatch help/);

  const doctor = await run(["doctor"]);
  assertSuccess(doctor, "doctor");
  assert.match(doctor.stdout, /Doctor passed/);

  const validate = await run(["validate"]);
  assertSuccess(validate, "validate");
  assert.match(validate.stdout, /Validation passed/);

  for (const target of targets) {
    const destination = path.join(scratch, target);
    const init = await run(["init", "--target", target, "--dir", destination]);
    assertSuccess(init, `init ${target}`);
    assert.match(init.stdout, /created:/);
    assert.match(init.stdout, /skipped:/);
    assert.ok(
      existsSync(path.join(destination, "skills", "basd-coding-dispatch", "SKILL.md")),
      `skill missing for ${target}`
    );
  }

  const conflictDir = path.join(scratch, "conflict");
  const first = await run(["init", "--target", "codex", "--dir", conflictDir]);
  assertSuccess(first, "initial codex scaffold");

  const second = await run(["init", "--target", "codex", "--dir", conflictDir]);
  assertFailure(second, "conflicting scaffold");
  assert.match(second.stdout, /refused:/);

  const forced = await run(["init", "--target", "codex", "--dir", conflictDir, "--force"]);
  assertSuccess(forced, "forced scaffold");
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
