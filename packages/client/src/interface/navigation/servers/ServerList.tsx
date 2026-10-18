import { Accessor, For, JSX, Show, createMemo } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { Channel, Server, User } from "stoat.js";
import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { useDevice } from "@revolt/common";
import { useInstance } from "@revolt/instance";
import { KeybindAction, createKeybind } from "@revolt/keybinds";
import { useNavigate } from "@revolt/routing";
import { useState } from "@revolt/state";
import { Column, Text, Time } from "@revolt/ui";
import { Initials } from "@revolt/ui/components/utils";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import { Tooltip } from "../../../../components/ui/components/floating";
import { Draggable } from "../../../../components/ui/components/utils/Draggable";

interface Props {
  /**
   * Ordered server list
   */
  orderedServers: Server[];

  /**
   * Set server ordering
   * @param ids List of IDs
   */
  setServerOrder: (ids: string[]) => void;

  /**
   * Unread conversations list
   */
  unreadConversations: Channel[];

  /**
   * Current logged in user
   */
  user: User;

  /**
   * Selected server id
   */
  selectedServer: Accessor<string | undefined>;

  /**
   * Create or join server
   */
  onCreateOrJoinServer(): void;

  /**
   * Menu generator
   */
  menuGenerator: (target: Server | Channel) => JSX.Directives["floating"];
}

/**
 * Server list sidebar component
 */
export const ServerList = (props: Props) => {
  const state = useState();
  const client = useClient();
  const navigate = useNavigate();
  const { isMobile } = useDevice();
  const instance = useInstance();

  const navigateServer = (byOffset: number) => {
    const serverId = props.selectedServer();
    if (serverId == null && props.orderedServers.length) {
      if (byOffset === 1) {
        navigate(`/server/${props.orderedServers[0].id}`);
      } else {
        navigate(
          `/server/${props.orderedServers[props.orderedServers.length - 1].id}`,
        );
      }
      return;
    }

    const currentServerIndex = props.orderedServers.findIndex(
      (server) => server.id === serverId,
    );

    const nextIndex = currentServerIndex + byOffset;

    if (nextIndex === -1) {
      return navigate("/app");
    }

    // this will wrap the index around
    const nextServer = props.orderedServers.at(
      nextIndex % props.orderedServers.length,
    );

    if (nextServer) {
      navigate(`/server/${nextServer.id}`);
    }
  };

  createKeybind(KeybindAction.NAVIGATION_SERVER_UP, () => navigateServer(-1));
  createKeybind(KeybindAction.NAVIGATION_SERVER_DOWN, () => navigateServer(1));

  const homeNotifications = createMemo(() => {
    return client().users.filter((user) => user.relationship === "Incoming")
      .length;
  });

  const dmAvatar = (conversation: Channel) =>
    conversation.iconURL ?? conversation.recipient?.avatarURL;

  return (
    <ServerListBase>
      <div use:invisibleScrollable={{ direction: "y", class: listBase() }}>
        <Tooltip
          placement="right"
          content={`You have ${homeNotifications()} pending friend requests.`}
        >
          <a
            class={entryContainer({
              indicator: !props.selectedServer() ? "selected" : undefined,
            })}
            href="/app"
          >
            <TileWrap>
              <Tile data-tile="" selected={!props.selectedServer()} brand>
                <LogoImage src="/assets/web/yappio-192.png" />
              </Tile>
              <Show when={homeNotifications()}>
                <Badge>{homeNotifications() > 99 ? "99+" : homeNotifications()}</Badge>
              </Show>
            </TileWrap>
          </a>
        </Tooltip>
        <For each={props.unreadConversations.slice(0, 9)}>
          {(conversation) => (
            <Tooltip placement="right" content={conversation.displayName}>
              <a
                class={entryContainer({ indicator: "alert" })}
                use:floating={props.menuGenerator(conversation)}
                href={`/channel/${conversation.id}`}
              >
                <TileWrap>
                  <Tile data-tile="">
                    <Show
                      when={dmAvatar(conversation)}
                      fallback={
                        <Initials
                          input={
                            conversation.name ??
                            conversation.recipient?.username ??
                            ""
                          }
                          maxLength={2}
                        />
                      }
                    >
                      <TileImage src={dmAvatar(conversation)} draggable={false} />
                    </Show>
                  </Tile>
                  <Show when={(conversation.mentions?.size ?? 0) > 0}>
                    <Badge>{conversation.mentions?.size}</Badge>
                  </Show>
                </TileWrap>
              </a>
            </Tooltip>
          )}
        </For>
        <Show when={props.unreadConversations.length > 9}>
          <a class={entryContainer()} href={`/`}>
            <TileWrap>
              <Tile data-tile="">+{props.unreadConversations.length - 9}</Tile>
            </TileWrap>
          </a>
        </Show>
        <LineDivider />
        <Draggable
          type="servers"
          items={props.orderedServers}
          onChange={props.setServerOrder}
          //TODO - No channel ordering on mobile due to usability issue
          //Consider adding a way to enable reordering in user settings
          disabled={isMobile}
        >
          {(entry) => (
            <Tooltip
              placement="right"
              content={() => (
                <Column>
                  <Text class="label" size="large">
                    {entry.item.name}
                  </Text>{" "}
                  <Show when={state.notifications.isMuted(entry.item)}>
                    <Text class="label" size="small">
                      <Show
                        when={
                          state.notifications.getServerMute(entry.item)!.until
                        }
                        fallback={<Trans>Muted</Trans>}
                      >
                        <Trans>
                          Muted until{" "}
                          <Time
                            format="datetime"
                            value={
                              state.notifications.getServerMute(entry.item)!
                                .until
                            }
                          />
                        </Trans>
                      </Show>
                    </Text>
                  </Show>
                </Column>
              )}
              aria={entry.item.name}
            >
              <div
                class={entryContainer({
                  indicator:
                    props.selectedServer() === entry.item.id
                      ? "selected"
                      : entry.item.unread &&
                          !state.notifications.isMuted(entry.item)
                        ? "alert"
                        : undefined,
                })}
                use:floating={props.menuGenerator(entry.item)}
              >
                <a href={state.layout.getLastActiveServerPath(entry.item.id)}>
                  <TileWrap>
                    <Tile data-tile="" selected={props.selectedServer() === entry.item.id}>
                      <Show
                        when={entry.item.iconURL}
                        fallback={
                          <Initials input={entry.item.name} maxLength={2} />
                        }
                      >
                        <TileImage src={entry.item.iconURL} draggable={false} />
                      </Show>
                    </Tile>
                    <Show when={entry.item.mentions.length}>
                      <Badge>{entry.item.mentions.length}</Badge>
                    </Show>
                    <Show when={entry.item.voiceStatus !== "none"}>
                      <VoiceDot>
                        <Symbol size={12}>volume_up</Symbol>
                      </VoiceDot>
                    </Show>
                  </TileWrap>
                </a>
              </div>
            </Tooltip>
          )}
        </Draggable>
        <Tooltip placement="right" content={"Create or join a server"}>
          <a
            class={entryContainer()}
            onClick={() => props.onCreateOrJoinServer()}
          >
            <TileWrap>
              <Tile data-tile="" action>
                <Symbol size={24}>add</Symbol>
              </Tile>
            </TileWrap>
          </a>
        </Tooltip>
        <Tooltip placement="right" content={"Find new servers to join"}>
            <a
              href={state.layout.getLastActiveDiscoverPath()}
              class={entryContainer()}
            >
              <TileWrap>
                <Tile data-tile="" action>
                  <Symbol size={24}>explore</Symbol>
                </Tile>
              </TileWrap>
            </a>
          </Tooltip>
        
      </div>
    </ServerListBase>
  );
};

