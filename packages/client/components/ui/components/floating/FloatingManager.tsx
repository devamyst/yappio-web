/* eslint-disable solid/reactivity */
import { useFloating } from "solid-floating-ui";
import {
  For,
  Match,
  Show,
  Switch,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { Portal } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";

import { autoUpdate, flip, offset, shift } from "@floating-ui/dom";
import { styled } from "styled-system/jsx";

import { Keybind, KeybindAction } from "@revolt/keybinds";

import { FloatingElement, floatingElements } from "../../directives";

import { dismissFloatingElements } from ".";
import { AutoComplete } from "./AutoComplete";
import { TooltipBase } from "./Tooltip";
import { UserCard } from "./UserCard";

/**
 * Render the actual floating elements
 */
export function FloatingManager() {
  let mouseX = 0,
    mouseY = 0;

  /**
   * Keep track of last mouse position at all times
   */
  function onMouseMove({ clientX, clientY }: PointerEvent) {
    mouseX = clientX;
    mouseY = clientY;
  }

  onMount(() => {
    document.addEventListener("pointermove", onMouseMove);
    document.addEventListener("pointerdown", onMouseMove);
  });
  onCleanup(() => {
    document.removeEventListener("pointermove", onMouseMove);
    document.removeEventListener("pointerdown", onMouseMove);
  });

  /**
   * Whether a floating element is visible
   */
  function anyVisible() {
    return floatingElements().find((el) => el.show());
  }

  return (
    <Portal mount={document.getElementById("floating")!}>
      <For each={floatingElements()}>
        {(element) => (
          <Presence>
            <Show when={element.show()}>
              <Floating {...element} mouseX={mouseX} mouseY={mouseY} />
            </Show>
          </Presence>
        )}
      </For>

      <Show when={anyVisible()}>
        <Keybind
          keybind={KeybindAction.CLOSE_FLOATING}
          onPressed={dismissFloatingElements}
        />
      </Show>
    </Portal>
  );
}

/**
 * Render a floating element
 */
function Floating(props: FloatingElement & { mouseX: number; mouseY: number }) {
  const [floating, setFloating] = createSignal<HTMLDivElement>();

  /**
   * Figure out placement of the floating element
   */
  const placement = () => {
    const current = props.show();
    if (!current) return;

    if (current.tooltip) {
      return current.tooltip.placement;
    } else if (current.userCard) {
      return "right-start";
    } else if (current.contextMenu) {
      return "right-start";
    } else if (current.autoComplete) {
      return "top-start";
    }
  };

  /**
   * Determine element to provide
   */
  const element = () => {
    const current = props.show();

    if (current?.contextMenu) {
      return {
        /**
         * Determine client rectangle for virtual element
         */
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: props.mouseX,
            y: props.mouseY,
            left: props.mouseX,
            right: props.mouseX,
            top: props.mouseY,
            bottom: props.mouseY,
          };
        },
      };
    } else {
      return props.element;
    }
  };

  const position = useFloating(element, floating, {
    placement: placement(),
    middleware: [offset(5), flip(), shift()],
    whileElementsMounted:
      props.show()?.tooltip || props.show()?.autoComplete
        ? autoUpdate
        : undefined,
  });

  /**
   * Dismiss floating element when clicking elsewhere
   */
  function onMouseDown(e: PointerEvent) {
    if (!e.defaultPrevented) {
      const currentlyShown = props.show();
      if (!currentlyShown?.contextMenu && !currentlyShown?.userCard) return;

      props.hide();
    }
  }

  if (props.config().contextMenu || props.config().userCard) {
    onMount(() => document.addEventListener("pointerdown", onMouseDown));
    onCleanup(() => document.removeEventListener("pointerdown", onMouseDown));
  }

  /**
   * Always dismiss context menu on click
   */
  function onClick() {
    const currentlyShown = props.show();
    if (!currentlyShown?.contextMenu) return;

    props.hide();
  }

  if (props.config().contextMenu) {
    onMount(() => document.addEventListener("click", onClick));
    onCleanup(() => document.removeEventListener("click", onClick));
  }

  const phoneQuery = window.matchMedia("(max-width: 600px)");
  const [isPhone, setIsPhone] = createSignal(phoneQuery.matches);
  const onPhoneChange = () => setIsPhone(phoneQuery.matches);
  onMount(() => phoneQuery.addEventListener("change", onPhoneChange));
  onCleanup(() => phoneQuery.removeEventListener("change", onPhoneChange));

  const asSheet = () => isPhone() && !!props.show()?.contextMenu;

  return (
    <Motion
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1, easing: [0.87, 0, 0.13, 1] }}
    >
      <Show when={asSheet()}>
        <SheetScrim />
      </Show>
      <div
        ref={setFloating}
        style={
          asSheet()
            ? {
                position: "fixed",
                top: "auto",
                left: "0",
                right: "0",
                bottom: "0",
                "z-index": "999",
              }
            : {
                position: position.strategy,
                top: `${position.y ?? 0}px`,
                left: `${position.x ?? 0}px`,
                "z-index": props.show()?.userCard ? "99" : "999",
              }
        }
      >
        <Switch>
          <Match when={props.show()?.tooltip}>
            <TooltipBase>
              {typeof props.show()!.tooltip!.content === "function"
                ? (props.show()!.tooltip!.content as (arg1: object) => void)({})
                : props.show()!.tooltip!.content}
            </TooltipBase>
          </Match>
          <Match when={props.show()?.userCard}>
            <UserCard
              user={props.show()!.userCard!.user}
              member={props.show()!.userCard!.member}
              bot={props.show()!.userCard!.bot}
              onClose={props.hide}
            />
          </Match>
          <Match when={props.show()?.contextMenu}>
            <Show
              when={asSheet()}
              fallback={props.show()!.contextMenu!({})}
            >
              <Sheet>
                <SheetHandle />
                {props.show()!.contextMenu!({})}
              </Sheet>
            </Show>
          </Match>
          <Match when={props.show()?.autoComplete}>
            <AutoComplete {...props.show()!.autoComplete!} />
          </Match>
        </Switch>
      </div>
    </Motion>
  );
}

const SheetScrim = styled("div", {
  base: {
    position: "fixed",
    inset: 0,
    zIndex: 998,
    background: "rgb(0 0 0 / 0.55)",
  },
});

const Sheet = styled("div", {
  base: {
    maxHeight: "70vh",
    overflowY: "auto",
    padding: "0 var(--space-2) calc(var(--space-4) + env(safe-area-inset-bottom))",
    borderTopLeftRadius: "16px",
    borderTopRightRadius: "16px",
    background: "var(--md-sys-color-surface-container-high)",
    boxShadow: "var(--elev-3)",
    animation: "yappioSheetIn var(--motion-med) var(--ease-emph)",
    "@media (prefers-reduced-motion: reduce)": { animation: "none" },

    "& > :not(:first-child)": {
      width: "100%",
      maxWidth: "none",
      minWidth: "0",
      boxShadow: "none",
      border: "none",
      background: "transparent",
    },
  },
});

const SheetHandle = styled("div", {
  base: {
    width: "40px",
    height: "4px",
    margin: "10px auto 8px",
    borderRadius: "var(--radius-pill)",
    background: "var(--md-sys-color-outline-variant)",
  },
});
