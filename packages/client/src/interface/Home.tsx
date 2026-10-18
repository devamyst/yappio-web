import { Match, Show, Switch } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { PublicChannelInvite } from "stoat.js";
import { css, cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { IS_DEV, useClient } from "@revolt/client";
import { useInstance } from "@revolt/instance";
import { useModals } from "@revolt/modal";
import { useNavigate } from "@revolt/routing";
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "var(--space-2)",
    textAlign: "center",
    padding: "var(--space-6) var(--space-8)",
    background:
      "radial-gradient(ellipse 60% 70% at 50% 40%, rgb(200 244 60 / 0.16) 0%, transparent 70%)",
  },
});

const Tagline = styled("p", {
  base: {
    fontSize: "17px",
    fontWeight: 500,
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
    color: "var(--md-sys-color-on-primary-container)",
    background: "var(--md-sys-color-primary-container)",
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

  const showLoungeButton = instance.isStoat;
  const isInLounge =
    client()!.servers.get("01F7ZSBSFHQ8TA81725KQCSDDP") !== undefined;

  return (
    <Base>
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
        <Extras>
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
