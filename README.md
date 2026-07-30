# Claude Code vs Cursor: Benchmark Harness

Reproducible benchmark harness for the Claude Code vs Cursor comparison: the exact multi-file task and prompt text, the pre-task fixture state, the scoring rubric, and a monthly cost calculator readers can run against their own usage numbers.

> Companion code for the Autonoma blog post: **[Claude Code vs Cursor: Which One Actually Ships](https://getautonoma.com/blog/claude-code-vs-cursor)**

## This repo contains no results, on purpose

There are no timings here. No token counts. No diffs. No filled-in scorecard.

The article this repo accompanies makes a specific promise: it does not run a
controlled multi-hour benchmark, and it does not invent a diff, a timing, or a
token count and present it as something we measured. Shipping fabricated
numbers in the companion repo would break that promise in the one place a
reader would actually go looking for evidence.

So every measurement slot in
[`SCORING_RUBRIC.md`](SCORING_RUBRIC.md) is blank, and it stays blank. What
this repo gives you is the apparatus: an identical task, an identical prompt,
an identical starting state, and definitions tight enough that two people
scoring the same run land in the same cells.

The result depends far more on your codebase than on which tool wins somebody's
demo. That is the whole argument. Run it yourself.

## Requirements

- Node 20 or newer, for the cost calculator. Nothing to install.
- For the benchmark itself: a small Node/Express and React app with a Task
  entity, a working build command, at least one passing test, and both tools
  installed and authenticated. Full list in
  [`TASK_SPEC.md`](TASK_SPEC.md#1-prerequisites).

## Quickstart

```bash
git clone https://github.com/Autonoma-Tools/claude-code-vs-cursor.git
cd claude-code-vs-cursor
node cost_calculator.js
```

That runs the cost model with the article's stated assumptions and prints the
worked example. There are no dependencies and no install step.

To run the benchmark end to end:

1. **Read [`TASK_SPEC.md`](TASK_SPEC.md).** It defines the task, the
   prerequisites, and the run rules.
2. **Set up the starting state.** Copy `fixture/models/task.js` and
   `fixture/components/TaskForm.jsx` into your app at the equivalent paths,
   apply the reference `tasks` table schema from TASK_SPEC section 2, seed a
   few rows, and commit. That commit is your baseline.
3. **Decide the denominator before you run anything.** Write down how many
   files the minimal correct change touches. Deciding it after you have seen a
   diff is how benchmarks get graded backwards.
4. **Run tool A.** Fresh session, paste the prompt from TASK_SPEC section 3
   verbatim, no follow-up coaching, start the timer.
5. **Score it immediately** in [`SCORING_RUBRIC.md`](SCORING_RUBRIC.md), before
   you touch the second tool.
6. **Reset to baseline** (`git reset --hard`, `git clean -fd`, and reset the
   database) and repeat for tool B with byte-identical input.
7. **Run the cost model** with your own session counts and your own measured
   per-session costs.

## Project structure

```
claude-code-vs-cursor/
├── README.md
├── TASK_SPEC.md               the task, the prompt, the run rules
├── SCORING_RUBRIC.md          the blank scorecard and scoring guidance
├── cost_calculator.js         runnable monthly cost model, zero dependencies
├── package.json
├── LICENSE
├── fixture/
│   ├── models/
│   │   └── task.js            pre-task model layer, no priority field
│   └── components/
│       └── TaskForm.jsx       pre-task form, no priority input
└── examples/
    └── team_of_twelve.js      overriding every cost input with your own numbers
```

- `TASK_SPEC.md` and `SCORING_RUBRIC.md` are the harness. Read them in that order.
- `fixture/` is the pre-task state. Do not edit these files by hand. They are the
  identical starting line of code for both runs, which is the only thing that
  makes a diff between the two runs mean anything.
- `cost_calculator.js` is runnable as-is. `examples/` shows how to override it.

## About the cost calculator

`node cost_calculator.js` reproduces the article's worked example: five
developers, three agentic sessions per day, twenty-two working days, so 330
sessions a month, priced against per-session figures of roughly $2.50 and
$2.04.

Those two per-session numbers are not ours. They come from firecrawl.dev's
published comparison, dated July 2026, measured on their task and their
codebase. They are the only attributable per-task figures anyone has published
in this category, which makes them a better anchor than a guess, and still an
anchor rather than a measurement. Per-session cost has the widest spread of any
input in the model. Run five real sessions, take the mean, and replace
`toolACostPerSession` and `toolBCostPerSession`. The script tells you when you
are still on the borrowed defaults.

Seat prices are vendor list prices as of July 2026. Both vendors have rewritten
their billing model at least once this year, so re-check the pricing pages
before you act on the arithmetic.

## What this harness cannot tell you

Every row on the scorecard checks the code, not the running application.
"Compiled first try" and "existing tests still passing" are necessary
conditions, not sufficient ones. Neither one answers whether the priority field
actually saves, actually renders, and actually rejects a bad value when a
person clicks through the app. That is a separate pass over the running app,
after the diff, regardless of which agent wrote it.

## About

This repository is maintained by [Autonoma](https://getautonoma.com) as reference material for the linked blog post. Autonoma builds autonomous AI agents that plan, execute, and maintain end-to-end tests directly from your codebase.

If something here is wrong, out of date, or unclear, please [open an issue](https://github.com/Autonoma-Tools/claude-code-vs-cursor/issues/new).

## License

Released under the [MIT License](./LICENSE) © 2026 Autonoma Labs.
