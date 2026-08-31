# Progress Tracker

**Started:** 2026-08-31
**Current module:** 01 — Your first agent
**Status:** scaffold ready, Module 01 buildable

> How to use this: tick boxes as you go. After each module, fill in the **Notes** line —
> especially anything that confused you. Tell me "done with module N" and I'll update
> this file, then build the next module's code with you.

---

## Progress at a glance

```
Part I   — The Agent Loop        [░░░░]  0/4
Part II  — MCP                   [░░░░]  0/4
Part III — Production Concerns   [░░░]   0/3
Part IV  — Capstone              [░]     0/1
                                 ──────────────
                          TOTAL   0/12
```

Legend: `[ ]` not started · `[~]` in progress · `[x]` complete

---

## Part I — The Agent Loop

### [ ] Module 01 — Your first agent, and what auth actually is
- [ ] `npm install` succeeded
- [ ] `npm run check` prints my auth method
- [ ] `npm run m01` returns a response from Claude
- [ ] I read the message stream, not just the final answer
- [ ] **Break it:** set a bad `ANTHROPIC_API_KEY`, watched it fail, then unset it
- [ ] I can explain where my agent's credentials come from

**Notes:**

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

---

## Open questions for Claude

_Drop questions here as they come up and I'll work through them with you._

-
