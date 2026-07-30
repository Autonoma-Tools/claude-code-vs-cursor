"use strict";

/**
 * Monthly cost calculator for the Claude Code vs Cursor comparison.
 *
 *   node cost_calculator.js
 *
 * Zero dependencies. Nothing to install. Every input below is a labeled
 * variable you are expected to overwrite with your own numbers.
 *
 * ---------------------------------------------------------------------------
 * PROVENANCE OF THE PER-SESSION FIGURES (read this before quoting the output)
 * ---------------------------------------------------------------------------
 * The default $2.50 and $2.04 per-session costs are NOT something we measured.
 * They are third-party figures published by firecrawl.dev for one comparable
 * task, dated July 2026. They are an anchor, not a measurement, and they came
 * from their codebase and their task, not yours.
 *
 * Per-session cost moves with task size, repo size, model choice, and how
 * chatty your sessions are. It is the input with the widest spread in this
 * whole calculation. Run five real sessions, take the mean, and replace the
 * two constants below. Until you do, treat every dollar figure this script
 * prints as an order of magnitude and nothing more.
 *
 * Subscription prices are vendor list prices as of July 2026. Both vendors
 * change tiers often. Re-check the pricing pages before acting on the output.
 */

// ---------------------------------------------------------------------------
// INPUTS: override these
// ---------------------------------------------------------------------------

const DEFAULT_INPUTS = {
  // Team shape.
  developers: 5,
  sessionsPerDeveloperPerDay: 3,
  workingDaysPerMonth: 22,

  // Tool A: Claude Code.
  toolAName: "Claude Code",
  toolASeatLabel: "Max",
  toolACostPerSession: 2.5, // USD. firecrawl.dev, July 2026. Anchor, not a measurement.
  toolASeatPriceMonthly: 200, // USD per seat per month, list price July 2026.
  toolABillingModel: "flat", // "flat" or "seat_plus_usage"

  // Tool B: Cursor.
  toolBName: "Cursor",
  toolBSeatLabel: "Pro",
  toolBCostPerSession: 2.04, // USD. firecrawl.dev, July 2026. Anchor, not a measurement.
  toolBSeatPriceMonthly: 20, // USD per seat per month, list price July 2026.
  toolBBillingModel: "seat_plus_usage", // "flat" or "seat_plus_usage"

  // Where the per-session costs came from. Change this when you change them,
  // so the printed report can never credit a source you did not actually use.
  costSource: "firecrawl.dev, July 2026 (third-party anchor, not a measurement)",
};

const BILLING_MODELS = ["flat", "seat_plus_usage"];

// ---------------------------------------------------------------------------
// CALCULATION
// ---------------------------------------------------------------------------

function calculate(overrides) {
  const input = Object.assign({}, DEFAULT_INPUTS, overrides || {});

  [
    "developers",
    "sessionsPerDeveloperPerDay",
    "workingDaysPerMonth",
    "toolACostPerSession",
    "toolASeatPriceMonthly",
    "toolBCostPerSession",
    "toolBSeatPriceMonthly",
  ].forEach(function (field) {
    const value = input[field];
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new TypeError(
        "Input '" + field + "' must be a finite number >= 0, received: " + String(value)
      );
    }
  });

  ["toolABillingModel", "toolBBillingModel"].forEach(function (field) {
    if (BILLING_MODELS.indexOf(input[field]) === -1) {
      throw new TypeError(
        "Input '" + field + "' must be one of: " + BILLING_MODELS.join(", ") + "."
      );
    }
  });

  const sessionsPerMonth =
    input.developers * input.sessionsPerDeveloperPerDay * input.workingDaysPerMonth;

  function tool(prefix) {
    const consumptionEquivalent = sessionsPerMonth * input[prefix + "CostPerSession"];
    const subscriptionBase = input.developers * input[prefix + "SeatPriceMonthly"];
    const billingModel = input[prefix + "BillingModel"];

    return {
      name: input[prefix + "Name"],
      seatLabel: input[prefix + "SeatLabel"],
      billingModel: billingModel,
      costPerSession: input[prefix + "CostPerSession"],
      seatPriceMonthly: input[prefix + "SeatPriceMonthly"],
      consumptionEquivalent: consumptionEquivalent,
      subscriptionBase: subscriptionBase,
      // A flat plan is priced to absorb the volume, so the plan price is the
      // budget. A seat-plus-usage plan bills the base and then meters on top,
      // so the honest answer is a range, not a point.
      budgetLow: subscriptionBase,
      budgetHigh: Math.max(subscriptionBase, consumptionEquivalent),
      flatPremium: subscriptionBase - consumptionEquivalent,
    };
  }

  // True only while both per-session costs are still the borrowed defaults.
  // Drives the strength of the caveat printed at the bottom of the report.
  const usingDefaultCostAnchors =
    input.toolACostPerSession === DEFAULT_INPUTS.toolACostPerSession &&
    input.toolBCostPerSession === DEFAULT_INPUTS.toolBCostPerSession;

  return {
    input: input,
    sessionsPerMonth: sessionsPerMonth,
    usingDefaultCostAnchors: usingDefaultCostAnchors,
    toolA: tool("toolA"),
    toolB: tool("toolB"),
  };
}

