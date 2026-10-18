import { For, JSX, onCleanup, onMount } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { css } from "styled-system/css";

import { YAPPIO_SOURCE_URL } from "@revolt/common";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import Wordmark from "../public/assets/web/wordmark.svg?component-solid";

const keyframes = `
@keyframes yl-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes yl-ring { 0%, 100% { box-shadow: 0 0 0 3px var(--md-sys-color-primary), 0 0 18px rgb(200 244 60 / 0.35); } 50% { box-shadow: 0 0 0 3px var(--md-sys-color-primary), 0 0 30px rgb(200 244 60 / 0.6); } }
@media (prefers-reduced-motion: reduce) { .yl-anim, .yl-ring { animation: none !important; } }
`;

const page = css({
  height: "100%",
  overflowY: "auto",
  overflowX: "hidden",
  color: "var(--md-sys-color-on-surface)",
  background: "var(--md-sys-color-surface-container-lowest)",
  fontFamily: "inherit",
  scrollBehavior: "smooth",
  "& a": { color: "inherit" },
  "& h1, & h2, & h3, & p": { margin: 0 },
});

const wrap = css({
  width: "100%",
  maxWidth: "1080px",
  marginInline: "auto",
  paddingInline: "24px",
  "@media (max-width: 600px)": { paddingInline: "16px" },
});

const nav = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBlock: "20px",
});

const brand = css({
  height: "24px",
  width: "auto",
  fill: "var(--md-sys-color-on-surface)",
  filter: "var(--yappio-wordmark-filter, none)",
});

const btnBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  height: "48px",
  paddingInline: "24px",
  borderRadius: "var(--radius-pill)",
  fontWeight: 700,
  fontSize: "15px",
  textDecoration: "none",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition:
    "transform var(--motion-fast) var(--ease-standard), background var(--motion-fast) var(--ease-standard), box-shadow var(--motion-fast) var(--ease-standard)",
  "&:hover": { transform: "translateY(-2px)" },
  "&:focus-visible": {
    outline: "2px solid var(--md-sys-color-primary)",
    outlineOffset: "3px",
  },
} as const;

const btnPrimary = css({
  ...btnBase,
  background: "var(--md-sys-color-primary)",
  color: "var(--md-sys-color-on-primary)",
  boxShadow: "0 6px 24px rgb(200 244 60 / 0.28)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 30px rgb(200 244 60 / 0.4)",
  },
});

const btnGhost = css({
  ...btnBase,
  color: "var(--md-sys-color-on-surface)",
  background: "var(--md-sys-color-surface-container-high)",
  border: "1px solid var(--md-sys-color-outline-variant)",
});

const btnSmall = css({ height: "40px", paddingInline: "18px", fontSize: "14px" });

const hero = css({
  position: "relative",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  alignItems: "center",
  gap: "48px",
  paddingBlock: "56px 72px",
  "@media (max-width: 860px)": {
    gridTemplateColumns: "1fr",
    gap: "40px",
    paddingBlock: "32px 48px",
    textAlign: "center",
  },
});

const heroText = css({
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  alignItems: "flex-start",
  "@media (max-width: 860px)": { alignItems: "center" },
});

const h1 = css({
  fontSize: "clamp(36px, 6vw, 60px)",
  lineHeight: 1.05,
  fontWeight: 800,
  letterSpacing: "-0.03em",
  "& em": { fontStyle: "normal", color: "var(--md-sys-color-primary)" },
});

const lead = css({
  fontSize: "18px",
  lineHeight: 1.55,
  maxWidth: "480px",
  color: "var(--md-sys-color-on-surface-variant)",
});

const ctas = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  "@media (max-width: 860px)": { justifyContent: "center" },
});

const glow = css({
  position: "absolute",
  inset: "-10% -10% auto auto",
  width: "70%",
  height: "90%",
  background:
    "radial-gradient(ellipse at center, rgb(200 244 60 / 0.2), transparent 65%)",
  pointerEvents: "none",
  zIndex: 0,
});

const mock = css({
  position: "relative",
  zIndex: 1,
  display: "flex",
  minHeight: "340px",
  borderRadius: "var(--radius-modal)",
  overflow: "hidden",
  background: "var(--md-sys-color-surface-container)",
  border: "1px solid var(--md-sys-color-outline-variant)",
  boxShadow: "var(--elev-3), 0 0 80px rgb(200 244 60 / 0.14)",
});

const rail = css({
  width: "56px",
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
  paddingBlock: "12px",
  background: "var(--md-sys-color-surface-container-lowest)",
});

const railDot = css({
  width: "36px",
  height: "36px",
  borderRadius: "12px",
  background: "var(--md-sys-color-surface-container-highest)",
  "&[data-on]": {
    background: "var(--md-sys-color-primary)",
    borderRadius: "var(--radius-control)",
  },
});

const mockMain = css({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  padding: "16px",
});

