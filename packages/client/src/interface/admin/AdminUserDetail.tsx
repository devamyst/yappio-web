import { For, Match, Show, Switch, createResource } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";

import { AdminUser, discovery } from "@revolt/common/lib/discovery";
import { useModals } from "@revolt/modal";

import { AuditList } from "./AdminAudit";
import {
  Badge,
  Btn,
  Mono,
  Muted,
  Notice,
  Panel,
  Row,
  Stack,
  StateBadges,
  errorText,
  formatTime,
  useToken,
  userLabel,
} from "./shared";

export function AdminUserDetail(props: { id: string }) {
  const { t } = useLingui();
  const token = useToken();
  const { openModal } = useModals();

  const [data, { refetch }] = createResource(
    () => [token(), props.id] as const,
    ([value, id]) => discovery.admin.user(value!, id),
  );

  function act(
    user: AdminUser,
    action: "suspend" | "unsuspend" | "ban" | "unban" | "logout",
  ) {
    const name = user.username;
    const titles = {
      suspend: t`Suspend account`,
      unsuspend: t`Lift suspension`,
      ban: t`Ban account`,
      unban: t`Lift ban`,
      logout: t`Force logout`,
    };
    const labels = {
      suspend: t`Suspend`,
      unsuspend: t`Unsuspend`,
      ban: t`Ban`,
      unban: t`Unban`,
      logout: t`Log out`,
    };

    openModal({
      type: "admin_confirm",
      title: titles[action],
      actionLabel: labels[action],
      targetName: name,
      targetId: user.id,
      askDays: action === "suspend",
      destructive: action === "suspend" || action === "ban",
      typeToConfirm: action === "suspend" || action === "ban",
      run: (reason, days) =>
        action === "suspend"
          ? discovery.admin.suspend(token()!, user.id, {
              reason,
              confirm: user.id,
              days,
            })
          : discovery.admin.userAction(token()!, user.id, action, {
              reason,
              confirm: user.id,
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
            <h2>{userLabel(detail().user)}</h2>
            <Row>
              <Mono>{detail().user.id}</Mono>
              <StateBadges user={detail().user} />
              <Show when={detail().account.disabled}>
                <Badge>
                  <Trans>Account disabled</Trans>
                </Badge>
              </Show>
            </Row>
            <Muted>{detail().account.email}</Muted>

            <Row>
              <Show
                when={detail().user.flagState.suspended}
                fallback={
                  <Btn
                    type="button"
                    data-tone="danger"
                    onClick={() => act(detail().user, "suspend")}
                  >
                    <Trans>Suspend</Trans>
                  </Btn>
                }
              >
                <Btn type="button" onClick={() => act(detail().user, "unsuspend")}>
                  <Trans>Unsuspend</Trans>
                </Btn>
              </Show>
              <Show
                when={detail().user.flagState.banned}
                fallback={
                  <Btn
                    type="button"
                    data-tone="danger"
                    onClick={() => act(detail().user, "ban")}
                  >
                    <Trans>Ban</Trans>
                  </Btn>
                }
              >
                <Btn type="button" onClick={() => act(detail().user, "unban")}>
                  <Trans>Unban</Trans>
                </Btn>
              </Show>
              <Btn type="button" onClick={() => act(detail().user, "logout")}>
                <Trans>Force logout</Trans>
              </Btn>
            </Row>

            <Show when={detail().suspensions.length > 0}>
              <h3>
                <Trans>Restrictions</Trans>
              </h3>
              <Stack>
                <For each={detail().suspensions}>
                  {(item) => (
                    <Muted>
                      {item.kind} {formatTime(item.at)}
                      {item.until ? ` -> ${formatTime(item.until)}` : ""}
                    </Muted>
                  )}
                </For>
              </Stack>
            </Show>

            <h3>
              <Trans>Sessions</Trans> ({detail().sessions.length})
            </h3>
            <Stack>
              <For each={detail().sessions}>
                {(session) => <Muted>{session.name || session.id}</Muted>}
              </For>
            </Stack>

            <h3>
              <Trans>Owned servers</Trans>
            </h3>
            <Stack>
              <For
                each={detail().ownedServers}
                fallback={
                  <Muted>
                    <Trans>None</Trans>
                  </Muted>
                }
              >
                {(server) => (
                  <Muted>
                    {server.name} ({server.id})
                  </Muted>
                )}
              </For>
            </Stack>

            <h3>
              <Trans>Member of</Trans> ({detail().servers.length})
            </h3>
            <Stack>
              <For each={detail().servers}>
                {(server) => (
                  <Muted>
                    {server.name} ({server.id})
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
