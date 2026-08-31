# Progress Tracker

**Started:** 2026-08-31
**Current module:** 02 — Reading the stream
**Status:** Module 01 complete

> How to use this: tick boxes as you go. After each module, fill in the **Notes** line —
> especially anything that confused you. Tell me "done with module N" and I'll update
> this file, then build the next module's code with you.

---

## Progress at a glance

```
Part I   — The Agent Loop        [█░░░]  1/4
Part II  — MCP                   [░░░░]  0/4
Part III — Production Concerns   [░░░]   0/3
Part IV  — Capstone              [░]     0/1
                                 ──────────────
                          TOTAL   1/12
```

Legend: `[ ]` not started · `[~]` in progress · `[x]` complete

---

## Part I — The Agent Loop

### [x] Module 01 — Your first agent, and what auth actually is
- [x] `npm install` succeeded
- [x] `npm run check` prints my auth method
- [x] `npm run m01` returns a response from Claude
- [x] I read the message stream, not just the final answer
- [x] **Break it:** set a bad `ANTHROPIC_API_KEY` — and it *didn't* fail. Found out why.
- [x] I can explain where my agent's credentials come from
- [x] Understand `apiKeySource` as the real answer vs. "is a key set?"

**Notes:** The break-it step as originally written doesn't reproduce. Setting
`ANTHROPIC_API_KEY=sk-ant-definitely-not-valid` and running `m01` **succeeds**,
because the CLI only honors env API keys on its approval list
(`customApiKeyResponses` in `~/.claude.json`) and silently falls back to the
subscription login otherwise. Patched `src/00-auth-check.ts` to detect and
report this, and corrected `COURSE.md` + `README.md`.

Real risks, which are *not* the stray-key scare: approval is **sticky** (a key
approved once is used silently forever, including non-interactively), and the
gate is **CLI-only** — `@anthropic-ai/sdk` called directly obeys the env key
with no prompt.

Also noted: 1 turn, ~40 words, **$0.05**. Cost is dominated by the harness
system prompt + tool schemas re-sent every turn, not by prompt length. On
subscription auth `total_cost_usd` is the API-equivalent, drawn against usage
limits rather than billed.

Confusing bits: `authMethod: "api_key"` reads alarming even when
`apiKeySource: "/login managed key"` means subscription. Two fields, and the
*source* is the one to trust.

---

### [ ] Module 02 — Reading the stream: message types and options
- [ ] Built the pretty-printing logger
- [ ] Identified `system` / `assistant` / `user` / `result` messages in real output
- [ ] Found a `tool_use` block and its matching `tool_result`
- [ ] Compared two models' cost + turn count on one prompt
- [ ] Understand `systemPrompt` replace-vs-append
- [ ] Understand what `settingSources: []` isolates me from
- [ ] **Break it:** `maxTurns: 1` on a multi-step task

**Notes:**

---

### [ ] Module 03 — Built-in tools and the permission system
- [ ] Ran an agent with `Read`/`Glob`/`Grep` only
- [ ] Understand why granting `Bash` grants nearly everything
- [ ] Used `allowedTools` as an allowlist
- [ ] Tried each `permissionMode` and can describe the differences
- [ ] Scribe produced `sandbox/INDEX.md`
- [ ] **Break it:** asked for a write with `Write` disallowed

**Notes:**

---

### [ ] Module 04 — Tools you wrote: `tool()` and `createSdkMcpServer()`
- [ ] Built `word_count` (pure)
- [ ] Built `save_note` (writes files + validates paths)
- [ ] Built `fetch_definition` (real network call + error handling)
- [ ] Understand the `mcp__server__tool` naming rule
- [ ] **Break it:** vague description → model stopped calling the tool
- [ ] **Break it:** path-traversal attempt was blocked
- [ ] I can debug "why isn't my tool being called?"

**Notes:**

---

## Part II — MCP

