import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import ActiveBookCard from "./ActiveBookCard";
import type { TrackedBook } from "../../types";

export default function TrackerDashboard() {
  const { activeBooks, addBookToTracker } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", author: "" });

  const currentlyReading = activeBooks.filter(
    (book: TrackedBook) => book.status === "READING",
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;

    addBookToTracker({
      id: Date.now().toString(),
      title: newBook.title,
      author: newBook.author,
      coverUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newBook.title)}&background=random&size=200`,
      progress: 0,
      status: "READING",
    });

    setNewBook({ title: "", author: "" });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">
            Currently Reading
          </h2>
          <span className="text-sm font-medium bg-slate-800 text-slate-300 px-2 py-1 rounded-md">
            {currentlyReading.length} Active
          </span>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm font-medium flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
          {isAdding ? "Cancel" : "Manual Add"}
        </button>
      </div>

      {/* Add Book Form */}
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
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              value={newBook.title}
              onChange={(e) =>
                setNewBook({ ...newBook, title: e.target.value })
              }
              autoFocus
            />
            <input
              type="text"
              placeholder="Author"
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              value={newBook.author}
              onChange={(e) =>
                setNewBook({ ...newBook, author: e.target.value })
              }
            />
            <button
              type="submit"
              disabled={!newBook.title || !newBook.author}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {currentlyReading.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
          <p className="text-slate-500 max-w-sm">
            You aren't tracking any books right now. Add one manually or check
            your recommendations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentlyReading.map((book) => (
            <ActiveBookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
