import { For, Match, Show, Switch, createResource, createSignal } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";

import {
  AdminReport,
  AdminReportStatus,
  discovery,
} from "@revolt/common/lib/discovery";
import { useModals } from "@revolt/modal";

import {
  Badge,
  Btn,
  Muted,
  Notice,
  Panel,
  Row,
  Stack,
  errorText,
  formatTime,
  useToken,
  userLabel,
} from "./shared";

export function AdminReports(props: {
  onOpenMessage: (id: string) => void;
  onOpenServer: (id: string) => void;
  onOpenUser: (id: string) => void;
}) {
  const { t } = useLingui();
  const token = useToken();
  const { openModal } = useModals();

  const [status, setStatus] = createSignal<AdminReportStatus>("Created");

  const [data, { refetch }] = createResource(
    () => [token(), status()] as const,
    ([value, current]) => discovery.admin.reports(value!, current),
  );

  function close(report: AdminReport, action: "resolve" | "reject") {
    openModal({
      type: "admin_confirm",
      title: action === "resolve" ? t`Resolve report` : t`Reject report`,
      actionLabel: action === "resolve" ? t`Resolve` : t`Reject`,
      targetName: report.id,
      targetId: report.id,
      typeToConfirm: false,
      destructive: false,
      run: (reason) =>
        discovery.admin.reportAction(token()!, report.id, action, {
          reason,
          confirm: report.id,
        }),
      onDone: refetch,
    });
  }

  const statuses: AdminReportStatus[] = ["Created", "Resolved", "Rejected"];

  return (
    <Stack style={{ gap: "16px" }}>
      <Row>
        <For each={statuses}>
          {(entry) => (
            <Btn
              type="button"
              data-tone={status() === entry ? "primary" : undefined}
              onClick={() => setStatus(entry)}
            >
              {entry === "Created" ? (
                <Trans>Open</Trans>
              ) : entry === "Resolved" ? (
                <Trans>Resolved</Trans>
              ) : (
                <Trans>Rejected</Trans>
              )}
            </Btn>
          )}
        </For>
      </Row>
      <Switch>
        <Match when={data.error}>
          <Notice tone="danger">{errorText(data.error)}</Notice>
        </Match>
        <Match when={data.loading && !data()}>
          <Muted>
            <Trans>Loading</Trans>
          </Muted>
        </Match>
        <Match when={(data()?.length ?? 0) === 0}>
          <Panel>
            <Muted>
              <Trans>No reports here.</Trans>
            </Muted>
          </Panel>
        </Match>
        <Match when={true}>
          <For each={data()}>
            {(report) => (
              <Panel>
                <Row>
                  <Badge data-tone="primary">{report.content.type}</Badge>
                  <strong>{report.content.reportReason}</strong>
                </Row>
                <Muted>
                  <Trans>From</Trans>{" "}
                  {report.author ? userLabel(report.author) : report.authorId}
                  <Show when={report.closedAt}>
                    {" / "}
                    {formatTime(report.closedAt)}
                  </Show>
                </Muted>
                <Show when={report.additionalContext}>
                  <Muted>{report.additionalContext}</Muted>
                </Show>
                <Show when={report.target.message}>
                  {(message) => (
                    <Muted>
                      {message().message.content ?? ""}
                    </Muted>
                  )}
                </Show>
                <Show when={report.target.server}>
                  {(server) => <Muted>{server().name}</Muted>}
                </Show>
                <Show when={report.target.user}>
                  {(user) => <Muted>{userLabel(user())}</Muted>}
                </Show>
                <Show when={report.rejectionReason ?? report.notes}>
                  <Muted>{report.rejectionReason ?? report.notes}</Muted>
                </Show>
                <Row>
                  <Show when={report.content.type === "Message"}>
                    <Btn
                      type="button"
                      onClick={() =>
                        props.onOpenMessage(
                          report.content.messageId ?? report.content.id,
                        )
                      }
                    >
                      <Trans>View message</Trans>
                    </Btn>
                  </Show>
                  <Show when={report.content.type === "Server"}>
                    <Btn
                      type="button"
                      onClick={() => props.onOpenServer(report.content.id)}
                    >
                      <Trans>View server</Trans>
                    </Btn>
                  </Show>
                  <Show when={report.content.type === "User"}>
                    <Btn
                      type="button"
                      onClick={() => props.onOpenUser(report.content.id)}
                    >
                      <Trans>View user</Trans>
                    </Btn>
                  </Show>
                  <Show when={report.status === "Created"}>
                    <Btn
                      type="button"
                      data-tone="primary"
                      onClick={() => close(report, "resolve")}
                    >
                      <Trans>Resolve</Trans>
                    </Btn>
                    <Btn type="button" onClick={() => close(report, "reject")}>
                      <Trans>Reject</Trans>
                    </Btn>
                  </Show>
                </Row>
              </Panel>
            )}
          </For>
        </Match>
      </Switch>
    </Stack>
  );
}
