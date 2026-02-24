import { useEffect, useState } from "react";
import { Trash2, Edit2, CheckCircle } from "lucide-react";
import type { TrackedBook } from "../../types";
import { useAppStore } from "../../store/useAppStore";

interface ActiveBookCardProps {
  book: TrackedBook;
}

export default function ActiveBookCard({ book }: ActiveBookCardProps) {
  const { updateProgress, removeBook, updateStatus, openChat } = useAppStore();
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [tempProgress, setTempProgress] = useState(book.progress);

  const handleSaveProgress = () => {
    updateProgress(book.id, tempProgress);
    if (tempProgress === 100) {
      updateStatus(book.id, "READ");
    }
    setIsEditingProgress(false);
  };

  useEffect(() => {
    console.log(book, "book");
  }, []);

  return (
    <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800 flex gap-6 items-center transition-all hover:shadow-md hover:border-slate-700 group">
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
          </div>
          <button
            onClick={() => removeBook(book.id)}
            className="text-slate-500 hover:text-red-400 transition-colors p-2 opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Progress Section */}
        <div className="mt-4">
          {isEditingProgress ? (
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <input
                type="range"
                min="0"
                max="100"
                value={tempProgress}
                onChange={(e) => setTempProgress(parseInt(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="text-sm font-bold text-slate-700 w-12 text-right">
                {tempProgress}%
              </span>
              <button
                onClick={handleSaveProgress}
                className="bg-indigo-600 text-white p-1.5 rounded hover:bg-indigo-700 transition-colors"
              >
                <CheckCircle size={16} />
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-4 group/progress cursor-pointer"
              onClick={() => setIsEditingProgress(true)}
            >
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${book.progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-slate-600 w-10 text-right flex items-center justify-end gap-1">
                {book.progress}%
                <Edit2
                  size={12}
                  className="text-slate-400 opacity-0 group-hover/progress:opacity-100"
                />
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => openChat(book)}
            className="px-4 py-2 bg-indigo-500/10 text-indigo-400 text-sm font-medium rounded-lg hover:bg-indigo-500/20 transition-colors border border-indigo-500/20"
          >
            Deep-Dive Q&A
          </button>
        </div>
      </div>
    </div>
  );
}
