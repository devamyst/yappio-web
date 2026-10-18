import { Show } from "solid-js";

import { styled } from "styled-system/jsx";

import { Markdown } from "@revolt/markdown";

import { Ripple, typography } from "../../design";

import { CardTitle, ProfileCard } from "./ProfileCard";

interface Props {
  full?: boolean;
  content?: string;
  onClick?: () => void;
}

/**
 * Profile biography
 */
export function ProfileBio(props: Props) {
  return (
    <Show when={props.content}>
      <ProfileCard
        onClick={props.onClick}
        isLink={typeof props.onClick !== "undefined"}
        width={props.full ? 3 : 2}
        constraint={props.full ? undefined : "half"}
      >
        <Show when={props.onClick}>
          <Ripple />
        </Show>

        <CardTitle>
          Bio
        </CardTitle>

        <Bio>
          <Markdown content={props.content} />
        </Bio>
      </ProfileCard>
    </Show>
  );
}

const Bio = styled("span", {
  base: {
    ...typography.raw({ class: "_messages" }),
    userSelect: "text",
    minWidth: 0,
    overflowWrap: "anywhere",

    "& h1, & h2, & h3, & h4, & h5, & h6": {
      lineHeight: 1.25,
      margin: "0.25em 0",
    },
    "& p, & ul, & ol": {
      margin: "0.25em 0",
    },
  },
});
