import {
  Hct,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant,
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities";

import { SelectedTheme, TypeTheme } from "@revolt/state/stores/Theme";

/**
 * Generate the Material variables from the given properties
 *
 * Currently only generates color keys
 */
export function createMaterialColourVariables<P extends string>(
  theme: SelectedTheme,
  prefix: P,
): addPrefixToObject<MaterialColours, P> {
  switch (theme.preset) {
    case "you":
      return Object.entries(
        generateMaterialYouScheme(
          theme.accent,
          theme.darkMode,
          theme.contrast,
          theme.variant,
        ),
      ).reduce(
        (d, [key, value]) => ({
          ...d,
          [`${prefix}${key}`]: value,
        }),
        {} as addPrefixToObject<MaterialColours, P>,
      );
    default:
      return {} as never;
  }
}

/**
 * Create R,G,B triplets for MDUI variables
 */
export function createMduiColourTriplets<P extends string>(
  theme: SelectedTheme,
  prefix: P,
): addPrefixToObject<MaterialColours, P> {
  const variables = createMaterialColourVariables(theme, prefix);

  for (const key in variables) {
    const [_, r, g, b] = /#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i.exec(
      variables[key as keyof typeof variables] as string,
    )!;

    variables[key as keyof typeof variables] =
      `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}` as never;
  }

  return variables;
}

type addPrefixToObject<T, P extends string> = {
  [K in keyof T as K extends string ? `${P}${K}` : never]: T[K];
};

type _addSuffixToObject<T, S extends string> = {
  [K in keyof T as K extends string ? `${K}${S}` : never]: T[K];
};

type MaterialColours = {
  primary: string;
  "on-primary": string;
  "primary-container": string;
  "on-primary-container": string;
  secondary: string;
  "on-secondary": string;
  "secondary-container": string;
  "on-secondary-container": string;
  tertiary: string;
  "on-tertiary": string;
  "tertiary-container": string;
  "on-tertiary-container": string;
  error: string;
  "on-error": string;
  "error-container": string;
  "on-error-container": string;

  "primary-fixed": string;
  "primary-fixed-dim": string;
  "on-primary-fixed": string;
  "on-primary-fixed-variant": string;
  "secondary-fixed": string;
  "secondary-fixed-dim": string;
  "on-secondary-fixed": string;
  "on-secondary-fixed-variant": string;
  "tertiary-fixed": string;
  "tertiary-fixed-dim": string;
  "on-tertiary-fixed": string;
  "on-tertiary-fixed-variant": string;

  "surface-dim": string;
  surface: string;
  "surface-bright": string;

  "surface-container-lowest": string;
  "surface-container-low": string;
  "surface-container": string;
  "surface-container-high": string;
  "surface-container-highest": string;

  "on-surface": string;
  "on-surface-variant": string;
  outline: string;
  "outline-variant": string;

  "inverse-surface": string;
  "inverse-on-surface": string;
  "inverse-primary": string;

  scrim: string;
  shadow: string;
};

export const YAPPIO_ACCENT = "#5865f2";

const YAPPIO_LIGHT_SURFACES: Partial<MaterialColours> = {
  "surface-dim": "#ebedef",
  surface: "#ffffff",
  "surface-bright": "#ffffff",
  "surface-container-lowest": "#e3e5e8",
  "surface-container-low": "#f2f3f5",
  "surface-container": "#f2f3f5",
  "surface-container-high": "#e3e5e8",
  "surface-container-highest": "#d7d9dc",
  "on-surface": "#313338",
  "on-surface-variant": "#5c5e66",
  outline: "#80848e",
  "outline-variant": "#e3e5e8",
  scrim: "#000000",
  shadow: "#000000",
};

const YAPPIO_DARK_SURFACES: Partial<MaterialColours> = {
  "surface-dim": "#232428",
  surface: "#313338",
  "surface-bright": "#404249",
  "surface-container-lowest": "#1e1f22",
  "surface-container-low": "#2b2d31",
  "surface-container": "#2b2d31",
  "surface-container-high": "#35373c",
  "surface-container-highest": "#404249",
  "on-surface": "#dbdee1",
  "on-surface-variant": "#949ba4",
  outline: "#80848e",
  "outline-variant": "#3f4147",
  "inverse-surface": "#f2f3f5",
  "inverse-on-surface": "#313338",
  scrim: "#000000",
  shadow: "#000000",
};

const YAPPIO_LIGHT: Partial<MaterialColours> = {
  primary: "#5865f2",
  "on-primary": "#ffffff",
  "primary-container": "#e0e3ff",
  "on-primary-container": "#2d36a8",
  secondary: "#4e5058",
  "on-secondary": "#ffffff",
  "secondary-container": "#e3e5e8",
  "on-secondary-container": "#313338",
  tertiary: "#006ce7",
  "on-tertiary": "#ffffff",
  "tertiary-container": "#d6e6ff",
  "on-tertiary-container": "#003a80",
  error: "#da373c",
  "on-error": "#ffffff",
  "error-container": "#fbd9da",
  "on-error-container": "#5c0c0f",
  "inverse-primary": "#a5acfa",
};

const YAPPIO_DARK: Partial<MaterialColours> = {
  primary: "#5865f2",
  "on-primary": "#ffffff",
  "primary-container": "#4752c4",
  "on-primary-container": "#ffffff",
  secondary: "#4e5058",
  "on-secondary": "#ffffff",
  "secondary-container": "#4e5058",
  "on-secondary-container": "#f2f3f5",
  tertiary: "#00a8fc",
  "on-tertiary": "#00263d",
  "tertiary-container": "#0b4a6e",
  "on-tertiary-container": "#d0ecff",
  error: "#f23f43",
  "on-error": "#ffffff",
  "error-container": "#da373c",
  "on-error-container": "#ffffff",
  "inverse-primary": "#4752c4",
};

