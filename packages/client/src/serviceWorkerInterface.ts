import { createSignal } from "solid-js";

import { registerSW } from "virtual:pwa-register";

const [pendingUpdate, setPendingUpdate] = createSignal<() => void>();

export { pendingUpdate };

const CHECK_INTERVAL_MS = 60_000;
const IDLE_BEFORE_APPLY_MS = 45_000;

let lastInput = Date.now();
for (const type of ["keydown", "pointerdown"]) {
  window.addEventListener(type, () => (lastInput = Date.now()), {
    passive: true,
  });
}

function applyWhenSafe(apply: () => void) {
  const attempt = () => {
    const idle = Date.now() - lastInput >= IDLE_BEFORE_APPLY_MS;
    if (document.hidden || idle) {
      apply();
    } else {
      setTimeout(attempt, 10_000);
    }
  };
  attempt();
}

const updateSW = registerSW({
  onNeedRefresh() {
    const apply = () => void updateSW(true);
    setPendingUpdate(() => apply);
    applyWhenSafe(apply);
  },
  onOfflineReady() {
    console.info("Ready to work offline =)");
  },
  onRegistered(r) {
    setInterval(() => r!.update(), CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) r!.update();
    });
  },
});
