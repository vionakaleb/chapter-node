import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

export default function DeepDiveChat() {
  const { isChatOpen, activeChatBook, closeChat } = useAppStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when opened
  useEffect(() => {
    if (isChatOpen && activeChatBook && messages.length === 0) {
      setMessages([
        {
          id: "1",
          role: "ai",
          content: `Hi! I'm your ChapterNode assistant. Ask me anything about "${activeChatBook.title}" by ${activeChatBook.author}.`,
        },
      ]);
    }
  }, [isChatOpen, activeChatBook, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate LLM Network Request
    setTimeout(() => {
      const aiMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: aiMessageId, role: "ai", content: "" },
      ]);

      const mockResponse = `That's a great question about ${activeChatBook?.title}. The author argues that our cognitive biases often short-circuit logical decision-making. Would you like me to summarize the specific chapter that covers this?`;
      let i = 0;

      const interval = setInterval(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: msg.content + mockResponse.charAt(i) }
              : msg,
          ),
        );
        i++;
        if (i >= mockResponse.length - 1) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 20);
    }, 600);
  };

  const handleClose = () => {
    closeChat();
    setTimeout(() => setMessages([]), 300);
  };

  if (!isChatOpen || !activeChatBook) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              <Bot size={18} className="text-indigo-400" />
              Deep-Dive Q&A
            </h3>
            <p className="text-xs text-slate-400 truncate w-64 mt-0.5">
              Discussing: {activeChatBook.title}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-800 rounded-lg hover:bg-slate-700"
          >
            <X size={18} />
          </button>
        </header>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                  <Bot size={14} className="text-indigo-400" />
                </div>
              )}

              <div
                className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"
                }`}
              >
                {msg.content}
                {msg.role === "ai" &&
                  isTyping &&
                  msg.id === messages[messages.length - 1].id && (
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-indigo-400 animate-pulse align-middle"></span>
                  )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <footer className="p-4 bg-slate-900 border-t border-slate-800">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the book..."
              disabled={isTyping}
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </footer>
      </div>
    </>
  );
}
