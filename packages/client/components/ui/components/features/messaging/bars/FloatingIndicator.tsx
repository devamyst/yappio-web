import { styled } from "styled-system/jsx";

import { typography } from "@revolt/ui/components/design";

/**
 * Common styles for the floating indicators
 */
export const FloatingIndicator = styled("div", {
  base: {
    // for <Ripple />:
    position: "relative",

    display: "flex",
    userSelect: "none",
    alignItems: "center",

    width: "calc(100% - var(--space-4))",
    marginInline: "var(--space-2)",
    gap: "var(--gap-md)",
    padding: "var(--space-2) var(--space-3)",
    borderRadius: "var(--radius-pill)",

    cursor: "pointer",
    backdropFilter: "var(--effects-blur-md)",

    ...typography.raw({ size: "small" }),
    fontSize: "13px",

    fill: "var(--md-sys-color-on-primary)",
    color: "var(--md-sys-color-on-primary)",
    backgroundColor: "var(--md-sys-color-primary)",
    boxShadow: "var(--elev-2)",
    fontWeight: 600,

    animation: "slideIn 340ms cubic-bezier(0.2, 0.9, 0.5, 1.16) forwards",
  },
  variants: {
    position: {
      top: {
        "--translateY": "-33px",
      },
      bottom: {
        "--translateY": "33px",
      },
    },
  },
});
