import { Show } from "solid-js";

import { createFormControl, createFormGroup } from "solid-forms";

import { Trans, useLingui } from "@lingui/solid/macro";

import {
  Avatar,
  Column,
  Dialog,
  DialogProps,
  Form2,
  MenuItem,
  Text,
} from "@revolt/ui";

import { useModals } from "..";
import { Modals } from "../types";

const PRESET_SECONDS: Record<string, number> = {
  "60": 60,
  "300": 300,
  "600": 600,
  "3600": 3600,
  "86400": 86400,
  "604800": 604800,
};

/**
 * Time out a server member
 */
export function TimeoutMemberModal(
  props: DialogProps & Modals & { type: "timeout_member" },
) {
  const { t } = useLingui();
  const { showError } = useModals();

  const group = createFormGroup({
    preset: createFormControl("600"),
    custom: createFormControl(""),
  });

  function until(): Date | undefined {
    const preset = group.controls.preset.value;
    if (preset === "custom") {
      const value = group.controls.custom.value;
      if (!value) return undefined;
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return new Date(Date.now() + PRESET_SECONDS[preset] * 1000);
  }

  function valid() {
    const date = until();
    return !!date && date.getTime() > Date.now();
  }

  async function onSubmit() {
    const date = until();
    if (!date) return;

    try {
      await props.member.setTimeout(date.toISOString());
      props.onClose();
    } catch (error) {
      showError(error);
    }
  }

  const submit = Form2.useSubmitHandler(group, onSubmit);

  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      title={<Trans>Timeout Member</Trans>}
      actions={[
        { text: <Trans>Cancel</Trans> },
        {
          text: <Trans>Timeout</Trans>,
          onClick: () => {
            onSubmit();
            return false;
          },
          isDisabled: !valid(),
        },
      ]}
      isDisabled={group.isPending}
    >
      <form onSubmit={submit}>
        <Column align>
          <Avatar src={props.member.user?.animatedAvatarURL} size={64} />
          <Text>
            <Trans>
              {props.member.user?.username} will not be able to send messages,
              react or speak until the timeout ends.
            </Trans>
          </Text>
          <Form2.Select label={t`Duration`} control={group.controls.preset}>
            <MenuItem value="60">
              <Trans>60 seconds</Trans>
            </MenuItem>
            <MenuItem value="300">
              <Trans>5 minutes</Trans>
            </MenuItem>
            <MenuItem value="600">
              <Trans>10 minutes</Trans>
            </MenuItem>
            <MenuItem value="3600">
              <Trans>1 hour</Trans>
            </MenuItem>
            <MenuItem value="86400">
              <Trans>1 day</Trans>
            </MenuItem>
            <MenuItem value="604800">
              <Trans>1 week</Trans>
            </MenuItem>
            <MenuItem value="custom">
              <Trans>Custom date</Trans>
            </MenuItem>
          </Form2.Select>
          <Show when={group.controls.preset.value === "custom"}>
            <Form2.TextField
              type="datetime-local"
              name="custom"
              control={group.controls.custom}
              label={t`Timeout until`}
            />
          </Show>
        </Column>
      </form>
    </Dialog>
  );
}
