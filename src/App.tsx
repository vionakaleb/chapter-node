import TrackerDashboard from "./components/book-tracker/TrackerDashboard";
import FypFeed from "./components/book-fyp/FypFeed";
import TeaserModal from "./components/book-summarizer/TeaserModal";
import DeepDiveChat from "./components/book-summarizer/DeepDiveChat";
import BookDetailsModal from "./components/book-fyp/BookDetailsModal";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans flex flex-col">
      {/* Top Bar */}
      <header className="h-16 w-full bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
        {/* Logo */}
        <div className="font-bold text-xl text-indigo-400 tracking-tight">
          ChapterNode
        </div>

        {/* Nav Links */}
        <nav>
          <ul className="flex items-center gap-2">
            <li className="text-indigo-400 text-sm font-medium flex items-center gap-2 cursor-pointer bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20 transition-colors hover:bg-indigo-500/20">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
              Dashboard
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome back.
          </h1>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Book Tracker */}
          <section className="xl:col-span-2 space-y-8">
            <TrackerDashboard />
          </section>

          {/* Book FYP */}
          <aside className="space-y-6">
            <FypFeed />
          </aside>
        </div>
      </main>

      {/* Book Summarizer (Modals/Overlays) */}
      <TeaserModal />
      <DeepDiveChat />
      <BookDetailsModal />
    </div>
  );
}

export default App;
