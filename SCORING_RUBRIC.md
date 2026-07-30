# SCORING_RUBRIC: the blank scorecard

**This scorecard is blank by design.** There are no results in this repo and
there never will be. The companion article does not run a controlled benchmark
and does not publish an invented diff, timing, or token count, because
fabricated numbers are the exact failure mode the article exists to call out.
The numbers that matter here are yours, produced on your codebase.

Fill this in after running [`TASK_SPEC.md`](TASK_SPEC.md) on both tools.

Companion article: <https://getautonoma.com/blog/claude-code-vs-cursor>

---

## Run metadata

Record this first. A score without it is not reproducible, not even by you.

| Field | Tool A | Tool B |
|---|---|---|
| Tool and version | | |
| Underlying model | | |
| Date of run | | |
| Baseline commit SHA | | |
| Files in minimal correct change set (decided before the run) | | |
| Stop condition that ended the run (1 to 4, see TASK_SPEC) | | |

---

## The scorecard

| Measurement | Tool A | Tool B |
|---|---|---|
| Files touched vs. files that actually needed touching | | |
| Compiled first try (Y/N) | | |
| Existing tests still passing (Y/N) | | |
| Human edits required after | | |
| Wall-clock time to a green state | | |

---

## Scoring guidance

Two people scoring the same run should land on the same cells. That only
happens if the definitions are tight, so use these and not your own.

### 1. Files touched vs. files that actually needed touching

Write it as a ratio: `touched / needed`, for example `6 / 3`.

- **Touched** is `git diff --name-only <baseline>..HEAD | wc -l` at the moment
  the tool stopped, before you hand-fix anything. Count every file, including
  lockfiles, config, and generated output. If the tool created a file and then
  deleted it inside the same run, it does not count, because it is not in the
  diff.
- **Needed** is the number you wrote down in TASK_SPEC section 2 **before**
  either run: one migration, the model file, the form file, plus any test file
  that asserts the task shape. Never revise this number after seeing a diff.

Lower is not automatically better. `2 / 3` means a layer was skipped, which is
worse than `5 / 3`. Score the ratio, then read the diff and note in the
qualitative section whether extra files were reasonable (a test the tool added
on its own) or noise (a reformatted unrelated file, a bumped lockfile, a
README the tool decided to rewrite).

### 2. Compiled first try (Y/N)

Run your build command once, immediately, with zero human edits in between.

- **Y** means it exits zero on the first invocation.
- **N** means anything else, including a warning that your build treats as an
  error.

If the tool ran the build itself during the session and fixed its own failure
before stopping, that still scores **Y**. Self-correction inside the run is the
tool doing its job. Record the number of self-corrections in the qualitative
section, because a Y after six attempts is a different tool experience from a Y
on the first attempt.

### 3. Existing tests still passing (Y/N)

Run the test suite exactly as it existed at the baseline commit, with zero
human edits.

- **Y** means every test that passed at baseline still passes.
- **N** means one or more baseline tests now fail.

Tests the tool added itself do not count toward this row either way. This row
is about regression, not coverage. If the tool **modified** an existing test to
make it pass, that is an **N**, and flag it loudly, because a tool that edits
the assertion instead of the code is the most expensive failure mode in this
whole category.

### 4. Human edits required after

Count the lines you personally changed to get from "the tool stopped" to
"green". Use `git diff --shortstat` between the tool's final commit and your
fixed state, and write it as `+added / -removed`.

- Count only functional edits. Do not count formatting, import ordering, or
  anything your linter would have done on save.
- If you had to add a whole missing layer yourself, note that separately as
  well, because 40 lines of "wrote the form input the tool skipped" is a
  categorically different result from 40 lines spread across three small fixes.
- Zero is a legitimate score. Write `0` and not a dash, so a blank cell always
  means "not recorded" and never means "nothing needed".

### 5. Wall-clock time to a green state

Minutes, from submitting the prompt to a passing build and a passing baseline
test suite, including your own hand-fixing time.

- Start the clock at prompt submission, not at first output.
- Do not pause the clock while the agent works unattended. Unattended time is
  the entire value proposition of a delegate-and-review tool, and stopping the
  clock for it quietly hands that tool the win before you have measured
  anything.
- Do pause for genuine interruptions unrelated to the run (a meeting, lunch)
  and note that you did.
- If a stop condition ended the run before green, record the elapsed time and
  mark it `not green`. Do not leave it blank and do not extrapolate.

---

## Qualitative notes

The numbers do not capture this and it is usually what changes your mind.

**Tool A:**

- Where did it go first, and was that the right place?
- Did it read the existing code before editing, or pattern-match from the prompt?
- Any moment where you wanted to intervene and the rules stopped you?
- Self-corrections during the run:
- Anything it did that you would reject in code review even though it passed:

**Tool B:**

- Where did it go first, and was that the right place?
- Did it read the existing code before editing, or pattern-match from the prompt?
- Any moment where you wanted to intervene and the rules stopped you?
- Self-corrections during the run:
- Anything it did that you would reject in code review even though it passed:

---

## What this scorecard cannot tell you

Every row above is a check on the code, not on the running application.
"Compiled first try" and "existing tests still passing" are necessary
conditions, not sufficient ones. Neither row answers whether the priority field
actually saves, actually renders in the form, and actually rejects a bad value
when a person clicks through the app in a browser.

If both tools score identically on all five rows, that is a real result and it
means the differentiator is somewhere else: the review model, the cost, or the
verification layer that runs after either tool finishes.
