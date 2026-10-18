import {
  Accessor,
  JSX,
  Match,
  Show,
  Switch,
  createMemo,
  createSignal,
  splitProps,
} from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { VirtualContainer } from "@minht11/solid-virtual-container";
import type { User } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { UserContextMenu } from "@revolt/app";
import { useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useNavigate } from "@revolt/routing";
import {
  Avatar,
  Deferred,
  Header,
  OverflowingText,
  UserStatus,
  main,
} from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import { HeaderIcon } from "./common/CommonHeader";

/**
 * Base layout of the friends page
 */
const Base = styled("div", {
  base: {
    width: "100%",
    display: "flex",
    flexDirection: "column",

    "& .FriendsList": {
      height: "100%",
      paddingInline: "var(--space-4)",
      paddingBottom: "var(--space-4)",
    },
  },
});

/**
 * Friends menu
 */
export function Friends() {
  const { t } = useLingui();
  const client = useClient();
  const { openModal } = useModals();

  /**
   * Reference to the parent scroll container
   */
  let scrollTargetElement!: HTMLDivElement;

  /**
   * Signal required for reacting to ref changes
   */
  const targetSignal = () => scrollTargetElement;

  /**
   * Generate lists of all users
   */
  const lists = createMemo(() => {
    const list = client()!.users.toList();

    const friends = list
      .filter((user) => user.relationship === "Friend")
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return {
      friends,
      online: friends.filter((user) => user.online),
      incoming: list
        .filter((user) => user.relationship === "Incoming")
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
      outgoing: list
        .filter((user) => user.relationship === "Outgoing")
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
      blocked: list
        .filter((user) => user.relationship === "Blocked")
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
    };
  });

  const pending = () => {
    const incoming = lists().incoming;
    return incoming.length > 99 ? "99+" : incoming.length;
  };

  const [page, setPage] = createSignal("online");

  const tabs = [
    { id: "online", label: () => t`Online` },
    { id: "all", label: () => t`All` },
    { id: "pending", label: () => t`Pending` },
    { id: "blocked", label: () => t`Blocked` },
  ];

  return (
    <Base>
      <Header placement="primary">
        <HeaderIcon>
          <Symbol>group</Symbol>
        </HeaderIcon>
        <PhoneHidden>
          <Trans>Friends</Trans>
        </PhoneHidden>
        <TabDivider />
        <Tabs role="tablist">
          {tabs.map((tab) => (
            <Tab
              type="button"
              role="tab"
              aria-selected={page() === tab.id}
              active={page() === tab.id}
              onClick={() => setPage(tab.id)}
            >
              {tab.label()}
              <Show when={tab.id === "pending" && lists().incoming.length}>
                <TabBadge>{pending()}</TabBadge>
              </Show>
              <Show when={tab.id === "online" || tab.id === "all"}>
                <TabCount>
                  {tab.id === "online"
                    ? lists().online.length
                    : lists().friends.length}
                </TabCount>
              </Show>
            </Tab>
          ))}
        </Tabs>
        <AddButton
          type="button"
          aria-label={t`Add friend`}
          onClick={() =>
            openModal({
              type: "add_friend",
              client: client(),
            })
          }
        >
          <PhoneHidden>
            <Trans>Add friend</Trans>
          </PhoneHidden>
          <PhoneOnly>
            <Symbol>person_add</Symbol>
          </PhoneOnly>
        </AddButton>
      </Header>

      <main class={main()}>
        <Deferred>
          <div class="FriendsList" ref={scrollTargetElement} use:scrollable>
            <Switch
              fallback={
                <People
                  title={t`Online`}
                  empty={t`Nobody is online right now.`}
                  users={lists().online}
                  scrollTargetElement={targetSignal}
                />
              }
            >
              <Match when={page() === "all"}>
                <People
                  title={t`All friends`}
                  empty={t`You have not added any friends yet.`}
                  users={lists().friends}
                  scrollTargetElement={targetSignal}
                />
              </Match>
              <Match when={page() === "pending"}>
                <People
                  title={t`Incoming`}
                  empty={t`No incoming requests.`}
                  users={lists().incoming}
                  scrollTargetElement={targetSignal}
                />
                <People
                  title={t`Outgoing`}
                  empty={t`No outgoing requests.`}
                  users={lists().outgoing}
                  scrollTargetElement={targetSignal}
                />
              </Match>
              <Match when={page() === "blocked"}>
                <People
                  title={t`Blocked`}
                  empty={t`You have not blocked anyone.`}
                  users={lists().blocked}
                  scrollTargetElement={targetSignal}
                />
              </Match>
            </Switch>
          </div>
        </Deferred>
      </main>
    </Base>
  );
}

