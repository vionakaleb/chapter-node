import React, { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import ActiveBookCard from "./ActiveBookCard";
import type { BookStatus, TrackedBook } from "../../types";
import { lookupBook } from "../../services/recommenderApi";

const SHELVES: { value: BookStatus; label: string; emptyHint: string }[] = [
  {
    value: "READING",
    label: "Currently Reading",
    emptyHint:
      "Nothing here yet. Move a book from your To Read shelf or add one manually.",
  },
  {
    value: "TO_READ",
    label: "To Read",
    emptyHint: "Add a book or check your AI recommendations.",
  },
  {
    value: "READ",
    label: "Finished",
    emptyHint: "Books you finish will appear here.",
  },
  {
    value: "DNF",
    label: "Abandoned",
    emptyHint: "Books you mark as DNF will appear here.",
  },
];

export default function TrackerDashboard() {
  const { activeBooks, addBookToTracker } = useAppStore();
  const [shelf, setShelf] = useState<BookStatus>("READING");
  const [isAdding, setIsAdding] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", author: "" });

  const counts = useMemo(
    () =>
      activeBooks.reduce<Record<BookStatus, number>>(
        (acc, b) => ({ ...acc, [b.status]: (acc[b.status] || 0) + 1 }),
        { READING: 0, TO_READ: 0, READ: 0, DNF: 0 },
      ),
    [activeBooks],
  );

  const visible = useMemo(
    () => activeBooks.filter((b) => b.status === shelf),
    [activeBooks, shelf],
  );

// src/components/book-tracker/TrackerDashboard.tsx  (handleAddSubmit)
const handleAddSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newBook.title || !newBook.author) return;

  const book: TrackedBook = {
    id: crypto.randomUUID(),
    title: newBook.title,
    author: newBook.author,
    coverUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newBook.title)}&background=random&size=200`,
    progress: 0,
    status: shelf === "READ" || shelf === "DNF" ? "TO_READ" : shelf,
  };

  addBookToTracker(book);
  setNewBook({ title: "", author: "" });
  setIsAdding(false);

  // enrich in the background, don't await in the UI
  lookupBook(newBook.title, newBook.author)
    .then((enriched) => {
      if (enriched) enrichBook(book.id, enriched.subjects, enriched.workKey);
    })
    .catch(() => {}); // silent fail, enrichment is best-effort
};

  const activeShelf = SHELVES.find((s) => s.value === shelf)!;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto">
        {SHELVES.map((s) => {
          const isActive = s.value === shelf;
          return (
            <button
              key={s.value}
              onClick={() => setShelf(s.value)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                isActive
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {s.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-md ${
                  isActive
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {counts[s.value]}
              </span>
            </button>
          );
        })}

        <div className="flex-1" />

        <button
          onClick={() => setIsAdding((v) => !v)}
          className="text-sm font-medium flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
          {isAdding ? "Cancel" : "Manual Add"}
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-slate-900 p-5 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-top-2"
        >
          <h4 className="text-sm font-bold text-white mb-3">
            Add Book Manually
          </h4>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Book Title"
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={newBook.title}
              onChange={(e) =>
                setNewBook({ ...newBook, title: e.target.value })
              }
              autoFocus
            />
            <input
              type="text"
              placeholder="Author"
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={newBook.author}
              onChange={(e) =>
                setNewBook({ ...newBook, author: e.target.value })
              }
            />
            <button
              type="submit"
              disabled={!newBook.title || !newBook.author}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* Empty / List */}
      {visible.length === 0 ? (
        <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-2xl p-10 flex items-center justify-center text-center">
          <p className="text-slate-500 max-w-sm text-sm">
            {activeShelf.emptyHint}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((book) => (
            <ActiveBookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
