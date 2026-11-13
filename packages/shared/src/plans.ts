export const PLANS = ["free", "pro"] as const;
export type Plan = (typeof PLANS)[number];

export const WIDGET_POSITIONS = ["bottom-right", "bottom-left", "top-right", "top-left"] as const;
export type WidgetPosition = (typeof WIDGET_POSITIONS)[number];

export const WIDGET_ANIMATIONS = ["fade", "slide", "scale"] as const;
export type WidgetAnimation = (typeof WIDGET_ANIMATIONS)[number];

export type PlanLimits = {
  projects: number;
  messagesPerMonth: number;
  knowledgeSources: number;
  /** Customization flags: true means the plan may change that setting. */
  customize: {
    color: boolean;
    position: boolean;
    label: boolean;
    animation: boolean;
    headerText: boolean;
    hideBadge: boolean;
  };
};

/** project.md §5. The server reads these; the client never decides. */
export const PLAN_LIMITS = {
  free: {
    projects: 1,
    messagesPerMonth: 100,
    knowledgeSources: 3,
    customize: {
      color: false,
      position: false,
      label: false,
      animation: false,
      headerText: false,
      hideBadge: false,
    },
  },
  pro: {
    projects: 5,
    messagesPerMonth: 2000,
    knowledgeSources: 25,
    customize: {
      color: true,
      position: true,
      label: true,
      animation: true,
      headerText: true,
      hideBadge: true,
    },
  },
} as const satisfies Record<Plan, PlanLimits>;
