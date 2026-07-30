# TASK_SPEC: the same-task benchmark

This is the exact task to run on both tools. It is written so that two people
in two different places produce runs that can actually be compared.

The single most important part of this document is the
[prompt text](#3-the-prompt-copy-it-verbatim). Both tools must receive
byte-identical instructions. If you paraphrase for the second tool, you have
not run a benchmark, you have run two different tasks.

Companion article: <https://getautonoma.com/blog/claude-code-vs-cursor>

---

## Why this task

Add a `priority` field to a Task entity in a small Node/Express and React app,
threaded through three layers that have to agree: a database migration, the
API's validation and serializer, and a frontend form.

It is deliberately boring and deliberately real. This is the shape of change
that breaks in the ways that actually cost you an afternoon:

- **A forgotten layer.** The column lands, the validator accepts the value, and
  the form never gets an input, so the feature is invisible to a user.
- **A stale serializer.** The value saves correctly and never comes back out of
  the API, so the UI shows the default forever and nobody notices until QA.
- **A form that skips the new enum.** The input exists but sends a free-text
  string, or omits the default, so half the writes get rejected at the boundary.

None of those are hard problems. All three are cross-file consistency problems,
which is exactly the thing a "who holds the control loop" comparison is
supposed to be measuring. A single-file task tells you almost nothing about the
difference between a terminal agent and an inline assistant.

The task is also small enough to run twice in one sitting, which matters,
because a benchmark you only have the patience to run once is a benchmark you
cannot check.

---

## 1. Prerequisites

- Node 20 or newer.
- A small Node/Express plus React application with a Task entity you control,
  with a working build command and at least one existing test that passes
  before you start. Your own side project is a better fixture than anything we
  could ship you, because the result depends far more on your codebase than on
  which tool wins a vendor's demo.
- Git, with a clean working tree. You will reset between runs.
- Both tools installed and authenticated, each on a plan that will not hit a
  quota wall halfway through a run.
- A timer. Your phone is fine.

---

## 2. The starting state

Both runs must begin from an identical commit. The two fixture files in this
repo pin the two layers where the interesting divergence happens:

- [`fixture/models/task.js`](fixture/models/task.js) is the model layer:
  the column list, the validator, the row builder, and the serializer. There is
  no `priority` anywhere in it.
- [`fixture/components/TaskForm.jsx`](fixture/components/TaskForm.jsx) is the
  create/edit form. Same field names as the model, and no priority input.

Copy both into your app at the equivalent paths, wire them into your existing
route and page, and commit. That commit is your baseline.

The database layer starts from a `tasks` table with exactly these columns and
no others:

```sql
CREATE TABLE tasks (
  id          INTEGER PRIMARY KEY,
  title       TEXT    NOT NULL,
  description TEXT,
  status      TEXT    NOT NULL DEFAULT 'todo',
  due_date    TEXT,
  created_at  TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL
);
```

Seed at least three rows before the run. A migration that works on an empty
table and fails on existing data is a real failure, and an empty table hides it.

**The minimal correct change set is three files** (plus any test file that
asserts the task shape): one new migration, `models/task.js`, and
`components/TaskForm.jsx`. Write that number down now, before either run. It is
the denominator for the first row of the scorecard, and deciding it after you
have seen a diff is how benchmarks get graded backwards.

---

## 3. The prompt: copy it verbatim

Select the whole block below and paste it. Do not retype it. Do not adjust it
per tool. Do not add "please also update the tests" to the second run because
the first run reminded you that tests exist.

```text
Add a priority field to the Task entity.

Requirements:

1. priority is one of exactly three values: low, medium, high. It is required
   on every task. Existing tasks default to medium.
2. Add a database migration that adds the column to the tasks table and applies
   the default to existing rows.
3. Update the API so that priority is validated on create and on update,
   rejected with a 400 and a clear error message when the value is not one of
   the three allowed values, and included in every serialized task response.
4. Update the task form so a user can set priority when creating or editing a
   task, using the same three values, defaulting to medium.
5. Do not rename, remove, or change the behavior of any existing field.

When you are finished, run the build and the existing test suite and confirm
both pass.
```

That is the entire input. Nothing before it, nothing after it.

---

## 4. Run rules

**One fresh session per tool.** New terminal session or new chat, no prior
conversation, no carried-over context from the other run. If the tool keeps
project-level memory or instruction files, either both tools get an equivalent
file or neither does.

**No follow-up coaching.** Once the prompt is submitted you do not steer. You
may not say "you forgot the form", "check the serializer", or "try again". The
whole question is what the tool does without you.

**What you are allowed to answer:** permission prompts only. Approving a file
edit, approving a command, approving a package install, confirming a diff. Yes
and no are allowed. Content is not. If a tool asks a question that requires
you to supply a design decision, record the question and end the run there,
because answering it makes the two runs different tasks.

**Same day, same model tier.** Model versions move. Run both tools within a few
hours of each other and record which underlying model each one used, because a
result without that is not reproducible even by you.

**Reset between runs.** `git reset --hard <baseline>` and
`git clean -fd`, or clone the repo twice. Also reset the database to the seeded
state, since a migration that already ran will not run again and the second
tool gets a free pass.

**Watch, but do not touch.** Note where each tool goes. That qualitative note
is often more useful than the numbers.

---

## 5. Stop conditions

End the run and start scoring when the first of these happens:

1. The tool reports that it is finished.
2. Thirty minutes of wall-clock time have elapsed.
3. The tool asks a question that requires content guidance from you (see above).
4. The tool errors out in a way it cannot recover from on its own.

Record which condition ended each run. A run that hit condition 2, 3, or 4 is
still a data point and should be scored, not discarded. Throwing out the runs
that went badly is the single easiest way to produce a benchmark that says
whatever you already believed.

---

## 6. The clock

Start the timer when you submit the prompt. Stop it when the build and the
existing test suite both pass, including any fixing you had to do yourself
after the tool stopped. Time to a green state, not time to the tool falling
silent, is the number that maps to your actual day.

Record your hand-fixing time separately as well. The gap between "the agent
finished" and "the branch is green" is the most interesting number in this
whole exercise and it is the one nobody publishes.

---

## 7. Score it

Fill in [`SCORING_RUBRIC.md`](SCORING_RUBRIC.md) immediately after each run,
before you run the second tool. Scoring from memory at the end of the day
favors whichever tool you already liked.