// ---------------------------------------------------------------------------
// REPORT
// ---------------------------------------------------------------------------

const LABEL_WIDTH = 46;

function usd(amount) {
  const sign = amount < 0 ? "-" : "";
  return sign + "$" + Math.abs(amount).toFixed(2);
}

function row(label, value) {
  const dots = ".".repeat(Math.max(3, LABEL_WIDTH - label.length));
  return "  " + label + " " + dots + " " + value;
}

function toolSummary(tool) {
  if (tool.billingModel === "flat") {
    const comparison =
      tool.flatPremium >= 0
        ? "You are paying " +
          usd(tool.flatPremium) +
          " over the consumption-equivalent for predictable billing and headroom."
        : "That is " +
          usd(-tool.flatPremium) +
          " below the consumption-equivalent, so the flat plan is the cheaper option at this volume.";

    return [
      tool.name +
        ": flat " +
        usd(tool.subscriptionBase) +
        " per month on " +
        tool.seatLabel +
        " seats.",
      "  Consumption-equivalent at this volume is " + usd(tool.consumptionEquivalent) + ".",
      "  " + comparison,
    ].join("\n");
  }

  const coversIt = tool.subscriptionBase >= tool.consumptionEquivalent;
  const closing = coversIt
    ? "At this volume the base already exceeds the consumption-equivalent of " +
      usd(tool.consumptionEquivalent) +
      ", so expect little or no overage."
    : "At this volume the base will not cover it, so budget between " +
      usd(tool.budgetLow) +
      " and " +
      usd(tool.budgetHigh) +
      " and measure where you land.";

  return [
    tool.name +
      ": " +
      usd(tool.subscriptionBase) +
      " per month base on " +
      tool.seatLabel +
      " seats, plus usage above the included pool.",
    "  " + closing,
  ].join("\n");
}

function formatReport(result) {
  const input = result.input;
  const a = result.toolA;
  const b = result.toolB;
  const lines = [];

  lines.push("Monthly AI coding tool cost, worked from stated assumptions");
  lines.push("===========================================================");
  lines.push("");

  lines.push("ASSUMPTIONS");
  lines.push(row("Developers on the team", String(input.developers)));
  lines.push(
    row("Agentic sessions per developer per day", String(input.sessionsPerDeveloperPerDay))
  );
  lines.push(row("Working days per month", String(input.workingDaysPerMonth)));
  lines.push(row("Sessions per month, team wide", String(result.sessionsPerMonth)));
  lines.push(row(a.name + " cost per session", usd(a.costPerSession)));
  lines.push(row(b.name + " cost per session", usd(b.costPerSession)));
  lines.push(row(a.name + " " + a.seatLabel + " seat per month", usd(a.seatPriceMonthly)));
  lines.push(row(b.name + " " + b.seatLabel + " seat per month", usd(b.seatPriceMonthly)));
  lines.push(row("Source of the per-session costs", input.costSource));
  lines.push("");

  lines.push("CONSUMPTION EQUIVALENT (sessions per month x cost per session)");
  lines.push(row(a.name, usd(a.consumptionEquivalent)));
  lines.push(row(b.name, usd(b.consumptionEquivalent)));
  lines.push("");

  lines.push("SUBSCRIPTION BASE (developers x seat price)");
  lines.push(row(a.name + " " + a.seatLabel, usd(a.subscriptionBase)));
  lines.push(row(b.name + " " + b.seatLabel, usd(b.subscriptionBase)));
  lines.push("");

  lines.push("WHAT TO BUDGET");
  lines.push("  " + toolSummary(a));
  lines.push("");
  lines.push("  " + toolSummary(b));
  lines.push("");

  lines.push("CAVEAT");
  if (result.usingDefaultCostAnchors) {
    lines.push("  The per-session costs above are still the shipped defaults: third-party");
    lines.push("  figures (firecrawl.dev, July 2026) for one comparable task on someone");
    lines.push("  else's codebase. They are an anchor, not a measurement of your workload,");
    lines.push("  and per-session cost is the input with the widest spread in this whole");
    lines.push("  calculation. Run five real sessions, take the mean, and replace");
    lines.push("  toolACostPerSession and toolBCostPerSession before you present any of");
    lines.push("  this as a budget.");
  } else {
    lines.push("  Per-session costs have been overridden from the shipped defaults.");
    lines.push("  Source on record: " + input.costSource);
    lines.push("  Sanity-check that this source is your own measurement and that the");
    lines.push("  sample was large enough to mean something, because this is the input");
    lines.push("  with the widest spread in the whole calculation.");
  }
  lines.push("  Seat prices are list prices as of July 2026 and change often. Re-check");
  lines.push("  both vendor pricing pages before acting on any of these numbers.");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// ENTRY POINT
// ---------------------------------------------------------------------------

if (require.main === module) {
  console.log(formatReport(calculate()));
}

module.exports = {
  DEFAULT_INPUTS: DEFAULT_INPUTS,
  BILLING_MODELS: BILLING_MODELS,
  calculate: calculate,
  formatReport: formatReport,
  usd: usd,
};
