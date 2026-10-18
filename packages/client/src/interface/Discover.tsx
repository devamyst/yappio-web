import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createResource,
  createSignal,
  on,
  onCleanup,
} from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { PublicBot, PublicChannelInvite } from "stoat.js";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import {
  DiscoveryError,
  Listing,
  ListingType,
  discovery,
} from "@revolt/common/lib/discovery";
import { useModals } from "@revolt/modal";
import { useNavigate } from "@revolt/routing";
import { useState } from "@revolt/state";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import { ListingCard, SkeletonCard } from "./discover/ListingCard";
import { MyListings } from "./discover/MyListings";
import { Moderation } from "./discover/Moderation";
import { Empty, GhostButton, Grid, JoinButton } from "./discover/shared";

type Tab = ListingType | "mine" | "moderation";

const PER_PAGE = 24;

export function Discover() {
  const { t } = useLingui();
  const state = useState();
  const client = useClient();
  const navigate = useNavigate();
  const { openModal, showError } = useModals();

  const token = () => state.auth.getSession()?.token;

  const [tab, setTab] = createSignal<Tab>("server");
  const [search, setSearch] = createSignal("");
  const [query, setQuery] = createSignal("");
  const [category, setCategory] = createSignal("");
  const [sort, setSort] = createSignal<"members" | "new" | "name">("members");
  const [items, setItems] = createSignal<Listing[]>([]);
  const [total, setTotal] = createSignal(0);
  const [page, setPage] = createSignal(1);
  const [loading, setLoading] = createSignal(true);
  const [warming, setWarming] = createSignal(false);
  const [reload, setReload] = createSignal(0);

  const [categories] = createResource(() =>
    discovery.categories().catch(() => [] as string[]),
  );
  const [isAdmin] = createResource(token, (value) => discovery.isAdmin(value));

  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));
  function onSearch(value: string) {
    setSearch(value);
    clearTimeout(timer);
    timer = setTimeout(() => setQuery(value.trim()), 300);
  }

  let requestId = 0;
  async function load(nextPage: number) {
    const current = ++requestId;
    const kind = tab();
    if (kind === "mine" || kind === "moderation") return;

    setLoading(true);
    try {
      const result = await discovery.listings({
        type: kind,
        q: query(),
        category: category(),
        sort: sort(),
        page: nextPage,
        per: PER_PAGE,
      });
      if (current !== requestId) return;
      setWarming(false);
      setTotal(result.total);
      setPage(nextPage);
      setItems(nextPage === 1 ? result.items : [...items(), ...result.items]);
    } catch (error) {
      if (current !== requestId) return;
      setItems([]);
      setTotal(0);
      setWarming(error instanceof DiscoveryError && error.unavailable);
    } finally {
      if (current === requestId) setLoading(false);
    }
  }

  createEffect(
    on([tab, query, category, sort, reload], () => {
      setItems([]);
      load(1);
    }),
  );

  async function join(item: Listing) {
    try {
      if (item.type === "server") {
        const existing = client().servers.get(item.targetId);
        if (existing) {
          navigate(`/server/${existing.id}`);
          return;
        }

        const invite = await client()
          .api.get(`/invites/${item.inviteCode as ""}`)
          .then((invite) => PublicChannelInvite.from(client(), invite));
        openModal({ type: "invite", invite });
      } else {
        const bot = await client()
          .api.get(`/bots/${item.targetId as ""}/invite`)
          .then((bot) => new PublicBot(client(), bot));
        openModal({ type: "add_bot", invite: bot });
      }
    } catch (error) {
      showError(error);
    }
  }

  function publish() {
    openModal({
      type: "publish_listing",
      onDone: () => setReload(reload() + 1),
    });
  }

  const browsing = () => tab() === "server" || tab() === "bot";

  return (
    <Page>
      <Scroller>
        <Content>
          <Hero>
            <HeroText>
              <h1>
                <Trans>Discover</Trans>
              </h1>
              <p>
                <Trans>Find servers to join and apps to add to yours.</Trans>
              </p>
            </HeroText>
            <PublishButton type="button" onClick={publish}>
              <Symbol size={20}>add</Symbol>
              <Trans>Publish</Trans>
            </PublishButton>
            <HeroSearch>
              <SearchBox>
              <Symbol size={20}>search</Symbol>
              <input
                type="search"
                value={search()}
                placeholder={t`Search servers and apps`}
                aria-label={t`Search`}
                onInput={(e) => onSearch(e.currentTarget.value)}
              />
            </SearchBox>
            </HeroSearch>
          </Hero>

          <Tabs role="tablist">
            <TabButton
              role="tab"
              aria-selected={tab() === "server"}
              onClick={() => setTab("server")}
            >
              <Trans>Servers</Trans>
            </TabButton>
            <TabButton
              role="tab"
              aria-selected={tab() === "bot"}
              onClick={() => setTab("bot")}
            >
              <Trans>Apps</Trans>
            </TabButton>
            <TabButton
              role="tab"
              aria-selected={tab() === "mine"}
              onClick={() => setTab("mine")}
            >
              <Trans>My listings</Trans>
            </TabButton>
            <Show when={isAdmin()}>
              <TabButton
                role="tab"
                aria-selected={tab() === "moderation"}
                onClick={() => setTab("moderation")}
              >
                <Trans>Moderation</Trans>
              </TabButton>
            </Show>
          </Tabs>

          <Switch>
            <Match when={browsing()}>
              <Toolbar>
                <Chips>
                  <Chip
                    type="button"
                    aria-pressed={category() === ""}
                    onClick={() => setCategory("")}
                  >
                    <Trans>All</Trans>
                  </Chip>
                  <For each={categories() ?? []}>
                    {(name) => (
                      <Chip
                        type="button"
                        aria-pressed={category() === name}
                        onClick={() => setCategory(name)}
                      >
                        {name}
                      </Chip>
                    )}
                  </For>
                </Chips>
                <SortSelect
                  aria-label={t`Sort`}
                  value={sort()}
                  onChange={(e) =>
                    setSort(e.currentTarget.value as "members" | "new" | "name")
                  }
                >
                  <option value="members">{t`Most members`}</option>
                  <option value="new">{t`Newest`}</option>
                  <option value="name">{t`A-Z`}</option>
                </SortSelect>
              </Toolbar>

              <Switch>
                <Match when={warming()}>
                  <Empty>
                    <WarmArt aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </WarmArt>
                    <h2>
                      <Trans>Discovery is warming up</Trans>
                    </h2>
                    <p>
                      <Trans>
                        Listings are not available right now. Check back in a
                        minute.
                      </Trans>
                    </p>
                    <PublishButton
                      type="button"
                      onClick={() => setReload(reload() + 1)}
                    >
                      <Symbol size={20}>refresh</Symbol>
                      <Trans>Retry</Trans>
                    </PublishButton>
                  </Empty>
                </Match>
                <Match when={loading() && items().length === 0}>
                  <Grid>
                    <For each={[0, 1, 2, 3, 4, 5, 6, 7]}>
                      {() => <SkeletonCard />}
                    </For>
                  </Grid>
                </Match>
                <Match when={items().length === 0}>
                  <Empty>
                    <Symbol size={48}>explore</Symbol>
                    <h2>
                      <Trans>Nothing here yet</Trans>
                    </h2>
                    <p>
                      <Trans>
                        No listings match. Be the first to put yours on the map.
                      </Trans>
                    </p>
                    <PublishButton type="button" onClick={publish}>
                      <Trans>Publish yours</Trans>
                    </PublishButton>
                  </Empty>
                </Match>
                <Match when={true}>
                  <Grid>
                    <For each={items()}>
                      {(item) => (
                        <ListingCard
                          item={item}
                          action={
                            <JoinButton type="button" onClick={() => join(item)}>
                              {item.type === "server" ? (
                                <Trans>Join</Trans>
                              ) : (
                                <Trans>Add to server</Trans>
                              )}
                            </JoinButton>
                          }
                        />
                      )}
                    </For>
                  </Grid>
                  <Show when={items().length < total()}>
                    <MoreRow>
                      <MoreButton
                        type="button"
                        disabled={loading()}
                        onClick={() => load(page() + 1)}
                      >
                        <Trans>Load more</Trans>
                      </MoreButton>
                    </MoreRow>
                  </Show>
                </Match>
              </Switch>
            </Match>
            <Match when={tab() === "mine"}>
              <MyListings token={token()} onPublish={publish} />
            </Match>
            <Match when={tab() === "moderation"}>
              <Moderation token={token()} />
            </Match>
          </Switch>
        </Content>
      </Scroller>
    </Page>
  );
}

