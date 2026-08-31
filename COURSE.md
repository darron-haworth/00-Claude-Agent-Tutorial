# Claude Agent SDK + MCP: A Course From Zero

**Audience:** you know how to program, but you've never built an agent and don't yet know what MCP is.
**Language:** TypeScript (Node 20+).
**Auth:** your existing Claude subscription login — no API key needed.
**Time:** ~14–20 hours of hands-on work across 12 modules. Most modules are one sitting.

Track your progress in [PROGRESS.md](PROGRESS.md). Read [README.md](README.md) first if you haven't.

---

## The two ideas this course is really about

Almost everything here reduces to two concepts. Everything else is detail.

**1. An agent is a loop, not a prompt.**
A normal LLM call is: text in, text out. An agent is: text in → model decides to *use a tool* → your code runs that tool → the result goes back to the model → repeat until the model says "done." That loop is the whole idea. The Agent SDK writes the loop for you so you only write tools and prompts.

**2. MCP is a *plug shape* for tools.**
Before MCP, every AI app invented its own way to describe tools, so a "read Postgres" integration written for one app was useless in another. **MCP (Model Context Protocol)** is an open standard that says: a *server* exposes tools/resources/prompts over a defined protocol, and any *client* that speaks MCP can use them. It's USB-C for AI tooling. Write a server once → it works in the Agent SDK, in Claude Code, in Claude Desktop, in other vendors' apps.

The rest is learning where the seams are and what can go wrong.

---

## The through-line project: **Scribe**

Rather than 12 disconnected demos, you build **one agent that grows every module** — a research-and-notes agent called Scribe. By the end it can read your files, look things up, write notes, use tools you invented, delegate to sub-agents, and run under a budget.

```
M01  Scribe says hello                      →  the agent loop
M02  Scribe streams, and you can see it think →  message types, options
M03  Scribe reads and writes real files      →  built-in tools, permissions
M04  Scribe gets tools you wrote             →  custom in-process tools
M05  (concepts) What MCP actually is         →  protocol, transports, primitives
M06  Scribe uses other people's MCP servers  →  consuming stdio + HTTP servers
M07  You build an MCP server from scratch    →  the other side of the protocol
M08  Your server plugs into Claude Code too  →  .mcp.json, one server / many clients
M09  Scribe asks permission, and you audit it →  canUseTool, hooks
M10  Scribe delegates to specialists         →  subagents, skills
M11  Scribe remembers, and costs a known $   →  sessions, resume, budget
M12  Capstone: ship your own agent           →  put it all together
```

Each module has: **Concepts → Build → Break it → Checkpoint**. The "Break it" step matters most — you learn the boundaries by crossing them on purpose.

---

# Part I — The Agent Loop (Modules 01–04)

Goal: by the end of Part I you can build a working agent with custom tools, and you understand what the SDK is doing on your behalf.

## Module 01 — Your first agent, and what auth actually is
**Files:** `src/00-auth-check.ts`, `src/01-hello-agent.ts`

**Concepts**
- What the Agent SDK *is*: Claude Code packaged as a library. It ships a full harness — agent loop, context management, built-in tools (Read/Write/Edit/Bash/Glob/Grep/WebSearch), permissions, sessions.
- **How it runs:** the SDK spawns the `claude` CLI as a subprocess and talks to it. This surprises people. It's why the CLI must be installed, and why the SDK inherits your CLI login for free.
- **Auth precedence** — the trap that costs people money: if `ANTHROPIC_API_KEY` is set, it **wins** over your subscription login and you get billed per token. An empty `.env` is a feature, not an omission.
- `query()` returns an async generator. You consume it with `for await`.

**Build**
- Run `npm run check` → prints your resolved auth method and proves credentials work.
- Run `npm run m01` → a one-shot prompt, printing only the final result.

**Break it**
- Set `ANTHROPIC_API_KEY=sk-ant-invalid` in `.env` and re-run. Watch a working setup fail. Understand *why* before you unset it.

