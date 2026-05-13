#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "../bin/basd-coding-dispatch.mjs";
import {
  expectedDestinationPathForSuperpowersSource,
  expectedSuperpowersExecutableSourceFiles,
  expectedSuperpowersCompanionSkills,
  expectedSuperpowersCompanionSourceFiles
} from "./companion-support-files.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(packageRoot, "bin", "basd-coding-dispatch.mjs");
const companionManifestPath = path.join(packageRoot, "integrations", "companion-skills.json");

const manualAdapterTargets = [
  "codex",
  "claude-code",
  "opencode",
  "cursor",
  "generic-agent"
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

const companionSkillNames = [
  "codex",
  "claude-code",
  ...expectedSuperpowersCompanionSkills
];

const companionSkillFileExpectations = new Map([
  ["codex", ["SKILL.md"]],
  ["claude-code", ["SKILL.md"]],
  ...Object.entries(expectedSuperpowersCompanionSourceFiles).map(([skillName, sourcePaths]) => [
    skillName,
    sourcePaths.map((sourcePath) => (
      expectedDestinationPathForSuperpowersSource(skillName, sourcePath)
    ))
  ])
]);

const companionExecutableFileExpectations = expectedSuperpowersExecutableSourceFiles.map(
  (sourcePath) => {
    const skillName = sourcePath.split("/")[1];
    return {
      skillName,
      file: expectedDestinationPathForSuperpowersSource(skillName, sourcePath)
    };
  }
);

function companionFixtureContent(skillName, sourcePath) {
  if (sourcePath.endsWith("/SKILL.md")) {
    return `---\nname: ${skillName}\n---\n# ${skillName} fixture\n`;
  }

  return `# ${sourcePath} fixture\n`;
}

const fixtureFiles = [
  {
    repo: "NousResearch/hermes-agent",
    path: "skills/autonomous-ai-agents/codex/SKILL.md",
    content: "---\nname: codex\n---\n# Codex fixture\n"
  },
  {
    repo: "NousResearch/hermes-agent",
    path: "skills/autonomous-ai-agents/claude-code/SKILL.md",
    content: "---\nname: claude-code\n---\n# Claude Code fixture\n"
  },
  ...Object.entries(expectedSuperpowersCompanionSourceFiles).flatMap(([skillName, sourcePaths]) => (
    sourcePaths.map((sourcePath) => ({
      repo: "obra/superpowers",
      path: sourcePath,
      content: companionFixtureContent(skillName, sourcePath)
    }))
  ))
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

function assertInstalledCompanionSkills(root, label) {
  for (const [skillName, files] of companionSkillFileExpectations) {
    for (const file of files) {
      assert.ok(
        existsSync(path.join(root, "skills", skillName, file)),
        `companion skill ${skillName} file ${file} missing for ${label}`
      );
    }
  }
}

function assertMissingCompanionSkills(root, label) {
  for (const [skillName, files] of companionSkillFileExpectations) {
    for (const file of files) {
      assert.ok(
        !existsSync(path.join(root, "skills", skillName, file)),
        `companion skill ${skillName} file ${file} should be absent for ${label}`
      );
    }
  }
}

async function assertInstalledCompanionExecutables(root, label) {
  for (const { skillName, file } of companionExecutableFileExpectations) {
    const filePath = path.join(root, "skills", skillName, file);
    const info = await stat(filePath);

    assert.ok(
      (info.mode & 0o111) !== 0,
      `companion skill ${skillName} file ${file} must be executable for ${label}`
    );
  }
}

function expectedDoctorInstallOk(status) {
  const targets = Object.values(status.targets ?? {});
  return status.ok === true
    && status.source?.status === "ok"
    && status.companionManifest?.status === "ok"
    && targets.length > 0
    && targets.every((target) => {
      return target.skill?.status === "installed"
        && target.companionSkills.every((skill) => skill.status === "installed");
    });
}

async function writeFixtureFiles(root) {
  for (const file of fixtureFiles) {
    const fixturePath = path.join(root, file.repo, file.path);
    await mkdir(path.dirname(fixturePath), { recursive: true });
    await writeFile(fixturePath, file.content, "utf8");
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
const originalCompanionFixtureRoot = process.env.BASD_COMPANION_SKILLS_FIXTURE_DIR;

try {
  assert.ok(existsSync(companionManifestPath), "companion skill manifest is missing");

  const companionFixtureRoot = path.join(scratch, "companion-fixtures");
  await writeFixtureFiles(companionFixtureRoot);
  process.env.BASD_COMPANION_SKILLS_FIXTURE_DIR = companionFixtureRoot;

  const help = await run(["help"]);
  assertSuccess(help, "help");
  assert.match(help.stdout, /basd-coding-dispatch init/);
  assert.match(help.stdout, /hermes\s+Native Hermes skill install.*\(default\)/);
  assert.match(help.stdout, /openclaw/);
  assert.match(help.stdout, /--skip-companion-skills/);
  assert.match(help.stdout, /--no-companion-skills/);
  assert.match(help.stdout, /doctor --json/);

  const unknown = await run(["missing-command"]);
  assertFailure(unknown, "unknown command");
  assert.match(unknown.combined, /Unknown command/);
  assert.match(unknown.combined, /basd-coding-dispatch help/);

  const originalHermesHomeForDoctor = process.env.HERMES_HOME;
  const originalOpenClawWorkspaceForDoctor = process.env.OPENCLAW_WORKSPACE;
  const originalPathForDoctor = process.env.PATH;
  try {
    process.env.HERMES_HOME = path.join(scratch, "doctor-hermes-home");
    process.env.OPENCLAW_WORKSPACE = path.join(scratch, "doctor-openclaw-workspace");

    const doctor = await run(["doctor"]);
    assertSuccess(doctor, "doctor");
    assert.match(doctor.stdout, /source: ok/);
    assert.match(doctor.stdout, /companion manifest: ok/);
    assert.match(doctor.stdout, /hermes cli:/);
    assert.match(doctor.stdout, /hermes home:/);
    assert.doesNotMatch(doctor.stdout, /hermes root:/);
    assert.match(doctor.stdout, /hermes companion skills:/);
    assert.match(doctor.stdout, /missing files: skills\/codex\/SKILL\.md/);
    assert.match(doctor.stdout, /openclaw cli:/);
    assert.match(doctor.stdout, /openclaw workspace:/);
    assert.match(doctor.stdout, /openclaw companion skills:/);
    assert.match(doctor.stdout, /Doctor passed/);

    const doctorJson = await run(["doctor", "--json"]);
    assertSuccess(doctorJson, "doctor --json");
    assert.equal(doctorJson.stderr, "");
    const parsedDoctor = JSON.parse(doctorJson.stdout);
    assert.equal(parsedDoctor.ok, true, "doctor --json preserves source/package ok semantics");
    assert.equal(parsedDoctor.source.status, "ok");
    assert.equal(parsedDoctor.companionManifest.status, "ok");
    assert.equal(typeof parsedDoctor.installOk, "boolean", "doctor --json includes installOk");
    assert.equal(
      parsedDoctor.installOk,
      expectedDoctorInstallOk(parsedDoctor),
      "doctor --json installOk reflects source, manifest, native skill, and companion skill install health"
    );
    assert.ok(parsedDoctor.targets.hermes.skill.path, "doctor --json includes Hermes skill path");
    assert.ok(parsedDoctor.targets.openclaw.skill.path, "doctor --json includes OpenClaw skill path");
    assert.ok(
      Array.isArray(parsedDoctor.targets.hermes.companionSkills),
      "doctor --json includes Hermes companion skill statuses"
    );
    assert.ok(
      parsedDoctor.targets.hermes.companionSkills.every((skill) => Array.isArray(skill.missingFiles)),
      "doctor --json includes missing companion file drift status"
    );

    const fakeBin = path.join(scratch, "fake-bin");
    await mkdir(path.join(fakeBin, "hermes"), { recursive: true });
    await mkdir(path.join(fakeBin, "openclaw"), { recursive: true });
    process.env.PATH = fakeBin;

    const weirdDoctor = await run(["doctor"]);
    assertSuccess(weirdDoctor, "doctor handles non-ENOENT spawn errors");
    assert.match(weirdDoctor.stdout, /hermes cli: error \(/);
    assert.doesNotMatch(weirdDoctor.stdout, /hermes cli: present \(/);
    assert.match(weirdDoctor.stdout, /openclaw cli: error \(/);
    assert.doesNotMatch(weirdDoctor.stdout, /openclaw cli: present \(/);
  } finally {
    if (originalHermesHomeForDoctor === undefined) {
      delete process.env.HERMES_HOME;
    } else {
      process.env.HERMES_HOME = originalHermesHomeForDoctor;
    }

    if (originalOpenClawWorkspaceForDoctor === undefined) {
      delete process.env.OPENCLAW_WORKSPACE;
    } else {
      process.env.OPENCLAW_WORKSPACE = originalOpenClawWorkspaceForDoctor;
    }

    if (originalPathForDoctor === undefined) {
      delete process.env.PATH;
    } else {
      process.env.PATH = originalPathForDoctor;
    }
  }

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
    assertInstalledCompanionSkills(
      path.join(fakeHome, ".hermes-from-env"),
      "hermes tilde env"
    );

    const openclawTildeEnv = await run(["init", "--target", "openclaw"]);
    assertSuccess(openclawTildeEnv, "openclaw init expands OPENCLAW_WORKSPACE tilde");
    assert.match(
      openclawTildeEnv.stdout,
      new RegExp(`root: ${escapeRegExp(path.join(fakeHome, "openclaw-from-env"))}`)
    );
    assertInstalledSkill(path.join(fakeHome, "openclaw-from-env"), "openclaw tilde env");
    assertInstalledCompanionSkills(
      path.join(fakeHome, "openclaw-from-env"),
      "openclaw tilde env"
    );

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
    assertInstalledCompanionSkills(
      path.join(fakeHome, "openclaw-from-dir"),
      "openclaw tilde dir"
    );

    const manualTildeDir = await run([
      "init",
      "--target",
      "generic-agent",
      "--dir",
      "~/.generic-agent-target"
    ]);
    assertSuccess(manualTildeDir, "generic-agent init expands --dir tilde");
    assert.match(
      manualTildeDir.stdout,
      new RegExp(`dir: ${escapeRegExp(path.join(fakeHome, ".generic-agent-target"))}`)
    );
    assertInstalledSkill(path.join(fakeHome, ".generic-agent-target"), "generic-agent tilde dir");
    assertMissingCompanionSkills(
      path.join(fakeHome, ".generic-agent-target"),
      "generic-agent tilde dir"
    );
    assert.ok(
      !existsSync(path.join(scratch, "~")),
      "generic-agent tilde dir should not create a literal ./~ directory"
    );
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
    assertInstalledCompanionSkills(
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
    assertInstalledCompanionSkills(
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
    assertInstalledCompanionSkills(
      path.join(subprocessHome, "openclaw-from-dir-subprocess"),
      "subprocess openclaw tilde dir"
    );

    const manualTildeDir = runSubprocess(
      ["init", "--target", "generic-agent", "--dir", "~/.generic-agent-target-subprocess"],
      { env: { ...process.env, HOME: subprocessHome }, cwd: scratch }
    );
    assertSuccess(manualTildeDir, "subprocess generic-agent init expands --dir tilde");
    assert.match(
      manualTildeDir.stdout,
      new RegExp(`dir: ${escapeRegExp(path.join(subprocessHome, ".generic-agent-target-subprocess"))}`)
    );
    assertInstalledSkill(
      path.join(subprocessHome, ".generic-agent-target-subprocess"),
      "subprocess generic-agent tilde dir"
    );
    assertMissingCompanionSkills(
      path.join(subprocessHome, ".generic-agent-target-subprocess"),
      "subprocess generic-agent tilde dir"
    );
    assert.ok(
      !existsSync(path.join(scratch, "~")),
      "subprocess generic-agent tilde dir should not create a literal ./~ directory"
    );
  }

  const hermesHome = path.join(scratch, "hermes-home");
  const hermesInit = await run(["init", "--target", "hermes", "--dir", hermesHome]);
  assertSuccess(hermesInit, "init hermes");
  assert.match(hermesInit.stdout, /target: hermes/);
  assert.match(hermesInit.stdout, /root:/);
  assert.match(hermesInit.stdout, /next: hermes skills list/);
  assertInstalledSkill(hermesHome, "hermes");
  assertInstalledCompanionSkills(hermesHome, "hermes");
  await assertInstalledCompanionExecutables(hermesHome, "hermes");
  assert.ok(
    !existsSync(path.join(hermesHome, "AGENTS.md")),
    "hermes target should install only the native skill directory"
  );

  const hermesSkipHome = path.join(scratch, "hermes-skip-home");
  const hermesSkipInit = await run([
    "init",
    "--target",
    "hermes",
    "--dir",
    hermesSkipHome,
    "--skip-companion-skills"
  ]);
  assertSuccess(hermesSkipInit, "init hermes skips companion skills");
  assert.match(hermesSkipInit.stdout, /companion skills: skipped by flag/);
  assertInstalledSkill(hermesSkipHome, "hermes skip");
  assertMissingCompanionSkills(hermesSkipHome, "hermes skip");

  const openclawNoCompanionWorkspace = path.join(scratch, "openclaw-no-companion");
  const openclawNoCompanionInit = await run([
    "init",
    "--target",
    "openclaw",
    "--dir",
    openclawNoCompanionWorkspace,
    "--no-companion-skills"
  ]);
  assertSuccess(openclawNoCompanionInit, "init openclaw skips companion skills alias");
  assert.match(openclawNoCompanionInit.stdout, /companion skills: skipped by flag/);
  assertInstalledSkill(openclawNoCompanionWorkspace, "openclaw no companion");
  assertMissingCompanionSkills(openclawNoCompanionWorkspace, "openclaw no companion");

  const openclawWorkspace = path.join(scratch, "openclaw-workspace");
  const openclawInit = await run(["init", "--target", "openclaw", "--dir", openclawWorkspace]);
  assertSuccess(openclawInit, "init openclaw");
  assert.match(openclawInit.stdout, /target: openclaw/);
  assert.match(openclawInit.stdout, /next: openclaw skills list/);
  assertInstalledSkill(openclawWorkspace, "openclaw");
  assertInstalledCompanionSkills(openclawWorkspace, "openclaw");
  await assertInstalledCompanionExecutables(openclawWorkspace, "openclaw");

  const existingCompanionRoot = path.join(scratch, "existing-companion");
  const existingCodexPath = path.join(existingCompanionRoot, "skills", "codex", "SKILL.md");
  await mkdir(path.dirname(existingCodexPath), { recursive: true });
  await writeFile(existingCodexPath, "keep me\n", "utf8");

  const existingCompanionInit = await run([
    "init",
    "--target",
    "hermes",
    "--dir",
    existingCompanionRoot
  ]);
  assertSuccess(existingCompanionInit, "init skips existing companion skill");
  assert.match(existingCompanionInit.stdout, /companion skipped:/);
  assert.match(existingCompanionInit.stdout, /codex/);
  assert.equal(await readFile(existingCodexPath, "utf8"), "keep me\n");
  assertInstalledSkill(existingCompanionRoot, "existing companion root");
  for (const [skillName, files] of companionSkillFileExpectations) {
    if (skillName === "codex") {
      continue;
    }

    for (const file of files) {
      assert.ok(
        existsSync(path.join(existingCompanionRoot, "skills", skillName, file)),
        `companion skill ${skillName} file ${file} missing after existing-companion install`
      );
    }
  }

  const partialCompanionRoot = path.join(scratch, "partial-companion");
  const partialPromptPath = path.join(
    partialCompanionRoot,
    "skills",
    "subagent-driven-development",
    "spec-reviewer-prompt.md"
  );
  await mkdir(path.dirname(partialPromptPath), { recursive: true });
  await writeFile(partialPromptPath, "keep partial prompt\n", "utf8");

  const partialCompanionInit = await run([
    "init",
    "--target",
    "hermes",
    "--dir",
    partialCompanionRoot
  ]);
  assertSuccess(partialCompanionInit, "init completes partial companion skill");
  assert.match(partialCompanionInit.stdout, /companion completed:/);
  assert.match(partialCompanionInit.stdout, /subagent-driven-development/);
  assert.equal(await readFile(partialPromptPath, "utf8"), "keep partial prompt\n");
  assertInstalledSkill(partialCompanionRoot, "partial companion root");
  assertInstalledCompanionSkills(partialCompanionRoot, "partial companion root");

  const forceCompanionRoot = path.join(scratch, "force-existing-companion");
  const forceCodexPath = path.join(forceCompanionRoot, "skills", "codex", "SKILL.md");
  await mkdir(path.dirname(forceCodexPath), { recursive: true });
  await writeFile(forceCodexPath, "replace me\n", "utf8");

  const forceCompanionInit = await run([
    "init",
    "--target",
    "hermes",
    "--dir",
    forceCompanionRoot,
    "--force"
  ]);
  assertSuccess(forceCompanionInit, "force init overwrites existing companion skill");
  assert.match(forceCompanionInit.stdout, /companion overwritten:/);
  assert.match(forceCompanionInit.stdout, /codex/);
  assert.notEqual(await readFile(forceCodexPath, "utf8"), "replace me\n");
  assertInstalledSkill(forceCompanionRoot, "force existing companion root");
  assertInstalledCompanionSkills(forceCompanionRoot, "force existing companion root");
  await assertInstalledCompanionExecutables(
    forceCompanionRoot,
    "force existing companion root"
  );

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
    assertInstalledCompanionSkills(hermesEnvHome, "hermes env");

    const openclawEnvWorkspace = path.join(scratch, "openclaw-env-workspace");
    process.env.OPENCLAW_WORKSPACE = openclawEnvWorkspace;
    const openclawEnvInit = await run(["init", "--target", "openclaw"]);
    assertSuccess(openclawEnvInit, "init openclaw from OPENCLAW_WORKSPACE");
    assertInstalledSkill(openclawEnvWorkspace, "openclaw env");
    assertInstalledCompanionSkills(openclawEnvWorkspace, "openclaw env");
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
    assertMissingCompanionSkills(destination, target);
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
  if (originalCompanionFixtureRoot === undefined) {
    delete process.env.BASD_COMPANION_SKILLS_FIXTURE_DIR;
  } else {
    process.env.BASD_COMPANION_SKILLS_FIXTURE_DIR = originalCompanionFixtureRoot;
  }
  await rm(scratch, { recursive: true, force: true });
}
