import { Show } from "solid-js";
import type { JSX } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import { AdminUser } from "@revolt/common/lib/discovery";
import { useState } from "@revolt/state";

export function useToken() {
  const state = useState();
  return () => state.auth.getSession()?.token;
}

export function errorText(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong.";
}

export function formatTime(at: number | string | null | undefined) {
  if (at === null || at === undefined) return "";
  const date = new Date(at);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

export function userLabel(user: {
  username: string;
  displayName?: string | null;
}) {
  return user.displayName && user.displayName !== user.username
    ? `${user.displayName} (${user.username})`
    : user.username;
}

export function StateBadges(props: { user: AdminUser }) {
  return (
    <>
      <Show when={props.user.flagState.suspended}>
        <Badge data-tone="danger">
          <Trans>Suspended</Trans>
        </Badge>
      </Show>
      <Show when={props.user.flagState.banned}>
        <Badge data-tone="danger">
          <Trans>Banned</Trans>
        </Badge>
      </Show>
      <Show when={props.user.flagState.deleted}>
        <Badge>
          <Trans>Deleted</Trans>
        </Badge>
      </Show>
      <Show when={props.user.bot}>
        <Badge>
          <Trans>Bot</Trans>
        </Badge>
      </Show>
    </>
  );
}

export function Notice(props: { children: JSX.Element; tone?: "danger" }) {
  return (
    <NoticeBox data-tone={props.tone} role={props.tone ? "alert" : undefined}>
      {props.children}
    </NoticeBox>
  );
}

export const Split = styled("div", {
  base: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "minmax(0, 1fr)",
    alignItems: "start",
    "@media (min-width: 900px)": {
      gridTemplateColumns: "minmax(0, 340px) minmax(0, 1fr)",
    },
  },
});

export const Panel = styled("section", {
  base: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid var(--md-sys-color-outline-variant)",
    background: "var(--md-sys-color-surface-container-low)",
    color: "var(--md-sys-color-on-surface)",
    overflowWrap: "anywhere",

    "& h2": { margin: 0, fontSize: "18px", fontWeight: 700 },
    "& h3": {
      margin: 0,
      fontSize: "12px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "var(--md-sys-color-on-surface-variant)",
    },
  },
});

export const Row = styled("div", {
  base: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" },
});

export const Stack = styled("div", {
  base: { display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 },
});

export const Muted = styled("span", {
  base: {
    fontSize: "13px",
    color: "var(--md-sys-color-on-surface-variant)",
    overflowWrap: "anywhere",
  },
});

export const Mono = styled("code", {
  base: { fontSize: "12px", fontFamily: "monospace", overflowWrap: "anywhere" },
});

export const Field = styled("input", {
  base: {
    flexGrow: 1,
    minWidth: 0,
    height: "40px",
    padding: "0 12px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "none",
    outline: "none",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-highest)",

    "&:focus-visible": { outline: "2px solid var(--md-sys-color-primary)" },
  },
});

export const Area = styled("textarea", {
  base: {
    minWidth: 0,
    minHeight: "72px",
    padding: "10px 12px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    borderRadius: "4px",
    border: "none",
    outline: "none",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-highest)",

    "&:focus-visible": { outline: "2px solid var(--md-sys-color-primary)" },
  },
});

export const Btn = styled("button", {
  base: {
    height: "36px",
    padding: "0 16px",
    cursor: "pointer",
    border: "none",
    fontSize: "14px",
    fontWeight: 600,
    borderRadius: "4px",
    whiteSpace: "nowrap",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-highest)",
    transition: "filter var(--motion-fast) var(--ease-standard)",

    _phone: { height: "44px" },
    "&:hover": { filter: "brightness(1.15)" },
    "&:disabled": { opacity: 0.5, cursor: "default", filter: "none" },
    "&:focus-visible": {
      outline: "2px solid var(--md-sys-color-primary)",
      outlineOffset: "2px",
    },
    "&[data-tone=primary]": {
      color: "var(--md-sys-color-on-primary)",
      background: "var(--md-sys-color-primary)",
    },
    "&[data-tone=danger]": {
      color: "var(--md-sys-color-on-error)",
      background: "var(--md-sys-color-error)",
    },
  },
});

export const Badge = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    height: "20px",
    padding: "0 8px",
    fontSize: "11px",
    fontWeight: 700,
    borderRadius: "4px",
    color: "var(--md-sys-color-on-surface-variant)",
    background: "var(--md-sys-color-surface-container-highest)",

    "&[data-tone=danger]": {
      color: "var(--md-sys-color-on-error)",
      background: "var(--md-sys-color-error)",
    },
    "&[data-tone=primary]": {
      color: "var(--md-sys-color-on-primary)",
      background: "var(--md-sys-color-primary)",
    },
  },
});

export const ListItem = styled("button", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "2px",
    width: "100%",
    minWidth: 0,
    padding: "10px 12px",
    cursor: "pointer",
    textAlign: "left",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    overflowWrap: "anywhere",
    color: "var(--md-sys-color-on-surface)",
    background: "transparent",

    "&:hover": { background: "var(--md-sys-color-surface-container-high)" },
    "&[aria-current=true]": {
      background: "var(--md-sys-color-surface-container-highest)",
    },
    "&:focus-visible": {
      outline: "2px solid var(--md-sys-color-primary)",
      outlineOffset: "-2px",
    },
  },
});

export const Tabs = styled("div", {
  base: {
    display: "flex",
    gap: "4px",
    overflowX: "auto",
    borderBottom: "1px solid var(--md-sys-color-outline-variant)",
  },
});

export const TabButton = styled("button", {
  base: {
    padding: "10px 16px",
    cursor: "pointer",
    border: "none",
    fontSize: "14px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    background: "transparent",
    borderBottom: "2px solid transparent",
    color: "var(--md-sys-color-on-surface-variant)",

    _phone: { padding: "12px 14px" },
    "&[aria-selected=true]": {
      color: "var(--md-sys-color-primary)",
      borderBottomColor: "var(--md-sys-color-primary)",
    },
    "&:focus-visible": {
      outline: "2px solid var(--md-sys-color-primary)",
      outlineOffset: "-2px",
    },
  },
});

const NoticeBox = styled("div", {
  base: {
    padding: "10px 12px",
    fontSize: "13px",
    borderRadius: "4px",
    overflowWrap: "anywhere",
    color: "var(--md-sys-color-on-surface-variant)",
    background: "var(--md-sys-color-surface-container-high)",

    "&[data-tone=danger]": {
      color: "var(--md-sys-color-error)",
      border: "1px solid var(--md-sys-color-error)",
    },
  },
});
