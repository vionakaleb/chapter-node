import { Sparkles, BookOpen } from "lucide-react";
import type { Book } from "../../types";
import { useAppStore } from "../../store/useAppStore";

interface FypCardProps {
  book: Book;
  reason: string;
}

export default function FypCard({ book, reason }: FypCardProps) {
  const { openTeaserModal, openDetailsModal } = useAppStore();

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-sm hover:bg-white/15 transition-all group">
      <div className="flex gap-4">
        {/* Book Cover */}
        <div className="relative shrink-0">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-20 h-28 object-cover rounded-lg shadow-sm"
          />
          <div className="absolute -top-2 -right-2 bg-indigo-500 text-white p-1.5 rounded-full shadow-lg">
            <Sparkles size={12} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="font-bold text-white leading-tight mb-1">
            {book.title}
          </h4>
          <p className="text-xs text-indigo-200 mb-3">{book.author}</p>

          {/* AI Reason Bubble */}
          <div className="bg-slate-900/50 rounded-lg p-2.5 border border-white/5">
            <p className="text-[11px] text-slate-300 italic leading-relaxed">
              "{reason}"
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => openTeaserModal(book)}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20"
        >
          <Sparkles size={14} />
          AI Teaser
        </button>

        {/* Book Details Modal */}
        <button
          onClick={() => openDetailsModal(book)}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-white/5 text-slate-200 text-xs font-semibold rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
        >
          <BookOpen size={14} />
          Details
        </button>
      </div>
    </div>
  );
}
