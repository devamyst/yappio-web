import { For, Match, Show, Switch, createMemo } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { PublicChannelInvite } from "stoat.js";
import { css, cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { IS_DEV, useClient } from "@revolt/client";
import { useInstance } from "@revolt/instance";
import { useModals } from "@revolt/modal";
import { useNavigate } from "@revolt/routing";
import { useState } from "@revolt/state";
import {
  Button,
  CategoryButton,
  Header,
  iconSize,
  main,
} from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import MdGroups3 from "@material-design-icons/svg/filled/groups_3.svg?component-solid";
import MdHome from "@material-design-icons/svg/filled/home.svg?component-solid";

import Wordmark from "../../public/assets/web/wordmark.svg?component-solid";

import { HeaderIcon } from "./common/CommonHeader";

/**
 * Base layout of the home page (i.e. the header/background)
 */
const Base = styled("div", {
  base: {
    width: "100%",
    display: "flex",
    flexDirection: "column",

    color: "var(--md-sys-color-on-surface)",
  },
});

/**
 * Layout of the content as a whole
 */
const content = cva({
  base: {
    ...main.raw(),

    padding: "var(--space-7) var(--space-4)",

    gap: "var(--space-6)",
    alignItems: "center",
    justifyContent: "center",
  },
});

const Hero = styled("div", {
  base: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    maxWidth: "720px",
    borderRadius: "var(--radius-modal)",
    border: "1px solid var(--md-sys-color-outline-variant)",
    boxShadow: "var(--elev-2)",
    backgroundSize: "200% 200%",
    animation: "home-drift 16s ease-in-out infinite",
    "@media (prefers-reduced-motion: reduce)": { animation: "none" },
    _phone: { padding: "var(--space-6) var(--space-4)" },
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "var(--space-2)",
    textAlign: "center",
    padding: "var(--space-6) var(--space-8)",
    background:
      "radial-gradient(ellipse 50% 80% at 15% 20%, rgb(200 244 60 / 0.3) 0%, transparent 70%), radial-gradient(ellipse 50% 80% at 90% 90%, rgb(91 212 160 / 0.26) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 70% 0%, rgb(140 120 255 / 0.2) 0%, transparent 70%), var(--md-sys-color-surface-container-high)",
  },
});

const Shortcuts = styled("div", {
  base: {
    width: "100%",
    maxWidth: "720px",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
  },
});

const ShortcutRow = styled("div", {
  base: {
    display: "flex",
    gap: "var(--space-2)",
    overflowX: "auto",
    paddingBottom: "4px",
    scrollbarWidth: "none",
  },
});

const Chip = styled("button", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    flexShrink: 0,
    height: "40px",
    padding: "0 var(--space-4)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    maxWidth: "220px",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-high)",
    border: "1px solid var(--md-sys-color-outline-variant)",
    borderRadius: "var(--radius-pill)",
    transition:
      "transform var(--motion-fast) var(--ease-standard), border-color var(--motion-fast)",
    "&:hover": {
      transform: "translateY(-2px)",
      borderColor: "var(--md-sys-color-primary)",
    },
    "& span:last-child": {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  },
});

const ShortLabel = styled("span", {
  base: {
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const Tagline = styled("p", {
  base: {
    fontSize: "20px",
    fontWeight: 700,
    color: "var(--md-sys-color-on-surface)",
    opacity: 0.9,
  },
});

const Cards = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "var(--space-3)",
    width: "100%",
    maxWidth: "720px",

    _phone: {
      gridTemplateColumns: "1fr",
    },
  },
});

const ActionCard = styled("button", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "var(--space-2)",
    padding: "var(--space-4)",
    minHeight: "128px",
    textAlign: "left",
    cursor: "pointer",
    color: "var(--md-sys-color-on-surface)",
    borderRadius: "var(--radius-card)",
    background: "var(--md-sys-color-surface-container-high)",
    border: "1px solid rgb(255 255 255 / 0.08)",
    boxShadow: "var(--elev-1)",
    transition:
      "background var(--motion-fast) var(--ease-standard), transform var(--motion-med) var(--ease-emph)",

    "&:hover": {
      background:
        "color-mix(in srgb, var(--md-sys-color-primary) 10%, var(--md-sys-color-surface-container-highest))",
      borderColor: "rgb(200 244 60 / 0.55)",
      transform: "translateY(-2px)",
    },
  },
});

