#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  expectedDestinationPathForSuperpowersSource,
  expectedSuperpowersExecutableSourceFiles,
  expectedSuperpowersCompanionSkills,
  expectedSuperpowersCompanionSourceFiles
} from "./companion-support-files.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(repoRoot, relativePath), "utf8");
}

function assertIncludes(content, needle, label) {
  assert.ok(
    content.includes(needle),
    `${label} must include: ${needle}`
  );
}

function assertMatches(content, pattern, label) {
  assert.match(content, pattern, `${label} must match ${pattern}`);
}

function assertNotMatches(content, pattern, label) {
  assert.doesNotMatch(content, pattern, `${label} must not match ${pattern}`);
}

const qualityProfiles = await read("references/quality-profiles.md");
const qualityGates = await read("references/quality-gates.md");
const reviewPackets = await read("references/review-packets.md");
const reviewOrchestration = await read("references/review-orchestration.md");
const superpowersIntegration = await read("references/superpowers-integration.md");
const planLinter = await read("references/plan-linter.md");
const promptTemplates = await read("references/prompt-templates.md");
const sessionTopology = await read("references/session-topology.md");
const companionManifest = JSON.parse(await read("integrations/companion-skills.json"));

const companionSkillsByName = new Map(
  (companionManifest.skills ?? []).map((skill) => [skill.name, skill])
);

