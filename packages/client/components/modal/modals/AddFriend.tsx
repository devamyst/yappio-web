import { createSignal } from "solid-js";

import { createFormControl, createFormGroup } from "solid-forms";

import { Trans, useLingui } from "@lingui/solid/macro";

import { Dialog, DialogProps, Form2, Text } from "@revolt/ui";

import { useModals } from "..";
import { Modals } from "../types";

/**
 * Add a new friend by username
 */
export function AddFriendModal(
  props: DialogProps & Modals & { type: "add_friend" },
) {
  const { t } = useLingui();
  const { showError } = useModals();

  const group = createFormGroup({
    username: createFormControl("", { required: true }),
  });

  const [hint, setHint] = createSignal<string>();

  const tagHelp = () =>
    t`Usernames have a 4-digit tag, like yapper#1234. Find it on their profile.`;

  async function onSubmit() {
    const username = group.controls.username.value.trim();

    if (!/^.+#\d{4}$/.test(username)) {
      setHint(tagHelp());
      return;
    }

    setHint(undefined);

    try {
      await props.client.api.post(`/users/friend`, { username });

      props.onClose();
    } catch (error) {
      const info = error as { type?: string; status?: number; message?: string };
      const text = `${info?.type ?? ""} ${info?.message ?? ""}`;
      if (
        info?.status === 400 ||
        /FailedValidation|InvalidUsername|NotFound/.test(text)
      ) {
        setHint(tagHelp());
      } else {
        showError(error);
      }
    }
  }

  const submit = Form2.useSubmitHandler(group, onSubmit);

  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      title={<Trans>Add a new friend</Trans>}
      actions={[
        { text: <Trans>Close</Trans> },
        {
          text: <Trans>Send Request</Trans>,
          onClick: () => {
            onSubmit();
            return false;
          },
          isDisabled: !Form2.canSubmit(group),
        },
      ]}
      isDisabled={group.isPending}
    >
      <form onSubmit={submit}>
        <Form2.TextField
          name="username"
          control={group.controls.username}
          label={t`Username`}
          placeholder={t`username#1234`}
        />
        <Text class="label" size="small">
          {hint() ?? tagHelp()}
        </Text>
      </form>
    </Dialog>
  );
}
