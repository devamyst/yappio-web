import { Show, createSignal } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import { Dialog, DialogProps } from "@revolt/ui";

import { Modals } from "../types";

export function AdminConfirmModal(
  props: DialogProps & Modals & { type: "admin_confirm" },
) {
  const { t } = useLingui();

  const [reason, setReason] = createSignal("");
  const [typed, setTyped] = createSignal("");
  const [days, setDays] = createSignal("");
  const [error, setError] = createSignal("");
  const [busy, setBusy] = createSignal(false);

  const needsTyping = () => props.typeToConfirm !== false;

  const matches = () =>
    !needsTyping() ||
    typed().trim() === props.targetName ||
    typed().trim() === props.targetId;

  const daysValue = (): number | null | undefined => {
    if (!props.askDays) return null;
    const text = days().trim();
    if (text === "") return null;
    const value = Number(text);
    return Number.isInteger(value) && value >= 1 && value <= 3650
      ? value
      : undefined;
  };

  const valid = () =>
    reason().trim().length >= 3 &&
    reason().trim().length <= 300 &&
    matches() &&
    daysValue() !== undefined;

  async function submit() {
    setError("");
    setBusy(true);
    try {
      await props.run(reason().trim(), daysValue() ?? null);
      props.onDone?.();
    } catch (e) {
      setError(
        e instanceof Error && e.message ? e.message : t`Something went wrong.`,
      );
      throw e;
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      destructive={props.destructive !== false}
      show={props.show}
      onClose={props.onClose}
      title={props.title}
      minWidth={320}
      actions={[
        { text: <Trans>Cancel</Trans> },
        {
          text: props.actionLabel,
          isDisabled: !valid() || busy(),
          onClick: () => submit(),
        },
      ]}
    >
      <Wrap>
        <Show when={props.description}>
          <Hint>{props.description}</Hint>
        </Show>
        <Label>
          <Trans>Reason (3 to 300 characters)</Trans>
          <Area
            maxlength={300}
            value={reason()}
            onInput={(e) => setReason(e.currentTarget.value)}
          />
        </Label>
        <Show when={props.askDays}>
          <Label>
            <Trans>Days (empty for indefinite)</Trans>
            <Input
              inputmode="numeric"
              value={days()}
              onInput={(e) => setDays(e.currentTarget.value)}
            />
          </Label>
        </Show>
        <Show when={needsTyping()}>
          <Label>
            <span>
              <Trans>
                Type <strong>{props.targetName}</strong> or its id to confirm
              </Trans>
            </span>
            <Input
              autocomplete="off"
              value={typed()}
              onInput={(e) => setTyped(e.currentTarget.value)}
            />
          </Label>
        </Show>
        <Show when={error()}>
          <ErrorBox role="alert">{error()}</ErrorBox>
        </Show>
      </Wrap>
    </Dialog>
  );
}

const Wrap = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minWidth: 0,
    maxWidth: "min(420px, calc(100vw - 80px))",
    overflowWrap: "anywhere",
  },
});

const Hint = styled("p", {
  base: {
    margin: 0,
    fontSize: "14px",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const Label = styled("label", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--md-sys-color-on-surface)",
  },
});

const Input = styled("input", {
  base: {
    height: "40px",
    padding: "0 12px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "none",
    outline: "none",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-highest)",

    "&:focus-visible": { outline: "2px solid var(--md-sys-color-primary)" },
  },
});

const Area = styled("textarea", {
  base: {
    minHeight: "72px",
    padding: "10px 12px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    borderRadius: "4px",
    border: "none",
    outline: "none",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-highest)",

    "&:focus-visible": { outline: "2px solid var(--md-sys-color-primary)" },
  },
});

const ErrorBox = styled("div", {
  base: {
    padding: "10px 12px",
    fontSize: "13px",
    borderRadius: "4px",
    color: "var(--md-sys-color-error)",
    border: "1px solid var(--md-sys-color-error)",
  },
});