**Checkpoint:** you can explain, without looking, where your agent's credentials come from and what would override them.

---

## Module 02 — Reading the stream: message types and options
**Files:** `src/02-message-types.ts`, `src/03-options.ts`

**Concepts**
- The message stream is the agent's *thought process made inspectable*. You'll see `system` (init), `assistant` (text + tool_use blocks), `user` (tool_result blocks), and `result` (final, with cost/duration/usage).
- Tool use is a **structured block in an assistant message**, not text. That distinction is the whole protocol.
- Key `Options`:
  - `model` — `'sonnet'` / `'opus'` / `'haiku'` aliases, or a full ID
  - `systemPrompt` — a string *replaces* the default harness prompt; `{ type: 'preset', preset: 'claude_code', append: '...' }` *extends* it. Replacing it silently drops a lot of built-in competence.
  - `maxTurns` — a hard stop on loop iterations. Your seatbelt against runaway agents.
  - `settingSources` — controls whether `~/.claude/settings.json`, `.claude/settings.json`, and `CLAUDE.md` get loaded. **Defaults to loading all of them.** Pass `[]` for a hermetic agent whose behavior doesn't change based on whose machine it runs on.
  - `cwd` — the agent's working directory.

**Build**
- A logger that pretty-prints every message type with a legend. You'll reuse this all course; it's your debugger.
- The same prompt run three ways: cheap model, expensive model, custom system prompt. Compare cost and turn count from the `result` message.

**Break it**
- Set `maxTurns: 1` on a task that needs three tool calls. See a truncated result and learn what a `maxTurns` stop looks like in the stream.

**Checkpoint:** given a raw message dump, you can point at where the model decided to use a tool and where the result came back.

---

## Module 03 — Built-in tools and the permission system
**Files:** `src/04-builtin-tools.ts`

**Concepts**
- The built-in toolset, and the judgment call each represents: `Read`, `Write`, `Edit`, `Glob`, `Grep`, `Bash`, `WebFetch`, `WebSearch`, `Task`.
- **`Bash` is a superset of most tools.** Granting it effectively grants everything. Prefer narrow tools; this is a real security principle, not a style preference.
- `allowedTools` / `disallowedTools` — allowlist beats denylist.
- `permissionMode`: `'default'` | `'acceptEdits'` | `'plan'` | `'dontAsk'` | `'bypassPermissions'` | `'auto'`.
- **`bypassPermissions` requires you to also pass a confirmation flag**, on purpose. Friction as a safety feature. Never use it against a directory you care about.
- Why we point the agent at a gitignored `sandbox/` directory: an agent with `Write` is an agent that can overwrite your work.

**Build**
- Scribe indexes `sandbox/`: `Glob` to find files, `Read` to inspect, `Write` to produce `sandbox/INDEX.md`. Read-only first, then grant `Write`.

**Break it**
- Ask it to write outside `sandbox/` with `Write` disallowed. Watch it try, get refused, and reason about the refusal.

**Checkpoint:** you can configure an agent that can read your repo but provably cannot modify it.

---

## Module 04 — Tools you wrote: `tool()` and `createSdkMcpServer()`
**Files:** `src/05-custom-tools.ts`

**Concepts**
- `tool(name, description, zodSchema, handler)` defines a tool. `createSdkMcpServer({ name, tools })` bundles tools into an **in-process MCP server** — no subprocess, no network. This is your first MCP server, and you build it before learning the protocol on purpose: the API is easy, so the concept lands without protocol overhead.
- Tools get namespaced: `mcp__<server>__<tool>`. You must use that full name in `allowedTools`.
- **The description is prompt engineering, not documentation.** The model chooses tools based on the description and schema alone. A vague description is a bug — and it's the single most common reason a custom tool "doesn't get called."
- Zod schema → JSON Schema → the model's view of your tool. `.describe()` on each field is how you disambiguate arguments.
- Handlers return MCP content: `{ content: [{ type: 'text', text: '...' }] }`.
- Errors: return an error *result* the model can read and recover from, rather than throwing.

