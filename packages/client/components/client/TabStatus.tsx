import { createEffect, createMemo, onCleanup } from "solid-js";

import { useLingui } from "@lingui/solid/macro";

import { useModals } from "@revolt/modal";
import { useLocation, useSmartParams } from "@revolt/routing";
import { useState } from "@revolt/state";

import { useClient, useClientLifecycle } from ".";

const BASE_TITLE = "Yappio";
const ICON_SOURCE = "/assets/web/android-chrome-512x512.png";
const ICON_LINK_ID = "yappio-dynamic-icon";

let iconImage: Promise<HTMLImageElement> | undefined;

function loadIcon() {
  iconImage ??= new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = ICON_SOURCE;
  });
  return iconImage;
}

function removeIconLink() {
  document.getElementById(ICON_LINK_ID)?.remove();
}

async function drawIcon(mentions: number, unread: boolean) {
  if (!mentions && !unread) {
    removeIconLink();
    return;
  }

  const image = await loadIcon();
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(image, 0, 0, size, size);

  if (mentions) {
    const radius = 22;
    const cx = size - radius;
    const cy = size - radius;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#f23f43";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 30px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(mentions > 9 ? "9+" : String(mentions), cx, cy + 2);
  } else {
    const cx = size - 14;
    const cy = size - 14;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#f23f43";
    ctx.fill();
  }

  let link = document.getElementById(ICON_LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = ICON_LINK_ID;
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);
  }
  link.href = canvas.toDataURL("image/png");
}

/**
 * Keeps the tab title, tab icon and app badge in sync with where the user is and what is unread
 */
export function TabStatus() {
  const state = useState();
  const client = useClient();
  const params = useSmartParams();
  const location = useLocation();
  const modals = useModals();
  const { isLoggedIn } = useClientLifecycle();
  const { t } = useLingui();

  const totals = createMemo(() => {
    let mentions = 0;
    let unread = false;

    if (!isLoggedIn()) return { mentions, unread };

    for (const channel of client().channels.values()) {
      if (channel.type === "SavedMessages") continue;
      if (state.notifications.isMuted(channel)) continue;
      if (state.notifications.computeForChannel(channel) === "none") continue;
      if (!channel.unread) continue;

      if (channel.type === "DirectMessage" || channel.type === "Group") {
        mentions += Math.max(channel.mentions?.size ?? 0, 1);
      } else if (channel.mentions?.size) {
        mentions += channel.mentions.size;
      } else {
        unread = true;
      }
    }

    return { mentions, unread };
  });

  const pageTitle = createMemo(() => {
    if (modals.isOpen("settings")) return t`Settings`;

    const channelId = params().channelId;
    const channel = channelId ? client().channels.get(channelId) : undefined;
    if (channel) {
      switch (channel.type) {
        case "TextChannel":
          return `#${channel.name} | ${channel.server?.name ?? BASE_TITLE}`;
        case "DirectMessage":
          return `@${channel.displayName ?? channel.recipient?.username ?? ""}`;
        case "Group":
          return channel.name;
      }
    }

    const server = params().serverId
      ? client().servers.get(params().serverId!)
      : undefined;
    if (server) return server.name;

    const path = location.pathname;
    if (path.startsWith("/friends")) return t`Friends`;
    if (path.startsWith("/discover")) return t`Discover`;
    return undefined;
  });

  createEffect(() => {
    if (!isLoggedIn()) return;

    const { mentions, unread } = totals();
    const page = pageTitle();
    const prefix = mentions ? `(${mentions}) ` : unread ? "• " : "";
    document.title = `${prefix}${page ? `${page} - ${BASE_TITLE}` : BASE_TITLE}`;

    drawIcon(mentions, unread).catch(() => removeIconLink());

    if (mentions) navigator.setAppBadge?.(mentions)?.catch(() => {});
    else navigator.clearAppBadge?.()?.catch(() => {});

    onCleanup(() => {
      document.title = BASE_TITLE;
    });
  });

  createEffect(() => {
    if (isLoggedIn()) return;
    removeIconLink();
    navigator.clearAppBadge?.()?.catch(() => {});
  });

  return null;
}
