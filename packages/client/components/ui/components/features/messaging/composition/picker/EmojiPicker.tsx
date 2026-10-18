import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";

import { VirtualContainer } from "@minht11/solid-virtual-container";
import { Emoji as StoatEmoji, Server } from "stoat.js";
import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { Emoji } from "@revolt/markdown";
import { UnicodeEmoji } from "@revolt/markdown/emoji";
import { UNICODE_EMOJI_PACK_PUA } from "@revolt/markdown/emoji/UnicodeEmoji";
import { useState } from "@revolt/state";
import { Avatar, Ripple } from "@revolt/ui/components/design";
import { Row } from "@revolt/ui/components/layout";
import { iconSize } from "@revolt/ui/components/utils";

import MdEmojiEmotions from "@material-design-icons/svg/outlined/emoji_emotions.svg?component-solid";
import MdSchedule from "@material-design-icons/svg/outlined/schedule.svg?component-solid";
import MdSearch from "@material-design-icons/svg/outlined/search.svg?component-solid";

import emojiMapping from "../../../../../emojiMapping.json";

import { Trans, useLingui } from "@lingui/solid/macro";
import {
  CompositionMediaPickerContext,
  compositionContent,
} from "./CompositionMediaPicker";
import { isCustomEmojiId, pushRecentEmoji, recentEmoji } from "./recentEmoji";

type Item =
  | {
      /**
       * Server header
       */
      t: 0;
      server: Server;
    }
  | {
      /**
       * Spacing element
       */
      t: 1;
    }
  | {
      /**
       * Custom emoji
       */
      t: 2;
      emoji: StoatEmoji;
    }
  | {
      /**
       * Title header
       */
      t: 3;
      title: string;
    }
  | {
      /**
       * Unicode emoji
       */
      t: 4;
      name: string;
      text: string;
    }
  | {
      /**
       * Recently used emoji, stored as a reaction string
       */
      t: 5;
      value: string;
    };

const MAX_COLUMNS = 9;

const [hoveredItem, setHoveredItem] = createSignal<Item | null>(null);

