---
name: pr-review
description: >-
  Reviews a GitHub pull request for this React/Vite frontend (correctness,
  security, UI behavior, data fetching, accessibility, tests, and build safety)
  and, only after explicit user confirmation, posts inline diff comments and
  submits a GitHub PR review. Use when the user names this skill or asks to
  review a GitHub PR, PR URL/number, or gh pr review.
---

# HCF Painel PR Review

Explicit invoke only. GitHub PRs only. Non-mutating until Phase 6.

Do not checkout, push, merge, `gh pr comment`, or fix code. Do not use `Task` or
spawn subagents. Do not run the full test suite as part of review; inspect CI
and use focused read-only checks only when needed. `gh pr review` is Phase 6
only, after Yes.

Domain and frontend details: [CHECKLIST.md](CHECKLIST.md).

## Inputs and evidence

- PR URL or number (`#42`, `42`), or the PR for the current branch (`gh pr view`).
- Optional path filter: review only those files.
- If no PR resolves, ask for a number/URL. Do not review a local dirty tree.

Resolve the repository with `gh repo view --json nameWithOwner`, then load:

```bash
gh pr view <n> --json number,title,body,author,baseRefName,headRefName,headRefOid,isDraft,labels,url,files
gh pr checks <n>
gh api "repos/{owner}/{repo}/pulls/{n}/comments"
gh pr diff <n>
```

The PR patch is canonical. Read every in-scope changed file from disk. If local
HEAD differs from `headRefOid`, warn once and cite local lines only when the
content matches the patch. Never checkout or switch branches. An empty diff
ends the review with `No changes detected to review.`

Match the PR language (title wins when mixed). Skip duplicate findings already
raised on the same path/line.

## Review lenses

Select only lenses matching the changed paths:

| Lens | Paths |
| --- | --- |
| Features / UI | `src/features`, `src/components`, `src/pages`, `src/layouts` |
| Data fetching / HTTP | `src/hooks`, `src/services`, `src/libraries/http`, `src/config` |
| Auth / session | `src/contexts/Auth`, `src/libraries/auth`, `src/libraries/session`, `src/stores` |
| Routing | `src/libraries/router`, route configuration, pages |
| Tests | `test/`, `*.test.*`, `*.spec.*` |
| Build / infra | `vite.config.ts`, `tsconfig.json`, `.github/workflows`, `Dockerfile`, package files |
| Herbarium domain | `src/features/expedicoes`, `solos`, `usuarios`, `vegetacoes`, `tombos`, `src/resources` |

Read `.cursor/rules/data-fetching.mdc` whenever the diff touches its globs or
changes a query/fetcher. No API hexagonal rules apply here; do not copy or
invent the API project's domain-layer findings.

## Blocker bar

Block only what the diff introduces or clearly worsens: broken user-visible
behavior, security/privacy exposure, data loss, broken API/session contracts,
accessibility regressions that prevent use, or CI/build failures. Suggestions
cover optional hardening, low-risk missing tests, pre-existing issues, and
hypotheticals. Same root cause gets one finding. Do not nit formatting or
lint-only issues when CI already owns them.

CI failure on the PR head is a blocker unless the user says to ignore CI.

Verdict: `REQUEST CHANGES` for any blocker; otherwise `COMMENT` for suggestions;
otherwise `APPROVE`.

For findings about a concrete code shape, include a short desired-shape fenced
snippet (about 5–15 lines) in both the report and inline comment. Do not paste
large existing files.

## Chat report, then stop

Emit exactly this structure, translating headings to Portuguese when the PR is
Portuguese:

```markdown
# PR review: #<number> — <title>

**Verdict:** REQUEST CHANGES | COMMENT | APPROVE
**CI:** <summary>
**Scope:** <n> files; lenses: <list>
**HEAD match:** ok | diverged (warn)

## Summary
<2–4 sentences>

## Blockers
- <issue> — `path:line`
  Why: <evidence>

## Suggestions
- <issue> — `path:line`
  Why: <rationale>
```

Empty sections say `None.` Do not add a Notes section. Then list postable and
non-postable findings and ask: “post these N inline comments and submit the
GitHub review (...)? Yes / No / Edit first.” Do not post in this phase.

## Phase 6 — confirmed GitHub writes

After Yes, post each postable finding to the PR's `headRefOid` using the PR
comments API, with `path`, `line`, and `side=RIGHT`. Use `start_line` for a
multi-line hunk. A 422 line is not in the diff: skip it and report that fact.
Then submit exactly one review with no summary body, mapping the verdict to
`--request-changes`, `--comment`, or `--approve`. Never use `gh pr comment` or
`gh pr merge`; if the user says no, make no GitHub writes.

Do not deploy, run Ansible, write production data, or leave the repository
modified.
