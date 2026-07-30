"use strict";

/**
 * Example: overriding every input in cost_calculator.js.
 *
 *   node examples/team_of_twelve.js
 *
 * This is what the calculator looks like once you have replaced the borrowed
 * third-party per-session anchors with numbers you measured yourself, which is
 * the only version of this output worth putting in a budget document.
 *
 * Scenario: twelve developers, heavier session load, and per-session costs
 * taken from the reader's own five-session sample rather than from
 * firecrawl.dev. The values below are illustrative placeholders for the shape
 * of a real override. Replace them with your own measurements.
 */

const { calculate, formatReport } = require("../cost_calculator");

const MY_MEASURED_INPUTS = {
  developers: 12,
  sessionsPerDeveloperPerDay: 4,
  workingDaysPerMonth: 21,

  // Mean of five real sessions on our own repo, measured in-house.
  // Substitute yours. Do not ship someone else's anchor as your budget.
  toolACostPerSession: 3.1,
  toolBCostPerSession: 2.35,

  // Seat prices as negotiated on our plan.
  toolASeatPriceMonthly: 200,
  toolBSeatPriceMonthly: 40,
  toolBSeatLabel: "Business",

  // Always update this when you change the per-session numbers, so the report
  // never credits a source you did not use.
  costSource: "in-house, mean of 5 sessions on our own repo",
};

console.log(formatReport(calculate(MY_MEASURED_INPUTS)));
