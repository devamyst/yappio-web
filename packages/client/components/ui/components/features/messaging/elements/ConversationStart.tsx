import { Match, Show, Switch } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { Channel } from "stoat.js";
import { styled } from "styled-system/jsx";

import { Text } from "../../../design";

interface Props {
  /**
   * Channel information
   */
  channel: Channel;
}

/**
 * Mark the beginning of a conversation
 */
export function ConversationStart(props: Props) {
  return (
    <Base>
      <Show when={props.channel.type !== "SavedMessages"}>
        <Text class="headline" size="large">
          <Show
            when={props.channel.type === "TextChannel"}
            fallback={props.channel.name ?? props.channel.recipient?.displayName}
          >
            <Trans>Welcome to #{props.channel.name}</Trans>
          </Show>
        </Text>
      </Show>
      <Text class="title">
        <Switch
          fallback={<Trans>This is the start of your conversation.</Trans>}
        >
          <Match when={props.channel.type === "SavedMessages"}>
            <Trans>This is the start of your notes.</Trans>
          </Match>
        </Switch>
      </Text>
    </Base>
  );
}

/**
 * Base styles
 */
const Base = styled("div", {
  base: {
    display: "flex",
    userSelect: "none",
    flexDirection: "column",
    margin: "var(--space-4) var(--space-4) var(--space-3)",
    gap: "var(--space-1)",

    color: "var(--md-sys-color-on-surface)",

    "&& > :first-child": {
      fontSize: "30px",
      lineHeight: "38px",
      fontWeight: 800,
      letterSpacing: "-0.01em",
    },

    "&& > :nth-child(2)": {
      fontSize: "15px",
      fontWeight: 400,
      color: "var(--md-sys-color-on-surface-variant)",
    },
  },
});
