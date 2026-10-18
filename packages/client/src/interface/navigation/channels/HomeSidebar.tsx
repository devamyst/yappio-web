import { Match, Show, Switch, createMemo, splitProps } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { VirtualContainer } from "@minht11/solid-virtual-container";
import { Channel } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { ChannelContextMenu, UserContextMenu } from "@revolt/app";
import { useClient } from "@revolt/client";
import { useDevice } from "@revolt/common";
import { useInstance } from "@revolt/instance";
import Instance from "@revolt/instance/Instance";
import { TextWithEmoji } from "@revolt/markdown";
import { useModals } from "@revolt/modal";
import { useLocation, useNavigate } from "@revolt/routing";
import { useState } from "@revolt/state";
import {
  Avatar,
  Deferred,
  MenuButton,
  OverflowingText,
  Tooltip,
  UserStatus,
  iconSize,
  typography,
} from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import MdClose from "@material-design-icons/svg/outlined/close.svg?component-solid";

import { SidebarBase } from "./common";

interface Props {
  /**
   * Ordered list of conversations
   */
  conversations: () => Channel[];

  /**
   * Current channel ID
   */
  channelId?: string;

  /**
   * Open the saved notes channel
   */
  openSavedNotes: (
    navigate?: ReturnType<typeof useNavigate>,
  ) => string | undefined;
}

/**
 * Display home navigation and conversations
 */
export const HomeSidebar = (props: Props) => {
  const { t } = useLingui();
  const client = useClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal } = useModals();
  const { isMobile } = useDevice();
  const state = useState();
  const instance = useInstance();

  const savedNotesChannelId = createMemo(() => props.openSavedNotes());

  let scrollTargetElement!: HTMLDivElement;

  const pendingRequests = createMemo(() => {
    return client().users.filter((user) => user.relationship === "Incoming")
      .length;
  });

  return (
    <SidebarBase class="channel_bar home">
      <SearchHeader>
        <SearchButton
          type="button"
          onClick={() => openModal({ type: "quick_switcher", client: client() })}
        >
          <Trans>Find or start a conversation</Trans>
        </SearchButton>
      </SearchHeader>
      <div
        ref={scrollTargetElement}
        use:invisibleScrollable
        style={{ "flex-grow": 1 }}
      >
        <List>
          <MenuButton
            href="/friends"
            size="normal"
            icon={<Symbol>group</Symbol>}
            attention={
              Instance.relPath(location.pathname) === "/friends"
                ? "selected"
                : "normal"
            }
          >
            <ButtonTitle>
              <Trans>Friends</Trans>
              <div style={{ flex: "1 1 auto" }} />
              <Show when={pendingRequests()}>
                <PendingBadge>{pendingRequests()}</PendingBadge>
              </Show>
            </ButtonTitle>
          </MenuButton>

          <MenuButton
              href={state.layout.getLastActiveDiscoverPath()}
              size="normal"
              icon={<Symbol>explore</Symbol>}
              attention={
                Instance.relPath(location.pathname).startsWith("/discover")
                  ? "selected"
                  : "normal"
              }
            >
              <ButtonTitle>
                <Trans>Discover</Trans>
              </ButtonTitle>
            </MenuButton>
          

          <Switch
            fallback={
              <MenuButton
                size="normal"
                attention={"normal"}
                icon={<Symbol>note_stack</Symbol>}
                onClick={() => props.openSavedNotes(navigate)}
              >
                <ButtonTitle>
                  <Trans>Saved Notes</Trans>
                </ButtonTitle>
              </MenuButton>
            }
          >
            <Match when={savedNotesChannelId()}>
              <MenuButton
                href={`/channel/${savedNotesChannelId()}`}
                size="normal"
                icon={<Symbol>note_stack</Symbol>}
                attention={
                  props.channelId && savedNotesChannelId() === props.channelId
                    ? "selected"
                    : "normal"
                }
              >
                <ButtonTitle>
                  <Trans>Saved Notes</Trans>
                </ButtonTitle>
              </MenuButton>
            </Match>
          </Switch>

          <Category>
            <Trans>Direct messages</Trans>
            <a
              class={css({ cursor: "pointer" })}
              onClick={() =>
                openModal({
                  type: "create_group",
                  client: client(),
                })
              }
              use:floating={{
                tooltip: {
                  placement: "right",
                  content: t`Create a new group`,
                },
              }}
            >
              <Symbol size={20} marginTop="2px">
                add
              </Symbol>
            </a>
          </Category>

          <Deferred>
            <VirtualContainer
              items={props.conversations()}
              scrollTarget={scrollTargetElement}
              itemSize={{ height: 48 }}
            >
              {(item) => (
                <div
                  style={{
                    ...item.style,
                    width: "100%",
                    "padding-block": "3px",
                  }}
                >
                  <Entry
                    // @ts-expect-error missing type on Entry
                    role="listitem"
                    tabIndex={item.tabIndex}
                    channel={item.item}
                    active={item.item.id === props.channelId}
                    isMobile={isMobile}
                  />
                </div>
              )}
            </VirtualContainer>
          </Deferred>
        </List>
      </div>
    </SidebarBase>
  );
};

