import { For, JSX, Show } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import type { Listing } from "@revolt/common/lib/discovery";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

export type CardData = Pick<
  Listing,
  | "type"
  | "name"
  | "description"
  | "categories"
  | "iconUrl"
  | "bannerUrl"
  | "memberCount"
  | "featured"
>;

export function formatCount(count: number) {
  return count >= 1000
    ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1).replace(".0", "")}k`
    : String(count);
}

function bannerGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  return `linear-gradient(135deg, hsl(${hash} 55% 42%) 0%, hsl(${(hash + 55) % 360} 60% 20%) 100%)`;
}

export function ListingCard(props: {
  item: CardData;
  action?: JSX.Element;
  footer?: JSX.Element;
}) {
  return (
    <Card>
      <Banner
        style={
          props.item.bannerUrl
            ? { "background-image": `url('${props.item.bannerUrl}')` }
            : {
                "background-image": bannerGradient(
                  props.item.categories[0] ?? props.item.name,
                ),
              }
        }
      >
        <Show when={props.item.featured}>
          <FeaturedPill>
            <Symbol size={14}>star</Symbol>
            <Trans>Featured</Trans>
          </FeaturedPill>
        </Show>
      </Banner>
      <Body>
        <Icon>
          <Show
            when={props.item.iconUrl}
            fallback={<span>{props.item.name.charAt(0).toUpperCase()}</span>}
          >
            <img src={props.item.iconUrl!} alt="" loading="lazy" />
          </Show>
        </Icon>
        <Name>{props.item.name}</Name>
        <Description>{props.item.description}</Description>
        <Pills>
          <For each={props.item.categories}>{(name) => <Pill>{name}</Pill>}</For>
        </Pills>
        <Footer>
          <Show when={props.item.type === "server"}>
            <Count>
              <Symbol size={16}>group</Symbol>
              {formatCount(props.item.memberCount ?? 0)}
            </Count>
          </Show>
          <Spacer />
          {props.action}
        </Footer>
        {props.footer}
      </Body>
    </Card>
  );
}

export function SkeletonCard() {
  return (
    <Card aria-hidden="true">
      <Banner class="skeleton" />
      <Body>
        <Icon class="skeleton" />
        <Bar style={{ width: "55%", height: "18px" }} />
        <Bar style={{ width: "100%", height: "12px" }} />
        <Bar style={{ width: "80%", height: "12px" }} />
      </Body>
    </Card>
  );
}

const Card = styled("article", {
  base: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    overflow: "hidden",
    borderRadius: "var(--radius-card)",
    background: "var(--md-sys-color-surface-container-high)",
    boxShadow: "var(--elev-1)",
    border: "1px solid transparent",
    transition:
      "transform var(--motion-med) var(--ease-standard), box-shadow var(--motion-med) var(--ease-standard), border-color var(--motion-med) var(--ease-standard)",

    "&:hover, &:focus-within": {
      transform: "translateY(-4px)",
      boxShadow: "var(--elev-3)",
      borderColor: "color-mix(in srgb, var(--md-sys-color-primary) 55%, transparent)",
    },

    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
      "&:hover, &:focus-within": { transform: "none" },
      "& .skeleton, &.skeleton": { animation: "none" },
    },

    "& .skeleton": {
      animation: "yappioPulse 1.4s ease-in-out infinite",
      background: "var(--md-sys-color-surface-container-highest)",
    },
  },
});

const Banner = styled("div", {
  base: {
    position: "relative",
    height: "120px",
    flexShrink: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundImage:
      "linear-gradient(135deg, var(--md-sys-color-primary) 0%, #1f1c2c 85%)",
  },
});

const FeaturedPill = styled("span", {
  base: {
    position: "absolute",
    top: "8px",
    right: "8px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "2px 8px",
    fontSize: "11px",
    fontWeight: 700,
    borderRadius: "var(--radius-pill)",
    color: "var(--md-sys-color-on-primary)",
    background: "var(--md-sys-color-primary)",
    boxShadow:
      "0 0 0 3px color-mix(in srgb, var(--md-sys-color-primary) 30%, transparent), 0 0 18px color-mix(in srgb, var(--md-sys-color-primary) 70%, transparent)",
  },
});

const Body = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "0 14px 14px",
    flexGrow: 1,
    minWidth: 0,
  },
});

const Icon = styled("div", {
  base: {
    width: "56px",
    height: "56px",
    marginTop: "-28px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    fontSize: "22px",
    fontWeight: 700,
    borderRadius: "var(--radius-server)",
    border: "3px solid var(--md-sys-color-surface-container-high)",
    color: "var(--md-sys-color-on-primary-container)",
    background: "var(--md-sys-color-primary-container)",

    "& img": { width: "100%", height: "100%", objectFit: "cover" },
  },
});

const Name = styled("h3", {
  base: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "var(--md-sys-color-on-surface)",
  },
});

const Description = styled("p", {
  base: {
    margin: 0,
    fontSize: "13px",
    lineHeight: 1.4,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    wordBreak: "break-word",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const Pills = styled("div", {
  base: { display: "flex", flexWrap: "wrap", gap: "4px" },
});

const Pill = styled("span", {
  base: {
    padding: "1px 8px",
    fontSize: "11px",
    borderRadius: "var(--radius-pill)",
    color: "var(--md-sys-color-on-surface-variant)",
    background: "var(--md-sys-color-surface-container-highest)",
  },
});

const Footer = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "auto",
    paddingTop: "8px",
  },
});

const Count = styled("span", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "3px 10px 3px 8px",
    fontSize: "12px",
    fontWeight: 600,
    borderRadius: "var(--radius-pill)",
    background: "var(--md-sys-color-surface-container-highest)",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const Spacer = styled("div", { base: { flexGrow: 1 } });

const Bar = styled("div", {
  base: {
    borderRadius: "var(--radius-xs)",
    animation: "yappioPulse 1.4s ease-in-out infinite",
    background: "var(--md-sys-color-surface-container-highest)",
  },
});
