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

import { discovery } from "@revolt/common/lib/discovery";
import { useModals } from "@revolt/modal";

import { AuditList } from "./AdminAudit";
import {
  Badge,
  Btn,
  Field,
  ListItem,
  Mono,
  Muted,
  Notice,
  Panel,
  Row,
  Split,
  Stack,
  StateBadges,
  errorText,
  useToken,
  userLabel,
} from "./shared";

export function AdminServers(props: { initial?: string }) {
  const { t } = useLingui();
  const token = useToken();

  const [text, setText] = createSignal(props.initial ?? "");
  const [query, setQuery] = createSignal(props.initial ?? "");
  const [selected, setSelected] = createSignal<string | undefined>(
    props.initial,
  );

  createEffect(
    on(
      () => props.initial,
      (value) => {
        if (value) {
          setText(value);
          setQuery(value);
          setSelected(value);
        }
      },
      { defer: true },
    ),
  );

  const [results] = createResource(
    () => (query().trim() ? ([token(), query().trim()] as const) : false),
    ([value, q]) => discovery.admin.servers(value!, q),
  );

  return (
    <Split>
      <Stack>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(text());
          }}
        >
          <Row>
            <Field
              type="search"
              value={text()}
              aria-label={t`Search servers`}
              placeholder={t`Server id or name`}
              onInput={(e) => setText(e.currentTarget.value)}
            />
            <Btn type="submit" data-tone="primary">
              <Trans>Search</Trans>
            </Btn>
          </Row>
        </form>
        <Switch>
          <Match when={results.error}>
            <Notice tone="danger">{errorText(results.error)}</Notice>
          </Match>
          <Match when={results.loading}>
            <Muted>
              <Trans>Searching</Trans>
            </Muted>
          </Match>
          <Match when={results() && results()!.length === 0}>
            <Muted>
              <Trans>No servers found.</Trans>
            </Muted>
          </Match>
          <Match when={results()}>
            <Stack>
              <For each={results()}>
                {(server) => (
                  <ListItem
                    type="button"
                    aria-current={selected() === server.id}
                    onClick={() => setSelected(server.id)}
                  >
                    <strong>{server.name}</strong>
                    <Muted>{server.id}</Muted>
                  </ListItem>
                )}
              </For>
            </Stack>
          </Match>
        </Switch>
      </Stack>
      <Show
        when={selected()}
        fallback={
          <Panel>
            <Muted>
              <Trans>Search for a server to see its details.</Trans>
            </Muted>
          </Panel>
        }
      >
        {(id) => <ServerDetail id={id()} />}
      </Show>
    </Split>
  );
}

function ServerDetail(props: { id: string }) {
  const { t } = useLingui();
  const token = useToken();
  const { openModal } = useModals();

  const [data, { refetch }] = createResource(
    () => [token(), props.id] as const,
    ([value, id]) => discovery.admin.server(value!, id),
  );

  function setFlag(name: "official" | "verified", value: boolean) {
    const server = data()!.server;
    openModal({
      type: "admin_confirm",
      title: name === "official" ? t`Official badge` : t`Verified badge`,
      actionLabel: value ? t`Grant` : t`Remove`,
      targetName: server.name,
      targetId: server.id,
      typeToConfirm: false,
      destructive: false,
      run: (reason) =>
        discovery.admin.serverFlags(token()!, server.id, {
          reason,
          confirm: server.id,
          [name]: value,
        }),
      onDone: refetch,
    });
  }

  function takeover() {
    const server = data()!.server;
    openModal({
      type: "admin_confirm",
      title: t`Take over server`,
      description: t`You become the owner. The previous owner is kept in the audit log.`,
      actionLabel: t`Take over`,
      targetName: server.name,
      targetId: server.id,
      run: (reason) =>
        discovery.admin.serverAction(token()!, server.id, "takeover", {
          reason,
          confirm: server.id,
        }),
      onDone: refetch,
    });
  }

  function remove() {
    const server = data()!.server;
    openModal({
      type: "admin_confirm",
      title: t`Delete server`,
      description: t`This takes ownership, deletes the server for everyone and removes its listing. It cannot be undone.`,
      actionLabel: t`Delete server`,
      targetName: server.name,
      targetId: server.id,
      run: (reason) =>
        discovery.admin.serverAction(token()!, server.id, "delete", {
          reason,
          confirm: server.id,
        }),
      onDone: refetch,
    });
  }

  return (
    <Switch>
      <Match when={data.error}>
        <Panel>
          <Notice tone="danger">{errorText(data.error)}</Notice>
        </Panel>
      </Match>
      <Match when={data.loading && !data()}>
        <Panel>
          <Muted>
            <Trans>Loading</Trans>
          </Muted>
        </Panel>
      </Match>
      <Match when={data()}>
        {(detail) => (
          <Panel>
            <h2>{detail().server.name}</h2>
            <Row>
              <Mono>{detail().server.id}</Mono>
              <Show when={detail().server.official}>
                <Badge data-tone="primary">
                  <Trans>Official</Trans>
                </Badge>
              </Show>
              <Show when={detail().server.verified}>
                <Badge data-tone="primary">
                  <Trans>Verified</Trans>
                </Badge>
              </Show>
            </Row>
            <Muted>
              <Trans>{detail().server.memberCount} members</Trans>
              {" / "}
              <Trans>{detail().server.channels.length} channels</Trans>
              {" / "}
              <Trans>{detail().server.roles.length} roles</Trans>
            </Muted>
            <Show when={detail().owner}>
              {(owner) => (
                <Row>
                  <Muted>
                    <Trans>Owner</Trans>: {userLabel(owner())}
                  </Muted>
                  <StateBadges user={owner()} />
                </Row>
              )}
            </Show>
            <Show when={detail().listing}>
              {(listing) => (
                <Muted>
                  <Trans>Listing</Trans>: {listing().status}
                  {listing().featured ? " / featured" : ""}
                </Muted>
              )}
            </Show>

            <Row>
              <Btn
                type="button"
                onClick={() => setFlag("official", !detail().server.official)}
              >
                {detail().server.official ? (
                  <Trans>Remove official</Trans>
                ) : (
                  <Trans>Make official</Trans>
                )}
              </Btn>
              <Btn
                type="button"
                onClick={() => setFlag("verified", !detail().server.verified)}
              >
                {detail().server.verified ? (
                  <Trans>Remove verified</Trans>
                ) : (
                  <Trans>Make verified</Trans>
                )}
              </Btn>
              <Btn type="button" data-tone="danger" onClick={takeover}>
                <Trans>Take over</Trans>
              </Btn>
              <Btn type="button" data-tone="danger" onClick={remove}>
                <Trans>Delete</Trans>
              </Btn>
            </Row>

            <h3>
              <Trans>Roles</Trans>
            </h3>
            <Stack>
              <For each={detail().server.roles}>
                {(role) => (
                  <Muted>
                    {role.name} (rank {role.rank})
                  </Muted>
                )}
              </For>
            </Stack>

            <h3>
              <Trans>Recent actions</Trans>
            </h3>
            <AuditList items={detail().audit} />
          </Panel>
        )}
      </Match>
    </Switch>
  );
}
