import { create } from "zustand";

type QueuedToast = { id: number; message: string };

type ToastState = {
  queue: QueuedToast[];
  show: (message: string) => void;
  dismissFront: () => void;
};

let nextId = 0;

// A queue (not a single message slot) so several toasts fired in quick
// succession (e.g. daily challenge + quiz reward back to back) display one
// at a time instead of clobbering each other.
export const useToastStore = create<ToastState>((set) => ({
  queue: [],
  show: (message) => {
    nextId += 1;
    set((s) => ({ queue: [...s.queue, { id: nextId, message }] }));
  },
  dismissFront: () => set((s) => ({ queue: s.queue.slice(1) })),
}));
