import { For, Show, createMemo, createSignal, onMount } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { Server, ServerMember } from "stoat.js";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { Avatar, Button, CircularProgress, TextField } from "@revolt/ui";

export function ServerMembers(props: { server: Server }) {
  const { t } = useLingui();
  const client = useClient();
  const { openModal, showError } = useModals();
  const [search, setSearch] = createSignal("");
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      await props.server.syncMembers();
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  });

  const members = createMemo(() => {
    const query = search().trim().toLowerCase();
    const out: ServerMember[] = [];

    for (const member of client().serverMembers.values()) {
      if (member.id.server !== props.server.id) continue;
      if (query) {
        const haystack = [
          member.nickname,
          member.user?.displayName,
          member.user?.username,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) continue;
      }
      out.push(member);
    }

    return out.sort((a, b) =>
      (a.nickname ?? a.user?.displayName ?? "").localeCompare(
        b.nickname ?? b.user?.displayName ?? "",
      ),
    );
  });

  const canAct = (member: ServerMember, permission: "KickMembers" | "BanMembers") =>
    !member.user?.self &&
    member.id.user !== props.server.ownerId &&
    props.server.havePermission(permission) &&
    member.inferiorTo(props.server.member!);

  return (
    <Page>
      <TextField
        label={t`Search members`}
        value={search()}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <Count>
        <Trans>{members().length} members</Trans>
      </Count>
      <Show when={loading() && !members().length}>
        <CircularProgress />
      </Show>
      <List>
        <For each={members()}>
          {(member) => (
            <Row>
              <Avatar
                size={40}
                src={member.avatar?.previewUrl ?? member.user?.avatar?.previewUrl}
                fallback={member.nickname ?? member.user?.displayName}
              />
              <Info>
                <Name>{member.nickname ?? member.user?.displayName}</Name>
                <Sub>
                  {member.user?.username}#{member.user?.discriminator}
                </Sub>
                <Chips>
                  <For each={member.orderedRoles.toReversed()}>
                    {(role) => (
                      <Chip>
                        <Dot
                          style={{
                            background:
                              role.colour ??
                              "var(--md-sys-color-outline-variant)",
                          }}
                        />
                        {role.name}
                      </Chip>
                    )}
                  </For>
                </Chips>
              </Info>
              <Actions>
                <Show when={canAct(member, "KickMembers")}>
                  <Button
                    size="xs"
                    variant="tonal"
                    onPress={() => openModal({ type: "kick_member", member })}
                  >
                    <Trans>Kick</Trans>
                  </Button>
                </Show>
                <Show when={canAct(member, "BanMembers")}>
                  <Button
                    size="xs"
                    variant="_error"
                    onPress={() => openModal({ type: "ban_member", member })}
                  >
                    <Trans>Ban</Trans>
                  </Button>
                </Show>
              </Actions>
            </Row>
          )}
        </For>
      </List>
    </Page>
  );
}

const Page = styled("div", {
  base: { display: "flex", flexDirection: "column", gap: "var(--space-2)" },
});

const Count = styled("div", {
  base: {
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".02em",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const List = styled("div", {
  base: { display: "flex", flexDirection: "column", gap: "var(--space-1)" },
});

const Row = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
    padding: "var(--space-2) var(--space-3)",
    borderRadius: "var(--radius-card)",
    background: "var(--md-sys-color-surface-container-high)",
    "@media (max-width: 600px)": { flexWrap: "wrap" },
  },
});

const Info = styled("div", {
  base: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column" },
});

const Name = styled("div", {
  base: {
    fontWeight: 600,
    color: "var(--md-sys-color-on-surface)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

const Sub = styled("div", {
  base: { fontSize: "12px", color: "var(--md-sys-color-on-surface-variant)" },
});

const Chips = styled("div", {
  base: { display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" },
});

const Chip = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "1px 8px",
    fontSize: "12px",
    borderRadius: "var(--radius-pill)",
    border: "1px solid var(--md-sys-color-outline-variant)",
    color: "var(--md-sys-color-on-surface)",
  },
});

const Dot = styled("span", {
  base: { width: "10px", height: "10px", borderRadius: "50%" },
});

const Actions = styled("div", {
  base: { display: "flex", gap: "var(--space-1)", flexShrink: 0 },
});