const PhoneHidden = styled("span", {
  base: {
    _phone: {
      display: "none",
    },
  },
});

const PhoneOnly = styled("span", {
  base: {
    display: "none",
    _phone: {
      display: "inline-flex",
    },
  },
});

const TabDivider = styled("div", {
  base: {
    _phone: {
      display: "none",
    },
    width: "1px",
    height: "20px",
    flexShrink: 0,
    background: "var(--md-sys-color-outline-variant)",
  },
});

const Tabs = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-1)",
    flexGrow: 1,
    minWidth: 0,
    overflowX: "auto",
  },
});

const Tab = styled("button", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-1)",
    height: "32px",
    padding: "0 var(--space-3)",
    flexShrink: 0,
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--md-sys-color-on-surface-variant)",
    borderRadius: "var(--radius-pill)",
    transition:
      "background var(--motion-fast) var(--ease-standard), color var(--motion-fast)",

    "&:hover": {
      color: "var(--md-sys-color-on-surface)",
      background: "var(--md-sys-color-surface-container-high)",
    },

    _phone: {
      minHeight: "44px",
      padding: "0 var(--space-2)",
    },
  },
  variants: {
    active: {
      true: {
        fontWeight: 600,
        color: "var(--md-sys-color-on-surface)",
        background:
          "color-mix(in srgb, var(--md-sys-color-primary) 22%, var(--md-sys-color-surface-container-high))",
      },
      false: {},
    },
  },
});

const TabBadge = styled("span", {
  base: {
    minWidth: "18px",
    padding: "0 5px",
    textAlign: "center",
    fontSize: "11px",
    fontWeight: 700,
    lineHeight: "18px",
    color: "var(--md-sys-color-on-error)",
    background: "var(--md-sys-color-error)",
    borderRadius: "var(--radius-pill)",
  },
});

const TabCount = styled("span", {
  base: {
    fontSize: "12px",
    fontWeight: 600,
    opacity: 0.7,

    _phone: {
      display: "none",
    },
  },
});

const AddButton = styled("button", {
  base: {
    height: "32px",
    padding: "0 var(--space-3)",
    flexShrink: 0,
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--md-sys-color-on-primary)",
    background: "var(--md-sys-color-primary)",
    borderRadius: "var(--radius-pill)",
    transition: "filter var(--motion-fast) var(--ease-standard)",

    "&:hover": {
      filter: "brightness(1.08)",
    },

    _phone: {
      minHeight: "44px",
      padding: "0 var(--space-3)",
    },
  },
});

/**
 * List of users
 */
function People(props: {
  users: User[];
  title: string;
  empty: string;
  scrollTargetElement: Accessor<HTMLDivElement>;
}) {
  return (
    <div>
      <SectionHeading>
        {props.title} {"—"} {props.users.length}
      </SectionHeading>

      <Show when={props.users.length === 0}>
        <Empty>
          <Symbol size={48}>sentiment_neutral</Symbol>
          <span>{props.empty}</span>
        </Empty>
      </Show>

      <VirtualContainer
        items={props.users}
        scrollTarget={props.scrollTargetElement()}
        itemSize={{ height: 72 }}
      >
        {(item) => (
          <ContainerListEntry
            style={{
              ...item.style,
            }}
          >
            <Entry
              role="listitem"
              tabIndex={item.tabIndex}
              style={item.style}
              user={item.item}
            />
          </ContainerListEntry>
        )}
      </VirtualContainer>
    </div>
  );
}

const SectionHeading = styled("div", {
  base: {
    padding: "var(--space-4) var(--space-2) var(--space-2)",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const Empty = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "var(--space-7) var(--space-4)",
    textAlign: "center",
    color: "var(--md-sys-color-on-surface-variant)",
    borderRadius: "var(--radius-card)",
    border: "1px dashed var(--md-sys-color-outline-variant)",
    background:
      "radial-gradient(60% 80% at 50% 0%, color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent), transparent)",
  },
});

const ContainerListEntry = styled("div", {
  base: {
    width: "100%",
  },
});

const rowStyle = css({
  height: "64px",
  display: "flex",
  alignItems: "center",
  gap: "var(--space-3)",
  padding: "0 var(--space-3)",
  marginBottom: "8px",
  cursor: "pointer",
  color: "var(--md-sys-color-on-surface)",
  borderRadius: "var(--radius-card)",
  border: "1px solid var(--md-sys-color-outline-variant)",
  background: "var(--md-sys-color-surface-container-low)",
  transition:
    "background var(--motion-fast) var(--ease-standard), transform var(--motion-fast) var(--ease-standard), border-color var(--motion-fast) var(--ease-standard)",

  "&:hover": {
    background: "var(--md-sys-color-surface-container-high)",
    transform: "translateY(-1px)",
    borderColor: "color-mix(in srgb, var(--md-sys-color-primary) 40%, transparent)",
  },

  "&:hover [data-actions], &:focus-within [data-actions]": {
    opacity: 1,
  },

  "@media (prefers-reduced-motion: reduce)": {
    "&:hover": { transform: "none" },
  },
});

