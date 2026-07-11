// src/components/book-fyp/FypFeed.tsx
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import FypCard from "./FypCard";
import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "../../store/useAppStore";
import {
  fetchRecommendations,
  type Recommendation,
} from "../../services/recommenderApi";

export default function FypFeed() {
  const { activeBooks, userId } = useAppStore();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (activeBooks.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const results = await fetchRecommendations(
        activeBooks,
        10,
        userId ?? undefined,
      );
      setRecommendations(results);
    } catch {
      setError("Couldn't load recommendations right now.");
    } finally {
      setLoading(false);
    }
  }, [activeBooks]);

  useEffect(() => {
    load();
    console.log(recommendations, "recommendations");
  }, []); // only on mount; user controls refresh manually

  return (
    <div className="bg-linear-to-b from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl ring-1 ring-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Sparkles size={18} className="text-indigo-300" />
          </div>
          <h2 className="text-lg font-bold">AI Curated For You</h2>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-medium bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 border border-white/5 disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3 mb-4">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {loading && recommendations.length === 0 && (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white/5 rounded-2xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-28 bg-white/10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                  <div className="h-12 bg-white/5 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && recommendations.length === 0 && !error && (
        <p className="text-slate-400 text-sm text-center py-8">
          Add books to your library to get recommendations.
        </p>
      )}

      <div className="space-y-4">
        {recommendations.map((book) => (
          <FypCard
            key={book.workKey}
            book={{
              id: book.workKey,
              title: book.title,
              author: book.authors[0] ?? "",
              coverUrl:
                book.coverUrl ??
                `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&background=random&size=200`,
            }}
            reason={book.reason}
          />
        ))}
      </div>
    </div>
  );
}