const SearchHeader = styled("div", {
  base: {
    height: "var(--layout-height-header)",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    padding: "0 var(--space-2)",
    borderBottom: "var(--hairline)",
  },
});

const SearchButton = styled("button", {
  base: {
    width: "100%",
    height: "32px",
    padding: "0 var(--space-2)",
    textAlign: "left",
    cursor: "pointer",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    fontSize: "13px",
    color: "var(--md-sys-color-on-surface-variant)",
    borderRadius: "var(--radius-control)",
    background: "var(--md-sys-color-surface-container-lowest)",
    transition: "color var(--motion-fast) var(--ease-standard)",

    "&:hover": {
      color: "var(--md-sys-color-on-surface)",
    },
  },
});

/**
 * Button title
 */
const ButtonTitle = styled("div", {
  base: {
    gap: "var(--gap-md)",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
});

const PendingBadge = styled("div", {
  base: {
    ...typography.raw({ class: "label", size: "small" }),
    minWidth: "18px",
    padding: "1px 6px",
    textAlign: "center",
    fontWeight: 700,
    color: "var(--md-sys-color-on-error)",
    background: "var(--md-sys-color-error)",
    borderRadius: "var(--radius-pill)",
  },
});

const Category = styled("div", {
  base: {
    display: "flex",
    paddingInline: "var(--space-3) var(--space-1)",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "var(--space-4)",
    paddingBottom: "var(--space-1)",
    color: "var(--md-sys-color-on-surface)",
    opacity: 0.85,

    ...typography.raw({ class: "label", size: "small" }),
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
});

/**
 * Styles required to correctly display name and status
 */
const NameStatusStack = styled("div", {
  base: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
});

/**
 * Single conversation entry
 */
function Entry(
  props: { channel: Channel; active: boolean; isMobile: boolean } /*& Omit<
    ComponentProps<typeof Link>,
    "href"
  >*/,
) {
  const [local, remote] = splitProps(props, ["channel", "active", "isMobile"]);

  const { t } = useLingui();
  const { openModal } = useModals();

  /**
   * Determine user status if present
   */
  const status = () =>
    local.channel.recipient?.statusMessage((s) =>
      s === "Online"
        ? t`Online`
        : s === "Busy"
          ? t`Busy`
          : s === "Focus"
            ? t`Focus`
            : s === "Idle"
              ? t`Idle`
              : t`Offline`,
    );

  return (
    <MenuButton
      {...remote}
      href={`/channel/${local.channel.id}`}
      size="normal"
      alert={
        !local.active &&
        local.channel.unread &&
        (local.channel.mentions?.size || true)
      }
      attention={
        local.active
          ? "selected"
          : local.channel.muted
            ? "muted"
            : local.channel.unread
              ? "active"
              : "normal"
      }
      icon={
        <Switch>
          <Match when={local.channel.type === "Group"}>
            <Avatar
              size={32}
              shape="rounded-square"
              fallback={local.channel.name}
              src={local.channel.iconURL}
              primaryContrast
            />
          </Match>
          <Match when={local.channel.type === "DirectMessage"}>
            <Avatar
              size={32}
              src={local.channel.iconURL}
              holepunch="bottom-right"
              overlay={
                <UserStatus.Graphic
                  status={local.channel?.recipient?.presence}
                />
              }
            />
          </Match>
        </Switch>
      }
      actions={
        <Show when={!local.isMobile}>
          <a
            onClick={(e) => {
              e.preventDefault();
              openModal({
                type: "delete_channel",
                channel: local.channel,
              });
            }}
          >
            <MdClose {...iconSize("18px")} />
          </a>
        </Show>
      }
      use:floating={{
        contextMenu: () =>
          local.channel.type === "DirectMessage" ? (
            <UserContextMenu
              user={local.channel.recipient!}
              channel={local.channel}
            />
          ) : (
            <ChannelContextMenu channel={local.channel} />
          ),
      }}
    >
      <NameStatusStack>
        <Switch>
          <Match when={local.channel.type === "Group"}>
            <OverflowingText>
              <TextWithEmoji content={local.channel.name!} />
            </OverflowingText>
            <span class={typography({ class: "_status" })}>
              {/* <Plural
                  value={local.channel.recipientIds.size}
                  one="# Member"
                  other="# Members"
                /> */}
              {local.channel.recipientIds.size}{" "}
              {local.channel.recipientIds.size > 1 ? `Members` : "Member"}
            </span>
          </Match>
          <Match when={local.channel.type === "DirectMessage"}>
            <OverflowingText>
              {local.channel?.recipient?.displayName}
            </OverflowingText>
            <Show when={status()}>
              <Tooltip
                content={() => <TextWithEmoji content={status()!} />}
                placement="top-start"
                aria={status()!}
              >
                <OverflowingText class={typography({ class: "_status" })}>
                  <TextWithEmoji content={status()!} />
                </OverflowingText>
              </Tooltip>
            </Show>
          </Match>
        </Switch>
      </NameStatusStack>
    </MenuButton>
  );
}

/**
 * Inner scrollable list
 * We fix the width in order to prevent scrollbar from moving stuff around
 */
const List = styled("div", {
  base: {
    paddingInline: "var(--space-2)",
    width: "100%",
  },
});
