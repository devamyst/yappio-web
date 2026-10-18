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

import { AdminUser, discovery } from "@revolt/common/lib/discovery";

import { AdminUserDetail } from "./AdminUserDetail";
import {
  Btn,
  Field,
  ListItem,
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

export function AdminUsers(props: { initial?: string }) {
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
    () => (query().trim().length >= 2 ? ([token(), query().trim()] as const) : false),
    ([value, q]) => discovery.admin.users(value!, q),
  );

  function submit(event: Event) {
    event.preventDefault();
    setQuery(text());
  }

  return (
    <Split>
      <Stack>
        <form onSubmit={submit}>
          <Row>
            <Field
              type="search"
              value={text()}
              aria-label={t`Search users`}
              placeholder={t`User id, name or exact email`}
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
              <Trans>No users found.</Trans>
            </Muted>
          </Match>
          <Match when={results()}>
            <Stack>
              <For each={results()}>
                {(user: AdminUser) => (
                  <ListItem
                    type="button"
                    aria-current={selected() === user.id}
                    onClick={() => setSelected(user.id)}
                  >
                    <strong>{userLabel(user)}</strong>
                    <Row>
                      <Muted>{user.id}</Muted>
                      <StateBadges user={user} />
                    </Row>
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
              <Trans>Search for a user to see their account.</Trans>
            </Muted>
          </Panel>
        }
      >
        {(id) => <AdminUserDetail id={id()} />}
      </Show>
    </Split>
  );
}
