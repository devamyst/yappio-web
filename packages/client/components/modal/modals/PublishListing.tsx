import {
  For,
  Match,
  Show,
  Switch,
  createResource,
  createSignal,
} from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import {
  DiscoveryError,
  Target,
  discovery,
} from "@revolt/common/lib/discovery";
import { useState } from "@revolt/state";
import { Dialog, DialogProps } from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import { ListingCard } from "../../../src/interface/discover/ListingCard";
import { Modals } from "../types";

type Step = 1 | 2 | 3;

export function PublishListingModal(
  props: DialogProps & Modals & { type: "publish_listing" },
) {
  const { t } = useLingui();
  const client = useClient();
  const state = useState();

  const token = () => state.auth.getSession()?.token;

  /* eslint-disable solid/reactivity */
  const editing = props.listing;
  const [kind, setKind] = createSignal<"server" | "bot">(
    editing?.type ?? "server",
  );
  const [targetId, setTargetId] = createSignal(
    editing?.targetId ?? props.server?.id ?? "",
  );
  const [step, setStep] = createSignal<Step>(editing || props.server ? 2 : 1);
  const [inviteCode, setInviteCode] = createSignal(editing?.inviteCode ?? "");
  const [description, setDescription] = createSignal(
    editing?.description ?? props.server?.description ?? "",
  );
  const [categories, setCategories] = createSignal<string[]>(
    editing?.categories ?? [],
  );
  const [tags, setTags] = createSignal<string[]>(editing?.tags ?? []);
  /* eslint-enable solid/reactivity */
  const [tagText, setTagText] = createSignal("");
  const [error, setError] = createSignal("");
  const [busy, setBusy] = createSignal(false);
  const [newInvite, setNewInvite] = createSignal<string[]>([]);

  const ownedIds = () =>
    client()
      .servers.filter((entry) => entry.owner?.self)
      .map((entry) => entry.id);

  const [mine] = createResource(token, (value) =>
    discovery.mine(value, ownedIds()),
  );
  const [allCategories] = createResource(() =>
    discovery.categories().catch(() => [] as string[]),
  );

  const targets = (): Target[] =>
    (kind() === "server" ? mine()?.servers : mine()?.bots) ?? [];

  const target = () =>
    targets().find((entry) => entry.id === targetId()) ??
    (editing && editing.targetId === targetId()
      ? { id: editing.targetId, name: editing.name, iconUrl: editing.iconUrl }
      : undefined);

  const server = () => client().servers.get(targetId());

  const [invites, { refetch: refetchInvites }] = createResource(
    () => (kind() === "server" && step() === 2 ? targetId() : undefined),
    async (id) => {
      const found = client().servers.get(id);
      if (!found) return [] as string[];
      const list = await found.fetchInvites().catch(() => []);
      return list.map((entry) => entry.id);
    },
  );

  const inviteChoices = () => [
    ...new Set([...newInvite(), ...(invites() ?? [])]),
  ];

  async function createInvite() {
    const found = server();
    const channel = found?.defaultChannel ?? found?.channels[0];
    if (!channel) {
      setError(t`This server has no channel to invite people to.`);
      return;
    }

    setBusy(true);
    setError("");
    try {
      const created = await channel.createInvite();
      setNewInvite([created._id, ...newInvite()]);
      setInviteCode(created._id);
      refetchInvites();
    } catch {
      setError(t`Could not create an invite. Check your permissions.`);
    } finally {
      setBusy(false);
    }
  }

  function toggleCategory(name: string) {
    if (categories().includes(name)) {
      setCategories(categories().filter((entry) => entry !== name));
    } else if (categories().length < 3) {
      setCategories([...categories(), name]);
    }
  }

  function addTag(raw: string) {
    const value = raw
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
    if (value.length >= 2 && value.length <= 20 && tags().length < 8) {
      if (!tags().includes(value)) setTags([...tags(), value]);
    }
    setTagText("");
  }

  const descriptionOk = () =>
    description().trim().length >= 10 && description().trim().length <= 500;

  const detailsError = () => {
    if (kind() === "server" && !inviteCode())
      return t`Pick or create a permanent invite.`;
    if (!descriptionOk()) return t`Write a description of 10 to 500 characters.`;
    if (categories().length === 0) return t`Pick at least one category.`;
    return "";
  };

  function next() {
    if (step() === 1) {
      if (!targetId()) {
        setError(t`Choose what to publish first.`);
        return;
      }
      setError("");
      setStep(2);
    } else if (step() === 2) {
      const problem = detailsError();
      setError(problem);
      if (!problem) setStep(3);
    }
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      if (editing) {
        await discovery.update(token()!, editing.id, {
          description: description().trim(),
          categories: categories(),
          tags: tags(),
          ...(kind() === "server" ? { inviteCode: inviteCode() } : {}),
        });
      } else {
        await discovery.publish(token()!, {
          type: kind(),
          targetId: targetId(),
          description: description().trim(),
          categories: categories(),
          tags: tags(),
          ...(kind() === "server" ? { inviteCode: inviteCode() } : {}),
        });
      }
      props.onDone?.();
      props.onClose();
    } catch (e) {
      setError(
        e instanceof DiscoveryError
          ? e.message
          : t`Something went wrong. Try again in a moment.`,
      );
    } finally {
      setBusy(false);
    }
  }

  function back() {
    setError("");
    if (step() === 3) setStep(2);
    else if (step() === 2 && !editing && !props.server) setStep(1);
  }

  const canGoBack = () =>
    step() === 3 || (step() === 2 && !editing && !props.server);

  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      title={editing ? t`Edit listing` : t`Publish to Discover`}
      minWidth={320}
    >
      <Wrap>
        <Steps>
          <For each={[1, 2, 3]}>
            {(n) => <Dot data-active={step() >= n} />}
          </For>
        </Steps>

        <Switch>
          <Match when={step() === 1}>
            <Row>
              <Seg
                type="button"
                aria-pressed={kind() === "server"}
                onClick={() => {
                  setKind("server");
                  setTargetId("");
                }}
              >
                <Symbol size={18}>dns</Symbol>
                <Trans>Server</Trans>
              </Seg>
              <Seg
                type="button"
                aria-pressed={kind() === "bot"}
                onClick={() => {
                  setKind("bot");
                  setTargetId("");
                }}
              >
                <Symbol size={18}>smart_toy</Symbol>
                <Trans>App</Trans>
              </Seg>
            </Row>
            <Hint>
              <Show
                when={kind() === "server"}
                fallback={
                  <Trans>
                    Only bots set to Public in My Bots can be listed. Turn that
                    on in your account settings first.
                  </Trans>
                }
              >
                <Trans>You can publish servers you own.</Trans>
              </Show>
            </Hint>
            <Show
              when={!mine.loading}
              fallback={
                <Hint>
                  <Trans>Loading...</Trans>
                </Hint>
              }
            >
              <Show
                when={targets().length > 0}
                fallback={
                  <Hint>
                    <Show
                      when={kind() === "server"}
                      fallback={<Trans>You have no public bots yet.</Trans>}
                    >
                      <Trans>You do not own any servers yet.</Trans>
                    </Show>
                  </Hint>
                }
              >
                <List>
                  <For each={targets()}>
                    {(entry) => (
                      <Option
                        type="button"
                        aria-pressed={targetId() === entry.id}
                        onClick={() => setTargetId(entry.id)}
                      >
                        <OptionIcon>
                          <Show
                            when={entry.iconUrl}
                            fallback={entry.name.charAt(0).toUpperCase()}
                          >
                            <img src={entry.iconUrl!} alt="" />
                          </Show>
                        </OptionIcon>
                        <span>{entry.name}</span>
                      </Option>
                    )}
                  </For>
                </List>
              </Show>
            </Show>
          </Match>

          <Match when={step() === 2}>
            <Show when={kind() === "server"}>
              <Label>
                <Trans>Permanent invite</Trans>
              </Label>
              <Hint>
                <Trans>
                  Pick an invite that never expires. Discovery hides the
                  listing if the invite stops working.
                </Trans>
              </Hint>
              <List>
                <For each={inviteChoices()}>
                  {(code) => (
                    <Option
                      type="button"
                      aria-pressed={inviteCode() === code}
                      onClick={() => setInviteCode(code)}
                    >
                      <Symbol size={18}>link</Symbol>
                      <span>{code}</span>
                    </Option>
                  )}
                </For>
              </List>
              <SmallButton type="button" disabled={busy()} onClick={createInvite}>
                <Trans>Create a new invite</Trans>
              </SmallButton>
            </Show>

            <Label>
              <Trans>Description</Trans>
            </Label>
            <Area
              rows={4}
              maxLength={500}
              value={description()}
              placeholder={t`What is it about? Who is it for?`}
              onInput={(e) => setDescription(e.currentTarget.value)}
            />
            <Hint>{description().trim().length}/500 (min 10)</Hint>

            <Label>
              <Trans>Categories (up to 3)</Trans>
            </Label>
            <Wrapping>
              <For each={allCategories() ?? []}>
                {(name) => (
                  <Chip
                    type="button"
                    aria-pressed={categories().includes(name)}
                    onClick={() => toggleCategory(name)}
                  >
                    {name}
                  </Chip>
                )}
              </For>
            </Wrapping>

            <Label>
              <Trans>Tags (up to 8)</Trans>
            </Label>
            <Wrapping>
              <For each={tags()}>
                {(tag) => (
                  <Chip
                    type="button"
                    aria-pressed="true"
                    onClick={() => setTags(tags().filter((x) => x !== tag))}
                  >
                    {tag} x
                  </Chip>
                )}
              </For>
            </Wrapping>
            <Input
              value={tagText()}
              placeholder={t`Type a tag and press Enter`}
              onInput={(e) => setTagText(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tagText());
                }
              }}
              onBlur={() => tagText() && addTag(tagText())}
            />
          </Match>

          <Match when={step() === 3}>
            <ListingCard
              item={{
                type: kind(),
                name: target()?.name ?? editing?.name ?? "",
                description: description().trim(),
                categories: categories(),
                iconUrl: target()?.iconUrl ?? null,
                bannerUrl:
                  server()?.bannerURL ?? editing?.bannerUrl ?? null,
                memberCount:
                  kind() === "server"
                    ? (server()?.members.length ?? editing?.memberCount ?? 0)
                    : null,
                featured: false,
              }}
            />
            <Hint>
              <Trans>This is how your listing will look in Discover.</Trans>
            </Hint>
          </Match>
        </Switch>

        <Show when={error()}>
          <ErrorText role="alert">{error()}</ErrorText>
        </Show>

        <Footer>
          <SmallButton type="button" onClick={props.onClose}>
            <Trans>Cancel</Trans>
          </SmallButton>
          <Spacer />
          <Show when={canGoBack()}>
            <SmallButton type="button" onClick={back}>
              <Trans>Back</Trans>
            </SmallButton>
          </Show>
          <Show
            when={step() === 3}
            fallback={
              <Primary type="button" onClick={next}>
                <Trans>Next</Trans>
              </Primary>
            }
          >
            <Primary type="button" disabled={busy()} onClick={submit}>
              {editing ? <Trans>Save</Trans> : <Trans>Publish</Trans>}
            </Primary>
          </Show>
        </Footer>
      </Wrap>
    </Dialog>
  );
}