/**
 * Generate a Material You colour scheme
 * @param accent Accent colour in hex format
 * @param darkMode Dark mode
 * @param constrat Constrast level
 * @returns Material colours
 */
function generateMaterialYouScheme(
  accent: string,
  darkMode: boolean,
  contrast: number,
  variant: TypeTheme["m3Variant"],
): MaterialColours {
  const hct = Hct.fromInt(argbFromHex(accent));

  let scheme;
  switch (variant) {
    case "content":
      scheme = new SchemeContent(hct, darkMode, contrast);
      break;
    case "expressive":
      scheme = new SchemeExpressive(hct, darkMode, contrast);
      break;
    case "fidelity":
      scheme = new SchemeFidelity(hct, darkMode, contrast);
      break;
    case "fruit_salad":
      scheme = new SchemeFruitSalad(hct, darkMode, contrast);
      break;
    case "monochrome":
      scheme = new SchemeMonochrome(hct, darkMode, contrast);
      break;
    case "neutral":
      scheme = new SchemeNeutral(hct, darkMode, contrast);
      break;
    case "rainbow":
      scheme = new SchemeRainbow(hct, darkMode, contrast);
      break;
    case "vibrant":
      scheme = new SchemeVibrant(hct, darkMode, contrast);
      break;
    case "tonal_spot":
    default:
      scheme = new SchemeTonalSpot(hct, darkMode, contrast);
      break;
  }

  const colours: MaterialColours = {
    primary: hexFromArgb(scheme.primary),
    "on-primary": hexFromArgb(scheme.onPrimary),
    "primary-container": hexFromArgb(scheme.primaryContainer),
    "on-primary-container": hexFromArgb(scheme.onPrimaryContainer),
    secondary: hexFromArgb(scheme.secondary),
    "on-secondary": hexFromArgb(scheme.onSecondary),
    "secondary-container": hexFromArgb(scheme.secondaryContainer),
    "on-secondary-container": hexFromArgb(scheme.onSecondaryContainer),
    tertiary: hexFromArgb(scheme.tertiary),
    "on-tertiary": hexFromArgb(scheme.onTertiary),
    "tertiary-container": hexFromArgb(scheme.tertiaryContainer),
    "on-tertiary-container": hexFromArgb(scheme.onTertiaryContainer),
    error: hexFromArgb(scheme.error),
    "on-error": hexFromArgb(scheme.onError),
    "error-container": hexFromArgb(scheme.errorContainer),
    "on-error-container": hexFromArgb(scheme.onErrorContainer),

    "primary-fixed": hexFromArgb(scheme.primaryFixed),
    "primary-fixed-dim": hexFromArgb(scheme.primaryFixedDim),
    "on-primary-fixed": hexFromArgb(scheme.onPrimaryFixed),
    "on-primary-fixed-variant": hexFromArgb(scheme.onPrimaryFixedVariant),
    "secondary-fixed": hexFromArgb(scheme.secondaryFixed),
    "secondary-fixed-dim": hexFromArgb(scheme.onSecondaryFixed),
    "on-secondary-fixed": hexFromArgb(scheme.onSecondaryFixed),
    "on-secondary-fixed-variant": hexFromArgb(scheme.onSecondaryFixedVariant),
    "tertiary-fixed": hexFromArgb(scheme.tertiaryFixed),
    "tertiary-fixed-dim": hexFromArgb(scheme.tertiaryFixedDim),
    "on-tertiary-fixed": hexFromArgb(scheme.onTertiaryFixed),
    "on-tertiary-fixed-variant": hexFromArgb(scheme.onTertiaryFixedVariant),

    "surface-dim": hexFromArgb(scheme.surfaceDim),
    surface: hexFromArgb(scheme.surface),
    "surface-bright": hexFromArgb(scheme.surfaceBright),

    "surface-container-lowest": hexFromArgb(scheme.surfaceContainerLowest),
    "surface-container-low": hexFromArgb(scheme.surfaceContainerLow),
    "surface-container": hexFromArgb(scheme.surfaceContainer),
    "surface-container-high": hexFromArgb(scheme.surfaceContainerHigh),
    "surface-container-highest": hexFromArgb(scheme.surfaceContainerHighest),

    "on-surface": hexFromArgb(scheme.onSurface),
    "on-surface-variant": hexFromArgb(scheme.onSurfaceVariant),
    outline: hexFromArgb(scheme.outline),
    "outline-variant": hexFromArgb(scheme.outlineVariant),

    "inverse-surface": hexFromArgb(scheme.inverseSurface),
    "inverse-on-surface": hexFromArgb(scheme.inverseOnSurface),
    "inverse-primary": hexFromArgb(scheme.inversePrimary),

    scrim: hexFromArgb(scheme.scrim),
    shadow: hexFromArgb(scheme.shadow),
  };

  const surfaces = darkMode ? YAPPIO_DARK_SURFACES : YAPPIO_LIGHT_SURFACES;

  if (accent.toLowerCase() === YAPPIO_ACCENT) {
    return {
      ...colours,
      ...surfaces,
      ...(darkMode ? YAPPIO_DARK : YAPPIO_LIGHT),
    };
  }

  return { ...colours, ...surfaces };
}
