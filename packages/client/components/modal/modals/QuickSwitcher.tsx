import { For, Show, createEffect, createMemo, createSignal, onMount } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import { useNavigate } from "@revolt/routing";
import { useState } from "@revolt/state";
import { Dialog, DialogProps } from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import { Modals } from "../types";

type Kind = "channel" | "server" | "person";

type Entry = {
  key: string;
  kind: Kind;
  label: string;
  hint?: string;
  icon: string;
  unread: boolean;
  rank: number;
  run: () => void;
};

function matchScore(query: string, text: string) {
  if (!query) return 0;
  const hay = text.toLowerCase();
  const at = hay.indexOf(query);
  if (at === 0) return 0;
  if (at > 0) return 1 + at / 100;

  let from = 0;
  let gaps = 0;
  for (const ch of query) {
    const found = hay.indexOf(ch, from);
    if (found === -1) return -1;
    gaps += found - from;
    from = found + 1;
  }
  return 5 + gaps / 100;
}

/**
 * Jump to any server, channel, conversation or friend
 */
export function QuickSwitcherModal(
  props: DialogProps & Modals & { type: "quick_switcher" },
) {
  const { t } = useLingui();
  const navigate = useNavigate();
  const state = useState();

  const [query, setQuery] = createSignal("");
  const [active, setActive] = createSignal(0);
  let input: HTMLInputElement | undefined;
  let list: HTMLDivElement | undefined;

  onMount(() => queueMicrotask(() => input?.focus()));

  function go(path: string) {
    navigate(path);
    props.onClose();
  }

  const entries = createMemo<Entry[]>(() => {
    const client = props.client;
    const out: Entry[] = [];

    const conversations = state.ordering.orderedConversations(client);
    const seenPeople = new Set<string>();

    conversations.forEach((channel, i) => {
      if (channel.type !== "DirectMessage" && channel.type !== "Group") return;
      if (channel.recipient) seenPeople.add(channel.recipient.id);
      out.push({
        key: channel.id,
        kind: "channel",
        label: channel.displayName ?? channel.name ?? "",
        hint:
          channel.type === "Group" ? t`Group` : t`Direct message`,
        icon: channel.type === "Group" ? "group" : "alternate_email",
        unread: !!channel.unread,
        rank: i,
        run: () => go(channel.path),
      });
    });

    for (const channel of client.channels.values()) {
      if (channel.type !== "TextChannel" || !channel.name) continue;
      out.push({
        key: channel.id,
        kind: "channel",
        label: channel.name,
        hint: channel.server?.name,
        icon: "tag",
        unread: !!channel.unread,
        rank: 1000,
        run: () => go(channel.path),
      });
    }

    state.ordering.orderedServers(client).forEach((server, i) => {
      out.push({
        key: server.id,
        kind: "server",
        label: server.name,
        icon: "dns",
        unread: !!server.unread,
        rank: i,
        run: () => go(server.path),
      });
    });

    for (const user of client.users.values()) {
      if (user.relationship !== "Friend" || seenPeople.has(user.id)) continue;
      out.push({
        key: user.id,
        kind: "person",
        label: user.displayName,
        hint: `${user.username}#${user.discriminator}`,
        icon: "person",
        unread: false,
        rank: 2000,
        run: () => {
          user.openDM().then((channel) => go(channel.path));
        },
      });
    }

    return out;
  });

  const sections = createMemo(() => {
    const q = query().trim().toLowerCase();

    const scored = entries()
      .map((entry) => ({
        entry,
        score: matchScore(q, `${entry.label} ${entry.hint ?? ""}`),
      }))
      .filter((x) => x.score >= 0)
      .sort(
        (a, b) =>
          a.score - b.score ||
          Number(b.entry.unread) - Number(a.entry.unread) ||
          a.entry.rank - b.entry.rank ||
          a.entry.label.localeCompare(b.entry.label),
      )
      .map((x) => x.entry);

    const pick = (kind: Kind, limit: number) =>
      scored.filter((e) => e.kind === kind).slice(0, limit);

    const unread = q ? [] : scored.filter((e) => e.unread).slice(0, 6);
    const taken = new Set(unread.map((e) => e.key));

    const groups = [
      { title: t`Unread`, items: unread },
      {
        title: t`Conversations and channels`,
        items: pick("channel", q ? 12 : 6).filter((e) => !taken.has(e.key)),
      },
      {
        title: t`Servers`,
        items: pick("server", q ? 6 : 8).filter((e) => !taken.has(e.key)),
      },
      { title: t`Friends`, items: pick("person", q ? 6 : 0) },
    ].filter((s) => s.items.length > 0);

    let start = 0;
    return groups.map((group) => {
      const withStart = { ...group, start };
      start += group.items.length;
      return withStart;
    });
  });

  const flat = createMemo(() => sections().flatMap((s) => s.items));

  createEffect(() => {
    query();
    setActive(0);
  });

  createEffect(() => {
    const i = active();
    list?.querySelector(`[data-idx="${i}"]`)?.scrollIntoView({
      block: "nearest",
    });
  });

  function onKeyDown(event: KeyboardEvent) {
    const count = flat().length;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (count) setActive((i) => (i + 1) % count);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (count) setActive((i) => (i - 1 + count) % count);
    } else if (event.key === "Enter") {
      event.preventDefault();
      flat()[active()]?.run();
    } else if (event.key === "Escape") {
      event.preventDefault();
      props.onClose();
    }
  }

  return (
    <Dialog show={props.show} onClose={props.onClose} minWidth={520} padding={12}>
      <Panel>
        <SearchInput
          ref={input}
          value={query()}
          placeholder={t`Where would you like to go?`}
          onInput={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={onKeyDown}
          aria-label={t`Quick switcher`}
        />
        <Results ref={list}>
          <Show
            when={flat().length}
            fallback={
              <Empty>
                <Symbol size={48}>search_off</Symbol>
                <Trans>Nothing matches that search.</Trans>
              </Empty>
            }
          >
            <For each={sections()}>
              {(section) => (
                  <>
                    <SectionTitle>{section.title}</SectionTitle>
                    <For each={section.items}>
                      {(entry, i) => (
                        <Row
                          type="button"
                          data-idx={section.start + i()}
                          active={active() === section.start + i()}
                          onMouseMove={() => setActive(section.start + i())}
                          onClick={() => entry.run()}
                        >
                          <Symbol size={20}>{entry.icon}</Symbol>
                          <RowLabel unread={entry.unread}>{entry.label}</RowLabel>
                          <Show when={entry.hint}>
                            <RowHint>{entry.hint}</RowHint>
                          </Show>
                          <Show when={entry.unread}>
                            <UnreadDot />
                          </Show>
                        </Row>
                      )}
                    </For>
                  </>
              )}
            </For>
          </Show>
        </Results>
      </Panel>
    </Dialog>
  );
}

