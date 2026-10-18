import { createSignal } from "solid-js";

import { checkAdmin } from "./discovery";

const [known, setKnown] = createSignal<Record<string, boolean>>({});
const asked = new Set<string>();

export function useIsAdmin(token: () => string | undefined) {
  return () => {
    const value = token();
    if (!value) return false;
    if (!asked.has(value)) {
      asked.add(value);
      checkAdmin(value).then((admin) =>
        setKnown((current) => ({ ...current, [value]: admin })),
      );
    }
    return known()[value] === true;
  };
}
