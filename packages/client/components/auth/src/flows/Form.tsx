import HCaptcha, { HCaptchaFunctions } from "solid-hcaptcha";
import { createSignal, For, JSX, Show } from "solid-js";

import { useLingui } from "@lingui/solid/macro";

import { Checkbox, Column, iconSize, Text, TextField } from "@revolt/ui";
import { styled } from "styled-system/jsx";

import MdError from "@material-design-icons/svg/filled/error.svg?component-solid";
import { TranslatedError } from "@revolt/i18n/errors";

const ErrorContainer = styled("span", {
  base: {
    color: "var(--md-sys-color-error)",
    display: "flex",
    alignItems: "center",
    gap: "0.4em",
    padding: "10px 12px",
    borderRadius: "var(--radius-control)",
    background:
      "color-mix(in srgb, var(--md-sys-color-error) 12%, transparent)",

    "& a": {
      color: "var(--md-sys-color-primary)",
    },
  },
});

/**
 * Available field types
 */
type Field =
  | "email"
  | "password"
  | "new-password"
  | "log-out"
  | "username"
  | "invite";

/**
 * Properties to apply to fields
 */
const useFieldConfiguration = () => {
  const { t } = useLingui();

  return {
    email: {
      type: "email" as const,
      name: () => t`Email`,
      placeholder: () => t`Please enter your email.`,
      autocomplete: "email",
    },
    password: {
      minLength: 8,
      type: "password" as const,
      "toggle-password": true,
      showPasswordIcon: "visibility",
      hidePasswordIcon: "visibility_off",
      autocomplete: "current-password",
      name: () => t`Password`,
      placeholder: () => t`Enter your current password.`,
    },
    "new-password": {
      minLength: 8,
      type: "password" as const,
      autocomplete: "new-password",
      "toggle-password": true,
      showPasswordIcon: "visibility",
      hidePasswordIcon: "visibility_off",
      hint: () => t`At least 8 characters. A longer phrase beats a short tricky one.`,
      name: () => t`New Password`,
      placeholder: () => t`Enter a new password.`,
    },
    "log-out": {
      name: () => t`Log out of all other sessions`,
    },
    username: {
      minLength: 2,
      type: "text" as const,
      autocomplete: "none",
      hint: () => t`People find you as username#1234. The number is added for you.`,
      name: () => t`Username`,
      placeholder: () => t`Enter your preferred username.`,
    },
    invite: {
      minLength: 1,
      type: "text" as const,
      autocomplete: "none",
      name: () => t`Invite Code`,
      placeholder: () => t`Enter your invite code.`,
    },
  };
};

const FieldHint = styled("span", {
  base: {
    display: "block",
    marginTop: "6px",
    paddingInline: "4px",
    fontSize: "12px",
    lineHeight: 1.4,
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

interface FieldProps {
  /**
   * Fields to gather
   */
  fields: (Field | FieldPreset)[];
}

interface FieldPreset {
  field: Field;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  disabled?: boolean;
}

/**
 * Render a bunch of fields with preset values
 */
export function Fields(props: FieldProps) {
  const fieldConfiguration = useFieldConfiguration();

  return (
    <For each={props.fields}>
      {(field) => {
        // If field is just a Field value, convert it to a FieldPreset
        if (typeof field === "string") {
          field = { field: field };
        }
        return (
          <div>
            {field.field === "log-out" ? (
              <Checkbox name={field.field}>
                {fieldConfiguration[field.field].name()}
              </Checkbox>
            ) : (
              <TextField
                required
                {...omitHint(fieldConfiguration[field.field])}
                name={field.field}
                label={fieldConfiguration[field.field].name()}
                placeholder={fieldConfiguration[field.field].placeholder()}
                disabled={field.disabled}
                value={field.value}
              />
            )}
            <Show when={"hint" in fieldConfiguration[field.field]}>
              <FieldHint>
                {(
                  fieldConfiguration[field.field] as { hint: () => string }
                ).hint()}
              </FieldHint>
            </Show>
          </div>
        );
      }}
    </For>
  );
}

function omitHint<T extends object>(config: T) {
  const { hint: _hint, ...rest } = config as T & { hint?: unknown };
  return rest;
}

interface Props {
  /**
   * Form children
   */
  children: JSX.Element;

  /**
   * Whether to include captcha token
   */
  captcha?: string;

  /**
   * Submission handler
   */
  onSubmit: (data: FormData) => Promise<void> | void;
}

/**
 * Small wrapper for HTML form
 */
export function Form(props: Props) {
  const [error, setError] = createSignal();
  let hcaptcha: HCaptchaFunctions | undefined;

  /**
   * Handle submission
   * @param event Form Event
   */
  async function onSubmit(event: Event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget as HTMLFormElement);

    if (props.captcha) {
      if (!hcaptcha) return alert("hCaptcha not loaded!");
      const response = await hcaptcha.execute();
      formData.set("captcha", response!.response);
    }

    try {
      await props.onSubmit(formData);
    } catch (err) {
      console.error(err);
      setError(err);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Column gap="xl">
        {props.children}
        <Show when={error()}>
          <ErrorContainer>
            <MdError
              {...iconSize("1rem")}
              fill="currentColor"
              style={{ "flex-shrink": 0 }}
            />
            <Text class="label" size="small">
              <TranslatedError error={error()} />
            </Text>
          </ErrorContainer>
        </Show>
      </Column>
      <Show when={props.captcha}>
        <HCaptcha
          sitekey={props.captcha!}
          onLoad={(instance) => (hcaptcha = instance)}
          size="invisible"
        />
      </Show>
    </form>
  );
}