const CardIcon = styled("div", {
  base: {
    width: "40px",
    height: "40px",
    display: "grid",
    placeItems: "center",
    borderRadius: "var(--radius-control)",
    color: "var(--md-sys-color-on-primary)",
    background: "var(--md-sys-color-primary)",
    boxShadow: "0 4px 14px rgb(200 244 60 / 0.3)",
  },
});

const CardTitle = styled("span", {
  base: {
    fontSize: "16px",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
});

const CardText = styled("span", {
  base: {
    fontSize: "13px",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const Checklist = styled("section", {
  base: {
    width: "100%",
    maxWidth: "720px",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
    padding: "var(--space-4)",
    borderRadius: "var(--radius-card)",
    background: "var(--md-sys-color-surface-container-high)",
    border: "1px solid var(--md-sys-color-outline-variant)",
  },
});

const CheckItem = styled("button", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
    minHeight: "44px",
    padding: "0 var(--space-3)",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--md-sys-color-on-surface)",
    borderRadius: "var(--radius-control)",
    transition: "background var(--motion-fast) var(--ease-standard)",

    "&:hover": {
      background: "var(--md-sys-color-surface-container-highest)",
    },
  },
});

const CheckDot = styled("span", {
  base: {
    width: "22px",
    height: "22px",
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    border: "2px solid var(--md-sys-color-outline)",
    color: "var(--md-sys-color-on-primary)",
  },
  variants: {
    done: {
      true: {
        background: "var(--md-sys-color-primary)",
        borderColor: "var(--md-sys-color-primary)",
      },
      false: {},
    },
  },
});

const Extras = styled("div", {
  base: {
    width: "100%",
    maxWidth: "720px",
  },
});

/**
 * Home page
 */
export function HomePage() {
  const { openModal } = useModals();
  const navigate = useNavigate();
  const client = useClient();
  const instance = useInstance();

  const steps = createMemo(() => [
    {
      label: <Trans>Add a friend</Trans>,
      done: client()!.users
        .toList()
        .some((user) => user.relationship === "Friend"),
      run: () => openModal({ type: "add_friend", client: client()! }),
    },
    {
      label: <Trans>Join a server</Trans>,
      done: client()!.servers.size > 0,
      run: () =>
        openModal({ type: "create_or_join_server", client: client()! }),
    },
    {
      label: <Trans>Set an avatar</Trans>,
      done: !!client()!.user?.avatar,
      run: () => openModal({ type: "settings", config: "user" }),
    },
  ]);
  const allDone = () => steps().every((step) => step.done);

  const state = useState();
  const recentServers = () =>
    state.ordering.orderedServers(client()!).slice(0, 6);
  const recentChats = () =>
    state.ordering
      .orderedConversations(client()!)
      .filter((c) => c.type === "DirectMessage" || c.type === "Group")
      .slice(0, 6);

  const showLoungeButton = instance.isStoat;
  const isInLounge =
    client()!.servers.get("01F7ZSBSFHQ8TA81725KQCSDDP") !== undefined;

  return (
    <Base>
      <style>{`@keyframes home-drift{0%,100%{background-position:0% 0%}50%{background-position:100% 100%}}`}</style>
      <Header placement="primary">
        <HeaderIcon>
          <MdHome {...iconSize(22)} />
        </HeaderIcon>
        <Trans>Home</Trans>
      </Header>
      <div use:scrollable={{ class: content() }}>
        <Hero>
          <Wordmark
            class={css({
              width: "200px",
              fill: "var(--md-sys-color-on-surface)",
              filter: "var(--yappio-wordmark-filter, none)",
            })}
          />
          <Tagline>
            <Trans>Where your people hang out.</Trans>
          </Tagline>
        </Hero>
        <Cards>
          <ActionCard
            type="button"
            onClick={() => openModal({ type: "add_friend", client: client()! })}
          >
            <CardIcon>
              <Symbol size={24}>person_add</Symbol>
            </CardIcon>
            <CardTitle>
              <Trans>Add a friend</Trans>
            </CardTitle>
            <CardText>
              <Trans>Send a request with their username and tag.</Trans>
            </CardText>
          </ActionCard>
          <ActionCard
            type="button"
            onClick={() =>
              openModal({ type: "create_or_join_server", client: client()! })
            }
          >
            <CardIcon>
              <Symbol size={24}>group_add</Symbol>
            </CardIcon>
            <CardTitle>
              <Trans>Join a server</Trans>
            </CardTitle>
            <CardText>
              <Trans>Got an invite? Paste it and hop in.</Trans>
            </CardText>
          </ActionCard>
          <ActionCard
            type="button"
            onClick={() =>
              openModal({ type: "create_group_or_server", client: client()! })
            }
          >
            <CardIcon>
              <Symbol size={24}>add_circle</Symbol>
            </CardIcon>
            <CardTitle>
              <Trans>Create a server</Trans>
            </CardTitle>
            <CardText>
              <Trans>Start your own place for friends and bots.</Trans>
            </CardText>
          </ActionCard>
        </Cards>
        <Show when={recentChats().length || recentServers().length}>
          <Shortcuts>
            <Show when={recentChats().length}>
              <ShortLabel>
                <Trans>Jump back in</Trans>
              </ShortLabel>
              <ShortcutRow>
                <For each={recentChats()}>
                  {(channel) => (
                    <Chip type="button" onClick={() => navigate(channel.path)}>
                      <Symbol size={18}>
                        {channel.type === "Group" ? "group" : "alternate_email"}
                      </Symbol>
                      <span>{channel.displayName ?? channel.name}</span>
                    </Chip>
                  )}
                </For>
              </ShortcutRow>
            </Show>
            <Show when={recentServers().length}>
              <ShortLabel>
                <Trans>Your servers</Trans>
              </ShortLabel>
              <ShortcutRow>
                <For each={recentServers()}>
                  {(server) => (
                    <Chip type="button" onClick={() => navigate(server.path)}>
                      <Symbol size={18}>dns</Symbol>
                      <span>{server.name}</span>
                    </Chip>
                  )}
                </For>
              </ShortcutRow>
            </Show>
          </Shortcuts>
        </Show>
        <Show when={!allDone()}>
          <Checklist aria-label="Getting started">
            <CardTitle>
              <Trans>Getting started</Trans>
            </CardTitle>
            <For each={steps()}>
              {(step) => (
                <CheckItem type="button" onClick={step.run}>
                  <CheckDot done={step.done}>
                    <Show when={step.done}>
                      <Symbol size={14}>check</Symbol>
                    </Show>
                  </CheckDot>
                  <span
                    class={css({ flexGrow: 1 })}
                    style={{
                      "text-decoration": step.done ? "line-through" : "none",
                      opacity: step.done ? 0.6 : 1,
                    }}
                  >
                    {step.label}
                  </span>
                </CheckItem>
              )}
            </For>
          </Checklist>
        </Show>
        <Extras>
          <CategoryButton
            onClick={() => navigate("/discover")}
            description={
              <Trans>Browse public servers by topic and find a new home.</Trans>
            }
            icon={<Symbol size={24}>explore</Symbol>}
          >
            <Trans>Discover servers</Trans>
          </CategoryButton>
          <Switch fallback={null}>
            <Match when={showLoungeButton && isInLounge}>
              <CategoryButton
                onClick={() => navigate("/server/01F7ZSBSFHQ8TA81725KQCSDDP")}
                description={
                  <Trans>
                    You can report issues and discuss improvements with us
                    directly here.
                  </Trans>
                }
                icon={<MdGroups3 />}
              >
                <Trans>Go to the Yappio Lounge</Trans>
              </CategoryButton>
            </Match>
            <Match when={showLoungeButton && !isInLounge}>
              <CategoryButton
                onClick={() => {
                  client()
                    .api.get("/invites/Testers")
                    .then((invite) =>
                      PublicChannelInvite.from(client(), invite),
                    )
                    .then((invite) => openModal({ type: "invite", invite }));
                }}
                description={
                  <Trans>
                    You can report issues and discuss improvements with us
                    directly here.
                  </Trans>
                }
                icon={<MdGroups3 />}
              >
                <Trans>Join the Yappio Lounge</Trans>
              </CategoryButton>
            </Match>
          </Switch>
        </Extras>
        <Show when={IS_DEV}>
          <Button onPress={() => navigate("/dev")}>
            Open Development Page
          </Button>
        </Show>
      </div>
    </Base>
  );
}
