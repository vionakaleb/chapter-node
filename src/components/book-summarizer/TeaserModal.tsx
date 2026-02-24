import { useState, useEffect } from "react";
import { X, Sparkles, BookPlus } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

export default function TeaserModal() {
  const {
    isTeaserModalOpen,
    selectedTeaserBook,
    closeTeaserModal,
    addBookToTracker,
  } = useAppStore();

  const [status, setStatus] = useState<"idle" | "generating" | "complete">(
    "idle",
  );
  const [summary, setSummary] = useState<string>("");

  // Simulating AI streaming response
  useEffect(() => {
    if (isTeaserModalOpen && selectedTeaserBook && status === "idle") {
      setStatus("generating");
      setSummary("");

      const mockStream = `In this compelling read, ${selectedTeaserBook.author} breaks down complex concepts into actionable frameworks. The book avoids dense jargon, instead focusing on practical applications for daily life. It is a highly recommended choice if you are looking to optimize your habits and understand the underlying systems that drive human behavior.`;

      let i = 0;
      const interval = setInterval(() => {
        setSummary((prev) => prev + mockStream.charAt(i));
        i++;
        if (i >= mockStream.length) {
          clearInterval(interval);
          setStatus("complete");
        }
      }, 20);

      return () => clearInterval(interval);
    }
  }, [isTeaserModalOpen, selectedTeaserBook, status]);

  // Reset local state when modal closes
  const handleClose = () => {
    closeTeaserModal();
    setTimeout(() => {
      setStatus("idle");
      setSummary("");
    }, 300);
  };

  const handleStartReading = () => {
    if (!selectedTeaserBook) return;

    // Map the discovery Book entity to a TrackedBook entity
    addBookToTracker({
      id: Date.now().toString(),
      title: selectedTeaserBook.title,
      author: selectedTeaserBook.author,
      coverUrl: selectedTeaserBook.coverUrl,
      progress: 0,
      status: "READING",
    });

    handleClose();
  };

  if (!isTeaserModalOpen || !selectedTeaserBook) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            AI Teaser Generator
          </h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </header>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex gap-5 mb-6">
            <img
              src={selectedTeaserBook.coverUrl}
              alt={selectedTeaserBook.title}
              className="w-16 h-24 object-cover rounded-lg shadow-sm border border-slate-200"
            />
            <div className="flex-1 pt-1">
              <h2 className="text-xl font-bold text-slate-900 leading-tight mb-1">
                {selectedTeaserBook.title}
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                {selectedTeaserBook.author}
              </p>
            </div>
          </div>

          {/* AI Output Area */}
          <div className="bg-linear-to-br from-indigo-50 to-slate-50 rounded-xl p-5 border border-indigo-100/50 min-h-[160px] relative shadow-inner">
            <Sparkles
              className="absolute top-4 right-4 text-indigo-200"
              size={24}
            />

            {status === "generating" && summary.length === 0 ? (
              // Loading Skeleton
              <div className="space-y-3 animate-pulse mt-2">
                <div className="h-3 bg-indigo-200/50 rounded w-3/4"></div>
                <div className="h-3 bg-indigo-200/50 rounded w-full"></div>
                <div className="h-3 bg-indigo-200/50 rounded w-5/6"></div>
              </div>
            ) : (
              // Streaming/Completed Text
              <div className="text-slate-700 leading-relaxed text-sm relative z-10">
                {summary}
                {status === "generating" && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse align-middle rounded-sm"></span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end items-center">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Dismiss
          </button>

          {/* Disabled until AI finishes generating */}
          <button
            disabled={status !== "complete"}
            onClick={handleStartReading}
            className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all shadow-sm flex items-center gap-2
              ${
                status === "complete"
                  ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 hover:shadow-md"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
          >
            <BookPlus size={16} />
            Add to Currently Reading
          </button>
        </footer>
      </div>
    </div>
  );
}