const Wrap = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "min(480px, calc(100vw - 80px))",
    maxHeight: "70vh",
    overflowY: "auto",
    paddingInline: "2px",
  },
});

const Steps = styled("div", { base: { display: "flex", gap: "6px" } });

const Dot = styled("span", {
  base: {
    flexGrow: 1,
    height: "4px",
    borderRadius: "var(--radius-pill)",
    background: "var(--md-sys-color-surface-container-highest)",
    transition: "background var(--motion-med) var(--ease-standard)",

    "&[data-active=true]": { background: "var(--md-sys-color-primary)" },
  },
});

const Row = styled("div", { base: { display: "flex", gap: "8px" } });

const Seg = styled("button", {
  base: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    height: "44px",
    cursor: "pointer",
    border: "2px solid transparent",
    fontWeight: 600,
    borderRadius: "var(--radius-control)",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-highest)",

    "&[aria-pressed=true]": {
      borderColor: "var(--md-sys-color-primary)",
      color: "var(--md-sys-color-primary)",
    },
    "&:focus-visible": {
      outline: "2px solid var(--md-sys-color-primary)",
      outlineOffset: "2px",
    },
  },
});

const Hint = styled("p", {
  base: {
    margin: 0,
    fontSize: "12px",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const Label = styled("span", {
  base: {
    marginTop: "6px",
    fontSize: "13px",
    fontWeight: 700,
    color: "var(--md-sys-color-on-surface)",
  },
});

const List = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    maxHeight: "200px",
    overflowY: "auto",
  },
});