assertMatches(
  qualityProfiles,
  /tiny-fix[\s\S]*lightweight independent review/i,
  "tiny fix profile"
);
assertMatches(
  qualityGates,
  /ambiguous[\s\S]*spec gate[\s\S]*implementation-plan/i,
  "ambiguous feature workflow"
);
assertMatches(
  qualityGates,
  /Brainstorming Gate[\s\S]*before[\s\S]*Implementation-Plan Gate[\s\S]*(broad|ambiguous|user-facing)/i,
  "Brainstorming Gate before implementation planning"
);
assertMatches(
  qualityGates,
  /micro-brainstorm[\s\S]*(tiny-fix|tiny fix|low-risk)/i,
  "tiny-fix brainstorming exception"
);
assertMatches(
  qualityGates,
  /implementation-plan gate[\s\S]*before feature code/i,
  "feature implementation-plan workflow"
);
assertIncludes(
  reviewPackets,
  "Untracked files",
  "review packet builder"
);
assertMatches(
  superpowersIntegration,
  /Superpowers evidence[\s\S]*compensation/i,
  "Superpowers evidence contract"
);
for (const skillName of expectedSuperpowersCompanionSkills) {
  assertIncludes(
    superpowersIntegration,
    skillName,
    `Superpowers phase map names ${skillName}`
  );
}
assertIncludes(
  superpowersIntegration,
  "f2cbfbefebbfef77321e4c9abc9e949826bea9d7",
  "Superpowers phase map baseline commit"
);
for (const [skillName, sourcePaths] of Object.entries(expectedSuperpowersCompanionSourceFiles)) {
  const skill = companionSkillsByName.get(skillName);
  assert.ok(skill, `companion manifest must include ${skillName}`);
  const filesBySourcePath = new Map((skill.files ?? []).map((file) => [file.sourcePath, file]));

  for (const sourcePath of sourcePaths) {
    const expectedDestinationPath = expectedDestinationPathForSuperpowersSource(
      skillName,
      sourcePath
    );
    const file = filesBySourcePath.get(sourcePath);

    assert.ok(
      file,
      `companion manifest must include ${sourcePath}`
    );
    assert.equal(
      file.destinationPath,
      expectedDestinationPath,
      `${sourcePath} destination must remain relative to ${skillName}`
    );
  }
}
for (const sourcePath of expectedSuperpowersExecutableSourceFiles) {
  const skillName = sourcePath.split("/")[1];
  const skill = companionSkillsByName.get(skillName);
  const file = (skill?.files ?? []).find((candidate) => candidate.sourcePath === sourcePath);

  assert.equal(
    file?.mode,
    "755",
    `${sourcePath} must declare executable mode`
  );
}
assertMatches(
  reviewOrchestration,
  /markdown\/YAML[\s\S]*not brittle JSON/i,
  "reviewer output format"
);
assertIncludes(
  reviewOrchestration,
  "```yaml",
  "reviewer output example fence"
);
assertNotMatches(
  reviewOrchestration,
  /must\s+return\s+strict\s+JSON|strict\s+JSON\s+only|JSON-only\s+reviewer\s+output/i,
  "reviewer output must remain markdown/YAML, not strict JSON"
);
assertMatches(
  reviewOrchestration,
  /bonus[\s\S]*backlog|backlog[\s\S]*bonus/i,
  "bonus finding triage"
);
assertMatches(
  reviewOrchestration,
  /receiving-code-review[\s\S]*(read|restate)[\s\S]*verify[\s\S]*evaluate[\s\S]*disposition/i,
  "review intake gate"
);
assertMatches(
  qualityProfiles,
  /auto-escalate|auto-escalation/i,
  "quality profile escalation"
);
assertMatches(
  qualityProfiles,
  /tiny-fix[\s\S]*micro-brainstorm[\s\S]*(ambiguity|ambiguous|unclear)/i,
  "tiny-fix micro-brainstorm policy"
);
assertMatches(
  qualityGates,
  /A2[\s\S]*(excluded|not part of v0\.1|not required)/i,
  "A2 gate-ledger exclusion"
);
assertNotMatches(
  qualityGates,
  /^(?!.*(?:not required|excluded|not part of v0\.1)).*(?:run manifest|gate ledger).*(?:required|mandatory|default)/im,
  "run manifest and gate ledger must not become generic requirements"
);
assertNotMatches(
  qualityProfiles,
  /every run[\s\S]*edge-case pack|exhaustive edge-case pack/i,
  "edge-case packs must not become exhaustive for every run"
);
assertNotMatches(
  superpowersIntegration,
  /prompt(?:ing)? alone\s+(?:is|counts as)[\s\S]*(proof|evidence)|naming a skill\s+(?:is|counts as)[\s\S]*(proof|evidence)/i,
  "Superpowers prompting alone must not count as proof"
);
assertIncludes(
  planLinter,
  "expected RED failures",
  "plan-lint checklist TDD planning"
);
assertMatches(
  planLinter,
  /brainstorming artifact[\s\S]*reason (?:it )?was not required/i,
  "plan-lint brainstorming artifact"
);
assertMatches(
  planLinter,
  /TDD applicability/i,
  "plan-lint TDD applicability"
);
assertMatches(
  qualityGates,
  /Debugging Gate[\s\S]*systematic debugging[\s\S]*(root cause|root-cause)[\s\S]*(original symptom|relevant regressions)/i,
  "systematic debugging gate"
);
assertMatches(
  promptTemplates,
  /Systematic Debugging Gate[\s\S]*symptom[\s\S]*(reproduction|failing check)[\s\S]*(root cause|root-cause)[\s\S]*verification commands/i,
  "systematic debugging prompt"
);
assertMatches(
  planLinter,
  /human[\s\S]*checklist[\s\S]*not an executable(?: or automated)? linter|checklist[\s\S]*not an automated linter/i,
  "plan-linter naming clarity"
);
assertMatches(
  sessionTopology,
  /executing-plans[\s\S]*1-2 tasks/i,
  "executing-plans topology"
);
assertMatches(
  sessionTopology,
  /subagent-driven-development[\s\S]*3\+ tasks/i,
  "subagent-driven-development topology"
);
assertMatches(
  sessionTopology,
  /dispatching-parallel-agents[\s\S]*independent domains/i,
  "dispatching-parallel-agents topology"
);
assertIncludes(
  promptTemplates,
  "Superpowers Activation Map",
  "workflow prompt templates"
);
assertMatches(
  promptTemplates,
  /Branch Closeout[\s\S]*finishing-a-development-branch|finishing-a-development-branch[\s\S]*Branch Closeout/i,
  "branch closeout prompt"
);
assertIncludes(
  promptTemplates,
  "Final verification report",
  "workflow prompt templates"
);
assertMatches(
  `${qualityGates}\n${qualityProfiles}\n${promptTemplates}`,
  /finishing-a-development-branch|closeout option|branch closeout/i,
  "branch closeout references"
);
assertNotMatches(
  `${qualityGates}\n${qualityProfiles}\n${superpowersIntegration}\n${promptTemplates}`,
  /mandatory full brainstorming for every tiny fix|every tiny fix must run full brainstorming|full brainstorming(?: ceremony)? for every tiny fix/i,
  "tiny fixes must not require full brainstorming"
);

console.log("Workflow evals passed");