**Build**
- Three tools of escalating interest:
  1. `word_count` — pure, deterministic, easy to verify.
  2. `save_note` — writes to `sandbox/notes/`, with path-traversal validation. Your first *dangerous* tool.
  3. `fetch_definition` — hits a real public API (dictionary), so you handle latency and failure.

**Break it**
- Rewrite `word_count`'s description as `"does stuff"` and re-run. The model stops using it. This is the lesson.
- Call `save_note` with `../../etc/passwd` and confirm your validation holds.

**Checkpoint:** you can add a custom tool to any agent, and you can debug "why isn't my tool being called?"

---

# Part II — MCP (Modules 05–08)

Goal: by the end of Part II, MCP is not magic. You can consume any server and write your own.

## Module 05 — What MCP actually is (concepts, minimal code)
**File:** `lessons/05-mcp-explained.md`

**Concepts**
- **The problem it solves.** N apps × M integrations = N×M bespoke adapters. MCP makes it N+M.
- **Architecture:** Host (the app) → Client (one per server) → Server (exposes capabilities). JSON-RPC 2.0 underneath.
- **Three primitives** — and who is in control of each, which is the part people miss:
  | Primitive | Controlled by | Example |
  |---|---|---|
  | **Tools** | the *model* decides to call | `create_issue`, `run_query` |
  | **Resources** | the *app/user* supplies as context | a file, a DB schema |
  | **Prompts** | the *user* invokes | a slash-command template |
  Most tutorials only cover tools. Knowing all three tells you which one your problem actually needs.
- **Transports:**
  - `stdio` — server is a local subprocess over stdin/stdout. Fast, no network, no auth. Default for local tools.
  - `http` — remote server over HTTP. Needs auth; can be shared across users.
  - `sdk` — in-process (what you built in M04). Fastest, TypeScript-only, no isolation.
- **The lifecycle:** `initialize` → capability negotiation → `tools/list` → `tools/call`.
- **Threat model, stated plainly.** An MCP server is code you're running and trusting with your data. Prompt injection through tool *results* is a live attack: a server can return text designed to steer your agent. Audit before you install; prefer pinned versions; be deliberate about tokens you hand over.

**Build**
- Read the raw JSON-RPC. Run a real server by hand, pipe `initialize` and `tools/list` in, and look at the actual bytes. Twenty minutes here saves hours of confusion later.

**Checkpoint:** you can explain MCP to a colleague in two minutes, including when *not* to reach for it.

---

## Module 06 — Consuming third-party MCP servers
**Files:** `src/06-external-mcp.ts`, `.mcp.json`

**Concepts**
- Configuring `mcpServers` in `Options`, and the three config shapes (`stdio` / `http` / `sdk`).
- Secrets in config: `env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN }` — the token lives in gitignored `.env`, never in committed JSON.
- **Tool-name discovery.** You often don't know the tool names until you connect. You'll list them at runtime instead of guessing.
- Failure modes you *will* hit: server not installed, wrong args, auth failure, server starts but exposes nothing. MCP startup is non-blocking, so a broken server looks like "my tools vanished" rather than a crash.
- **Context cost.** Every tool definition consumes context on every turn. Twenty servers connected "just in case" degrades the agent and raises cost. Connect what the task needs.

**Build**
- Connect `@modelcontextprotocol/server-filesystem` over stdio, scoped to `sandbox/`. Have Scribe use it instead of built-in `Read`, and compare.
- Connect one HTTP server for contrast.
- Print `tools/list` for each so you see the real surface.

**Break it**
- Point a filesystem server at `sandbox/` and ask Scribe to read `~/.ssh/id_rsa`. Watch the server's own scoping refuse it. Defense in depth: the server enforces, not just the prompt.

