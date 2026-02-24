import { useState, useEffect } from "react";
import { X, BookOpen, Calendar, Hash, Layers } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

interface APIData {
  description?: string;
  pageCount?: number;
  publishedDate?: string;
  categories?: string[];
  averageRating?: number;
}

export default function BookDetailsModal() {
  const { isDetailsModalOpen, selectedDetailsBook, closeDetailsModal } =
    useAppStore();

  const [loading, setLoading] = useState(false);
  const [bookData, setBookData] = useState<APIData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isDetailsModalOpen && selectedDetailsBook) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      setError("");
      setBookData(null);

      // Fetching from Google Books API using the title and author
      const query = encodeURIComponent(
        `intitle:${selectedDetailsBook.title} inauthor:${selectedDetailsBook.author}`,
      );

      fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.items && data.items.length > 0) {
            const info = data.items[0].volumeInfo;
            setBookData({
              description:
                info.description || "No description available for this book.",
              pageCount: info.pageCount,
              publishedDate: info.publishedDate,
              categories: info.categories,
              averageRating: info.averageRating,
            });
          } else {
            setError("Could not find extended details for this book.");
          }
        })
        .catch(() => setError("Failed to connect to the book database."))
        .finally(() => setLoading(false));
    }
  }, [isDetailsModalOpen, selectedDetailsBook]);

  if (!isDetailsModalOpen || !selectedDetailsBook) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-800 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="font-bold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-400" />
            Book Details
          </h3>
          <button
            onClick={closeDetailsModal}
            className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </header>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            <img
              src={selectedDetailsBook.coverUrl}
              alt={selectedDetailsBook.title}
              className="w-32 h-48 object-cover rounded-lg shadow-lg border border-slate-800 mx-auto sm:mx-0"
            />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white leading-tight mb-2">
                {selectedDetailsBook.title}
              </h2>
              <p className="text-indigo-400 font-medium mb-4">
                {selectedDetailsBook.author}
              </p>

              {/* Data Badges */}
              {!loading && bookData && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                  {bookData.pageCount && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                      <Hash size={14} className="text-slate-500" />{" "}
                      {bookData.pageCount} Pages
                    </span>
                  )}
                  {bookData.publishedDate && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                      <Calendar size={14} className="text-slate-500" />{" "}
                      {bookData.publishedDate.substring(0, 4)}
                    </span>
                  )}
                  {bookData.categories && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                      <Layers size={14} className="text-slate-500" />{" "}
                      {bookData.categories[0]}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Synopsis / Description Area */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider text-slate-400">
              Synopsis
            </h4>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                <div className="h-4 bg-slate-800 rounded w-4/6"></div>
              </div>
            ) : error ? (
              <p className="text-red-400 text-sm bg-red-400/10 p-4 rounded-lg border border-red-400/20">
                {error}
              </p>
            ) : bookData?.description ? (
              <div
                className="text-slate-300 text-sm leading-relaxed space-y-4 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: bookData.description }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