const Panel = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
    width: "100%",
    maxWidth: "min(560px, calc(100vw - 48px))",
  },
});

const SearchInput = styled("input", {
  base: {
    width: "100%",
    height: "48px",
    padding: "0 var(--space-3)",
    fontSize: "16px",
    color: "var(--md-sys-color-on-surface)",
    borderRadius: "var(--radius-control)",
    background: "var(--md-sys-color-surface-container-lowest)",

    "&::placeholder": {
      color: "var(--md-sys-color-on-surface-variant)",
    },
  },
});

const Results = styled("div", {
  base: {
    maxHeight: "min(420px, 60vh)",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
});

const SectionTitle = styled("div", {
  base: {
    padding: "var(--space-2) var(--space-2) var(--space-1)",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const Row = styled("button", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    minHeight: "40px",
    padding: "0 var(--space-2)",
    textAlign: "left",
    cursor: "pointer",
    color: "var(--md-sys-color-on-surface)",
    borderRadius: "var(--radius-control)",
  },
  variants: {
    active: {
      true: {
        background: "var(--md-sys-color-surface-container-highest)",
      },
      false: {},
    },
  },
});

const RowLabel = styled("span", {
  base: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 500,
  },
  variants: {
    unread: {
      true: { fontWeight: 700 },
      false: {},
    },
  },
});

const RowHint = styled("span", {
  base: {
    flexShrink: 0,
    marginLeft: "auto",
    fontSize: "12px",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const UnreadDot = styled("span", {
  base: {
    width: "8px",
    height: "8px",
    flexShrink: 0,
    borderRadius: "50%",
    background: "var(--md-sys-color-primary)",
  },
});

const Empty = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "var(--space-6) 0",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});