const mockHead = css({
  fontWeight: 700,
  fontSize: "14px",
  paddingBottom: "8px",
  borderBottom: "1px solid var(--md-sys-color-outline-variant)",
  color: "var(--md-sys-color-on-surface)",
});

const msgRow = css({ display: "flex", gap: "10px", alignItems: "flex-end" });

const avatar = css({
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  flexShrink: 0,
});

const bubble = css({
  maxWidth: "80%",
  padding: "9px 14px",
  borderRadius: "16px 16px 16px 4px",
  fontSize: "14px",
  lineHeight: 1.4,
  background: "var(--md-sys-color-surface-container-highest)",
  "&[data-me]": {
    borderRadius: "16px 16px 4px 16px",
    background: "var(--md-sys-color-primary)",
    color: "var(--md-sys-color-on-primary)",
    marginInlineStart: "auto",
  },
});

const voiceTile = css({
  marginTop: "auto",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px",
  borderRadius: "var(--radius-card)",
  background: "var(--md-sys-color-surface-container-high)",
  fontSize: "13px",
  fontWeight: 600,
});

const speakAvatar = css({
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #c8f43c, #5bd4a0)",
  animation: "yl-ring 2s ease-in-out infinite",
});

const section = css({ paddingBlock: "64px" });

const h2 = css({
  fontSize: "clamp(26px, 4vw, 36px)",
  fontWeight: 800,
  letterSpacing: "-0.02em",
  marginBottom: "12px",
});

const sub = css({
  fontSize: "16px",
  lineHeight: 1.6,
  color: "var(--md-sys-color-on-surface-variant)",
  maxWidth: "560px",
});

const grid = css({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "16px",
  marginTop: "32px",
  "@media (max-width: 860px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  "@media (max-width: 560px)": { gridTemplateColumns: "1fr" },
});

