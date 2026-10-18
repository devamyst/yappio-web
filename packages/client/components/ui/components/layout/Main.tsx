import { cva } from "styled-system/css";

/**
 * Styles for the main content of a page
 *
 * Flat chat surface that sits directly under the header.
 */
export const main = cva({
  base: {
    flexGrow: 1,
    minWidth: 0,
    minHeight: 0,

    display: "flex",
    overflow: "hidden",
    flexDirection: "column",

    background: "var(--md-sys-color-surface)",
    paddingBottom: "env(keyboard-inset-height)",
  },
});