const Page = styled("div", {
  base: {
    minWidth: 0,
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    background: "var(--md-sys-color-surface-container)",
  },
});

const Scroller = styled("div", {
  base: { flexGrow: 1, minHeight: 0, overflowY: "auto" },
});

const Content = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px 16px 48px",
  },
});

const Hero = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    padding: "32px 24px",
    borderRadius: "var(--radius-modal)",
    color: "var(--md-sys-color-on-surface)",
    border: "1px solid var(--md-sys-color-outline-variant)",
    background:
      "radial-gradient(120% 140% at 100% 0%, color-mix(in srgb, var(--md-sys-color-primary) 22%, transparent), transparent 55%), linear-gradient(135deg, var(--md-sys-color-surface-container-highest), var(--md-sys-color-surface-container-low))",

    "& h1": { margin: 0, fontSize: "32px", fontWeight: 800, letterSpacing: "-0.02em" },
    "& p": {
      margin: "4px 0 0",
      color: "var(--md-sys-color-on-surface-variant)",
    },
  },
});

const HeroText = styled("div", { base: { minWidth: 0, flex: "1 1 240px" } });

const HeroSearch = styled("div", { base: { flexBasis: "100%", marginTop: "8px" } });

const PublishButton = styled("button", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    height: "40px",
    padding: "0 18px",
    cursor: "pointer",
    border: "none",
    fontWeight: 700,
    fontSize: "14px",
    borderRadius: "var(--radius-pill)",
    color: "var(--md-sys-color-on-primary)",
    background: "var(--md-sys-color-primary)",
    transition: "filter var(--motion-fast) var(--ease-standard)",

    "&:hover": { filter: "brightness(1.08)" },
    "&:focus-visible": {
      outline: "2px solid var(--md-sys-color-primary)",
      outlineOffset: "2px",
    },
  },
});

