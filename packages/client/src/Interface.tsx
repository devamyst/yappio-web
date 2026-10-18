import {
  createEffect,
  createSignal,
  JSX,
  Match,
  onCleanup,
  Show,
  Switch,
} from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { Server } from "stoat.js";
import { styled } from "styled-system/jsx";

import { ChannelContextMenu, ServerContextMenu } from "@revolt/app";
import { MessageCache } from "@revolt/app/interface/channels/text/MessageCache";
import { Titlebar } from "@revolt/app/interface/desktop/Titlebar";
import { useClient, useClientLifecycle } from "@revolt/client";
import { State, TransitionType } from "@revolt/client/Controller";
import { NotificationsWorker } from "@revolt/client/NotificationsWorker";
import { useModals } from "@revolt/modal";
import { Navigate, useBeforeLeave, useLocation } from "@revolt/routing";
import { useState } from "@revolt/state";
import { LAYOUT_SECTIONS } from "@revolt/state/stores/Layout";
import { LoadingScreen } from "@revolt/ui";

import { SlideDrawer } from "../components/ui/components/navigation/SlideDrawer";
import { Landing } from "./Landing";
import { Sidebar } from "./interface/Sidebar";
import { PhoneNav } from "./interface/navigation/PhoneNav";

/**
 * Application layout
 */
const Interface = (props: { children: JSX.Element }) => {
  const state = useState();
  const client = useClient();
  const { openModal } = useModals();
  const { isLoggedIn, lifecycle } = useClientLifecycle();
  const location = useLocation();
  const { pathname } = location;

  useBeforeLeave((e) => {
    if (!e.defaultPrevented) {
      if (e.to === "/settings") {
        e.preventDefault();
        openModal({ type: "settings", config: "user" });
      } else if (typeof e.to === "string") {
        state.layout.setLastActivePath(e.to);
      }
    }
  });

  createEffect(() => {
    if (!isLoggedIn()) {
      state.layout.setNextPath(pathname);
      console.debug("WAITING... currently", lifecycle.state());
    }
  });

  function isDisconnected() {
    return [
      State.Connecting,
      State.Disconnected,
      State.Reconnecting,
      State.Offline,
    ].includes(lifecycle.state());
  }

  //Drawer slider for mobile
  let rootRef, sDrawer: SlideDrawer | undefined;
  const [contRef, setContRef] = createSignal<HTMLDivElement>();
  function rstLayout() {
    state.layout.setSectionState(LAYOUT_SECTIONS.PRIMARY_SIDEBAR, false, false);
    state.layout.setSectionState(LAYOUT_SECTIONS.MEMBER_SIDEBAR, false, true);
  }
  createEffect(() => {
    //Create drawer
    const cont = contRef();
    if (cont && !sDrawer) sDrawer = new SlideDrawer(cont, rootRef!);
    //Update on layout change
    if (sDrawer) {
      const en = sDrawer.enabled;
      setTimeout(() => {
        state.setAppDrawer(en ? sDrawer : undefined);
        if (en) rstLayout();
      }, 1);
    }
  });
  onCleanup(() => {
    sDrawer?.delete();
    state.setAppDrawer((sDrawer = undefined));
  });

  const showLanding = () =>
    !isLoggedIn() && location.pathname === "/" && !state.auth.getSession();

  return (
    <Show when={!showLanding()} fallback={<Landing />}>
    <MessageCache client={client()}>
      <AppRoot ref={rootRef} class="app_root">
        <Titlebar />
        <Switch fallback={<LoadingScreen />}>
          <Match when={!isLoggedIn()}>
            <Navigate href="/login" />
          </Match>
          <Match when={lifecycle.loadedOnce()}>
            <Layout
              disconnected={isDisconnected()}
              style={{ "flex-grow": 1, "min-height": 0 }}
              onDragOver={(e) => {
                if (e.dataTransfer) e.dataTransfer.dropEffect = "none";
              }}
              onDrop={(e) => e.preventDefault()}
            >
              <Sidebar
                menuGenerator={(target) => ({
                  contextMenu: () => {
                    return (
                      <>
                        {target instanceof Server ? (
                          <ServerContextMenu server={target} />
                        ) : (
                          <ChannelContextMenu channel={target} />
                        )}
                      </>
                    );
                  },
                })}
              />
              <Content
                ref={setContRef}
                class="app_body"
                sidebar={state.layout.getSectionState(
                  LAYOUT_SECTIONS.PRIMARY_SIDEBAR,
                  true,
                )}
              >
                {props.children}
              </Content>
            </Layout>
            <PhoneNav />
          </Match>
        </Switch>

        <Show when={isLoggedIn() && isDisconnected()}>
          <ReconnectPill role="status">
            <Dot />
            <Switch>
              <Match when={lifecycle.state() === State.Offline}>
                <Trans>Device is offline</Trans>
              </Match>
              <Match when={lifecycle.state() === State.Disconnected}>
                <Trans>Disconnected</Trans>
              </Match>
              <Match when={true}>
                <Trans>Reconnecting</Trans>
              </Match>
            </Switch>
            <Show
              when={
                lifecycle.state() === State.Disconnected ||
                lifecycle.state() === State.Offline
              }
            >
              <ReconnectButton
                type="button"
                onClick={() =>
                  lifecycle.transition({ type: TransitionType.Retry })
                }
              >
                <Trans>Retry</Trans>
              </ReconnectButton>
            </Show>
          </ReconnectPill>
        </Show>

        <NotificationsWorker />
      </AppRoot>
    </MessageCache>
    </Show>
  );
};

const ReconnectPill = styled("div", {
  base: {
    position: "fixed",
    top: "calc(12px + env(safe-area-inset-top))",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 997,
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "6px 8px 6px 14px",
    maxWidth: "calc(100vw - 32px)",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-highest)",
    border: "var(--hairline)",
    boxShadow: "var(--elev-2)",
    animation: "yappioPillIn var(--motion-med) var(--ease-emph)",
    "@media (prefers-reduced-motion: reduce)": { animation: "none" },
  },
});

const Dot = styled("span", {
  base: {
    width: "8px",
    height: "8px",
    flexShrink: 0,
    borderRadius: "50%",
    background: "var(--brand-presence-idle)",
    animation: "yappioPulse 1.6s var(--ease-standard) infinite",
    "@media (prefers-reduced-motion: reduce)": { animation: "none" },
  },
});

const ReconnectButton = styled("button", {
  base: {
    cursor: "pointer",
    padding: "4px 12px",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: 700,
    color: "var(--md-sys-color-on-primary)",
    background: "var(--md-sys-color-primary)",
  },
});

const AppRoot = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
});

/**
 * Parent container
 */
const Layout = styled("div", {
  base: {
    display: "flex",
    height: "100%",
    minWidth: 0,
  },
  variants: {
    disconnected: {
      true: {
        color: "var(--md-sys-color-outline)",
        background: "var(--md-sys-color-surface-container-lowest)",
      },
      false: {
        color: "var(--md-sys-color-outline)",
        background: "var(--md-sys-color-surface-container-lowest)",
      },
    },
  },
});

/**
 * Main content container
 */
const Content = styled("div", {
  base: {
    background: "var(--md-sys-color-surface-container)",
    display: "flex",
    width: "100%",
    minWidth: 0,
  },
  variants: {
    sidebar: {
      false: {
        overflow: "hidden",
      },
    },
  },
});

export default Interface;
