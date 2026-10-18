import { For, Show, createMemo } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { ServerMember } from "stoat.js";
import { styled } from "styled-system/jsx";

import { useModals } from "@revolt/modal";

import { Ripple, Text, typography } from "../../design";

import { ProfileCard } from "./ProfileCard";

export function ProfileRoles(props: { member?: ServerMember }) {
  const { openModal } = useModals();

  const visibleRoles = createMemo(() =>
    props.member
      ? props.member.orderedRoles.filter((r) =>
          props.member?.server ? props.member.server.roles.has(r.id) : true,
        )
      : [],
  );

  function openRoles() {
    openModal({ type: "user_profile_roles", member: props.member! });
  }

  return (
    <Show when={visibleRoles().length}>
      <ProfileCard isLink onClick={openRoles}>
        <Ripple />

        <Text class="title" size="large">
          <Trans>Roles</Trans>
        </Text>
        <RoleChips>
          <For each={visibleRoles().toReversed()}>
            {(role) => (
              <Chip>
                <RoleIcon
                  style={{
                    background:
                      role.colour ?? "var(--md-sys-color-outline-variant)",
                  }}
                />
                <Role>{role.name}</Role>
              </Chip>
            )}
          </For>
        </RoleChips>
      </ProfileCard>
    </Show>
  );
}

const RoleChips = styled("div", {
  base: { display: "flex", flexWrap: "wrap", gap: "6px", minWidth: 0 },
});

const Chip = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    maxWidth: "100%",
    padding: "3px 10px",
    borderRadius: "var(--radius-pill)",
    border: "1px solid var(--md-sys-color-outline-variant)",
    background: "var(--md-sys-color-surface-container-high)",
  },
});

const Role = styled("span", {
  base: {
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    ...typography.raw({ class: "label" }),
  },
});

const RoleIcon = styled("div", {
  base: {
    width: "10px",
    height: "10px",
    flexShrink: 0,
    aspectRatio: "1/1",
    borderRadius: "100%",
  },
});
