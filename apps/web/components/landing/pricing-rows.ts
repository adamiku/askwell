import { PLAN_LIMITS, PLANS, WIDGET_ANIMATIONS, type Plan } from "@askwell/shared";

export type PricingRow = { label: string; value: string };

export type PricingColumn = { id: Plan; name: string; rows: readonly PricingRow[] };

const NAMES: Record<Plan, string> = { free: "Free", pro: "Pro" };

const number = (n: number) => n.toLocaleString("en-US");

/** Words for each customization flag. The flags themselves come from PLAN_LIMITS. */
function rowsFor(plan: Plan): PricingRow[] {
  const { projects, messagesPerMonth, knowledgeSources, customize } = PLAN_LIMITS[plan];
  return [
    { label: "Projects", value: number(projects) },
    { label: "Messages / month (per project)", value: number(messagesPerMonth) },
    { label: "Knowledge sources (per project)", value: number(knowledgeSources) },
    { label: "Button color", value: customize.color ? "Any" : "Default" },
    { label: "Button position", value: customize.position ? "Any corner" : "Bottom right" },
    { label: "Button label", value: customize.label ? "Custom" : "Default" },
    {
      label: "Open animation",
      value: customize.animation ? capitalizeFirst(WIDGET_ANIMATIONS.join(" / ")) : "Fade",
    },
    { label: "Header text", value: customize.headerText ? "Custom" : "Default" },
    { label: "\"Powered by\" badge", value: customize.hideBadge ? "Hidden" : "Shown" },
  ];
}

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const PRICING_COLUMNS: readonly PricingColumn[] = PLANS.map((id) => ({
  id,
  name: NAMES[id],
  rows: rowsFor(id),
}));
