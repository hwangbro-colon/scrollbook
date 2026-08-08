import { create } from "zustand";

type ThemeState = { dark: boolean; toggleDark: () => void };

// Applies/removes the `.dark` class directly (no extra effect/hook needed)
// so the CSS override in index.css takes effect the instant this fires.
export const useThemeStore = create<ThemeState>((set, get) => ({
  dark: false,
  toggleDark: () => {
    const next = !get().dark;
    document.documentElement.classList.toggle("dark", next);
    set({ dark: next });
  },
}));
