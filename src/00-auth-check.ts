/**
 * MODULE 01 — Auth check
 *
 * Run: npm run check
 *
 * This makes no API call. It just answers one question: *where would my
 * agent's credentials come from right now?*
 *
 * Worth knowing up front: the Agent SDK does not talk to the API directly.
 * It spawns the `claude` CLI as a subprocess and drives it. That's why the
 * CLI has to be installed, and why your CLI login works here for free.
 */

import { execFileSync } from "node:child_process";

type AuthStatus = {
  loggedIn?: boolean;
  authMethod?: string;
  apiKeySource?: string;
  email?: string;
  orgName?: string;
};

console.log("Claude Agent SDK — auth check\n");

// ── 1. Is the CLI there? The SDK is useless without it. ────────────────────
let cliVersion: string;
try {
  cliVersion = execFileSync("claude", ["--version"], {
    encoding: "utf8",
  }).trim();
  console.log(`  claude CLI      ${cliVersion}`);
} catch {
  console.error("  claude CLI      NOT FOUND");
  console.error("\n  The SDK spawns this binary. Install it first:");
  console.error("    https://code.claude.com/docs/en/quickstart\n");
  process.exit(1);
}

// ── 2. The precedence trap ────────────────────────────────────────────────
// ANTHROPIC_API_KEY beats your subscription login. If it's set, you are
// paying per token whether you meant to or not. Empty is the good state.
const envKey = process.env.ANTHROPIC_API_KEY;

if (envKey) {
  const masked = `${envKey.slice(0, 10)}…${envKey.slice(-4)}`;
  console.log(`  ANTHROPIC_API_KEY  set (${masked})`);
  console.log("\n  ⚠  This OVERRIDES your subscription login.");
  console.log("     You will be billed per token at API rates.");
  console.log("     For this course, unset it and use your Claude login.");
} else {
  console.log("  ANTHROPIC_API_KEY  not set  ← good, subscription auth wins");
}

// ── 3. What the CLI itself thinks ─────────────────────────────────────────
try {
  const raw = execFileSync("claude", ["auth", "status"], { encoding: "utf8" });
  const status = JSON.parse(raw) as AuthStatus;

  console.log("\n  Resolved credentials:");
  console.log(`    logged in     ${status.loggedIn ? "yes" : "no"}`);
  console.log(`    method        ${status.authMethod ?? "unknown"}`);
  console.log(`    key source    ${status.apiKeySource ?? "unknown"}`);
  if (status.email) console.log(`    account       ${status.email}`);
  if (status.orgName) console.log(`    org           ${status.orgName}`);

  if (!status.loggedIn) {
    console.log("\n  Not logged in. Run:  claude auth login");
    process.exit(1);
  }

  console.log("\n  ✓ Ready. Next:  npm run m01\n");
} catch (err) {
  console.error("\n  Could not read auth status.");
  console.error(`  ${err instanceof Error ? err.message : String(err)}`);
  console.error("\n  Try:  claude auth login\n");
  process.exit(1);
}

/**
 * ── The lesson ────────────────────────────────────────────────────────────
 *
 * Credential precedence, highest first:
 *
 *   1. ANTHROPIC_API_KEY env var        → metered API billing
 *   2. apiKeyHelper (settings.json)     → enterprise setups
 *   3. Your `claude auth login` session → subscription  ← you are here
 *
 * The single most common surprise for people starting out is a stale
 * ANTHROPIC_API_KEY in a .env file quietly overriding their subscription.
 * Now you'd recognize it.
 *
 * ── Break it (do this) ────────────────────────────────────────────────────
 *
 * Put this in .env:
 *
 *   ANTHROPIC_API_KEY=sk-ant-definitely-not-valid
 *
 * Re-run `npm run check`, then `npm run m01`. Watch a working setup fail.
 * Then delete the line. Failing on purpose, once, is cheaper than failing
 * by accident later.
 */