const Names = styled("div", {
  base: {
    flexGrow: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.3,
  },
});

const StatusLine = styled("span", {
  base: {
    fontSize: "12px",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const RowActions = styled("div", {
  base: {
    display: "flex",
    gap: "var(--space-1)",
    opacity: 0,
    transition: "opacity var(--motion-fast) var(--ease-standard)",

    "&:has([data-tone=accept])": { opacity: 1 },

    _phone: {
      opacity: 1,
    },
  },
});

const RoundButton = styled("button", {
  base: {
    width: "36px",
    height: "36px",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    color: "var(--md-sys-color-on-surface-variant)",
    borderRadius: "50%",
    background: "var(--md-sys-color-surface-container-highest)",
    transition: "color var(--motion-fast) var(--ease-standard), background var(--motion-fast) var(--ease-standard)",

    "&:hover": {
      color: "var(--md-sys-color-on-surface)",
    },
    "&[data-tone=accept]": {
      color: "var(--md-sys-color-on-primary)",
      background: "var(--md-sys-color-primary)",
    },
    "&[data-tone=decline]:hover": {
      color: "var(--md-sys-color-on-error)",
      background: "var(--md-sys-color-error)",
    },

    _phone: {
      width: "44px",
      height: "44px",
    },
  },
});

/**
 * Single user entry
 */
function Entry(
  props: { user: User } & Omit<
    JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  >,
) {
  const { t } = useLingui();
  const { openModal } = useModals();
  const navigate = useNavigate();
  const [local, remote] = splitProps(props, ["user"]);

  const statusText = () => {
    switch (local.user.relationship) {
      case "Incoming":
        return t`Incoming friend request`;
      case "Outgoing":
        return t`Outgoing friend request`;
      case "Blocked":
        return t`Blocked`;
      default:
        return (
          local.user.status?.text ??
          (local.user.online && local.user.presence !== "Invisible"
            ? local.user.presence
            : t`Offline`)
        );
    }
  };

  return (
    <a
      {...remote}
      class={rowStyle}
      use:floating={{
        contextMenu: () => <UserContextMenu user={local.user} />,
      }}
      onClick={() => openModal({ type: "user_profile", user: local.user })}
    >
      <Avatar
        size={36}
        src={local.user.animatedAvatarURL}
        fallback={local.user.displayName}
        holepunch={
          local.user.relationship === "Friend" ? "bottom-right" : "none"
        }
        overlay={
          <Show when={local.user.relationship === "Friend"}>
            <UserStatus.Graphic status={local.user.presence} />
          </Show>
        }
      />
      <Names>
        <OverflowingText>{local.user.displayName}</OverflowingText>
        <StatusLine>{statusText()}</StatusLine>
      </Names>
      <RowActions data-actions="">
        <Show when={local.user.relationship === "Incoming"}>
          <RoundButton
            type="button"
            data-tone="accept"
            title={t`Accept`}
            aria-label={t`Accept`}
            onClick={(e) => {
              e.stopPropagation();
              local.user.addFriend();
            }}
          >
            <Symbol size={20}>check</Symbol>
          </RoundButton>
        </Show>
        <Show
          when={
            local.user.relationship === "Incoming" ||
            local.user.relationship === "Outgoing"
          }
        >
          <RoundButton
            type="button"
            data-tone="decline"
            title={
              local.user.relationship === "Incoming" ? t`Decline` : t`Cancel`
            }
            aria-label={
              local.user.relationship === "Incoming" ? t`Decline` : t`Cancel`
            }
            onClick={(e) => {
              e.stopPropagation();
              local.user.removeFriend();
            }}
          >
            <Symbol size={20}>close</Symbol>
          </RoundButton>
        </Show>
        <Show when={local.user.relationship === "Friend"}>
          <RoundButton
            type="button"
            title={t`Message`}
            aria-label={t`Message`}
            onClick={(e) => {
              e.stopPropagation();
              local.user.openDM().then((channel) => navigate(channel.path));
            }}
          >
            <Symbol size={20}>chat_bubble</Symbol>
          </RoundButton>
        </Show>
        <RoundButton
          type="button"
          title={t`More`}
          aria-label={t`More`}
          onClick={(e) => {
            e.stopPropagation();
            openModal({ type: "user_profile", user: local.user });
          }}
        >
          <Symbol size={20}>more_vert</Symbol>
        </RoundButton>
      </RowActions>
    </a>
  );
}
