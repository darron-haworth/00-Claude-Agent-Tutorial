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
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

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

// ── 2. The precedence trap, and the gate in front of it ───────────────────
// ANTHROPIC_API_KEY *can* beat your subscription login and switch you to
// metered billing. But the Claude Code CLI puts a gate in front of it: it
// keeps a list of API-key fingerprints you have explicitly approved, and a
// key that isn't on that list gets ignored rather than used.
//
// So "a key is set" and "a key is in effect" are two different questions.
// This section answers the first. Section 3 answers the second — and that's
// the one that decides who pays.
const envKey = process.env.ANTHROPIC_API_KEY;

/**
 * Best-effort read of the CLI's key-approval list. This is undocumented
 * internal state, so it's informational only — we never branch on it.
 * Section 3 asks the CLI what it actually resolved, which is the real answer.
 */
function readApprovalList(): { approved: string[]; rejected: string[] } | null {
  try {
    const raw = readFileSync(join(homedir(), ".claude.json"), "utf8");
    const parsed = JSON.parse(raw) as {
      customApiKeyResponses?: { approved?: string[]; rejected?: string[] };
    };
    const responses = parsed.customApiKeyResponses;
    if (!responses) return null;
    return {
      approved: responses.approved ?? [],
      rejected: responses.rejected ?? [],
    };
  } catch {
    return null;
  }
}

if (envKey) {
  const masked = `${envKey.slice(0, 10)}…${envKey.slice(-4)}`;
  console.log(`  ANTHROPIC_API_KEY  set (${masked})`);

  const list = readApprovalList();
  if (list) {
    console.log(
      `    approval list   ${list.approved.length} approved, ` +
        `${list.rejected.length} rejected`,
    );

    // Observed fingerprint format is the key's trailing 20 characters. A hint,
    // not a contract — CLI internals can change without notice.
    const fingerprint = envKey.slice(-20);

    if (list.approved.includes(fingerprint)) {
      console.log("    this key        APPROVED → expect it to be in effect");
    } else if (list.rejected.includes(fingerprint)) {
      console.log("    this key        REJECTED → will be ignored");
    } else {
      console.log("    this key        not on the list → gated");
      console.log(
        "                    (interactively you'd be prompted; " +
          "non-interactively it's ignored)",
      );
    }
  }
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

  // ── The question that actually matters ──────────────────────────────────
  // Not "is a key set?" but "which credential did the CLI resolve?" We answer
  // it from the CLI's own report rather than from our guess about the list.
  const source = status.apiKeySource ?? "unknown";
  const usingManagedLogin = /login managed key/i.test(source);

  if (envKey && usingManagedLogin) {
    console.log("\n  → Your env ANTHROPIC_API_KEY was NOT used.");
    console.log("    The CLI fell back to your subscription login, because");
    console.log("    the key isn't on the approval list. Setting a key and");
    console.log("    using a key are not the same thing.");
  } else if (envKey) {
    console.log("\n  ⚠  Your env ANTHROPIC_API_KEY IS in effect.");
    console.log("     You are being billed per token at API rates.");
    console.log("     For this course, unset it and use your Claude login.");
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
 * Ask two questions, not one:
 *
 *   Is a key set?       → look at the environment
 *   Is a key in effect? → look at `apiKeySource` from `claude auth status`
 *
 * Credential precedence for the Agent SDK, highest first:
 *
 *   1. ANTHROPIC_API_KEY env var        → metered API billing, BUT gated by
 *                                         the CLI's per-key approval list
 *   2. apiKeyHelper (settings.json)     → enterprise setups
 *   3. Your `claude auth login` session → subscription  ← you are here
 *
 * That gate is the part most write-ups get wrong. Because the Agent SDK
 * drives the `claude` CLI, an *unapproved* env key is ignored rather than
 * used — so a stray key in a .env usually can't bill you by accident.
 *
 * Two places the protection does not apply, and these are the real risks:
 *
 *   - Approval is sticky. A key you approved once is honored silently from
 *     then on, including in non-interactive SDK runs. The dangerous key is
 *     not the stray one, it's the one you said yes to months ago.
 *   - The gate is CLI behavior, not API behavior. Call the Anthropic SDK
 *     (@anthropic-ai/sdk) directly and ANTHROPIC_API_KEY wins immediately:
 *     no list, no prompt, no fallback.
 *
 * ── Break it (do this) ────────────────────────────────────────────────────
 *
 * First, the experiment that *fails to fail* — which is the point:
 *
 *   ANTHROPIC_API_KEY=sk-ant-definitely-not-valid npm run m01
 *
 * It succeeds. The invalid key never reached the API. Run `npm run check`
 * the same way and this script will tell you the key was set but not used.
 * Inline env vars beat editing .env here: nothing to create, nothing to
 * forget to delete.
 *
 * Then, a failure that does reproduce — break the subprocess instead:
 *
 *   env PATH=/nonexistent npx tsx src/01-hello-agent.ts
 *
 * The SDK spawns the `claude` binary as a child process. Take it off PATH
 * and there is no agent. Costs nothing, touches no credentials, and it is
 * exactly what a broken PATH in CI or a cron job looks like in the wild.
 */
