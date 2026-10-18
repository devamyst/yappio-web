import { Trans } from "@lingui/solid/macro";
import { useMutation } from "@tanstack/solid-query";

import { Avatar, Column, Dialog, DialogProps, Text } from "@revolt/ui";

import { useModals } from "..";
import { Modals } from "../types";

export function BlockUserModal(
  props: DialogProps & Modals & { type: "block_user" },
) {
  const { showError } = useModals();

  const block = useMutation(() => ({
    mutationFn: () => props.user.blockUser(),
    onError: showError,
  }));

  return (
    <Dialog
      destructive
      show={props.show}
      onClose={props.onClose}
      title={<Trans>Block User</Trans>}
      actions={[
        { text: <Trans>Cancel</Trans> },
        { text: <Trans>Block</Trans>, onClick: block.mutateAsync },
      ]}
      isDisabled={block.isPending}
    >
      <Column align>
        <Avatar src={props.user.animatedAvatarURL} size={64} />
        <Text>
          <Trans>
            {props.user.displayName} will no longer be able to message you or
            send you friend requests.
          </Trans>
        </Text>
      </Column>
    </Dialog>
  );
}
