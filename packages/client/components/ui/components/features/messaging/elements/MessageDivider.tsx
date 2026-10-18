import { Show } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

/**
 * Divider line
 */
const Base = styled("div", {
  base: {
    height: 0,
    display: "flex",
    userSelect: "none",
    alignItems: "center",
    margin: "20px 16px",
    justifyContent: "center",

    "& time": {
      fontSize: "0.75rem",
      lineHeight: "1rem",
      fontWeight: 600,
      padding: "2px 12px",
      border: "var(--hairline)",

      borderRadius: "var(--radius-pill)",

      color: "var(--md-sys-color-on-surface-variant)",
      background: "var(--md-sys-color-surface-container-high)",
    },
  },
  variants: {
    unread: {
      true: {
        borderTop: "2px solid var(--md-sys-color-primary)",
        justifyContent: "flex-end",
      },
      false: {
        borderTop: "thin solid var(--md-sys-color-outline-variant)",
      },
    },
  },
  defaultVariants: {
    unread: false,
  },
});

/**
 * Unread indicator
 */
const Unread = styled("div", {
  base: {
    fontSize: "0.625rem",
    fontWeight: 700,
    color: "var(--md-sys-color-on-primary)",
    background: "var(--md-sys-color-primary)",

    padding: "2px 8px",
    marginTop: "-1px",
    letterSpacing: "0.04em",
    borderRadius: "60px",
  },
});

interface Props {
  /**
   * Display the date
   */
  date?: string;

  /**
   * Show unread indicator
   */
  unread?: boolean;
}

/**
 * Generic message divider
 */
export function MessageDivider(props: Props) {
  return (
    <Base unread={props.unread}>
      <Show when={props.unread}>
        <Unread>
          <Trans>NEW</Trans>
        </Unread>
      </Show>
      <Show when={props.date}>
        <time>{props.date}</time>
      </Show>
    </Base>
  );
}
