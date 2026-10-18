import { JSX, splitProps } from "solid-js";

import { styled } from "styled-system/jsx";

import { typography } from "../design";

/**
 * Base element for the tooltip
 */
export const TooltipBase = styled("div", {
  base: {
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-lowest)",
    boxShadow: "var(--elev-2)",
    padding: "6px 10px",
    borderRadius: "var(--radius-xs)",

    ...typography.raw({
      class: "label",
      size: "small",
    }),
  },
});

type Props = {
  /**
   * Tooltip trigger area
   */
  children: JSX.Element;
} & (JSX.Directives["floating"] & object)["tooltip"];

/**
 * Tooltip component
 */
export function Tooltip(props: Props) {
  const [local, remote] = splitProps(props, ["children"]);

  return (
    <div use:floating={{ tooltip: remote as never }}>{local.children}</div>
  );
}
