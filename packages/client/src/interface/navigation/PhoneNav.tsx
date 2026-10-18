import { For, Show } from "solid-js";

import { useLingui } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import { useModals } from "@revolt/modal";
import { useLocation, useNavigate } from "@revolt/routing";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

/**
 * Bottom navigation shown on phones outside of a channel
 */
export function PhoneNav() {
  const { t } = useLingui();
  const location = useLocation();
  const navigate = useNavigate();
  const { openModal } = useModals();

  const visible = () => {
    const path = location.pathname;
    return (
      path === "/" || path.startsWith("/friends") || path.startsWith("/discover")
    );
  };

  const items = () => [
    {
      icon: "home",
      label: t`Home`,
      active: location.pathname === "/",
      go: () => navigate("/"),
    },
    {
      icon: "group",
      label: t`Friends`,
      active: location.pathname.startsWith("/friends"),
      go: () => navigate("/friends"),
    },
    {
      icon: "explore",
      label: t`Discover`,
      active: location.pathname.startsWith("/discover"),
      go: () => navigate("/discover"),
    },
    {
      icon: "person",
      label: t`You`,
      active: false,
      go: () => openModal({ type: "settings", config: "user" }),
    },
  ];

  return (
    <Show when={visible()}>
      <Bar aria-label={t`Main navigation`}>
        <For each={items()}>
          {(item) => (
            <Item
              type="button"
              active={item.active}
              aria-current={item.active ? "page" : undefined}
              onClick={item.go}
            >
              <Pill active={item.active}>
                <Symbol size={24} fill={item.active}>
                  {item.icon}
                </Symbol>
              </Pill>
              <span>{item.label}</span>
            </Item>
          )}
        </For>
      </Bar>
    </Show>
  );
}

const Bar = styled("nav", {
  base: {
    display: "none",
    flexShrink: 0,
    zIndex: 5,
    paddingBottom: "env(safe-area-inset-bottom)",
    background: "var(--md-sys-color-surface-container-high)",
    borderTop: "var(--hairline)",

    _phone: {
      display: "flex",
    },
  },
});

const Item = styled("button", {
  base: {
    flex: 1,
    minHeight: "64px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--md-sys-color-on-surface-variant)",
    transition: "color var(--motion-fast) var(--ease-standard)",
  },
  variants: {
    active: {
      true: { color: "var(--md-sys-color-on-surface)" },
      false: {},
    },
  },
});

const Pill = styled("span", {
  base: {
    width: "56px",
    height: "30px",
    display: "grid",
    placeItems: "center",
    borderRadius: "var(--radius-pill)",
    transition:
      "background var(--motion-fast) var(--ease-standard), color var(--motion-fast)",
  },
  variants: {
    active: {
      true: {
        background: "var(--md-sys-color-primary)",
        color: "var(--md-sys-color-on-primary)",
      },
      false: {},
    },
  },
});