### [ ] Module 05 — What MCP actually is
- [ ] Can explain the N×M → N+M problem
- [ ] Can name the three primitives **and who controls each**
- [ ] Can describe `stdio` vs `http` vs `sdk` transports and when to use each
- [ ] Read real JSON-RPC `initialize` + `tools/list` traffic by hand
- [ ] Can state the MCP threat model, including prompt injection via tool results
- [ ] Could explain MCP to a colleague in 2 minutes

**Notes:**

---

### [ ] Module 06 — Consuming third-party MCP servers
- [ ] Connected `server-filesystem` over stdio, scoped to `sandbox/`
- [ ] Connected an HTTP server
- [ ] Listed tools at runtime instead of guessing names
- [ ] Kept all tokens in gitignored `.env`
- [ ] Diagnosed at least one connection failure on purpose
- [ ] Understand the per-turn context cost of connected servers
- [ ] **Break it:** server scoping refused an out-of-scope read

**Notes:**

---

### [ ] Module 07 — Build your own MCP server
- [ ] `scribe-notes` server runs standalone
- [ ] Implemented **tools**
- [ ] Implemented **resources**
- [ ] Implemented **prompts**
- [ ] Tested with MCP Inspector before connecting an agent
- [ ] Validate all input at the server boundary
- [ ] **Break it:** `console.log` corrupted the stream; `console.error` fixed it
- [ ] Connected it to Scribe

**Notes:**

---

### [ ] Module 08 — One server, many clients
- [ ] Registered `scribe-notes` in `.mcp.json`
- [ ] Verified with `/mcp` inside Claude Code
- [ ] Used my own tool from this chat window
- [ ] Understand `local` vs `project` vs `user` scope precedence
- [ ] `.mcp.json` uses env-var references, no literal secrets
- [ ] Wrote one skill and can say how it differs from an MCP server

**Notes:**

---

## Part III — Production Concerns

### [ ] Module 09 — Permissions, hooks, and audit
- [ ] Implemented a `canUseTool` policy
- [ ] Modified a tool's input from the callback (not just allow/deny)
- [ ] Implemented at least one hook
- [ ] Can explain `canUseTool` vs hooks
- [ ] Audit log writing to `sandbox/audit.jsonl`
- [ ] **Break it:** tried to prompt my way past my own policy and failed

**Notes:**

---

### [ ] Module 10 — Subagents and skills
- [ ] Defined `researcher` and `summarizer` subagents
- [ ] Assigned a cheap model to the read-heavy agent
- [ ] Measured delegating vs monolithic: tokens, wall-clock, quality
- [ ] Can name a case where a subagent is the *wrong* call

**Notes:**

---

### [ ] Module 11 — Sessions, resumption, and cost control
- [ ] Resumed a session by ID
- [ ] Used `listSessions` / `getSessionMessages`
- [ ] Forked a session
- [ ] Built the interactive REPL with streaming input
- [ ] `maxBudgetUsd` stopped a run
- [ ] Print running cost during development

**Notes:**

---

## Part IV — Capstone

### [ ] Module 12 — Ship something of your own
**Project idea:** _(fill this in)_

- [ ] At least one custom tool I designed
- [ ] At least one MCP server (mine, or one I evaluated and chose)
- [ ] Permission policy + audit log
- [ ] Cost ceiling
- [ ] README a stranger could follow
- [ ] `git log -p | grep -i` finds no secrets
- [ ] It's actually useful to me

**Notes:**

---

## Running log

| Date | Module | What I did | What confused me |
|---|---|---|---|
| 2026-08-31 | — | Repo scaffolded, course planned | — |
| 2026-08-31 | 01 | Auth check + first agent ran. Break-it step didn't break — traced it to the CLI's API-key approval gate. Patched the course docs to match reality. | `authMethod: "api_key"` vs `apiKeySource: "/login managed key"` — which field actually tells you who's paying |

---

## Open questions for Claude

_Drop questions here as they come up and I'll work through them with you._

-
