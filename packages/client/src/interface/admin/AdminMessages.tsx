import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createResource,
  createSignal,
  on,
} from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import { AdminMessage, discovery } from "@revolt/common/lib/discovery";
import { useModals } from "@revolt/modal";

import {
  Btn,
  Field,
  Mono,
  Muted,
  Notice,
  Panel,
  Row,
  Stack,
  StateBadges,
  errorText,
  useToken,
  userLabel,
} from "./shared";

export function extractMessageId(text: string) {
  const found = text.toUpperCase().match(/[0-9A-Z]{26}/g);
  return found ? found[found.length - 1] : text.trim();
}

export function AdminMessages(props: { initial?: string }) {
  const { t } = useLingui();
  const token = useToken();
  const { openModal } = useModals();

  const [text, setText] = createSignal(props.initial ?? "");
  const [id, setId] = createSignal<string | undefined>(
    props.initial ? extractMessageId(props.initial) : undefined,
  );

  createEffect(
    on(
      () => props.initial,
      (value) => {
        if (value) {
          setText(value);
          setId(extractMessageId(value));
        }
      },
      { defer: true },
    ),
  );

  const [data, { refetch }] = createResource(
    () => (id() ? ([token(), id()!] as const) : false),
    ([value, messageId]) => discovery.admin.message(value!, messageId),
  );

  function remove() {
    const detail = data()!;
    openModal({
      type: "admin_confirm",
      title: t`Delete message`,
      description: t`The message is removed for everyone. It cannot be undone.`,
      actionLabel: t`Delete message`,
      targetName: detail.message.id,
      targetId: detail.message.id,
      run: (reason) =>
        discovery.admin.deleteMessage(token()!, detail.message.id, {
          reason,
          confirm: detail.message.id,
        }),
      onDone: refetch,
    });
  }

  const authorName = (detail: { authors: { id: string }[] }, authorId: string) => {
    const user = detail.authors.find((entry) => entry.id === authorId) as
      | { username: string; displayName: string | null }
      | undefined;
    return user ? userLabel(user) : authorId;
  };

  return (
    <Stack>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setId(extractMessageId(text()));
        }}
      >
        <Row>
          <Field
            value={text()}
            aria-label={t`Message id or link`}
            placeholder={t`Message id or link`}
            onInput={(e) => setText(e.currentTarget.value)}
          />
          <Btn type="submit" data-tone="primary">
            <Trans>Look up</Trans>
          </Btn>
        </Row>
      </form>
      <Switch>
        <Match when={!id()}>
          <Panel>
            <Muted>
              <Trans>Paste a message id or a message link.</Trans>
            </Muted>
          </Panel>
        </Match>
        <Match when={data.error}>
          <Notice tone="danger">{errorText(data.error)}</Notice>
        </Match>
        <Match when={data.loading && !data()}>
          <Muted>
            <Trans>Loading</Trans>
          </Muted>
        </Match>
        <Match when={data()}>
          {(detail) => (
            <Panel>
              <Row>
                <Mono>{detail().message.id}</Mono>
                <Show when={detail().server}>
                  <Muted>{detail().server!.name}</Muted>
                </Show>
                <Show when={detail().channel?.name}>
                  <Muted>#{detail().channel!.name}</Muted>
                </Show>
              </Row>
              <Show when={detail().author}>
                {(author) => (
                  <Row>
                    <strong>{userLabel(author())}</strong>
                    <StateBadges user={author()} />
                  </Row>
                )}
              </Show>
              <Row>
                <Btn type="button" data-tone="danger" onClick={remove}>
                  <Trans>Delete message</Trans>
                </Btn>
              </Row>
              <h3>
                <Trans>Context</Trans>
              </h3>
              <Stack>
                <For each={detail().context}>
                  {(entry: AdminMessage) => (
                    <Line data-focus={entry.id === detail().message.id}>
                      <Muted>{authorName(detail(), entry.author)}</Muted>
                      <span>{entry.content}</span>
                      <Show when={entry.attachmentCount > 0}>
                        <Muted>
                          <Trans>{entry.attachmentCount} attachments</Trans>
                        </Muted>
                      </Show>
                    </Line>
                  )}
                </For>
              </Stack>
            </Panel>
          )}
        </Match>
      </Switch>
    </Stack>
  );
}

const Line = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    padding: "6px 10px",
    fontSize: "14px",
    borderRadius: "4px",
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",

    "&[data-focus=true]": {
      background: "var(--md-sys-color-surface-container-highest)",
    },
  },
});
