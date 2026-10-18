import { createSignal } from "solid-js";

const KEY = "yappio:recent-emoji";
const MAX = 24;

function load(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string").slice(0, MAX)
      : [];
  } catch {
    return [];
  }
}

const [recent, setRecent] = createSignal<string[]>(load());

export const recentEmoji = recent;

export const isCustomEmojiId = (value: string) => /^[0-9A-Z]{26}$/.test(value);

export function pushRecentEmoji(value: string) {
  const next = [value, ...recent().filter((v) => v !== value)].slice(0, MAX);
  setRecent(next);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return;
  }
}
