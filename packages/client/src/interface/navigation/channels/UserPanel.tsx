import { Show, createSignal } from "solid-js";

import { useLingui } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import { useUser } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useVoice } from "@revolt/rtc";
import { Avatar, UserStatus } from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import { UserMenu } from "../servers/UserMenu";

/**
 * Current user card pinned to the bottom of the sidebar
 */
export function UserPanel() {
  const { t } = useLingui();
  const user = useUser();
  const voice = useVoice();
  const { openModal } = useModals();

  const [anchor, setAnchor] = createSignal<HTMLElement>();

  const statusLine = () => {
    const text = user()?.status?.text;
    if (text) return text;
    switch (user()?.presence) {
      case "Busy":
        return t`Do Not Disturb`;
      case "Idle":
        return t`Idle`;
      case "Focus":
        return t`Focus`;
      case "Invisible":
        return t`Invisible`;
      default:
        return t`Online`;
    }
  };

  return (
    <Panel>
      <Identity ref={setAnchor} type="button" aria-label={t`Set status`}>
        <Avatar
          size={36}
          src={user()?.animatedAvatarURL}
          fallback={user()?.username}
          holepunch="bottom-right"
          overlay={<UserStatus.Graphic status={user()?.presence} />}
        />
        <Names>
          <Name>{user()?.displayName}</Name>
          <Sub>{statusLine()}</Sub>
        </Names>
      </Identity>
      <UserMenu anchor={anchor} />
      <Actions>
        <PanelButton
          type="button"
          off={!voice.microphone()}
          disabled={!voice.speakingPermission}
          aria-label={voice.microphone() ? t`Mute` : t`Unmute`}
          title={voice.microphone() ? t`Mute` : t`Unmute`}
          onClick={() => voice.toggleMute()}
        >
          <Show when={voice.microphone()} fallback={<Symbol size={22}>mic_off</Symbol>}>
            <Symbol size={22}>mic</Symbol>
          </Show>
        </PanelButton>
        <PanelButton
          type="button"
          off={voice.deafen() || !voice.listenPermission}
          disabled={!voice.listenPermission}
          aria-label={voice.deafen() ? t`Undeafen` : t`Deafen`}
          title={voice.deafen() ? t`Undeafen` : t`Deafen`}
          onClick={() => voice.toggleDeafen()}
        >
          <Show
            when={voice.deafen() || !voice.listenPermission}
            fallback={<Symbol size={22}>headset</Symbol>}
          >
            <Symbol size={22}>headset_off</Symbol>
          </Show>
        </PanelButton>
        <PanelButton
          type="button"
          aria-label={t`Settings`}
          title={t`Settings`}
          onClick={() => openModal({ type: "settings", config: "user" })}
        >
          <Symbol size={22}>settings</Symbol>
        </PanelButton>
      </Actions>
    </Panel>
  );
}

const Panel = styled("div", {
  base: {
    height: "var(--layout-height-user-panel)",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "var(--space-1)",
    padding: "0 var(--space-2)",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-lowest)",
  },
});

const Identity = styled("button", {
  base: {
    flex: 1,
    minWidth: 0,
    height: "40px",
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "0 var(--space-1)",
    textAlign: "left",
    cursor: "pointer",
    color: "inherit",
    borderRadius: "var(--radius-control)",
    transition: "background var(--motion-fast) var(--ease-standard)",

    "&:hover": {
      background: "var(--md-sys-color-surface-container-high)",
    },
  },
});

const Names = styled("div", {
  base: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.25,
  },
});

const Name = styled("span", {
  base: {
    fontSize: "14px",
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

const Sub = styled("span", {
  base: {
    fontSize: "12px",
    color: "var(--md-sys-color-on-surface-variant)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

const Actions = styled("div", {
  base: {
    display: "flex",
    flexShrink: 0,
    gap: "2px",
  },
});

const PanelButton = styled("button", {
  base: {
    width: "36px",
    height: "36px",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    borderRadius: "var(--radius-control)",
    color: "var(--md-sys-color-on-surface-variant)",
    transition:
      "background var(--motion-fast) var(--ease-standard), color var(--motion-fast)",

    "&:hover:not(:disabled)": {
      color: "var(--md-sys-color-on-surface)",
      background: "var(--md-sys-color-surface-container-high)",
    },

    "&:disabled": {
      opacity: 0.4,
      cursor: "not-allowed",
    },

    _phone: {
      width: "40px",
      height: "40px",
    },
  },
  variants: {
    off: {
      true: {
        color: "var(--md-sys-color-error)",
      },
      false: {},
    },
  },
});
