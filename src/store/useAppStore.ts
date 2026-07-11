import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Book, TrackedBook, BookStatus } from "../types";
import { supabase } from "../lib/supabase";

interface TrackerSlice {
  userId: string | null;
  activeBooks: TrackedBook[];
  librarySyncing: boolean;
  setUserId: (id: string | null) => void;
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
  syncLibraryFromSupabase: (userId: string) => Promise<void>;
  clearLibrary: () => void;
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

async function saveLibraryToSupabase(
  userId: string,
  books: TrackedBook[],
): Promise<void> {
  await supabase
    .from("user_libraries")
    .upsert(
      {
        user_id: userId,
        book_data: books,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // --- Tracker ---
      userId: null,
      activeBooks: [],
      librarySyncing: false,

      setUserId: (id) => set({ userId: id }),

      syncLibraryFromSupabase: async (userId: string) => {
        set({ librarySyncing: true });

        const { data, error } = await supabase
          .from("user_libraries")
          .select("book_data")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          set({ librarySyncing: false });
          return;
        }

        if (data?.book_data && Array.isArray(data.book_data)) {
          set({
            activeBooks: data.book_data as TrackedBook[],
            userId,
            librarySyncing: false,
          });
        } else {
          // First login: check if there's local data to migrate
          const localBooks = get().activeBooks;
          if (localBooks.length > 0) {
            await saveLibraryToSupabase(userId, localBooks);
          }
          set({ userId, librarySyncing: false });
        }
      },

      clearLibrary: () => set({ activeBooks: [], userId: null }),

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
          const updated = [next, ...state.activeBooks];
          if (state.userId) saveLibraryToSupabase(state.userId, updated);
          return { activeBooks: updated };
        }),

      updateProgress: (id, progress, currentPage, totalPages) =>
        set((state) => {
          const updated = state.activeBooks.map((b) =>
            b.id !== id
              ? b
              : {
                  ...b,
                  progress: Math.min(Math.max(progress, 0), 100),
                  currentPage: currentPage ?? b.currentPage,
                  totalPages: totalPages ?? b.totalPages,
                },
          );
          if (state.userId) saveLibraryToSupabase(state.userId, updated);
          return { activeBooks: updated };
        }),

      updateStatus: (id, status) =>
        set((state) => {
          const updated = state.activeBooks.map((b) => {
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
          });
          if (state.userId) saveLibraryToSupabase(state.userId, updated);
          return { activeBooks: updated };
        }),

      rateBook: (id, rating) =>
        set((state) => {
          const updated = state.activeBooks.map((b) =>
            b.id === id
              ? { ...b, rating: Math.min(Math.max(rating, 0), 5) }
              : b,
          );
          if (state.userId) saveLibraryToSupabase(state.userId, updated);
          return { activeBooks: updated };
        }),

      removeBook: (id) =>
        set((state) => {
          const updated = state.activeBooks.filter((b) => b.id !== id);
          if (state.userId) saveLibraryToSupabase(state.userId, updated);
          return { activeBooks: updated };
        }),

      enrichBook: (id, subjects, workKey) =>
        set((state) => {
          const updated = state.activeBooks.map((b) =>
            b.id === id ? { ...b, subjects, workKey } : b,
          );
          if (state.userId) saveLibraryToSupabase(state.userId, updated);
          return { activeBooks: updated };
        }),

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
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeBooks: state.activeBooks,
        userId: state.userId,
      }),
    },
  ),
);
