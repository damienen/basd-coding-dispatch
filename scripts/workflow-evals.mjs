#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  qualityProfiles,
  /auto-escalate|auto-escalation/i,
  "quality profile escalation"
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
  /human[\s\S]*checklist[\s\S]*not an executable(?: or automated)? linter|checklist[\s\S]*not an automated linter/i,
  "plan-linter naming clarity"
);
assertIncludes(
  promptTemplates,
  "Final verification report",
  "workflow prompt templates"
);

console.log("Workflow evals passed");
