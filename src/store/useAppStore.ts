import { create } from "zustand";
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
  removeBook: (id: string) => void;
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

export const useAppStore = create<AppState>((set) => ({
  // --- Tracker State ---
  activeBooks: [
    {
      id: "1",
      title: "Thinking, Fast and Slow",
      author: "Daniel Kahneman",
      coverUrl:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=120&auto=format&fit=crop",
      progress: 42,
      currentPage: 210,
      totalPages: 499,
      status: "READING",
    },
  ],

  addBookToTracker: (bookData) =>
    set((state) => ({
      activeBooks: [
        {
          ...bookData,
          id: Math.random().toString(36).substring(7),
          currentPage: 0,
          totalPages: 300,
        },
        ...state.activeBooks,
      ],
    })),

  updateProgress: (id, progress, currentPage, totalPages) =>
    set((state) => ({
      activeBooks: state.activeBooks.map((b) =>
        b.id === id
          ? {
              ...b,
              progress: Math.min(Math.max(progress, 0), 100),
              currentPage,
              totalPages: totalPages ?? b.totalPages,
            }
          : b,
      ),
    })),

  updateStatus: (id, status) =>
    set((state) => ({
      activeBooks: state.activeBooks.map((b) =>
        b.id === id ? { ...b, status } : b,
      ),
    })),

  removeBook: (id) =>
    set((state) => ({
      activeBooks: state.activeBooks.filter((b) => b.id !== id),
    })),

  // --- Summarizer State ---
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

  // --- FYP State ---
  isDetailsModalOpen: false,
  selectedDetailsBook: null,
  openDetailsModal: (book) =>
    set({ isDetailsModalOpen: true, selectedDetailsBook: book }),
  closeDetailsModal: () =>
    set({ isDetailsModalOpen: false, selectedDetailsBook: null }),
}));
