import { createRoot, createSignal } from "solid-js";

export const MAX_SELECTED = 100;

const state = createRoot(() => {
  const [channelId, setChannelId] = createSignal<string>();
  const [selected, setSelected] = createSignal<ReadonlySet<string>>(new Set());
  return { channelId, setChannelId, selected, setSelected };
});

export const selectionChannelId = state.channelId;
export const selectedMessages = state.selected;

export function startSelecting(channelId: string) {
  state.setSelected(new Set());
  state.setChannelId(channelId);
}

export function stopSelecting() {
  state.setChannelId(undefined);
  state.setSelected(new Set());
}

export function isSelecting(channelId: string) {
  return state.channelId() === channelId;
}

export function toggleSelected(id: string) {
  const next = new Set(state.selected());
  if (next.has(id)) next.delete(id);
  else if (next.size < MAX_SELECTED) next.add(id);
  state.setSelected(next);
}
