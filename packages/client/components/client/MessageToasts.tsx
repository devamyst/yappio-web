import { For, Show, createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import { useLingui } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import { useNavigate } from "@revolt/routing";

export type MessageToast = {
  id: string;
  name: string;
  where?: string;
  body: string;
  avatar?: string;
  path: string;
};

const MAX_TOASTS = 3;
const DISMISS_MS = 5000;

const [toasts, setToasts] = createSignal<MessageToast[]>([]);
const timers = new Map<string, number>();

function dismiss(id: string) {
  window.clearTimeout(timers.get(id));
  timers.delete(id);
  setToasts((list) => list.filter((toast) => toast.id !== id));
}

export function showMessageToast(toast: MessageToast) {
  dismiss(toast.id);
  setToasts((list) => [...list, toast].slice(-MAX_TOASTS));
  for (const id of timers.keys()) {
    if (!toasts().some((entry) => entry.id === id)) dismiss(id);
  }
  timers.set(
    toast.id,
    window.setTimeout(() => dismiss(toast.id), DISMISS_MS),
  );
}

/**
 * Small stack of message popups shown while the window is focused on another channel
 */
export function MessageToasts() {
  const navigate = useNavigate();
  const { t } = useLingui();

  onCleanup(() => {
    for (const id of [...timers.keys()]) dismiss(id);
  });

  return (
    <Portal>
      <Stack aria-live="polite">
        <For each={toasts()}>
          {(toast) => (
            <Toast
              role="button"
              tabIndex={0}
              onClick={() => {
                dismiss(toast.id);
                navigate(toast.path);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  dismiss(toast.id);
                  navigate(toast.path);
                }
              }}
            >
              <Show
                when={toast.avatar}
                fallback={<Fallback>{toast.name.charAt(0)}</Fallback>}
              >
                <Image src={toast.avatar} alt="" draggable={false} />
              </Show>
              <Text>
                <Heading>
                  {toast.name}
                  <Show when={toast.where}>
                    <Where> {toast.where}</Where>
                  </Show>
                </Heading>
                <Body>{toast.body}</Body>
              </Text>
              <Close
                type="button"
                aria-label={t`Close`}
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(toast.id);
                }}
              >
                ×
              </Close>
            </Toast>
          )}
        </For>
      </Stack>
    </Portal>
  );
}

const Stack = styled("div", {
  base: {
    position: "fixed",
    insetInlineEnd: "16px",
    bottom: "calc(16px + env(safe-area-inset-bottom))",
    zIndex: 998,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "min(340px, calc(100vw - 32px))",
    pointerEvents: "none",
  },
});

const Toast = styled("div", {
  base: {
    pointerEvents: "auto",
    cursor: "pointer",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "10px 8px 10px 10px",
    borderRadius: "4px",
    background: "#111214",
    color: "#dbdee1",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.24)",
    "&:hover": { background: "#17181a" },
  },
});

const Image = styled("img", {
  base: {
    width: "36px",
    height: "36px",
    flexShrink: 0,
    borderRadius: "50%",
    objectFit: "cover",
  },
});

const Fallback = styled("div", {
  base: {
    width: "36px",
    height: "36px",
    flexShrink: 0,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "#5865f2",
    color: "#fff",
    fontWeight: 700,
    textTransform: "uppercase",
  },
});

const Text = styled("div", {
  base: { minWidth: 0, flexGrow: 1 },
});

const Heading = styled("div", {
  base: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#f2f3f5",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

const Where = styled("span", {
  base: { fontWeight: 400, color: "#949ba4" },
});

const Body = styled("div", {
  base: {
    fontSize: "13px",
    lineHeight: "1.3",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    wordBreak: "break-word",
  },
});

const Close = styled("button", {
  base: {
    cursor: "pointer",
    flexShrink: 0,
    width: "24px",
    height: "24px",
    borderRadius: "4px",
    fontSize: "18px",
    lineHeight: "1",
    color: "#949ba4",
    "&:hover": { color: "#f2f3f5", background: "rgba(255, 255, 255, 0.08)" },
  },
});
