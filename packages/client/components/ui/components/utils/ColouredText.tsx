import { JSX, Match, Switch } from "solid-js";

import { useState } from "@revolt/state";
import { css } from "styled-system/css";

import { readableColour } from "./contrast";

/**
 * Coloured text
 */
export function ColouredText(props: {
  colour?: string;
  children?: string | JSX.Element;
}) {
  const state = useState();
  const readable = () =>
    props.colour
      ? readableColour(props.colour, state.theme.activeTheme.darkMode)
      : undefined;

  return (
    <Switch
      fallback={<span style={{ color: readable() }} children={props.children} />}
    >
      <Match when={props.colour?.includes("gradient")}>
        <span
          style={{
            background: props.colour!,
          }}
          class={css({
            backgroundClip: "text !important",
            WebkitTextFillColor: "transparent",
            textDecoration: "none",
          })}
          children={props.children}
        />
      </Match>
    </Switch>
  );
}
