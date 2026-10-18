import { For, Match, Switch, createResource, createSignal } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import { Listing, discovery } from "@revolt/common/lib/discovery";
import { useModals } from "@revolt/modal";

import { ListingCard, SkeletonCard } from "./ListingCard";
import { Empty, GhostButton, Grid, JoinButton } from "./shared";

export function Moderation(props: { token: string | undefined }) {
  const { showError } = useModals();
  const [filter, setFilter] = createSignal<"hidden" | "approved">("hidden");

  const [data, { refetch }] = createResource(
    () => [props.token, filter()] as const,
    ([token, status]) => discovery.adminListings(token!, status),
  );

  async function act(
    item: Listing,
    action: "hide" | "approve" | "feature" | "unfeature",
  ) {
    try {
      await discovery.adminAction(props.token!, item.id, action);
      refetch();
    } catch (error) {
      showError(error);
    }
  }

  return (
    <>
      <Row>
        <JoinButton
          type="button"
          style={{ opacity: filter() === "hidden" ? 1 : 0.6 }}
          onClick={() => setFilter("hidden")}
        >
          <Trans>Hidden and reported</Trans>
        </JoinButton>
        <JoinButton
          type="button"
          style={{ opacity: filter() === "approved" ? 1 : 0.6 }}
          onClick={() => setFilter("approved")}
        >
          <Trans>Live</Trans>
        </JoinButton>
      </Row>
      <Switch>
        <Match when={data.error}>
          <Empty>
            <h2>
              <Trans>Could not load the queue</Trans>
            </h2>
          </Empty>
        </Match>
        <Match when={data.loading}>
          <Grid>
            <SkeletonCard />
            <SkeletonCard />
          </Grid>
        </Match>
        <Match when={(data()?.length ?? 0) === 0}>
          <Empty>
            <h2>
              <Trans>Queue is empty</Trans>
            </h2>
          </Empty>
        </Match>
        <Match when={true}>
          <Grid>
            <For each={data()}>
              {(item) => (
                <ListingCard
                  item={item}
                  footer={
                    <>
                      <Reason>
                        {item.hiddenReason ?? item.ownerName}
                      </Reason>
                      <Actions>
                        <GhostButton type="button" onClick={() => act(item, "hide")}>
                          <Trans>Hide</Trans>
                        </GhostButton>
                        <GhostButton
                          type="button"
                          onClick={() => act(item, "approve")}
                        >
                          <Trans>Approve</Trans>
                        </GhostButton>
                        <GhostButton
                          type="button"
                          onClick={() =>
                            act(item, item.featured ? "unfeature" : "feature")
                          }
                        >
                          {item.featured ? (
                            <Trans>Unfeature</Trans>
                          ) : (
                            <Trans>Feature</Trans>
                          )}
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
    </>
  );
}

const Row = styled("div", {
  base: { display: "flex", gap: "8px", flexWrap: "wrap" },
});

const Reason = styled("span", {
  base: {
    fontSize: "12px",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const Actions = styled("div", {
  base: { display: "flex", flexWrap: "wrap", gap: "6px" },
});