export function EmojiPicker() {
  const client = useClient();
  const { ordering, settings } = useState();
  const { t } = useLingui();

  const [filter, setFilter] = createSignal("");

  let emojiScrollTargetElement!: HTMLDivElement;

  const [columns, setColumns] = createSignal(MAX_COLUMNS);

  onMount(() => {
    const observer = new ResizeObserver(() => {
      const width = emojiScrollTargetElement.clientWidth;
      if (width > 0) {
        setColumns(Math.max(5, Math.min(MAX_COLUMNS, Math.floor(width / 40))));
      }
    });
    observer.observe(emojiScrollTargetElement);
    onCleanup(() => observer.disconnect());
  });

  function scrollToItem(pred: (item: Item) => boolean) {
    const idx = items().findIndex(pred);
    if (idx !== -1 && emojiScrollTargetElement) {
      emojiScrollTargetElement.scrollTop = Math.floor(idx / columns()) * 40;
    }
  }

  const items = createMemo(() => {
    const filterText = filter().toLowerCase();

    if (filterText) {
      return [
        ...ordering
          .orderedServers(client())
          .flatMap((server) =>
            server.emojis
              .filter((emoji) => emoji.name.toLowerCase().includes(filterText))
              .map((emoji) => ({ t: 2, emoji })),
          ),
        ...Object.entries(emojiMapping)
          .filter(([name]) => name.toLowerCase().includes(filterText))
          .map(([name, text]) => ({ t: 4, name, text })),
      ] as Item[];
    }

    const items: Item[] = [];

    if (recentEmoji().length > 0) {
      items.push({ t: 3, title: t`Recently used` });

      while (items.length % columns()) {
        items.push({ t: 1 });
      }

      for (const value of recentEmoji()) {
        items.push({ t: 5, value });
      }

      while (items.length % columns()) {
        items.push({ t: 1 });
      }
    }

    for (const server of ordering.orderedServers(client())) {
      const emojis = server.emojis;

      if (emojis.length === 0) continue;

      items.push({
        t: 0,
        server,
      });

      while (items.length % columns()) {
        items.push({ t: 1 });
      }

      for (const emoji of emojis) {
        items.push({ t: 2, emoji });
      }

      while (items.length % columns()) {
        items.push({ t: 1 });
      }
    }

    items.push({
      t: 3,
      title: t`Default`,
    });

    while (items.length % columns()) {
      items.push({ t: 1 });
    }

    for (const emoji of Object.entries(emojiMapping)) {
      items.push({
        t: 4,
        name: emoji[0],
        text: emoji[1] as string,
      });
    }

    return items;
  });

  createEffect(() => {
    if (hoveredItem() !== null) return;
    const first =
      items().find((item) => item.t === 2 || item.t === 4 || item.t === 5) ??
      null;
    setHoveredItem(first);
  });

  return (
    <Stack>
      <SearchWrap>
        <MdSearch {...iconSize(18)} />
        <SearchInput
          autofocus
          type="search"
          placeholder={t`Search for emojis...`}
          aria-label={t`Search for emojis`}
          value={filter()}
          onInput={(e) => setFilter(e.currentTarget.value)}
        />
      </SearchWrap>
      <Show when={!filter()}>
        <TabStrip role="tablist">
          <Show when={recentEmoji().length > 0}>
            <TabButton
              role="tab"
              aria-label={t`Recently used`}
              onClick={() => scrollToItem((i) => i.t === 3)}
            >
              <MdSchedule {...iconSize(20)} />
            </TabButton>
          </Show>
          <For
            each={ordering
              .orderedServers(client())
              .filter((s) => s.emojis.length > 0)}
          >
            {(server) => (
              <TabButton
                role="tab"
                aria-label={server.name}
                onClick={() =>
                  scrollToItem((i) => i.t === 0 && i.server.id === server.id)
                }
              >
                <Avatar
                  size={22}
                  src={server.animatedIconURL}
                  fallback={server.name}
                />
              </TabButton>
            )}
          </For>
          <TabButton
            role="tab"
            aria-label={t`Default`}
            onClick={() =>
              scrollToItem((i) => i.t === 3 && i.title === t`Default`)
            }
          >
            <MdEmojiEmotions {...iconSize(20)} />
          </TabButton>
        </TabStrip>
      </Show>
      <Row gap={"none"} class={compositionContent()}>
        <EmojiListColumn>
          <div
            ref={emojiScrollTargetElement}
            use:invisibleScrollable={{
              class: scrollContainer({ component: "emoji" }),
            }}
          >
            <VirtualContainer
              items={items()}
              scrollTarget={emojiScrollTargetElement}
              itemSize={{ height: 40, width: 40 }}
              crossAxisCount={columns}
            >
              {EmojiItem}
            </VirtualContainer>
          </div>

          <EmojiPreviewBar>
            <Show when={hoveredItem()}>
              {(item) => (
                <>
                  <Row align gap="sm" style={{ flex: 1, "min-width": 0 }}>
                    <PreviewEmoji>
                      <Switch>
                        <Match when={item().t === 2}>
                          <img src={(item() as Item & { t: 2 }).emoji.url} />
                        </Match>
                        <Match when={item().t === 4}>
                          <UnicodeEmoji
                            emoji={(item() as Item & { t: 4 }).text}
                            pack={settings.getValue("appearance:unicode_emoji")}
                          />
                        </Match>
                        <Match when={item().t === 5}>
                          <Emoji emoji={(item() as Item & { t: 5 }).value} />
                        </Match>
                      </Switch>
                    </PreviewEmoji>
                    <div>
                      <PreviewName>
                        <Switch>
                          <Match when={item().t === 2}>
                            :{(item() as Item & { t: 2 }).emoji.name}:
                          </Match>
                          <Match when={item().t === 4}>
                            :{(item() as Item & { t: 4 }).name}:
                          </Match>
                          <Match when={item().t === 5}>
                            <Trans>Recently used</Trans>
                          </Match>
                        </Switch>
                      </PreviewName>
                      <Show when={item().t === 2}>
                        <PreviewFrom>
                          <Trans>from </Trans>
                          <strong>
                            {(() => {
                              const parent = (item() as Item & { t: 2 }).emoji
                                .parent;
                              return parent.type === "Server"
                                ? (client().servers.get(parent.id)?.name ??
                                    t`Unknown Server`)
                                : t`Unknown Server`;
                            })()}
                          </strong>
                        </PreviewFrom>
                      </Show>
                    </div>
                  </Row>

                  {/* Extracted Server Avatar logic */}
                  <Show
                    when={
                      item().t === 2 &&
                      (item() as Item & { t: 2 }).emoji.parent.type === "Server"
                    }
                  >
                    {(() => {
                      const parent = (item() as Item & { t: 2 }).emoji.parent;

                      const server =
                        parent.type === "Server"
                          ? client().servers.get(parent.id)
                          : null;

                      return (
                        <Avatar
                          size={24}
                          src={server?.animatedIconURL}
                          fallback={server?.name ?? ""}
                        />
                      );
                    })()}
                  </Show>
                </>
              )}
            </Show>
          </EmojiPreviewBar>
        </EmojiListColumn>
      </Row>
    </Stack>
  );
}

