/**
 * MODULE 01 — Your first agent
 *
 * Run: npm run m01
 *
 * The smallest useful thing: one prompt, one answer. But read the loop
 * below carefully, because that shape is every agent you will ever write.
 */

import { query } from "@anthropic-ai/claude-agent-sdk";

// `query()` returns an async generator. Nothing runs until you iterate it.
//
// Two things worth noticing about the options:
//
//   settingSources: []
//     By default the SDK loads ~/.claude/settings.json, .claude/settings.json,
//     and CLAUDE.md files. Handy in real use, terrible for a lesson — your
//     agent would behave differently on my machine than on yours. `[]` makes
//     this hermetic. Module 02 covers when you *want* the default.
//
//   maxTurns: 2
//     A hard ceiling on loop iterations. This prompt needs one. The seatbelt
//     costs nothing and an agent loop is unbounded spend by default.

const response = query({
  prompt: "In one sentence: what makes an AI agent different from a chatbot?",
  options: {
    model: "sonnet",
    settingSources: [],
    maxTurns: 2,
  },
});

// The `for await` loop IS the agent loop, surfaced to you. Every iteration is
// one message: the model talking, a tool being called, a result coming back.
// Here there are no tools, so it's short — but the shape doesn't change when
// you add fifty tools in Module 04. It just runs longer.

for await (const message of response) {
  if (message.type === "assistant") {
    // Content is an array of *blocks*, not a string. Text is one kind of
    // block; `tool_use` is another. That distinction is the whole protocol,
    // and it's what Module 02 digs into.
    for (const block of message.message.content) {
      if (block.type === "text") {
        console.log(`\n${block.text}\n`);
      }
    }
  }

  if (message.type === "result") {
    // The final message always carries the receipt. Get in the habit of
    // reading it — it's how you notice a task cost 40x what you expected.
    if (message.subtype === "success") {
      console.log("─".repeat(60));
      console.log(`turns     ${message.num_turns}`);
      console.log(`duration  ${(message.duration_ms / 1000).toFixed(1)}s`);
      console.log(`cost      $${message.total_cost_usd.toFixed(4)}`);
      console.log("─".repeat(60));
    } else {
      // Non-success subtypes are how you learn you hit maxTurns or an error.
      console.error(`\nRun ended early: ${message.subtype}\n`);
      process.exitCode = 1;
    }
  }
}

/**
 * ── What just happened ────────────────────────────────────────────────────
 *
 *   1. `query()` spawned the `claude` CLI as a subprocess.
 *   2. The CLI authenticated using your subscription login.
 *   3. It sent your prompt plus a system prompt and tool definitions.
 *   4. The model replied with text (no tools needed here).
 *   5. A `result` message closed the stream with cost and timing.
 *
 * Steps 3–4 are the loop. With tools available, the model would emit a
 * `tool_use` block instead of text, the harness would execute it, feed the
 * result back, and go around again — as many times as needed, up to
 * `maxTurns`. You didn't write that loop. That's what the SDK is for.
 *
 * ── Try these ─────────────────────────────────────────────────────────────
 *
 * 1. Change the prompt to something needing a tool:
 *      "How many .ts files are in the current directory?"
 *    It fails or guesses. No tools were granted. Module 03 fixes this, and
 *    seeing the failure first makes that module land.
 *
 * 2. Swap `model: "sonnet"` for `"haiku"`. Compare cost and quality.
 *
 * 3. Delete `settingSources: []`. If you have a CLAUDE.md anywhere up the
 *    tree, the answer may change. That's the option earning its keep.
 *
 * 4. Print the raw messages:
 *      console.log(JSON.stringify(message, null, 2))
 *    Ugly, and exactly what Module 02 teaches you to read.
 */
