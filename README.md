# Claude Agent SDK + MCP — Learning Repo

A hands-on course taking you from "I don't know what an agent is" to building agents with custom tools, your own MCP servers, permission policies, and cost controls.

- **[COURSE.md](COURSE.md)** — the full 12-module curriculum
- **[PROGRESS.md](PROGRESS.md)** — your progress tracker

## Setup

```bash
npm install
npm run check     # verifies auth works — start here
npm run m01       # your first agent
```

## Auth: you probably need nothing

You're logged in through the Claude CLI, and the SDK inherits that credential automatically:

```bash
claude auth status
```

**Leave `.env` empty.** `ANTHROPIC_API_KEY` ranks above your subscription login and switches you to metered per-token billing.

With one wrinkle worth knowing, because it's the difference between a scare and a real problem: the `claude` CLI only honors an env API key you've **explicitly approved** (it tracks this in `customApiKeyResponses` in `~/.claude.json`). An unapproved key is ignored and the CLI uses your login instead — so the Agent SDK, which drives that CLI, is fairly hard to mis-bill by accident. The exposure is elsewhere:

- Approval is **sticky**. A key you approved once is used silently from then on, including in non-interactive SDK runs.
- The gate is **CLI-only**. Use `@anthropic-ai/sdk` directly and `ANTHROPIC_API_KEY` wins immediately — no list, no prompt.

Don't trust "no key is set" as your check. `npm run check` reports `apiKeySource`, which is what the CLI actually resolved.

`.env.example` documents the optional variables you'll need for specific modules (a GitHub token in Module 06, etc.).

## Debugging in VS Code

`Ctrl+Shift+D` → pick **▶ Debug current file** → `F5`. It debugs whichever `.ts` file is focused, so there's no config to add per lesson. Breakpoints bind directly in TypeScript (`F9` to set one).

Breakpoints only work when **VS Code starts the process**. Running `npm run m01` in a terminal yourself will never hit them.

**The single most useful breakpoint in an agent program** is inside the `for await (const message of response)` loop. Set one there and each `F5` continue steps you through one message of the agent's reasoning — you can inspect the `tool_use` blocks and results in the Variables panel as they happen. That's a far better way to understand the agent loop than reading about it.

One SDK-specific gotcha, already handled in `launch.json`: the Agent SDK spawns the `claude` CLI as a **child process**, so `autoAttachChildProcesses` is set to `false`. Without that, the debugger attaches to the harness too and you get extra debug sessions pausing on code you didn't write. There's a separate opt-in config for when you actually want that, and an attach config for debugging MCP servers in Module 07.

Tasks (`Ctrl+Shift+P` → *Tasks: Run Task*): **Typecheck** catches type errors without spending tokens; **List SDK exports** dumps every symbol in the installed SDK.

## Secrets

`.gitignore` blocks `.env`, `*.key`, `*.pem`, `credentials.json`, and `.claude/settings.local.json` before anything else. Two rules:

1. Real secrets go in `.env` (gitignored). Placeholders go in `.env.example` (committed).
2. `.mcp.json` **is** committed — it's how you share server config with a team — so it must only ever reference `${ENV_VARS}`, never literal tokens.

Before your first push:

```bash
git status --short          # confirm .env is not listed
git check-ignore -v .env    # confirm a rule matches it
```

## Layout

```
├── COURSE.md              the curriculum
├── PROGRESS.md            your tracker
├── src/                   lesson code, numbered by module
├── lessons/               concept write-ups for reading-heavy modules
├── mcp-servers/           MCP servers you build (Module 07+)
├── sandbox/               gitignored scratch space — agents write here
├── .mcp.json              shared MCP config (Module 08) — no secrets
├── .env.example           committed template
└── .env                   your real secrets — gitignored
```

`sandbox/` is gitignored deliberately. Agents in this course get real `Write` access, and it should point somewhere that can't damage your work.

## Working with me

This repo is meant to be used *with* the Claude Code chat window open. Useful things to say:

- "Explain the message stream in module 2 more slowly"
- "Build the module 4 code with me"
- "Why isn't my custom tool being called?"
- "Done with module 3" → I'll update `PROGRESS.md` and set up the next one

## Version note

Written against `@anthropic-ai/claude-agent-sdk@0.3.252` on 2026-08-31. The SDK moves fast. The authoritative reference for what exists is always:

```bash
grep -n "export declare" node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts
```
