import { styled } from "styled-system/jsx";

/**
 * Common styles for sidebar
 */
export const SidebarBase = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minHeight: 0,
    overflow: "hidden",
    width: "100%",

    fill: "var(--md-sys-color-on-surface)",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-low)",

    "& a": {
      textDecoration: "none",
    },

  },
});