const Stack = styled("div", {
  base: {
    minHeight: 0,
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
    paddingInline: "var(--space-3)",
  },
});

const SearchWrap = styled("label", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    height: "36px",
    flexShrink: 0,
    paddingInline: "var(--space-3)",
    borderRadius: "var(--radius-control)",
    border: "var(--hairline)",
    color: "var(--md-sys-color-on-surface-variant)",
    fill: "var(--md-sys-color-on-surface-variant)",
    background: "var(--md-sys-color-surface-container-highest)",
    transition: "border-color var(--motion-fast) var(--ease-standard)",
    _focusWithin: {
      borderColor: "var(--md-sys-color-primary)",
      boxShadow:
        "0 0 0 3px color-mix(in srgb, var(--md-sys-color-primary) 28%, transparent)",
    },
  },
});

const SearchInput = styled("input", {
  base: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    color: "var(--md-sys-color-on-surface)",
    fontSize: "0.875rem",
    "&::placeholder": {
      color: "var(--md-sys-color-on-surface-variant)",
    },
  },
});

const TabStrip = styled("div", {
  base: {
    display: "flex",
    flexShrink: 0,
    gap: "var(--space-1)",
    overflowX: "auto",
    paddingBottom: "var(--space-2)",
    borderBottom: "var(--hairline)",
    scrollbarWidth: "none",
  },
});

const TabButton = styled("button", {
  base: {
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    width: "34px",
    height: "34px",
    cursor: "pointer",
    border: "none",
    borderRadius: "var(--radius-control)",
    background: "transparent",
    fill: "var(--md-sys-color-on-surface-variant)",
    transition: "var(--transitions-fast) all",
    _hover: {
      fill: "var(--md-sys-color-primary)",
      background:
        "color-mix(in srgb, var(--md-sys-color-primary) 16%, transparent)",
    },
    _focusVisible: {
      outline: "2px solid var(--md-sys-color-primary)",
    },
  },
});

const scrollContainer = cva({
  base: {},
  variants: {
    component: {
      emoji: {
        flexGrow: 1,
      },
    },
  },
});

const EmojiPreviewBar = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "var(--gap-xs) var(--gap-md)",
    minHeight: "36px",
    flexShrink: 0,
    gap: "var(--gap-sm)",
  },
});

const EmojiListColumn = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
});

const PreviewEmoji = styled("div", {
  base: {
    width: "24px",
    height: "24px",
    flexShrink: 0,
    "--emoji-size": "24px",

    "& img": {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },
  },
});

const PreviewName = styled("span", {
  base: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "var(--colour-foreground)",
    lineHeight: 1.2,
  },
});

