import { useEffect } from "react";
import AuthGuard from "./components/auth/AuthGuard";
import TrackerDashboard from "./components/book-tracker/TrackerDashboard";
import FypFeed from "./components/book-fyp/FypFeed";
import TeaserModal from "./components/book-summarizer/TeaserModal";
import DeepDiveChat from "./components/book-summarizer/DeepDiveChat";
import BookDetailsModal from "./components/book-fyp/BookDetailsModal";
import { useAuth } from "./hooks/useAuth";
import { useAppStore } from "./store/useAppStore";
import { LogOut } from "lucide-react";

function Dashboard() {
  const { user, signOut } = useAuth();
  const { syncLibraryFromSupabase, clearLibrary } = useAppStore();

  const displayName =
    user?.user_metadata?.display_name || user?.email?.split("@")[0] || "reader";

  useEffect(() => {
    if (user) {
      syncLibraryFromSupabase(user.id);
    }
  }, [user, syncLibraryFromSupabase]);

  const handleSignOut = async () => {
    clearLibrary();
    await signOut();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans flex flex-col">
      {/* Top Bar */}
      <header className="h-16 w-full bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="font-bold text-xl text-indigo-400 tracking-tight">
          ChapterNode
        </div>

        <nav className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            Hi, <span className="text-white font-medium">{displayName}</span>
          </span>
          <button
            onClick={handleSignOut}
            className="text-slate-500 hover:text-slate-300 p-2 rounded-lg hover:bg-slate-800 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome back, {displayName}.
          </h1>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <section className="xl:col-span-2 space-y-8">
            <TrackerDashboard />
          </section>

          <aside className="space-y-6">
            <FypFeed />
          </aside>
        </div>
      </main>

      <TeaserModal />
      <DeepDiveChat />
      <BookDetailsModal />
    </div>
  );
}

function App() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}

export default App;
