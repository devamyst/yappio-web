import { createFormControl, createFormGroup } from "solid-forms";
import { For, Match, Show, Switch, createMemo, createSignal } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { Server } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { useError } from "@revolt/i18n";
import { useInstance } from "@revolt/instance";
import { useModals } from "@revolt/modal";
import { Button, CircularProgress, Form2 } from "@revolt/ui";

/**
 * Emoji list
 */
export function EmojiList(props: { server: Server }) {
  const err = useError();
  const { t } = useLingui();
  const client = useClient();
  const { openModal, showError } = useModals();
  const [dragging, setDragging] = createSignal(false);
  const [confirming, setConfirming] = createSignal<string>();
  const instance = useInstance();

  function isDisabled() {
    return props.server.emojis.length >= instance.globalLimits.server_emoji;
  }

  const editGroup = createFormGroup(
    {
      name: createFormControl("", { required: true }),
      file: createFormControl<string | File[] | null>(null, {
        required: true,
      }),
    },
    {
      disabled: isDisabled(),
    },
  );

  async function onSubmit() {
    const body = new FormData();
    body.append("file", editGroup.controls.file.value![0]);

    const [key, value] = client().authenticationHeader;
    const data: { id: string } = await fetch(`${instance.mediaUrl}/emojis`, {
      method: "POST",
      body,
      headers: {
        [key]: value,
      },
    }).then((res) => res.json());

    await props.server.createEmoji(data.id, {
      name: editGroup.controls.name.value,
    });
  }

  function onReset() {
    editGroup.controls.name.setValue("");
    editGroup.controls.file.setValue(null);
  }

  const previewUrl = createMemo(() => {
    const value = editGroup.controls.file.value;
    return Array.isArray(value) && value[0]
      ? URL.createObjectURL(value[0])
      : undefined;
  });

  function pickFile(files: FileList | null | undefined) {
    const file = files?.[0];
    if (file && file.type.startsWith("image/")) {
      editGroup.controls.file.setValue([file]);
      editGroup.controls.file.markDirty(true);
    }
  }

  async function remove(emoji: Server["emojis"][number]) {
    if (confirming() !== emoji.id) {
      setConfirming(emoji.id);
      return;
    }
    setConfirming(undefined);
    try {
      await emoji.delete();
    } catch (error) {
      showError(error);
    }
  }

  const submit = Form2.useSubmitHandler(editGroup, onSubmit, onReset);

  return (
    <Page>
      <Card>
        <CardTitle>
          <Trans>Upload emoji</Trans>
        </CardTitle>
        <form onSubmit={submit}>
          <Fields>
            <DropZone
              dragging={dragging()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pickFile(e.dataTransfer?.files);
              }}
            >
              <Show
                when={previewUrl()}
                fallback={
                  <DropHint>
                    <Trans>Drop an image or click to browse</Trans>
                  </DropHint>
                }
              >
                <img
                  src={previewUrl()}
                  class={css({ maxWidth: "64px", maxHeight: "64px" })}
                />
              </Show>
              <input
                type="file"
                accept="image/*"
                class={css({
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  cursor: "pointer",
                })}
                onChange={(e) => pickFile(e.currentTarget.files)}
              />
            </DropZone>
            <Side>
              <Form2.TextField
                minlength={1}
                maxlength={32}
                counter
                name="name"
                control={editGroup.controls.name}
                label={t`Emoji Name`}
                pattern="[a-z0-9_]{1,32}"
                helper={t`Lowercase letters, numbers and underscores only.`}
                helper-on-focus={true}
                autocomplete="off"
              />
              <Footer>
                <Form2.Submit group={editGroup}>
                  <Trans>Create</Trans>
                </Form2.Submit>
                <Switch
                  fallback={
                    <Hint>
                      <Trans>
                        {instance.globalLimits.server_emoji -
                          props.server.emojis.length}{" "}
                        emoji slots remaining
                      </Trans>
                    </Hint>
                  }
                >
                  <Match when={editGroup.errors?.error}>
                    {err(editGroup.errors!.error)}
                  </Match>
                  <Match when={editGroup.isPending}>
                    <CircularProgress />
                  </Match>
                </Switch>
              </Footer>
            </Side>
          </Fields>
        </form>
      </Card>

      <Card>
        <CardTitle>
          <Trans>Emoji</Trans> ({props.server.emojis.length})
        </CardTitle>
        <Show
          when={props.server.emojis.length}
          fallback={
            <Hint>
              <Trans>No custom emoji yet.</Trans>
            </Hint>
          }
        >
          <Grid>
            <For
              each={props.server.emojis.toSorted((b, a) =>
                a.id.localeCompare(b.id),
              )}
            >
              {(emoji) => (
                <Tile>
                  <button
                    type="button"
                    class={css({ cursor: "pointer", display: "flex" })}
                    aria-label={emoji.name}
                    onClick={() => openModal({ type: "emoji_preview", emoji })}
                  >
                    <img src={emoji.url} alt={emoji.name} width={40} height={40} />
                  </button>
                  <TileName>:{emoji.name}:</TileName>
                  <Button
                    size="xs"
                    variant={confirming() === emoji.id ? "_error" : "tonal"}
                    onPress={() => remove(emoji)}
                  >
                    <Show when={confirming() === emoji.id} fallback={t`Delete`}>
                      <Trans>Confirm</Trans>
                    </Show>
                  </Button>
                </Tile>
              )}
            </For>
          </Grid>
        </Show>
      </Card>
    </Page>
  );
}

const Page = styled("div", {
  base: { display: "flex", flexDirection: "column", gap: "var(--space-3)" },
});

const Card = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
    padding: "var(--space-4)",
    borderRadius: "var(--radius-card)",
    background: "var(--md-sys-color-surface-container-high)",
  },
});

const CardTitle = styled("div", {
  base: {
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".02em",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const Fields = styled("div", {
  base: {
    display: "flex",
    gap: "var(--space-4)",
    alignItems: "flex-start",
    "@media (max-width: 600px)": { flexDirection: "column" },
  },
});

const Side = styled("div", {
  base: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
  },
});

const Footer = styled("div", {
  base: { display: "flex", alignItems: "center", gap: "var(--space-3)" },
});

const Hint = styled("span", {
  base: { fontSize: "13px", color: "var(--md-sys-color-on-surface-variant)" },
});

const DropZone = styled("div", {
  base: {
    position: "relative",
    width: "128px",
    height: "128px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "var(--space-2)",
    borderRadius: "var(--radius-card)",
    border: "2px dashed var(--md-sys-color-outline)",
    color: "var(--md-sys-color-on-surface-variant)",
    transition: "background var(--motion-fast) var(--ease-standard)",
    "@media (max-width: 600px)": { width: "100%", height: "96px" },
  },
  variants: {
    dragging: {
      true: {
        background: "var(--md-sys-color-surface-container-highest)",
        borderColor: "var(--md-sys-color-primary)",
      },
      false: {},
    },
  },
});

const DropHint = styled("span", { base: { fontSize: "12px" } });

const Grid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))",
    gap: "var(--space-2)",
  },
});

const Tile = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "var(--space-1)",
    padding: "var(--space-2)",
    borderRadius: "var(--radius-control)",
    background: "var(--md-sys-color-surface-container)",
    minWidth: 0,
  },
});

const TileName = styled("div", {
  base: {
    maxWidth: "100%",
    fontSize: "12px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "var(--md-sys-color-on-surface)",
  },
});