const Option = styled("button", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 10px",
    cursor: "pointer",
    textAlign: "left",
    border: "2px solid transparent",
    borderRadius: "var(--radius-control)",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-highest)",

    "&[aria-pressed=true]": { borderColor: "var(--md-sys-color-primary)" },
    "&:focus-visible": {
      outline: "2px solid var(--md-sys-color-primary)",
      outlineOffset: "2px",
    },
  },
});

const OptionIcon = styled("span", {
  base: {
    width: "32px",
    height: "32px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    fontWeight: 700,
    borderRadius: "var(--radius-control)",
    color: "var(--md-sys-color-on-primary-container)",
    background: "var(--md-sys-color-primary-container)",

    "& img": { width: "100%", height: "100%", objectFit: "cover" },
  },
});

const Area = styled("textarea", {
  base: {
    resize: "vertical",
    padding: "10px 12px",
    border: "none",
    fontFamily: "inherit",
    fontSize: "14px",
    borderRadius: "var(--radius-control)",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-highest)",

    "&:focus-visible": { outline: "2px solid var(--md-sys-color-primary)" },
  },
});

const Input = styled("input", {
  base: {
    height: "40px",
    padding: "0 12px",
    border: "none",
    fontSize: "14px",
    borderRadius: "var(--radius-control)",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-highest)",

    "&:focus-visible": { outline: "2px solid var(--md-sys-color-primary)" },
  },
});

