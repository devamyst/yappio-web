import { JSX, Show } from "solid-js";

import { styled } from "styled-system/jsx";

/**
 * Short friendly message with an optional action for empty lists
 */
export function EmptyState(props: {
  title: JSX.Element;
  hint: JSX.Element;
  action?: JSX.Element;
}) {
  return (
    <Wrap>
      <Title>{props.title}</Title>
      <Hint>{props.hint}</Hint>
      <Show when={props.action}>{props.action}</Show>
    </Wrap>
  );
}

export const EmptyAction = styled("button", {
  base: {
    marginTop: "var(--space-2)",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 700,
    borderRadius: "var(--radius-pill)",
    color: "var(--md-sys-color-on-primary)",
    background: "var(--md-sys-color-primary)",
    transition: "box-shadow var(--motion-fast) var(--ease-standard)",

    "&:hover": {
      boxShadow: "0 4px 16px rgb(200 244 60 / 0.3)",
    },
  },
});

const Wrap = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "var(--space-1)",
    padding: "var(--space-6) var(--space-4)",
    textAlign: "center",
  },
});

const Title = styled("div", {
  base: {
    fontSize: "15px",
    fontWeight: 700,
    color: "var(--md-sys-color-on-surface)",
  },
});

const Hint = styled("div", {
  base: {
    fontSize: "13px",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});
