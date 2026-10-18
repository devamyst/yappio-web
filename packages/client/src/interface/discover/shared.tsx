import { styled } from "styled-system/jsx";

export const Grid = styled("div", {
  base: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
  },
});

export const JoinButton = styled("button", {
  base: {
    height: "32px",
    padding: "0 16px",
    cursor: "pointer",
    border: "none",
    fontSize: "13px",
    fontWeight: 700,
    borderRadius: "var(--radius-pill)",
    color: "var(--md-sys-color-on-primary)",
    background: "var(--md-sys-color-primary)",

    "&:hover": { filter: "brightness(1.08)" },
    "&:disabled": { opacity: 0.5, cursor: "default" },
    "&:focus-visible": {
      outline: "2px solid var(--md-sys-color-primary)",
      outlineOffset: "2px",
    },
  },
});

export const GhostButton = styled("button", {
  base: {
    height: "32px",
    padding: "0 14px",
    cursor: "pointer",
    border: "none",
    fontSize: "13px",
    fontWeight: 600,
    borderRadius: "var(--radius-pill)",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-highest)",

    "&:hover": { filter: "brightness(1.15)" },
    "&:disabled": { opacity: 0.5, cursor: "default" },
    "&:focus-visible": {
      outline: "2px solid var(--md-sys-color-primary)",
      outlineOffset: "2px",
    },
  },
});

export const Empty = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "56px 16px",
    textAlign: "center",
    color: "var(--md-sys-color-on-surface-variant)",

    "& h2": {
      margin: 0,
      fontSize: "20px",
      color: "var(--md-sys-color-on-surface)",
    },
    "& p": { margin: "0 0 8px", maxWidth: "420px" },
  },
});

