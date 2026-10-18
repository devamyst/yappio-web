import { Accessor, JSX, Setter, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";

import { useLingui } from "@lingui/solid/macro";

import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useState } from "@revolt/state";
import { Breadcrumbs, IconButton, Text } from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import MdClose from "@material-design-icons/svg/outlined/close.svg?component-solid";

import { SettingsList } from "..";
import { useSettingsNavigation } from "../Settings";

/**
 * Content portion of the settings menu
 */
export function SettingsContent(props: {
  onClose?: () => void;
  children: JSX.Element;
  list: Accessor<SettingsList<unknown>>;
  title: (ctx: SettingsList<never>, key: string) => string;
  page: Accessor<string | undefined>;
  ref: Setter<HTMLDivElement | undefined>;
  action: Accessor<(() => JSX.Element) | undefined>;
}) {
  const { navigate } = useSettingsNavigation();
  const { t } = useLingui();
  const { diagDrawer } = useState();

  const hints = (): Record<string, string> => ({
    account: t`Your login, email and security.`,
    profile: t`How other people see you across Yappio.`,
    sessions: t`Devices that are signed in to your account.`,
    bots: t`Create and manage the bots you own.`,
    voice: t`Microphone, noise handling and screen sharing.`,
    appearance: t`Theme, colours, fonts and message layout.`,
    notifications: t`Choose what makes noise and where.`,
    language: t`Pick the language and date format.`,
    native: t`Options for the desktop app.`,
    sync: t`Choose what follows you between devices.`,
    about: t`Version and build details.`,
    advanced: t`Options most people never need to touch.`,
    overview: t`The basics: name, description and look.`,
    emojis: t`Custom emoji members can use in this server.`,
    members: t`Everyone who has joined this server.`,
    roles: t`Colours, ordering and permissions for members.`,
    invites: t`Links people have used to join.`,
    bans: t`People kept out of this server.`,
    permissions: t`Who can see and do what here.`,
    webhooks: t`Let other services post into this channel.`,
  });
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div ref={props.ref} use:scrollable={{ class: base }}>
      <Show when={props.page()}>
        <InnerContent class="settings_cont">
          <InnerColumn>
            <PhoneBar>
              <PhoneBarButton
                type="button"
                aria-label={t`All settings`}
                onClick={() => diagDrawer()?.setShown(false)}
              >
                <Symbol>menu</Symbol>
              </PhoneBarButton>
              <Show when={props.onClose}>
                <PhoneBarButton
                  type="button"
                  aria-label={t`Close`}
                  onClick={() => props.onClose?.()}
                >
                  <Symbol>close</Symbol>
                </PhoneBarButton>
              </Show>
            </PhoneBar>
            <Show when={props.page() !== "account"}>
              <Text
                class={`title ${css({ fontSize: "20px", fontWeight: 700, paddingBottom: "var(--space-3)" })}`}
                size="large"
              >
                <Breadcrumbs
                  elements={props.page()!.split("/")}
                  renderElement={(key) =>
                    props.title(props.list() as SettingsList<never>, key)
                  }
                  navigate={(keys) => navigate(keys.join("/"))}
                />
              </Text>
            </Show>
            <Show when={!props.page()!.includes("/") && hints()[props.page()!]}>
              <p class={hint}>{hints()[props.page()!]}</p>
            </Show>
            {props.children}
            <div class={css({ minHeight: "80px" })} />
          </InnerColumn>
        </InnerContent>
      </Show>
      <ActionRail>
        <Show when={props.onClose}>
          <CloseAction class="close">
            <IconButton variant="tonal" onPress={props.onClose}>
              <MdClose />
            </IconButton>
          </CloseAction>
        </Show>
        <FloatingActions>
          <Presence>
            <Show when={props.action()} keyed>
              {(renderAction) => (
                <Motion.div
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    transition: {
                      duration: reduceMotion ? 0 : 0.2,
                      easing: [0.3, 0, 0.8, 0.15],
                    },
                  }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.3,
                    easing: [0.05, 0.7, 0.1, 1],
                  }}
                  style={{ "transform-origin": "center" }}
                >
                  {renderAction()}
                </Motion.div>
              )}
            </Show>
          </Presence>
        </FloatingActions>
      </ActionRail>
    </div>
  );
}

const PhoneBar = styled("div", {
  base: {
    display: "none",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 3,
    margin: "-12px -12px 0",
    padding: "var(--space-2) var(--space-3)",
    background: "var(--md-sys-color-surface)",

    _phone: {
      display: "flex",
    },
  },
});

const PhoneBarButton = styled("button", {
  base: {
    width: "44px",
    height: "44px",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    color: "var(--md-sys-color-on-surface)",
    borderRadius: "50%",
    background: "var(--md-sys-color-surface-container-highest)",
  },
});

const hint = css({
  margin: "calc(var(--space-2) * -1) 0 var(--space-2)",
  fontSize: "14px",
  color: "var(--md-sys-color-on-surface-variant)",
});

/**
 * Base styles
 */
const base = css({
  minWidth: 0,
  flex: "1 1 800px",
  flexDirection: "row",
  display: "flex",
  background: "var(--md-sys-color-surface)",

  "& > a": {
    textDecoration: "none",
  },

  _phone: {
    borderRadius: 0,
  },

  _tablet: {
    // prevent the fixed action rail from scroll with this element instead of the viewport
    willChange: "auto !important",
  },
});

/**
 * Settings pane
 */
const InnerContent = styled("div", {
  base: {
    gap: "13px",
    minWidth: 0,
    width: "100%",
    display: "flex",
    maxWidth: "740px",
    padding: "80px 32px",
    justifyContent: "stretch",
    zIndex: 1,

    _tablet: { padding: "12px", paddingBottom: "96px" },
    _phone: { height: "100vh" },
  },
});

/**
 * Pane content column
 */
const InnerColumn = styled("div", {
  base: {
    width: "100%",
    gap: "var(--gap-md)",
    display: "flex",
    flexDirection: "column",
    marginBlockEnd: "80px",
  },
});

/**
 * Viewport-height rail for settings controls
 */
const ActionRail = styled("div", {
  base: {
    height: "100vh",
    minWidth: "56px",
    padding: "80px 8px calc(var(--gap-xl) + env(safe-area-inset-bottom))",

    zIndex: 2,
    flexGrow: 1,
    flexShrink: 0,
    alignSelf: "flex-start",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,

    _tablet: {
      position: "fixed",
      insetInlineEnd: 0,
      height: "100dvh",
      padding: "12px",
      paddingBlockEnd: "calc(12px + env(safe-area-inset-bottom))",
      alignItems: "flex-end",
      justifyContent: "flex-end",
      pointerEvents: "none",

      "& > *": {
        pointerEvents: "auto",
      },
    },
  },
});

/**
 * Bottom-end anchor for actions belonging to the current settings page
 */
const FloatingActions = styled("div", {
  base: {
    height: "fit-content",
  },
});

/**
 * Positioning for close button
 */
const CloseAction = styled("div", {
  base: {
    visibility: "visible",

    "&:after": {
      content: '"ESC"',
      marginTop: "4px",
      display: "flex",
      justifyContent: "center",
      width: "40px",
      fontWeight: 600,
      color: "var(--md-sys-color-on-surface)",
      fontSize: "0.75rem",
    },

    _tablet: {
      display: "none",
    },
  },
});
