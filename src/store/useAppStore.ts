import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Book, TrackedBook, BookStatus } from "../types";

interface TrackerSlice {
  activeBooks: TrackedBook[];
  addBookToTracker: (book: TrackedBook) => void;
  updateProgress: (
    id: string,
    progress: number,
    currentPage?: number,
    totalPages?: number,
  ) => void;
  updateStatus: (id: string, status: BookStatus) => void;
  rateBook: (id: string, rating: number) => void;
  removeBook: (id: string) => void;
  enrichBook: (id: string, subjects: string[], workKey: string) => void;
}

interface SummarizerSlice {
  isTeaserModalOpen: boolean;
  selectedTeaserBook: Book | null;
  openTeaserModal: (book: Book) => void;
  closeTeaserModal: () => void;
  isChatOpen: boolean;
  activeChatBook: TrackedBook | null;
  openChat: (book: TrackedBook) => void;
  closeChat: () => void;
}

interface FypSlice {
  isDetailsModalOpen: boolean;
  selectedDetailsBook: Book | null;
  openDetailsModal: (book: Book) => void;
  closeDetailsModal: () => void;
}

type AppState = TrackerSlice & SummarizerSlice & FypSlice;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // --- Tracker ---
      activeBooks: [
        {
          id: "seed-1",
          title: "Thinking, Fast and Slow",
          author: "Daniel Kahneman",
          coverUrl:
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=120&auto=format&fit=crop",
          status: "READING",
          progress: 42,
          currentPage: 210,
          totalPages: 499,
          startedAt: new Date().toISOString(),
        },
      ],

      addBookToTracker: (book) =>
        set((state) => {
          if (state.activeBooks.some((b) => b.id === book.id)) return state;
          const now = new Date().toISOString();
          const next: TrackedBook = {
            ...book,
            currentPage: book.currentPage ?? 0,
            totalPages: book.totalPages ?? 0,
            startedAt:
              book.status === "READING"
                ? (book.startedAt ?? now)
                : book.startedAt,
            finishedAt:
              book.status === "READ"
                ? (book.finishedAt ?? now)
                : book.finishedAt,
            abandonedAt:
              book.status === "DNF"
                ? (book.abandonedAt ?? now)
                : book.abandonedAt,
          };
          return { activeBooks: [next, ...state.activeBooks] };
        }),

      updateProgress: (id, progress, currentPage, totalPages) =>
        set((state) => ({
          activeBooks: state.activeBooks.map((b) =>
            b.id !== id
              ? b
              : {
                  ...b,
                  progress: Math.min(Math.max(progress, 0), 100),
                  currentPage: currentPage ?? b.currentPage,
                  totalPages: totalPages ?? b.totalPages,
                },
          ),
        })),

      updateStatus: (id, status) =>
        set((state) => ({
          activeBooks: state.activeBooks.map((b) => {
            if (b.id !== id) return b;
            const now = new Date().toISOString();
            const next: TrackedBook = { ...b, status };

            if (status === "READING" && !b.startedAt) next.startedAt = now;
            if (status === "READ") {
              if (!b.finishedAt) next.finishedAt = now;
              next.progress = 100;
              if (b.totalPages) next.currentPage = b.totalPages;
            }
            if (status === "DNF" && !b.abandonedAt) next.abandonedAt = now;
            return next;
          }),
        })),

      rateBook: (id, rating) =>
        set((state) => ({
          activeBooks: state.activeBooks.map((b) =>
            b.id === id
              ? { ...b, rating: Math.min(Math.max(rating, 0), 5) }
              : b,
          ),
        })),

      removeBook: (id) =>
        set((state) => ({
          activeBooks: state.activeBooks.filter((b) => b.id !== id),
        })),

      enrichBook: (id, subjects, workKey) =>
        set((state) => ({
          activeBooks: state.activeBooks.map((b) =>
            b.id === id ? { ...b, subjects, workKey } : b,
          ),
        })),

      // --- Summarizer ---
      isTeaserModalOpen: false,
      selectedTeaserBook: null,
      isChatOpen: false,
      activeChatBook: null,
      openTeaserModal: (book) =>
        set({ isTeaserModalOpen: true, selectedTeaserBook: book }),
      closeTeaserModal: () =>
        set({ isTeaserModalOpen: false, selectedTeaserBook: null }),
      openChat: (book) => set({ isChatOpen: true, activeChatBook: book }),
      closeChat: () => set({ isChatOpen: false, activeChatBook: null }),

      // --- FYP ---
      isDetailsModalOpen: false,
      selectedDetailsBook: null,
      openDetailsModal: (book) =>
        set({ isDetailsModalOpen: true, selectedDetailsBook: book }),
      closeDetailsModal: () =>
        set({ isDetailsModalOpen: false, selectedDetailsBook: null }),
    }),
    {
      name: "chapternode-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeBooks: state.activeBooks }),
    },
  ),
);
