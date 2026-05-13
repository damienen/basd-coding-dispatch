export const expectedSuperpowersCompanionSourceFiles = {
  "using-superpowers": [
    "skills/using-superpowers/SKILL.md",
    "skills/using-superpowers/references/codex-tools.md",
    "skills/using-superpowers/references/copilot-tools.md",
    "skills/using-superpowers/references/gemini-tools.md"
  ],
  "brainstorming": [
    "skills/brainstorming/SKILL.md",
    "skills/brainstorming/scripts/frame-template.html",
    "skills/brainstorming/scripts/helper.js",
    "skills/brainstorming/scripts/server.cjs",
    "skills/brainstorming/scripts/start-server.sh",
    "skills/brainstorming/scripts/stop-server.sh",
    "skills/brainstorming/spec-document-reviewer-prompt.md",
    "skills/brainstorming/visual-companion.md"
  ],
  "using-git-worktrees": [
    "skills/using-git-worktrees/SKILL.md"
  ],
  "writing-plans": [
    "skills/writing-plans/SKILL.md",
    "skills/writing-plans/plan-document-reviewer-prompt.md"
  ],
  "executing-plans": [
    "skills/executing-plans/SKILL.md"
  ],
  "subagent-driven-development": [
    "skills/subagent-driven-development/SKILL.md",
    "skills/subagent-driven-development/code-quality-reviewer-prompt.md",
    "skills/subagent-driven-development/implementer-prompt.md",
    "skills/subagent-driven-development/spec-reviewer-prompt.md"
  ],
  "dispatching-parallel-agents": [
    "skills/dispatching-parallel-agents/SKILL.md"
  ],
  "test-driven-development": [
    "skills/test-driven-development/SKILL.md",
    "skills/test-driven-development/testing-anti-patterns.md"
  ],
  "systematic-debugging": [
    "skills/systematic-debugging/CREATION-LOG.md",
    "skills/systematic-debugging/SKILL.md",
    "skills/systematic-debugging/condition-based-waiting-example.ts",
    "skills/systematic-debugging/condition-based-waiting.md",
    "skills/systematic-debugging/defense-in-depth.md",
    "skills/systematic-debugging/find-polluter.sh",
    "skills/systematic-debugging/root-cause-tracing.md",
    "skills/systematic-debugging/test-academic.md",
    "skills/systematic-debugging/test-pressure-1.md",
    "skills/systematic-debugging/test-pressure-2.md",
    "skills/systematic-debugging/test-pressure-3.md"
  ],
  "requesting-code-review": [
    "skills/requesting-code-review/SKILL.md",
    "skills/requesting-code-review/code-reviewer.md"
  ],
  "receiving-code-review": [
    "skills/receiving-code-review/SKILL.md"
  ],
  "verification-before-completion": [
    "skills/verification-before-completion/SKILL.md"
  ],
  "finishing-a-development-branch": [
    "skills/finishing-a-development-branch/SKILL.md"
  ],
  "writing-skills": [
    "skills/writing-skills/SKILL.md",
    "skills/writing-skills/anthropic-best-practices.md",
    "skills/writing-skills/examples/CLAUDE_MD_TESTING.md",
    "skills/writing-skills/graphviz-conventions.dot",
    "skills/writing-skills/persuasion-principles.md",
    "skills/writing-skills/render-graphs.js",
    "skills/writing-skills/testing-skills-with-subagents.md"
  ]
};

export const expectedSuperpowersCompanionSkills = Object.keys(
  expectedSuperpowersCompanionSourceFiles
);

export const expectedSuperpowersExecutableSourceFiles = [
  "skills/brainstorming/scripts/start-server.sh",
  "skills/brainstorming/scripts/stop-server.sh",
  "skills/systematic-debugging/find-polluter.sh",
  "skills/writing-skills/render-graphs.js"
];

export function expectedDestinationPathForSuperpowersSource(skillName, sourcePath) {
  const prefix = `skills/${skillName}/`;

  if (!sourcePath.startsWith(prefix)) {
    throw new Error(`${sourcePath} does not live under ${prefix}`);
  }

  return sourcePath.slice(prefix.length);
}