const PreviewFrom = styled("span", {
  base: {
    display: "block",
    fontSize: "0.75rem",
    color: "var(--colour-foreground-muted)",
    marginTop: "1px",

    "& strong": {
      color: "var(--colour-foreground-secondary)",
      fontWeight: 500,
    },
  },
});

const EmojiItem = (props: { style: unknown; tabIndex: number; item: Item }) => {
  const state = useState();
  const { onTextReplacement } = useContext(CompositionMediaPickerContext);

  return (
    <EmojiOption
      style={props.style as never}
      type={props.item.t}
      tabIndex={props.tabIndex}
      role="listitem"
      onClick={() => {
        const pua =
          UNICODE_EMOJI_PACK_PUA[
            state.settings.getValue("appearance:unicode_emoji")!
          ] ?? "";

        if (props.item.t === 2) {
          pushRecentEmoji(props.item.emoji.id);
          onTextReplacement(`:${props.item.emoji.id}:`);
        }

        if (props.item.t === 4) {
          pushRecentEmoji(props.item.text);
          onTextReplacement(`${pua}${props.item.text}`);
        }

        if (props.item.t === 5) {
          onTextReplacement(
            isCustomEmojiId(props.item.value)
              ? `:${props.item.value}:`
              : `${pua}${props.item.value}`,
          );
          pushRecentEmoji(props.item.value);
        }
      }}
      onMouseEnter={() => {
        if (props.item.t === 2 || props.item.t === 4 || props.item.t === 5)
          setHoveredItem(props.item);
      }}
    >
      <Switch>
        <Match when={props.item.t === 0}>
          <ServerHeader server={(props.item as Item & { t: 0 }).server} />
        </Match>
        <Match when={props.item.t === 2}>
          <Ripple />
          <Show keyed when={(props.item as Item & { t: 2 }).emoji.id}>
            <img src={(props.item as Item & { t: 2 }).emoji.url} />
          </Show>
        </Match>
        <Match when={props.item.t === 3}>
          <span>{(props.item as Item & { t: 3 }).title}</span>
        </Match>
        <Match when={props.item.t === 5}>
          <Emoji emoji={(props.item as Item & { t: 5 }).value} />
        </Match>
        <Match when={props.item.t === 4}>
          <Ripple />
          <Show keyed when={(props.item as Item & { t: 4 }).text}>
            <UnicodeEmoji
              emoji={(props.item as Item & { t: 4 }).text}
              pack={state.settings.getValue("appearance:unicode_emoji")}
            />
          </Show>
        </Match>
      </Switch>
    </EmojiOption>
  );
};

const EmojiOption = styled("div", {
  base: {},
  variants: {
    type: {
      0: {},
      1: {},
      2: {},
      3: {},
      4: {},
      5: {},
    },
  },
  compoundVariants: [
    {
      type: [0, 3],
      css: {
        position: "absolute",
        left: 0,
        width: "100% !important",
        display: "flex",
        alignItems: "center",
        paddingInline: "var(--space-2)",
        zIndex: 1,
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "var(--md-sys-color-on-surface-variant)",
      },
    },
    {
      type: [2, 4, 5],
      css: {
        width: "100%",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        padding: "6px",
        borderRadius: "var(--radius-control)",
        transition: "background var(--motion-fast) var(--ease-standard)",
        display: "grid",
        placeItems: "center",
        "--emoji-size": "100%",

        _hover: {
          background:
            "color-mix(in srgb, var(--md-sys-color-primary) 16%, transparent)",
        },
        _focusVisible: {
          outline: "2px solid var(--md-sys-color-primary)",
          outlineOffset: "-2px",
        },

        "& img": {
          width: "100%",
          height: "100%",
          objectFit: "contain",
        },
      },
    },
  ],
});

function ServerHeader(props: { server: Server }) {
  return (
    <Row align>
      <Avatar
        size={24}
        src={props.server.animatedIconURL}
        fallback={props.server.name}
      />
      <span>{props.server.name}</span>
    </Row>
  );
}
