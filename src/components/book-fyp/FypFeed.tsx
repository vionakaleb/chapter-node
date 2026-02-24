import { Sparkles, RefreshCw } from "lucide-react";
import FypCard from "./FypCard";
import { useState } from "react";

const MOCK_RECOMMENDATIONS = [
  {
    id: "rec-1",
    title: "Atomic Habits",
    author: "James Clear",
    coverUrl:
      "https://ui-avatars.com/api/?name=Atomic+Habits&background=random&size=200",
    reason:
      'Because you are currently reading "Thinking, Fast and Slow", you might enjoy this practical application of behavioral systems.',
  },
  {
    id: "rec-2",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    coverUrl:
      "https://ui-avatars.com/api/?name=Design+of+Everyday+Things&background=random&size=200",
    reason:
      "Matches your historical interest in cognitive psychology and system architecture.",
  },
];

export default function FypFeed() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recommendations, setRecommendations] = useState(MOCK_RECOMMENDATIONS);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    // Simulate network request
    setTimeout(() => {
      // Shuffle array to simulate getting new books from DB
      const shuffled = [...recommendations].sort(() => Math.random() - 0.5);
      setRecommendations(shuffled);
      setIsRefreshing(false);
    }, 800);
  };

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
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 border border-white/5 disabled:opacity-50"
        >
          <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.map((book) => (
          <FypCard key={book.id} book={book} reason={book.reason} />
        ))}
      </div>
    </div>
  );
}
