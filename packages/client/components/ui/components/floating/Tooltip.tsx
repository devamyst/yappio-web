import { JSX, splitProps } from "solid-js";

import { styled } from "styled-system/jsx";

import { typography } from "../design";

/**
 * Base element for the tooltip
 */
export const TooltipBase = styled("div", {
  base: {
    color: "#dbdee1",
    background: "#111214",
    boxShadow: "var(--elev-2)",
    padding: "8px 12px",
    borderRadius: "4px",

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
