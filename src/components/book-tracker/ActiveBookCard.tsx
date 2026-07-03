import { useState } from "react";
import {
  Trash2,
  Edit2,
  CheckCircle,
  BookOpen,
  BookMarked,
  RotateCcw,
  Star,
} from "lucide-react";
import type { TrackedBook } from "../../types";
import { useAppStore } from "../../store/useAppStore";

interface ActiveBookCardProps {
  book: TrackedBook;
}

export default function ActiveBookCard({ book }: ActiveBookCardProps) {
  const { updateProgress, removeBook, updateStatus, openChat, rateBook } =
    useAppStore();
    
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [tempPage, setTempPage] = useState(book.currentPage ?? 0); // unit bug fix
  const [tempTotalPages, setTempTotalPages] = useState(book.totalPages || 100);

  const handleSaveProgress = () => {
    const total = tempTotalPages > 0 ? tempTotalPages : 1;
    const finalPage = Math.min(Math.max(tempPage, 0), total);
    const newProgress = Math.round((finalPage / total) * 100);

    updateProgress(book.id, newProgress, finalPage, total);
    if (newProgress >= 100) updateStatus(book.id, "READ");

    setIsEditingProgress(false);
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800 flex gap-6 items-center transition-all hover:border-slate-700 group">
      <img
        src={book.coverUrl}
        alt={book.title}
        className="w-24 h-36 object-cover rounded-md shadow-sm border border-slate-800"
      />

      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="text-xl font-bold text-white">{book.title}</h3>
            <p className="text-slate-400">{book.author}</p>
            <StatusMeta book={book} />
          </div>
          <button
            onClick={() => removeBook(book.id)}
            aria-label={`Remove ${book.title}`}
            className="text-slate-500 hover:text-red-400 transition-colors p-2 opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Body varies by status */}
        {book.status === "READING" && (
          <div className="mt-4">
            {isEditingProgress ? (
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <input
                  type="range"
                  min="0"
                  max={tempTotalPages}
                  value={tempPage}
                  onChange={(e) => setTempPage(parseInt(e.target.value) || 0)}
                  className="flex-1 accent-indigo-500 cursor-pointer"
                />
                <div className="flex items-center gap-1 text-sm font-bold text-white bg-slate-900 border border-slate-700 rounded-md px-2 py-1 focus-within:border-indigo-500">
                  <input
                    type="number"
                    min="0"
                    max={tempTotalPages}
                    value={tempPage}
                    onChange={(e) => setTempPage(parseInt(e.target.value) || 0)}
                    className="w-10 bg-transparent text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-slate-500 select-none">/</span>
                  <input
                    type="number"
                    min="1"
                    value={tempTotalPages}
                    onChange={(e) =>
                      setTempTotalPages(parseInt(e.target.value) || 0)
                    }
                    className="w-10 bg-transparent text-slate-400 focus:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <button
                  onClick={handleSaveProgress}
                  aria-label="Save progress"
                  className="bg-indigo-600 text-white p-1.5 rounded-md hover:bg-indigo-500 shrink-0"
                >
                  <CheckCircle size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingProgress(true)}
                className="flex items-center gap-4 cursor-pointer group/progress"
              >
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${book.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-400 w-14 text-right flex items-center justify-end gap-1">
                  {book.progress}%
                  <Edit2
                    size={12}
                    className="text-slate-500 opacity-0 group-hover/progress:opacity-100"
                  />
                </span>
              </div>
            )}
          </div>
        )}

        {book.status === "READ" && (
          <div className="mt-4 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => rateBook(book.id, n)}
                aria-label={`Rate ${n} ${n === 1 ? "star" : "stars"}`}
                className="p-0.5"
              >
                <Star
                  size={18}
                  className={
                    n <= (book.rating ?? 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-600 hover:text-amber-400/50"
                  }
                />
              </button>
            ))}
          </div>
        )}

        {/* Status actions */}
        <div className="mt-6 flex gap-3 flex-wrap">
          {book.status === "TO_READ" && (
            <button
              onClick={() => updateStatus(book.id, "READING")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg flex items-center gap-2"
            >
              <BookOpen size={14} /> Start Reading
            </button>
          )}

          {book.status === "READING" && (
            <>
              <button
                onClick={() => updateStatus(book.id, "READ")}
                className="px-4 py-2 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 text-sm font-medium rounded-lg border border-emerald-500/20 flex items-center gap-2"
              >
                <BookMarked size={14} /> Mark Finished
              </button>
              <button
                onClick={() => updateStatus(book.id, "DNF")}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg"
              >
                Mark DNF
              </button>
            </>
          )}

          {book.status === "READ" && (
            <button
              onClick={() => openChat(book)}
              className="px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-sm font-medium rounded-lg border border-indigo-500/20 flex items-center gap-2"
            >
              <BookOpen size={14} /> Deep-Dive Q&A
            </button>
          )}

          {book.status === "DNF" && (
            <button
              onClick={() => updateStatus(book.id, "READING")}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg flex items-center gap-2"
            >
              <RotateCcw size={14} /> Resume
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusMeta({ book }: { book: TrackedBook }) {
  const fmt = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

  if (book.status === "READING" && book.startedAt)
    return (
      <p className="text-xs text-slate-500 mt-1">
        Started {fmt(book.startedAt)}
      </p>
    );
  if (book.status === "READ" && book.finishedAt)
    return (
      <p className="text-xs text-emerald-500/80 mt-1">
        Finished {fmt(book.finishedAt)}
      </p>
    );
  if (book.status === "DNF" && book.abandonedAt)
    return (
      <p className="text-xs text-slate-500 mt-1">
        Abandoned {fmt(book.abandonedAt)}
      </p>
    );
  return null;
}
