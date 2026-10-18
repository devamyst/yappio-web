import { createSignal } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { useMutation } from "@tanstack/solid-query";

import { Column, Dialog, DialogProps, Text, TextField } from "@revolt/ui";

import { useModals } from "..";
import { Modals } from "../types";

const MAX_BULK = 100;

/**
 * Bulk delete selected messages or the latest messages in a channel
 */
export function PurgeMessagesModal(
  props: DialogProps & Modals & { type: "purge_messages" },
) {
  const { t } = useLingui();
  const { showError } = useModals();
  const [count, setCount] = createSignal("10");

  const selected = () => props.ids;

  const amount = () => {
    const n = Math.floor(Number(count()));
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), MAX_BULK) : 0;
  };

  const purge = useMutation(() => ({
    mutationFn: async () => {
      let ids = selected();
      if (!ids) {
        const messages = await props.channel.fetchMessages({
          limit: amount(),
        });
        ids = messages.map((message) => message.id);
      }

      if (ids.length < 1) return;
      await props.channel.deleteMessages(ids.slice(0, MAX_BULK));
      props.onDone?.();
    },
    onError: showError,
    onSuccess: () => props.onClose(),
  }));

  return (
    <Dialog
      destructive
      show={props.show}
      onClose={props.onClose}
      title={
        selected() ? (
          <Trans>Delete selected messages</Trans>
        ) : (
          <Trans>Purge messages</Trans>
        )
      }
      actions={[
        { text: <Trans>Cancel</Trans> },
        {
          text: <Trans>Delete</Trans>,
          onClick: () => {
            purge.mutate();
            return false;
          },
          isDisabled: !selected() && amount() < 1,
        },
      ]}
      isDisabled={purge.isPending}
    >
      <Column>
        {selected() ? (
          <Text>
            <Trans>
              You are about to delete {selected()!.length} messages. This
              cannot be undone.
            </Trans>
          </Text>
        ) : (
          <>
            <Text>
              <Trans>
                Delete the most recent messages in this channel. Up to{" "}
                {MAX_BULK} at a time, and the server only accepts recent
                messages. This cannot be undone.
              </Trans>
            </Text>
            <TextField
              type="number"
              label={t`Number of messages`}
              value={count()}
              min={1}
              max={MAX_BULK}
              onInput={(e) => setCount(e.currentTarget.value)}
              onChange={(e) => setCount(e.currentTarget.value)}
            />
          </>
        )}
      </Column>
    </Dialog>
  );
}
