import {
  For,
  Show,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { Server, ServerMember } from "stoat.js";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { Avatar, CircularProgress, Symbol, TextField } from "@revolt/ui";

import {
  ContextMenu,
  ContextMenuButton,
  ContextMenuDivider,
} from "../../../../menus/ContextMenu";

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

  const [menuFor, setMenuFor] = createSignal<string>();

  const closeMenu = () => setMenuFor(undefined);
  const closeOnOutside = (event: PointerEvent) => {
    if (!(event.target as Element).closest("[data-member-actions]")) closeMenu();
  };
  onMount(() => document.addEventListener("pointerdown", closeOnOutside));
  onCleanup(() => document.removeEventListener("pointerdown", closeOnOutside));

  const isOwner = () => !!props.server.owner?.self;

  const outranks = (member: ServerMember) =>
    !member.user?.self &&
    member.id.user !== props.server.ownerId &&
    member.inferiorTo(props.server.member!);

  const canRoles = (member: ServerMember) =>
    isOwner() ||
    (props.server.havePermission("AssignRoles") && outranks(member));

  const canNickname = (member: ServerMember) =>
    member.user?.self
      ? props.server.havePermission("ChangeNickname") ||
        props.server.havePermission("ChangeAvatar")
      : (props.server.havePermission("ManageNicknames") ||
          props.server.havePermission("RemoveAvatars")) &&
        outranks(member);

  const canAct = (
    member: ServerMember,
    permission: "KickMembers" | "BanMembers" | "TimeoutMembers",
  ) => props.server.havePermission(permission) && outranks(member);

  const isTimedOut = (member: ServerMember) =>
    !!member.timeout && member.timeout > new Date();

  const hasActions = (member: ServerMember) =>
    canRoles(member) ||
    canNickname(member) ||
    canAct(member, "TimeoutMembers") ||
    canAct(member, "KickMembers") ||
    canAct(member, "BanMembers");

  const act = (fn: () => void) => {
    closeMenu();
    fn();
  };

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
              <Show when={isTimedOut(member)}>
                <TimedOut>
                  <Symbol size={14}>timer</Symbol>
                  <Trans>Timed out</Trans>
                </TimedOut>
              </Show>
              <Show when={hasActions(member)}>
                <Actions data-member-actions="">
                  <MenuTrigger
                    type="button"
                    aria-label={t`Member actions`}
                    onClick={() =>
                      setMenuFor(menuFor() === member.id.user ? undefined : member.id.user)
                    }
                  >
                    <Symbol size={20}>more_vert</Symbol>
                  </MenuTrigger>
                  <Show when={menuFor() === member.id.user}>
                    <Dropdown>
                      <ContextMenu>
                        <Show when={canRoles(member)}>
                          <ContextMenuButton
                            onClick={() =>
                              act(() =>
                                openModal({
                                  type: "user_profile_roles",
                                  member,
                                }),
                              )
                            }
                          >
                            <Trans>Roles</Trans>
                          </ContextMenuButton>
                        </Show>
                        <Show when={canNickname(member)}>
                          <ContextMenuButton
                            onClick={() =>
                              act(() =>
                                openModal({ type: "server_identity", member }),
                              )
                            }
                          >
                            <Trans>Nickname</Trans>
                          </ContextMenuButton>
                        </Show>
                        <Show
                          when={
                            canAct(member, "TimeoutMembers") ||
                            canAct(member, "KickMembers") ||
                            canAct(member, "BanMembers")
                          }
                        >
                          <ContextMenuDivider />
                        </Show>
                        <Show when={canAct(member, "TimeoutMembers")}>
                          <Show
                            when={isTimedOut(member)}
                            fallback={
                              <ContextMenuButton
                                onClick={() =>
                                  act(() =>
                                    openModal({ type: "timeout_member", member }),
                                  )
                                }
                              >
                                <Trans>Timeout</Trans>
                              </ContextMenuButton>
                            }
                          >
                            <ContextMenuButton
                              onClick={() =>
                                act(() =>
                                  member.removeTimeout().catch(showError),
                                )
                              }
                            >
                              <Trans>Remove timeout</Trans>
                            </ContextMenuButton>
                          </Show>
                        </Show>
                        <Show when={canAct(member, "KickMembers")}>
                          <ContextMenuButton
                            destructive
                            onClick={() =>
                              act(() =>
                                openModal({ type: "kick_member", member }),
                              )
                            }
                          >
                            <Trans>Kick</Trans>
                          </ContextMenuButton>
                        </Show>
                        <Show when={canAct(member, "BanMembers")}>
                          <ContextMenuButton
                            destructive
                            onClick={() =>
                              act(() =>
                                openModal({ type: "ban_member", member }),
                              )
                            }
                          >
                            <Trans>Ban</Trans>
                          </ContextMenuButton>
                        </Show>
                      </ContextMenu>
                    </Dropdown>
                  </Show>
                </Actions>
              </Show>
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
  base: { position: "relative", display: "flex", flexShrink: 0 },
});

const MenuTrigger = styled("button", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    background: "transparent",
    color: "var(--md-sys-color-on-surface-variant)",
    "&:hover": {
      background: "var(--md-sys-color-surface-container-highest)",
      color: "var(--md-sys-color-on-surface)",
    },
  },
});

const Dropdown = styled("div", {
  base: {
    position: "absolute",
    top: "100%",
    insetInlineEnd: 0,
    zIndex: 50,
  },
});

const TimedOut = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flexShrink: 0,
    fontSize: "12px",
    color: "var(--md-sys-color-error)",
  },
});
