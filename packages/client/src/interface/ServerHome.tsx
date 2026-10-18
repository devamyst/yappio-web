import { Component, Match, Switch, createMemo } from "solid-js";

import { useClient } from "@revolt/client";
import { Trans } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import { Navigate, useParams } from "@revolt/routing";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

/**
 * Server home component
 */
export const ServerHome: Component = () => {
  const params = useParams();
  const client = useClient();
  const server = createMemo(() => client()!.servers.get(params.server)!);

  return (
    <Switch
      fallback={
        <Empty>
          <Symbol size={48}>forum</Symbol>
          <Trans>This server has no channels you can see yet.</Trans>
        </Empty>
      }
    >
      <Match when={!server()}>
        <Navigate href={"/"} />
      </Match>
      <Match when={server().defaultChannel}>
        <Navigate href={`channel/${server().defaultChannel!.id}`} />
      </Match>
    </Switch>
  );
};

const Empty = styled("div", {
  base: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-2)",
    textAlign: "center",
    padding: "var(--space-4)",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});
