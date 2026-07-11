export type BookStatus = "TO_READ" | "READING" | "READ" | "DNF";

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
}

export interface TrackedBook extends Book {
  status: BookStatus;
  progress: number; // 0–100
  currentPage?: number;
  totalPages?: number;
  startedAt?: string;
  finishedAt?: string;
  abandonedAt?: string;
  rating?: number;
  subjects?: string[]; // from Open Library
  workKey?: string; // e.g. "/works/OL45804W"
  averageRating: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}
