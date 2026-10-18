import { styled } from "styled-system/jsx";

export const ProfileCard = styled("div", {
  base: {
    // for <Ripple />:
    position: "relative",

    minWidth: 0,
    height: "100%",
    width: "100%",
    userSelect: "none",

    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container)",

    padding: "var(--gap-md) var(--gap-lg)",
    borderRadius: "var(--radius-card)",

    display: "flex",
    gap: "var(--gap-sm)",
    flexDirection: "column",

  },
  variants: {
    width: {
      1: {
        overflow: "hidden",
      },
      2: {
        gridColumn: "1 / 3",
      },
      3: {
        gridColumn: "1 / 4",
      },
    },
    constraint: {
      half: {
        overflow: "hidden",
        maxHeight: "168px",
      },
    },
    isLink: {
      true: {
        cursor: "pointer",
      },
    },
  },
  defaultVariants: {
    width: 1,
  },
});

export const CardTitle = styled("div", {
  base: {
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});
