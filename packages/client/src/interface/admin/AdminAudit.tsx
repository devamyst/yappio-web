import { For, Show, createSignal, onMount } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";

import { AdminAuditRow, discovery } from "@revolt/common/lib/discovery";

import {
  Badge,
  Btn,
  Field,
  Muted,
  Notice,
  Panel,
  Row,
  Stack,
  errorText,
  formatTime,
  useToken,
} from "./shared";

export function AuditList(props: { items: AdminAuditRow[] }) {
  return (
    <Stack>
      <For
        each={props.items}
        fallback={
          <Muted>
            <Trans>Nothing recorded.</Trans>
          </Muted>
        }
      >
        {(row) => (
          <Stack style={{ gap: "2px" }}>
            <Row>
              <strong>{row.action}</strong>
              <Badge>{row.targetType}</Badge>
              <Show when={row.failed}>
                <Badge data-tone="danger">
                  <Trans>Failed</Trans>
                </Badge>
              </Show>
            </Row>
            <Muted>
              {formatTime(row.at)} / {row.adminName} / {row.targetId}
            </Muted>
            <Muted>{row.reason}</Muted>
          </Stack>
        )}
      </For>
    </Stack>
  );
}

export function AdminAudit() {
  const { t } = useLingui();
  const token = useToken();

  const [target, setTarget] = createSignal("");
  const [admin, setAdmin] = createSignal("");
  const [items, setItems] = createSignal<AdminAuditRow[]>([]);
  const [next, setNext] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");

  async function load(more: boolean) {
    setLoading(true);
    setError("");
    try {
      const page = await discovery.admin.audit(token()!, {
        target: target().trim() || undefined,
        admin: admin().trim() || undefined,
        before: more ? (next() ?? undefined) : undefined,
      });
      setItems(more ? [...items(), ...page.items] : page.items);
      setNext(page.next);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }

  onMount(() => load(false));

  return (
    <Panel>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(false);
        }}
      >
        <Row>
          <Field
            value={target()}
            aria-label={t`Target id`}
            placeholder={t`Target id`}
            onInput={(e) => setTarget(e.currentTarget.value)}
          />
          <Field
            value={admin()}
            aria-label={t`Admin id`}
            placeholder={t`Admin id`}
            onInput={(e) => setAdmin(e.currentTarget.value)}
          />
          <Btn type="submit" data-tone="primary" disabled={loading()}>
            <Trans>Filter</Trans>
          </Btn>
        </Row>
      </form>
      <Show when={error()}>
        <Notice tone="danger">{error()}</Notice>
      </Show>
      <AuditList items={items()} />
      <Show when={next()}>
        <Row>
          <Btn type="button" disabled={loading()} onClick={() => load(true)}>
            <Trans>Load more</Trans>
          </Btn>
        </Row>
      </Show>
    </Panel>
  );
}