const ServerListBase = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    width: "var(--layout-width-server-list)",
    paddingTop: "var(--space-2)",
    background: "var(--md-sys-color-surface-container-lowest)",

    fill: "var(--md-sys-color-on-surface)",

    _phone: {
      minHeight: 0,
    },
  },
});

const listBase = cva({
  base: {
    flexGrow: 1,
    paddingBottom: "var(--space-2)",
  },
});

const entryContainer = cva({
  base: {
    width: "var(--layout-width-server-list)",
    height: "56px",
    position: "relative",
    display: "grid",
    flexShrink: 0,
    placeItems: "center",
    cursor: "pointer",

    "&:before": {
      content: "' '",
      position: "absolute",
      width: "4px",
      height: "0px",
      transition:
        "height var(--motion-med) var(--ease-emph), opacity var(--motion-fast)",
      left: 0,
      borderRadius: "0 4px 4px 0",
      background: "var(--md-sys-color-on-surface)",
    },

    "&:hover:before": {
      height: "20px",
    },

    "&:hover [data-tile]": {
      borderRadius: "var(--radius-server)",
    },
  },
  variants: {
    indicator: {
      selected: {
        "&:before": {
          height: "40px !important",
        },
      },
      alert: {
        "&:before": {
          height: "8px",
        },
      },
    },
  },
});

const TileWrap = styled("div", {
  base: {
    position: "relative",
    width: "48px",
    height: "48px",
  },
});

const Tile = styled("div", {
  base: {
    width: "48px",
    height: "48px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 600,
    userSelect: "none",
    borderRadius: "50%",
    transition:
      "border-radius var(--motion-med) var(--ease-emph), background var(--motion-med) var(--ease-standard), color var(--motion-fast)",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-high)",
  },
  variants: {
    selected: {
      true: {
        borderRadius: "var(--radius-server)",
        background: "var(--md-sys-color-surface-container-highest)",
      },
      false: {},
    },
    brand: {
      true: {},
      false: {},
    },
    action: {
      true: {
        color: "var(--brand-presence-online)",

        "&:hover": {
          color: "white",
          background: "var(--brand-presence-online)",
        },
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      brand: true,
      selected: true,
      css: {
        background: "var(--md-sys-color-primary)",
      },
    },
  ],
});

const TileImage = styled("img", {
  base: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});

const LogoImage = styled("img", {
  base: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});

const Badge = styled("div", {
  base: {
    position: "absolute",
    right: "-4px",
    bottom: "-4px",
    minWidth: "20px",
    height: "20px",
    padding: "0 5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-pill)",
    border: "3px solid var(--md-sys-color-surface-container-lowest)",
    boxSizing: "content-box",
    fontSize: "11px",
    fontWeight: 700,
    lineHeight: 1,
    pointerEvents: "none",
    color: "var(--md-sys-color-on-error)",
    background: "var(--md-sys-color-error)",
  },
});

const VoiceDot = styled("div", {
  base: {
    position: "absolute",
    left: "-4px",
    bottom: "-4px",
    width: "18px",
    height: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    border: "3px solid var(--md-sys-color-surface-container-lowest)",
    boxSizing: "content-box",
    pointerEvents: "none",
    color: "white",
    background: "var(--brand-presence-online)",
  },
});

const LineDivider = styled("div", {
  base: {
    height: "2px",
    flexShrink: 0,
    margin: "var(--space-1) auto var(--space-2)",
    width: "32px",
    borderRadius: "var(--radius-pill)",
    background: "var(--md-sys-color-outline-variant)",
  },
});
