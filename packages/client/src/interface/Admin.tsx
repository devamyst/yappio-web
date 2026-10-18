import { Match, Show, Switch, createResource, createSignal } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import { checkAdmin } from "@revolt/common/lib/discovery";
import { Navigate, useLocation } from "@revolt/routing";
import { useState } from "@revolt/state";

import { AdminAudit } from "./admin/AdminAudit";
import { AdminMessages } from "./admin/AdminMessages";
import { AdminReports } from "./admin/AdminReports";
import { AdminServers } from "./admin/AdminServers";
import { AdminUsers } from "./admin/AdminUsers";
import { TabButton, Tabs } from "./admin/shared";
import { Moderation } from "./discover/Moderation";

type Tab = "users" | "servers" | "reports" | "messages" | "audit" | "listings";

export function Admin() {
  const state = useState();
  const location = useLocation();

  const token = () => state.auth.getSession()?.token;

  const [admin] = createResource(token, (value) => checkAdmin(value));

  const params = new URLSearchParams(location.search);
  const startUser = params.get("user") ?? undefined;
  const startServer = params.get("server") ?? undefined;
  const startMessage = params.get("message") ?? undefined;

  const [tab, setTab] = createSignal<Tab>(
    startServer ? "servers" : startMessage ? "messages" : "users",
  );
  const [user, setUser] = createSignal(startUser);
  const [server, setServer] = createSignal(startServer);
  const [message, setMessage] = createSignal(startMessage);

  return (
    <Switch>
      <Match when={admin.loading}>
        <Page />
      </Match>
      <Match when={admin() !== true}>
        <Navigate href="/" />
      </Match>
      <Match when={true}>
        <Page>
          <Scroller>
            <Content>
              <Title>
                <Trans>Admin</Trans>
              </Title>
              <Tabs role="tablist">
                <TabButton
                  role="tab"
                  aria-selected={tab() === "users"}
                  onClick={() => setTab("users")}
                >
                  <Trans>Users</Trans>
                </TabButton>
                <TabButton
                  role="tab"
                  aria-selected={tab() === "servers"}
                  onClick={() => setTab("servers")}
                >
                  <Trans>Servers</Trans>
                </TabButton>
                <TabButton
                  role="tab"
                  aria-selected={tab() === "reports"}
                  onClick={() => setTab("reports")}
                >
                  <Trans>Reports</Trans>
                </TabButton>
                <TabButton
                  role="tab"
                  aria-selected={tab() === "messages"}
                  onClick={() => setTab("messages")}
                >
                  <Trans>Messages</Trans>
                </TabButton>
                <TabButton
                  role="tab"
                  aria-selected={tab() === "audit"}
                  onClick={() => setTab("audit")}
                >
                  <Trans>Audit log</Trans>
                </TabButton>
                <TabButton
                  role="tab"
                  aria-selected={tab() === "listings"}
                  onClick={() => setTab("listings")}
                >
                  <Trans>Listings</Trans>
                </TabButton>
              </Tabs>
              <Switch>
                <Match when={tab() === "users"}>
                  <AdminUsers initial={user()} />
                </Match>
                <Match when={tab() === "servers"}>
                  <AdminServers initial={server()} />
                </Match>
                <Match when={tab() === "reports"}>
                  <AdminReports
                    onOpenMessage={(id) => {
                      setMessage(id);
                      setTab("messages");
                    }}
                    onOpenServer={(id) => {
                      setServer(id);
                      setTab("servers");
                    }}
                    onOpenUser={(id) => {
                      setUser(id);
                      setTab("users");
                    }}
                  />
                </Match>
                <Match when={tab() === "messages"}>
                  <AdminMessages initial={message()} />
                </Match>
                <Match when={tab() === "audit"}>
                  <AdminAudit />
                </Match>
                <Match when={tab() === "listings"}>
                  <Show when={token()}>
                    <Moderation token={token()} />
                  </Show>
                </Match>
              </Switch>
            </Content>
          </Scroller>
        </Page>
      </Match>
    </Switch>
  );
}

const Page = styled("div", {
  base: {
    minWidth: 0,
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    background: "var(--md-sys-color-surface)",
  },
});

const Scroller = styled("div", {
  base: { flexGrow: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" },
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

const Title = styled("h1", {
  base: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "var(--md-sys-color-on-surface)",
  },
});
