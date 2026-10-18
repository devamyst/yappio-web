import { For, Show } from "solid-js";

import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { MessageContextMenu, useMessage } from "@revolt/app";
import { useUser } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useState } from "@revolt/state";
import { Emoji } from "@revolt/markdown";
import { Ripple } from "@revolt/ui/components/design";
import { iconSize } from "@revolt/ui/components/utils";

import { pushRecentEmoji, recentEmoji } from "../composition/picker/recentEmoji";

import MdDelete from "@material-design-icons/svg/outlined/delete.svg?component-solid";
import MdEdit from "@material-design-icons/svg/outlined/edit.svg?component-solid";
import MdEmojiEmotions from "@material-design-icons/svg/outlined/emoji_emotions.svg?component-solid";
import MdMoreVert from "@material-design-icons/svg/outlined/more_vert.svg?component-solid";
import MdReply from "@material-design-icons/svg/outlined/reply.svg?component-solid";

export function MessageToolbar() {
  const user = useUser();
  const state = useState();
  const { openModal } = useModals();
  const { message, reactPicker } = useMessage();

  let reactRef;

  // todo: a11y for buttons; tabindex

  /**
   * Delete the message
   */
  function deleteMessage(ev: MouseEvent) {
    if (ev.shiftKey) {
      message?.delete();
    } else if (message) {
      openModal({
        type: "delete_message",
        message: message,
      });
    }
  }

  const quick = () => recentEmoji().slice(0, 4);

  return (
    <Base class="Toolbar">
      <Show when={message?.channel?.havePermission("React")}>
        <For each={quick()}>
          {(value) => (
            <div
              class={tool()}
              role="button"
              tabIndex={0}
              onClick={() => {
                message?.react(value);
                pushRecentEmoji(value);
              }}
              style={{ "--emoji-size": "20px" }}
            >
              <Emoji emoji={value} />
            </div>
          )}
        </For>
      </Show>
      <Show when={message?.channel?.havePermission("SendMessage")}>
        <div
          class={tool()}
          onClick={() => state.draft.addReply(message!, user()!.id)}
        >
          <Ripple />
          <MdReply {...iconSize(20)} />
        </div>
      </Show>
      <Show when={message?.channel?.havePermission("React")}>
        <div
          ref={reactRef}
          class={tool()}
          onClick={(e) => reactPicker!()?.onClickEmoji(e, reactRef)}
        >
          <Ripple />
          <MdEmojiEmotions {...iconSize(20)} />
        </div>
      </Show>
      <Show when={message?.author?.self}>
        <div
          class={tool()}
          onClick={() => state.draft.setEditingMessage(message)}
        >
          <Ripple />
          <MdEdit {...iconSize(20)} />
        </div>
      </Show>
      <Show
        when={
          message?.author?.self ||
          message?.channel?.havePermission("ManageMessages")
        }
      >
        <div class={tool()} onClick={deleteMessage}>
          <Ripple />
          <MdDelete {...iconSize(20)} />
        </div>
      </Show>
      <div
        class={tool()}
        use:floating={{
          contextMenu: () => (
            <MessageContextMenu message={message!} reactPicker={reactPicker} />
          ),
          contextMenuHandler: "click",
        }}
      >
        <Ripple />
        <MdMoreVert {...iconSize(20)} />
      </div>
    </Base>
  );
}

const Base = styled("div", {
  base: {
    top: "-18px",
    right: "16px",
    zIndex: 2,
    position: "absolute",

    alignItems: "center",
    gap: "2px",
    padding: "3px",

    display: "none",
    borderRadius: "var(--radius-control)",
    boxShadow: "var(--elev-2)",
    border: "var(--hairline)",

    fill: "var(--md-sys-color-on-surface-variant)",
    background: "var(--md-sys-color-surface-container-high)",
  },
});

const tool = cva({
  base: {
    cursor: "pointer",
    position: "relative",
    padding: "6px",
    minWidth: "32px",
    minHeight: "32px",
    overflow: "hidden",
    borderRadius: "var(--radius-control)",
    display: "grid",
    placeItems: "center",
    transition: "var(--transitions-fast) all",
    _hover: {
      fill: "var(--md-sys-color-primary)",
      background:
        "color-mix(in srgb, var(--md-sys-color-primary) 16%, transparent)",
    },
    _focusVisible: {
      outline: "2px solid var(--md-sys-color-primary)",
    },
    "& img": {
      width: "20px",
      height: "20px",
      objectFit: "contain",
    },
  },
});