**Checkpoint:** given any MCP server's README, you can wire it in and verify its tools loaded.

---

## Module 07 — Build your own MCP server
**Files:** `mcp-servers/scribe-server/`

**Concepts**
- Standalone server with `@modelcontextprotocol/sdk` + `StdioServerTransport` — a real process, not in-process. Compare directly against M04's `sdk` transport: same tools, different boundary.
- Implementing all three primitives, not just tools:
  - **tools** — the actions
  - **resources** — expose your notes as readable context via URIs
  - **prompts** — a reusable "summarize my notes" template
- **`stdout` is the protocol channel.** A stray `console.log` corrupts the JSON-RPC stream and breaks your server in a way that looks like nonsense. Log to `stderr`. This bites everyone once.
- Input validation at the boundary — the server is a security boundary, and its caller is a language model.
- Testing without an agent in the loop: MCP Inspector, and hand-piped JSON-RPC.

**Build**
- A `scribe-notes` server: `search_notes`, `add_note`, `list_tags`; notes exposed as resources; one prompt template.
- Test it standalone with the Inspector, *then* connect it to Scribe.

**Break it**
- Add a `console.log` to the handler. Watch it break. Move it to `console.error`. Watch it work. You will never forget this.

**Checkpoint:** you can write, test, and debug an MCP server without an agent involved.

---

## Module 08 — One server, many clients
**Files:** `.mcp.json`, `.claude/settings.json`

**Concepts**
- **The payoff moment.** The server from M07, unchanged, now used by a different host: Claude Code itself.
- Configuration scopes and precedence: `local` (`.claude/settings.local.json`, gitignored, personal) vs `project` (`.mcp.json`, committed, shared with your team) vs `user` (`~/.claude/`, all your projects).
- `claude mcp add` / `claude mcp list`, and `/mcp` inside Claude Code.
- Committing `.mcp.json` safely: env-var references (`${GITHUB_TOKEN}`), never literal secrets. This is why `.mcp.json` is *not* in `.gitignore` but `.mcp.local.json` is.
- Brief tour of the rest of Claude Code's extension surface, so you know what exists: **skills** (`.claude/skills/`), **subagents** (`.claude/agents/`), **hooks**, **slash commands**. When to reach for a skill vs an MCP server — skills are instructions, servers are capabilities.

**Build**
- Register `scribe-notes` in `.mcp.json`, restart, confirm via `/mcp`, then use your own tools from this chat window.
- Write one small skill so you can feel the difference.

**Checkpoint:** your own tools are available in Claude Code, and your teammate could get them by cloning the repo.

---

# Part III — Production Concerns (Modules 09–11)

Goal: the difference between a demo and something you'd let near real work.

## Module 09 — Permissions, hooks, and audit
**Files:** `src/07-permissions.ts`, `src/08-hooks.ts`

**Concepts**
- `canUseTool` — a callback that intercepts *every* tool call before it runs. Allow, deny, or **modify the input**. This is your programmable policy layer.
- Hooks — event-driven interception across the lifecycle (`PreToolUse`, `PostToolUse`, `SessionStart`, `Stop`, and many more). Hooks in the SDK are callbacks; in Claude Code they're shell commands in settings.
- `canUseTool` vs hooks: one gates a decision, the other observes and reacts. Use the right one.
- Building an **audit log**: every tool call, its input, its result, timestamped. Non-negotiable for anything touching real data — when an agent does something surprising, this file is how you find out what happened.
- Practical policy patterns: block writes outside a root, require confirmation for destructive ops, redact secrets from logs, rate-limit an expensive tool.

**Build**
- A policy layer: deny `Bash` containing `rm -rf`, force all writes under `sandbox/`, log everything to `sandbox/audit.jsonl`.
- Adversarially prompt your own agent to violate the policy. Confirm the policy — not the prompt — is what stops it.