const SearchBox = styled("label", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    height: "48px",
    padding: "0 16px",
    borderRadius: "var(--radius-pill)",
    color: "var(--md-sys-color-on-surface-variant)",
    background: "var(--md-sys-color-surface-container-high)",

    "&:focus-within": {
      outline: "2px solid var(--md-sys-color-primary)",
    },

    "& input": {
      flexGrow: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      fontSize: "15px",
      background: "transparent",
      color: "var(--md-sys-color-on-surface)",
    },
  },
});

const Tabs = styled("div", {
  base: {
    display: "flex",
    gap: "4px",
    overflowX: "auto",
    borderBottom: "1px solid var(--md-sys-color-outline-variant)",
  },
});

const TabButton = styled("button", {
  base: {
    padding: "10px 16px",
    cursor: "pointer",
    border: "none",
    fontSize: "14px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    background: "transparent",
    borderBottom: "2px solid transparent",
    color: "var(--md-sys-color-on-surface-variant)",

    "&[aria-selected=true]": {
      color: "var(--md-sys-color-primary)",
      borderBottomColor: "var(--md-sys-color-primary)",
    },
    "&:focus-visible": {
      outline: "2px solid var(--md-sys-color-primary)",
      outlineOffset: "-2px",
    },
  },
});

const Toolbar = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
  },
});

const Chips = styled("div", {
  base: {
    display: "flex",
    flexWrap: "nowrap",
    gap: "6px",
    minWidth: 0,
    flex: "1 1 240px",
    overflowX: "auto",
    scrollbarWidth: "none",
    padding: "2px 16px",
    margin: "0 -16px",
    maskImage:
      "linear-gradient(90deg, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",
    WebkitMaskImage:
      "linear-gradient(90deg, transparent 0, #000 16px, #000 calc(100% - 24px), transparent 100%)",

    "&::-webkit-scrollbar": { display: "none" },
    "& > *": { flexShrink: 0 },
  },
});

const Chip = styled("button", {
  base: {
    height: "32px",
    padding: "0 14px",
    cursor: "pointer",
    border: "1px solid var(--md-sys-color-outline-variant)",
    fontSize: "13px",
    borderRadius: "var(--radius-pill)",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-high)",
    transition: "background var(--motion-fast) var(--ease-standard)",

    "&:hover": { background: "var(--md-sys-color-surface-container-highest)" },
    "&[aria-pressed=true]": {
      fontWeight: 700,
      color: "var(--md-sys-color-on-primary)",
      background: "var(--md-sys-color-primary)",
    },
    "&:focus-visible": {
      outline: "2px solid var(--md-sys-color-primary)",
      outlineOffset: "2px",
    },
  },
});

const SortSelect = styled("select", {
  base: {
    height: "36px",
    padding: "0 12px",
    fontSize: "13px",
    cursor: "pointer",
    border: "none",
    borderRadius: "var(--radius-control)",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-high)",

    "&:focus-visible": {
      outline: "2px solid var(--md-sys-color-primary)",
    },
  },
});

const WarmArt = styled("div", {
  base: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    height: "72px",
    marginBottom: "8px",

    "& span": {
      width: "18px",
      borderRadius: "var(--radius-pill)",
      background: "var(--md-sys-color-primary)",
      boxShadow:
        "0 0 18px color-mix(in srgb, var(--md-sys-color-primary) 55%, transparent)",
      animation: "yappioPulse 1.4s ease-in-out infinite",
    },
    "& span:nth-child(1)": { height: "32px" },
    "& span:nth-child(2)": { height: "60px", animationDelay: "0.2s" },
    "& span:nth-child(3)": { height: "44px", animationDelay: "0.4s" },

    "@media (prefers-reduced-motion: reduce)": {
      "& span": { animation: "none" },
    },
  },
});

const MoreRow = styled("div", {
  base: { display: "flex", justifyContent: "center" },
});

const MoreButton = styled(GhostButton, { base: { height: "40px" } });