const card = css({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "20px",
  borderRadius: "var(--radius-card)",
  background: "var(--md-sys-color-surface-container)",
  border: "1px solid var(--md-sys-color-outline-variant)",
  transition:
    "transform var(--motion-med) var(--ease-emph), border-color var(--motion-fast) var(--ease-standard)",
  "&:hover": {
    transform: "translateY(-3px)",
    borderColor: "var(--md-sys-color-primary)",
  },
  "& h3": { fontSize: "17px", fontWeight: 700 },
  "& p": {
    fontSize: "14px",
    lineHeight: 1.55,
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const cardIcon = css({
  width: "40px",
  height: "40px",
  display: "grid",
  placeItems: "center",
  borderRadius: "var(--radius-control)",
  color: "var(--md-sys-color-on-primary-container)",
  background: "var(--md-sys-color-primary-container)",
});

const openSource = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "16px",
  padding: "40px",
  borderRadius: "var(--radius-modal)",
  background:
    "radial-gradient(ellipse 70% 120% at 0% 0%, rgb(200 244 60 / 0.16), transparent 70%), var(--md-sys-color-surface-container)",
  border: "1px solid var(--md-sys-color-outline-variant)",
  "@media (max-width: 560px)": { padding: "24px" },
});

const footer = css({
  marginTop: "32px",
  paddingBlock: "32px",
  borderTop: "1px solid var(--md-sys-color-outline-variant)",
  display: "flex",
  flexWrap: "wrap",
  gap: "16px 32px",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "14px",
  color: "var(--md-sys-color-on-surface-variant)",
  "& nav": { display: "flex", gap: "20px" },
  "& nav a:hover": { color: "var(--md-sys-color-primary)" },
});

function Up(props: { delay?: number; children: JSX.Element; class?: string }) {
  return (
    <div
      class={`yl-anim ${props.class ?? ""}`}
      style={{
        animation: `yl-up 0.7s var(--ease-emph, ease-out) ${props.delay ?? 0}s both`,
      }}
    >
      {props.children}
    </div>
  );
}

export function Landing() {
  onMount(() => {
    const prevTitle = document.title;
    document.title = "Yappio - Where your people hang out";
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const created = !meta;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    const prevDesc = meta.content;
    meta.content =
      "Yappio is a free, open source chat app with servers, voice and video, friends, bots and big file uploads.";
    onCleanup(() => {
      document.title = prevTitle;
      if (created) meta!.remove();
      else meta!.content = prevDesc;
    });
  });

  const features = [
    {
      icon: "forum",
      title: <Trans>Servers and channels</Trans>,
      text: (
        <Trans>
          Make a place for your group, split it into channels, and hand out
          roles so everyone sees what they should.
        </Trans>
      ),
    },
    {
      icon: "headset_mic",
      title: <Trans>Voice and video</Trans>,
      text: (
        <Trans>
          Hop into a voice channel, turn your camera on or share your screen.
          No call links to chase.
        </Trans>
      ),
    },
    {
      icon: "group",
      title: <Trans>Friends and DMs</Trans>,
      text: (
        <Trans>
          Add friends by username, message them directly or start a small group
          chat.
        </Trans>
      ),
    },
    {
      icon: "smart_toy",
      title: <Trans>Bots</Trans>,
      text: (
        <Trans>
          Build your own bot or add one to your server to handle the boring
          parts.
        </Trans>
      ),
    },
    {
      icon: "explore",
      title: <Trans>Discover</Trans>,
      text: (
        <Trans>
          Browse public servers by topic when you want somewhere new to hang
          out.
        </Trans>
      ),
    },
    {
      icon: "upload_file",
      title: <Trans>Big file uploads</Trans>,
      text: (
        <Trans>
          Send large files and clips without squeezing them down first.
        </Trans>
      ),
    },
  ];

  return (
    <div class={page}>
      <style>{keyframes}</style>
      <div class={wrap}>
        <header class={nav}>
          <Wordmark class={brand} aria-label="Yappio" />
          <a href="/login/auth" class={`${btnGhost} ${btnSmall}`}>
            <Trans>Log in</Trans>
          </a>
        </header>

        <main>
          <section class={hero}>
            <div class={glow} aria-hidden="true" />
            <div class={heroText} style={{ position: "relative", "z-index": 1 }}>
              <Up>
                <h1 class={h1}>
                  <Trans>
                    Where your people <em>hang out</em>
                  </Trans>
                </h1>
              </Up>
              <Up delay={0.1}>
                <p class={lead}>
                  <Trans>
                    Yappio is a chat app I run for friends, communities and
                    anyone who just wants to talk. Free, open source, and no
                    nonsense.
                  </Trans>
                </p>
              </Up>
              <Up delay={0.2} class={ctas}>
                <a href="/login/auth" class={btnPrimary}>
                  <Trans>Open Yappio</Trans>
                </a>
                <a href="/login/create" class={btnGhost}>
                  <Trans>Create account</Trans>
                </a>
              </Up>
            </div>

            <Up delay={0.25}>
              <div class={mock} aria-hidden="true">
                <div class={rail}>
                  <span class={railDot} data-on />
                  <span class={railDot} />
                  <span class={railDot} />
                  <span class={railDot} />
                </div>
                <div class={mockMain}>
                  <div class={mockHead}># general</div>
                  <div class={msgRow}>
                    <span
                      class={avatar}
                      style={{
                        background: "linear-gradient(135deg, #7aa2ff, #b07aff)",
                      }}
                    />
                    <div class={bubble}>
                      <Trans>anyone up for a game tonight?</Trans>
                    </div>
                  </div>
                  <div class={msgRow}>
                    <div class={bubble} data-me>
                      <Trans>yes! hopping in voice now</Trans>
                    </div>
                  </div>
                  <div class={msgRow}>
                    <span
                      class={avatar}
                      style={{
                        background: "linear-gradient(135deg, #ff9a7a, #ffd36b)",
                      }}
                    />
                    <div class={bubble}>
                      <Trans>save me a spot</Trans>
                    </div>
                  </div>
                  <div class={voiceTile}>
                    <span class={`${speakAvatar} yl-ring`} />
                    <span>
                      <Trans>Voice: Lounge</Trans>
                    </span>
                  </div>
                </div>
              </div>
            </Up>
          </section>

          <section class={section} aria-labelledby="yl-features">
            <Up>
              <h2 id="yl-features" class={h2}>
                <Trans>Everything you need to chat</Trans>
              </h2>
              <p class={sub}>
                <Trans>
                  The usual things you would expect, done cleanly.
                </Trans>
              </p>
            </Up>
            <div class={grid}>
              <For each={features}>
                {(f, i) => (
                  <Up delay={0.05 * i()}>
                    <article class={card} style={{ height: "100%" }}>
                      <span class={cardIcon}>
                        <Symbol size={22}>{f.icon}</Symbol>
                      </span>
                      <h3>{f.title}</h3>
                      <p>{f.text}</p>
                    </article>
                  </Up>
                )}
              </For>
            </div>
          </section>

          <section class={section} aria-labelledby="yl-open">
            <Up>
              <div class={openSource}>
                <h2 id="yl-open" class={h2} style={{ "margin-bottom": "0" }}>
                  <Trans>Free and open source</Trans>
                </h2>
                <p class={sub}>
                  <Trans>
                    Yappio costs nothing and the code is public. Read it, run
                    it yourself, or send me a fix.
                  </Trans>
                </p>
                <a
                  href={YAPPIO_SOURCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  class={btnPrimary}
                >
                  <Trans>View the source</Trans>
                </a>
              </div>
            </Up>
          </section>
        </main>

        <footer class={footer}>
          <span>
            <Trans>
              Built on Stoat, the open source chat platform. Thanks to everyone
              behind it.
            </Trans>
          </span>
          <nav aria-label="Footer">
            <a href={YAPPIO_SOURCE_URL} target="_blank" rel="noopener noreferrer">
              <Trans>Source Code</Trans>
            </a>
            <a
              href={`${YAPPIO_SOURCE_URL}#readme`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Trans>About</Trans>
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}
