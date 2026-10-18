import { Show, createEffect, createSignal, onCleanup } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { ConnectionQuality, RoomEvent } from "livekit-client";
import { styled } from "styled-system/jsx";

import { useNavigate } from "@revolt/routing";
import { useVoice } from "@revolt/rtc";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

/**
 * Connection summary shown above the user panel while in a voice channel
 */
export function VoiceConnectedPanel() {
  const voice = useVoice();
  const navigate = useNavigate();
  const { t } = useLingui();

  const [quality, setQuality] = createSignal<ConnectionQuality>(
    ConnectionQuality.Unknown,
  );

  createEffect(() => {
    const room = voice.room();
    if (!room) return;
    const update = () => setQuality(room.localParticipant.connectionQuality);
    update();
    room.on(RoomEvent.ConnectionQualityChanged, update);
    onCleanup(() => room.off(RoomEvent.ConnectionQualityChanged, update));
  });

  const qualityText = () => {
    switch (quality()) {
      case ConnectionQuality.Excellent:
        return t`Excellent connection`;
      case ConnectionQuality.Good:
        return t`Good connection`;
      case ConnectionQuality.Poor:
        return t`Poor connection`;
      default:
        return t`Checking connection`;
    }
  };

  const connected = () => voice.state() === "CONNECTED";

  return (
    <Show when={voice.channel()}>
      <Panel>
        <Dot connected={connected()} />
        <Info
          type="button"
          onClick={() => navigate(voice.channel()?.path ?? "")}
        >
          <Title>
            <Show when={connected()} fallback={<Trans>Connecting</Trans>}>
              <Trans>Voice connected</Trans>
            </Show>
          </Title>
          <Sub>
            {voice.channel()?.name} &middot; {qualityText()}
          </Sub>
        </Info>
        <Leave
          type="button"
          aria-label={t`End call`}
          title={t`End call`}
          onClick={() => voice.disconnect()}
        >
          <Symbol size={20}>call_end</Symbol>
        </Leave>
      </Panel>
    </Show>
  );
}

const Panel = styled("div", {
  base: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    margin: "0 var(--space-2) var(--space-1)",
    padding: "var(--space-2) var(--space-3)",
    borderRadius: "var(--radius-card)",
    border: "var(--hairline)",
    background: "var(--md-sys-color-surface-container-high)",
  },
});

const Dot = styled("span", {
  base: {
    width: "10px",
    height: "10px",
    flexShrink: 0,
    borderRadius: "50%",
    background: "var(--brand-presence-idle)",
  },
  variants: {
    connected: {
      true: {
        background: "var(--brand-presence-online)",
        boxShadow: "0 0 0 3px rgb(58 191 126 / .25)",
      },
      false: {},
    },
  },
});

const Info = styled("button", {
  base: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    cursor: "pointer",
    color: "inherit",
  },
});

const Title = styled("span", {
  base: {
    fontSize: "13px",
    fontWeight: 700,
    color: "var(--brand-presence-online)",
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

const Leave = styled("button", {
  base: {
    width: "32px",
    height: "32px",
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    borderRadius: "var(--radius-control)",
    color: "var(--md-sys-color-error)",
    transition: "background var(--motion-fast) var(--ease-standard)",

    "&:hover": {
      background: "var(--md-sys-color-error-container)",
    },
  },
});
