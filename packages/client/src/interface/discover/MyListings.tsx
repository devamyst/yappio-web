import { For, Match, Show, Switch, createResource } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import { Listing, discovery } from "@revolt/common/lib/discovery";
import { useModals } from "@revolt/modal";

import { ListingCard, SkeletonCard } from "./ListingCard";
import { Empty, GhostButton, Grid, JoinButton } from "./shared";

export function statusOf(item: Listing) {
  if (item.status === "approved") return "live";
  return item.hiddenReason?.toLowerCase().includes("invite")
    ? "invite"
    : "hidden";
}

export function MyListings(props: {
  token: string | undefined;
  onPublish: () => void;
}) {
  const { openModal, showError } = useModals();

  const [data, { refetch }] = createResource(
    () => props.token,
    (token) => discovery.mine(token),
  );

  async function unpublish(item: Listing) {
    try {
      await discovery.remove(props.token!, item.id);
      refetch();
    } catch (error) {
      showError(error);
    }
  }

  function edit(item: Listing) {
    openModal({ type: "publish_listing", listing: item, onDone: refetch });
  }

  return (
    <Switch>
      <Match when={data.error}>
        <Empty>
          <h2>
            <Trans>Discovery is warming up</Trans>
          </h2>
          <p>
            <Trans>Your listings are not available right now.</Trans>
          </p>
        </Empty>
      </Match>
      <Match when={data.loading}>
        <Grid>
          <SkeletonCard />
          <SkeletonCard />
        </Grid>
      </Match>
      <Match when={(data()?.listings.length ?? 0) === 0}>
        <Empty>
          <h2>
            <Trans>You have no listings</Trans>
          </h2>
          <p>
            <Trans>Publish a server you own or a public bot.</Trans>
          </p>
          <JoinButton type="button" onClick={props.onPublish}>
            <Trans>Publish yours</Trans>
          </JoinButton>
        </Empty>
      </Match>
      <Match when={true}>
        <Grid>
          <For each={data()!.listings}>
            {(item) => (
              <ListingCard
                item={item}
                footer={
                  <>
                    <Status data-status={statusOf(item)}>
                      <Switch>
                        <Match when={statusOf(item) === "live"}>
                          <Trans>Live</Trans>
                        </Match>
                        <Match when={statusOf(item) === "invite"}>
                          <Trans>Hidden: invite expired</Trans>
                        </Match>
                        <Match when={true}>
                          <Trans>Hidden by moderators</Trans>
                        </Match>
                      </Switch>
                    </Status>
                    <Actions>
                      <Show when={statusOf(item) === "invite"}>
                        <JoinButton type="button" onClick={() => edit(item)}>
                          <Trans>Fix invite</Trans>
                        </JoinButton>
                      </Show>
                      <GhostButton type="button" onClick={() => edit(item)}>
                        <Trans>Edit</Trans>
                      </GhostButton>
                      <GhostButton type="button" onClick={() => unpublish(item)}>
                        <Trans>Unpublish</Trans>
                      </GhostButton>
                    </Actions>
                  </>
                }
              />
            )}
          </For>
        </Grid>
      </Match>
    </Switch>
  );
}

const Status = styled("span", {
  base: {
    alignSelf: "flex-start",
    padding: "2px 10px",
    fontSize: "12px",
    fontWeight: 700,
    borderRadius: "var(--radius-pill)",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-highest)",

    "&[data-status=live]": {
      color: "var(--md-sys-color-on-primary)",
      background: "var(--md-sys-color-primary)",
    },
    "&[data-status=invite], &[data-status=hidden]": {
      color: "var(--md-sys-color-on-error-container)",
      background: "var(--md-sys-color-error-container)",
    },
  },
});

const Actions = styled("div", {
  base: { display: "flex", flexWrap: "wrap", gap: "6px" },
});
