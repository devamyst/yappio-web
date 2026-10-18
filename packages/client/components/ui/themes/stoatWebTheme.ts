import { SelectedTheme } from "@revolt/state/stores/Theme";

/**
 * Generate Yappio for Web variables
 * @param theme Theme
 * @returns CSS Variables
 */
export function createStoatWebVariables(theme: SelectedTheme) {
  return {
    // helper variables
    "--unset-fg": "red",
    "--unset-bg": "linear-gradient(to right, red, blue)",

    // message size
    "--message-size": `${theme.messageSize}px`,
    "--message-group-spacing": `${theme.messageGroupSpacing}px`,

    // emoji size
    "--emoji-size": "1.4em",
    "--emoji-size-medium": "48px",
    "--emoji-size-large": "96px",

    // effects
    "--effects-blur-md": theme.blur ? "blur(20px)" : "unset",
    "--effects-invert-black": theme.darkMode ? "invert(100%)" : "invert(0%)",
    "--effects-invert-light": theme.darkMode ? "invert(0%)" : "invert(1000%)",

    // transitions
    "--transitions-fast": "var(--motion-fast) var(--ease-standard)",
    "--transitions-medium": "var(--motion-med) var(--ease-standard)",

    // brand
    "--brand-presence-online": "#3ABF7E",
    "--brand-presence-idle": "#F0B232",
    "--brand-presence-busy": "#F23F43",
    "--brand-presence-focus": "#4799F0",
    "--brand-presence-invisible": "#80848E",

    // radius
    "--radius-xs": "4px",
    "--radius-control": "8px",
    "--radius-card": "12px",
    "--radius-modal": "16px",
    "--radius-pill": "999px",
    "--radius-server": "16px",

    // spacing
    "--space-1": "4px",
    "--space-2": "8px",
    "--space-3": "12px",
    "--space-4": "16px",
    "--space-5": "20px",
    "--space-6": "24px",
    "--space-7": "32px",
    "--space-8": "40px",

    // elevation
    "--elev-1": theme.darkMode
      ? "0 1px 2px rgb(0 0 0 / .35)"
      : "0 1px 2px rgb(0 0 0 / .08)",
    "--elev-2": theme.darkMode
      ? "0 4px 12px rgb(0 0 0 / .4)"
      : "0 4px 12px rgb(0 0 0 / .12)",
    "--elev-3": theme.darkMode
      ? "0 16px 40px rgb(0 0 0 / .5)"
      : "0 16px 40px rgb(0 0 0 / .18)",
    "--hairline": "1px solid var(--md-sys-color-outline-variant)",

    // motion
    "--motion-fast": "120ms",
    "--motion-med": "200ms",
    "--motion-slow": "320ms",
    "--ease-standard": "cubic-bezier(.2, 0, 0, 1)",
    "--ease-emph": "cubic-bezier(.3, 0, 0, 1)",

    // font
    "--fonts-primary": `"${theme.interfaceFont}", "Inter", sans-serif`,
    "--fonts-monospace": `"${theme.monospaceFont}", "Jetbrains Mono", sans-serif`,

    // load constants
    ...reduceWithPrefix(themeConstants.borderRadius, "--borderRadius-"),
    ...reduceWithPrefix(themeConstants.gap, "--gap-"),
    ...reduceWithPrefix(themeConstants.layout, "--layout-"),
  };
}

/**
 * Add prefix to all keys in an object
 * @param object Object
 * @param prefix Prefix
 * @returns New object
 */
function reduceWithPrefix(object: Record<string, string>, prefix: string) {
  return Object.entries(object).reduce(
    (d, [k, v]) => ({ ...d, [`${prefix}${k}`]: v }),
    {},
  );
}

const themeConstants = {
  borderRadius: {
    // Material 3 Expressive ten-level shape scale
    // https://m3.material.io/styles/shape/corner-radius-scale
    none: "0px",
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    li: "20px",
    xl: "28px",
    xli: "32px",
    xxl: "48px",
    full: "calc(infinity * 1px)",
    circle: "100%",
  },
  /**
   * @deprecated decide this at a component level
   */
  gap: {
    none: "0",
    xxs: "1px",
    xs: "2px",
    s: "6px",
    sm: "4px",
    md: "8px",
    l: "12px",
    lg: "15px",
    x: "28px",
    xl: "32px",
    xxl: "64px",
  },
  layout: {
    "width-channel-sidebar": "240px",
    "width-server-list": "72px",
    "width-member-list": "240px",
    "height-header": "48px",
    "height-user-panel": "56px",
    "width-user-context-menu-truncate": "300px",
    "height-message-box": "32vh",
  },
};
