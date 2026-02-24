export type BookStatus = "TO_READ" | "READING" | "READ" | "DNF";

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
}

export interface TrackedBook extends Book {
  progress: number;
  status: BookStatus;
  startedAt?: string;
}