**Checkpoint:** you can enforce a rule your agent cannot talk its way out of, and prove it from the audit log.

---

## Module 10 — Subagents and skills
**Files:** `src/09-subagents.ts`, `.claude/agents/`

**Concepts**
- Why delegate: **context isolation**. A subagent burns its own context on a noisy subtask and returns only a conclusion. Fan-out for parallelism is the secondary benefit.
- `agents` in `Options`: `{ description, prompt, tools, model, effort }` per agent. `description` is how the orchestrator decides to delegate — same prompt-engineering discipline as tool descriptions.
- **Cost/latency shape:** delegation multiplies token spend. Give cheap models the reading-heavy work (`model: 'haiku'`), keep judgment on a strong model.
- Where subagents pay off vs. where they're cargo cult. A single-step task does not need an org chart.
- Skills — progressive disclosure of instructions, loaded on demand.

**Build**
- Scribe gains a `researcher` (read-heavy, cheap model, read-only tools) and a `summarizer`. Compare a delegating run against a monolithic one on the same task: total tokens, wall-clock, quality.

**Checkpoint:** you can justify a subagent with numbers instead of vibes.

---

## Module 11 — Sessions, resumption, and cost control
**Files:** `src/10-sessions.ts`

**Concepts**
- Sessions persist to disk. `resume` a session ID; `continue` the latest. Multi-turn agents without you writing state management.
- Session helpers: `listSessions`, `getSessionMessages`, `getSessionInfo`, `forkSession`. Forking gives you "try two approaches from the same starting point."
- Streaming input mode: `prompt` as an `AsyncIterable` for interactive, long-lived agents.
- **Cost control:** `maxBudgetUsd` as a hard stop, reading `usage` and `total_cost_usd` off the `result` message, and why the cost line should be visible during development. An agent loop is an *unbounded* spend by default.
- Context management: what compaction is and when it fires.

**Build**
- A small interactive Scribe REPL that keeps context across turns, resumes after exit, and prints running cost.

**Checkpoint:** your agent survives a restart and can't exceed a dollar cap you set.

---

# Part IV — Capstone (Module 12)

## Module 12 — Ship something of your own
**Files:** `capstone/`

Pick a real problem *you* have. Requirements:

- [ ] At least one custom tool you designed
- [ ] At least one MCP server — yours, or a third-party one you evaluated and chose
- [ ] A permission policy with an audit log
- [ ] A cost ceiling
- [ ] A README a stranger could follow
- [ ] No secrets in git history

Suggestions if nothing jumps out: a PR-review agent over `gh`; a personal-knowledge agent over your notes; a log-triage agent; a docs-freshness checker that flags stale docs against code.

**Checkpoint:** it runs, it's useful to you, and you can defend every permission you granted it.

---

## Reference

| What | Where |
|---|---|
| Agent SDK docs | https://code.claude.com/docs/en/agent-sdk |
| TypeScript SDK reference | https://code.claude.com/docs/en/agent-sdk/typescript |
| MCP specification | https://modelcontextprotocol.io/specification |
| MCP server registry | https://github.com/modelcontextprotocol/servers |
| MCP Inspector | `npx @modelcontextprotocol/inspector` |
| Local type source of truth | `node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts` |

**When docs and this course disagree, the docs win** — and `sdk.d.ts` beats both. The SDK moves fast (it was `0.3.252` when this was written). Checking types locally is a skill this course wants you to build, not a workaround.

---

## A note on how to take this course

Type the code. Don't paste it. The muscle memory is the point.

Do the **Break it** step every time. Reading that `stdout` corrupts a stdio MCP server teaches you a fact; watching your own server dissolve into garbage teaches you a reflex.

Ask me to explain anything at any depth — that's what the chat window is for. And after each module, tell me and I'll update [PROGRESS.md](PROGRESS.md) with what you found hard, so the later modules can lean on what actually stuck.
