/**
 * Plan values from project.md section 5, in one place.
 * Swap this file for PLAN_LIMITS from packages/shared once P1F-T02 merges.
 */
export type PlanId = "free" | "pro";

export type PlanSummary = {
  id: PlanId;
  name: string;
  rows: ReadonlyArray<{ label: string; value: string }>;
};

export const PLAN_SUMMARIES: readonly PlanSummary[] = [
  {
    id: "free",
    name: "Free",
    rows: [
      { label: "Projects", value: "1" },
      { label: "Messages / month (per project)", value: "100" },
      { label: "Knowledge sources (per project)", value: "3" },
      { label: "Button color", value: "Default" },
      { label: "Button position", value: "Bottom right" },
      { label: "Button label", value: "Default" },
      { label: "Open animation", value: "Fade" },
      { label: "Header text", value: "Default" },
      { label: "\"Powered by\" badge", value: "Shown" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    rows: [
      { label: "Projects", value: "5" },
      { label: "Messages / month (per project)", value: "2,000" },
      { label: "Knowledge sources (per project)", value: "25" },
      { label: "Button color", value: "Any" },
      { label: "Button position", value: "Any corner" },
      { label: "Button label", value: "Custom" },
      { label: "Open animation", value: "Fade / slide / scale" },
      { label: "Header text", value: "Custom" },
      { label: "\"Powered by\" badge", value: "Hidden" },
    ],
  },
];