const Wrapping = styled("div", {
  base: { display: "flex", flexWrap: "wrap", gap: "6px" },
});

const Chip = styled("button", {
  base: {
    height: "30px",
    padding: "0 12px",
    cursor: "pointer",
    border: "none",
    fontSize: "13px",
    borderRadius: "var(--radius-pill)",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-highest)",

    "&[aria-pressed=true]": {
      fontWeight: 700,
      color: "var(--md-sys-color-on-primary)",
      background: "var(--md-sys-color-primary)",
    },
    "&:focus-visible": {
      outline: "2px solid var(--md-sys-color-primary)",
      outlineOffset: "2px",
    },
  },
});

const SmallButton = styled("button", {
  base: {
    alignSelf: "flex-start",
    height: "36px",
    padding: "0 16px",
    cursor: "pointer",
    border: "none",
    fontWeight: 600,
    borderRadius: "var(--radius-pill)",
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-highest)",

    "&:disabled": { opacity: 0.5, cursor: "default" },
    "&:focus-visible": {
      outline: "2px solid var(--md-sys-color-primary)",
      outlineOffset: "2px",
    },
  },
});

const Primary = styled("button", {
  base: {
    height: "36px",
    padding: "0 20px",
    cursor: "pointer",
    border: "none",
    fontWeight: 700,
    borderRadius: "var(--radius-pill)",
    color: "var(--md-sys-color-on-primary)",
    background: "var(--md-sys-color-primary)",

    "&:disabled": { opacity: 0.5, cursor: "default" },
    "&:focus-visible": {
      outline: "2px solid var(--md-sys-color-primary)",
      outlineOffset: "2px",
    },
  },
});

const Footer = styled("div", {
  base: { display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" },
});

const Spacer = styled("div", { base: { flexGrow: 1 } });

const ErrorText = styled("p", {
  base: {
    margin: 0,
    padding: "8px 12px",
    fontSize: "13px",
    borderRadius: "var(--radius-control)",
    color: "var(--md-sys-color-on-error-container)",
    background: "var(--md-sys-color-error-container)",
  },
});
