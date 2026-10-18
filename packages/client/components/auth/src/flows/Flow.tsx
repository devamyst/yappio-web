import { JSX, Show } from "solid-js";

import { defineKeyframes } from "@pandacss/dev";
import { styled } from "styled-system/jsx";

import { Column, Row, Text } from "@revolt/ui";

import envelope from "./envelope.svg";
import wave from "./wave.svg";

/**
 * Container for authentication page flows
 */
export const FlowBase = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-4)",
    flexGrow: 0,
    background: "var(--md-sys-color-surface-container)",
    color: "var(--md-sys-color-on-surface)",
    width: "100%",
    maxWidth: "480px",
    padding: "var(--space-7) var(--space-7)",
    borderRadius: "var(--radius-modal)",
    boxShadow: "var(--elev-3)",
    marginTop: "var(--space-4)",
    marginBottom: "var(--space-4)",
    justifySelf: "center",
    marginInline: "auto",

    "& form": {
      width: "100%",
    },

    _phone: {
      flexGrow: 1,
      maxWidth: "none",
      margin: 0,
      padding: "var(--space-5) var(--space-4)",
      borderRadius: 0,
      boxShadow: "none",
    },
  },
});

/**
 * Wave animation
 * TODO: I don't think this is how you use it
 */
const WaveAnimation = defineKeyframes({
  fadeIn: {
    "0%": { transform: "rotate(0)" },
    "10%": { transform: "rotate(14deg)" },
    "20%": { transform: "rotate(-8deg)" },
    "30%": { transform: "rotate(14deg)" },
    "40%": { transform: "rotate(-4deg)" },
    "50%": { transform: "rotate(10deg)" },
    "60%": { transform: "rotate(0)" },
    "100%": { transform: "rotate(0)" },
  },
});

/**
 * Envelope animation
 * TODO: I don't think this is how you use it
 */
const EnvelopeAnimation = defineKeyframes({
  fadeIn: {
    "0%": {
      opacity: 0,
      transform: "translateY(-24px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(-4px)",
    },
  },
});

/**
 * Wave emoji
 */
const Wave = styled("img", {
  base: {
    height: "1.8em",
    animationDuration: "2.5s",
    animationIterationCount: 1,
    animationName: WaveAnimation,
  },
});

/**
 * Mail emoji
 */
const Mail = styled("img", {
  base: {
    height: "1.8em",
    transform: "translateY(-4px)",
    animationDuration: "0.5s",
    animationIterationCount: 1,
    animationTimingFunction: "ease",
    animationName: EnvelopeAnimation,
  },
});

/**
 * Common flow title component
 */
export function FlowTitle(props: {
  children: JSX.Element;
  subtitle?: JSX.Element;
  emoji?: "wave" | "mail";
}) {
  return (
    <Column>
      <Row align gap="sm">
        <Show when={props.emoji === "wave"}>
          <Wave src={wave} />
        </Show>
        <Show when={props.emoji === "mail"}>
          <Mail src={envelope} />
        </Show>
        <Text class="title" size="large">
          {props.children}
        </Text>
      </Row>
      <Show when={props.subtitle}>
        <Text class="title">{props.subtitle}</Text>
      </Show>
    </Column>
  );
}
