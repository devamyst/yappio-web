import { Show, createSignal } from "solid-js";

import { ServerMember, User } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useLingui } from "@lingui/solid/macro";
import { OverflowingText, Tooltip } from "@revolt/ui";
import { Avatar, Ripple, UserStatus, typography } from "../../design";

export function ProfileBanner(props: {
  user: User;
  member?: ServerMember;
  bannerUrl?: string;
  onClick?: (e: MouseEvent) => void;
  onClickAvatar?: (e: MouseEvent) => void;
  width: 2 | 3;
}) {
  const { t } = useLingui();

  const [isCopied, setIsCopied] = createSignal(false);

  function copyUsername() {
    navigator.clipboard.writeText(
      `${props.user.username}#${props.user.discriminator}`,
    );
  }

  function onUsernameClick(e: MouseEvent) {
    e.stopPropagation();
    copyUsername();
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }

  const bannerImage = () => {
    if (props.bannerUrl) return `url('${props.bannerUrl}')`;
    let hash = 0;
    for (const char of props.user.id) hash = (hash * 31 + char.charCodeAt(0)) % 360;
    return `linear-gradient(135deg, hsl(${hash} 55% 42%), hsl(${(hash + 55) % 360} 60% 20%))`;
  };

  const pronouns = () => props.member?.pronouns ?? props.user.pronouns;
  const shownName = () => props.member?.displayName ?? props.user.displayName;
  const sameName = () => shownName() === props.user.username;

  const handle = () => (
    <Tooltip
      content={isCopied() ? t`Copied!` : t`Click to copy username`}
      placement="top"
    >
      <Username onClick={onUsernameClick}>
        {props.user.username}
        <LowEmphasis>#{props.user.discriminator}</LowEmphasis>
      </Username>
    </Tooltip>
  );

  return (
    <Banner
      isLink={typeof props.onClick !== "undefined"}
      onClick={props.onClick}
      width={props.width}
    >
      <Cover
        large={props.width === 3}
        style={{ "background-image": bannerImage() }}
      />
      <Show when={typeof props.onClick !== "undefined"}>
        <Ripple />
      </Show>

      <Info>
        <AvatarRing>
          <Avatar
            src={props.user.animatedAvatarURL}
            fallback={shownName()}
            size={72}
            holepunch="bottom-right"
            onClick={props.onClickAvatar}
            interactive={props.user.avatar && !!props.onClickAvatar}
            overlay={<UserStatus.Graphic status={props.user.presence} />}
          />
        </AvatarRing>
        <UserDetails>
          <Show when={!sameName()} fallback={<Name>{handle()}</Name>}>
            <Name>
              <OverflowingText>{shownName()}</OverflowingText>
            </Name>
            <Handle>{handle()}</Handle>
          </Show>
          <Show when={pronouns()}>
            <Pronouns>
              <OverflowingText>{pronouns()}</OverflowingText>
            </Pronouns>
          </Show>
        </UserDetails>
      </Info>
    </Banner>
  );
}

const Banner = styled("div", {
  base: {
    position: "relative",
    userSelect: "none",
    minWidth: 0,
    overflow: "hidden",
    background: "var(--md-sys-color-surface-container)",
    color: "var(--md-sys-color-on-surface)",
    borderRadius: "var(--radius-card)",
  },
  variants: {
    width: {
      3: {
        gridColumn: "1 / 4",
      },
      2: {
        gridColumn: "1 / 3",
      },
    },
    isLink: {
      true: {
        cursor: "pointer",
      },
    },
  },
});

const Cover = styled("div", {
  base: {
    height: "96px",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  variants: {
    large: {
      true: {
        height: "140px",
      },
    },
  },
});

const Info = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--gap-sm)",
    padding: "0 var(--gap-lg) var(--gap-lg)",
  },
});

const AvatarRing = styled("div", {
  base: {
    marginTop: "-40px",
    padding: "4px",
    width: "fit-content",
    lineHeight: 0,
    position: "relative",
    borderRadius: "50%",
    background: "var(--md-sys-color-surface-container)",
  },
});

const Name = styled("div", {
  base: {
    fontSize: "1.25rem",
    fontWeight: 700,
    lineHeight: "1.5rem",
    minWidth: 0,
  },
});

const Handle = styled("div", {
  base: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const Pronouns = styled("div", {
  base: {
    fontSize: "0.8125rem",
    lineHeight: "1.25rem",
    color: "var(--md-sys-color-on-surface-variant)",
    minWidth: 0,
  },
});

const UserDetails = styled("div", {
  base: {
    ...typography.raw(),

    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
});

const Username = styled("span", {
  base: {
    cursor: "pointer",
    _hover: {
      textDecoration: "underline",
    },
  },
});

const LowEmphasis = styled("span", {
  base: {
    fontWeight: 400,
    opacity: 0.7,
  },
});
