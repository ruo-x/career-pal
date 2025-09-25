"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
};

export default function Home() {
  const [input, setInput] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role: Message["role"], text: string) => {
    const msg: Message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      role,
      text,
      createdAt: Date.now(),
    };
    setMessages((m) => [...m, msg]);
    return msg;
  };

  // Send user input to backend
  const handleSend = async () => {
    if (input.trim() === "") return;

    setIsSending(true);
    const trimmed = input.trim();
    setInput("");

    // Add user bubble immediately
    addMessage("user", trimmed);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Server error");
      }

      const data = await res.json();
      const response = data.response || "No response";

      addMessage("assistant", response);
    } catch (error) {
      console.error("Send Error:", error);
      addMessage("assistant", "Error: Unable to get response. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  // Support Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen font-sans">
      {/* Header */}
      <header className="flex items-center justify-between h-[10vh] px-6 bg-gray-100">
        <h1 className="text-3xl font-bold">Career Pal</h1>
        <button
          onClick={() => setMessages([])}
          className="rounded-full border border-black/10 dark:border-white/15 px-4 sm:px-5 h-10 sm:h-12 text-sm sm:text-base hover:bg-gray-200 dark:hover:bg-gray-800 transition">
          Clear
        </button>
      </header>

      {/* Message display */}
      <div className="flex-1 overflow-auto p-4" aria-live="polite">
        <div className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              No messages yet. Ask me anything about cybersecurity!
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[78%] whitespace-pre-wrap break-words px-4 py-2 rounded-2xl text-sm leading-snug ${m.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-[6px] rounded-tl-2xl rounded-tr-2xl"
                    : "bg-gray-100 text-gray-900 rounded-bl-[6px] rounded-tr-2xl rounded-tl-2xl"
                    }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.text}
                  </ReactMarkdown>
                  <div className="text-[10px] opacity-60 mt-1 text-right">
                    {/* optional tiny timestamp */}
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            )))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <footer className="flex rounded-3xl items-center justify-center gap-4 h-[18vh] px-20 bg-gray-100">
        <textarea
          name="userPrompt"
          className="flex-1 rounded-2xl border border-black/30 p-4 text-medium resize-none"
          placeholder={
            isSending ? "Career Pal is thinking..." : "Type your message here... (Enter to send, Shift + Enter for new line)"
          }
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          disabled={isSending || input.trim() === ""}
          className={`flex items-center justify-center rounded-full px-5 py-3 text-medium font-medium transition ${isSending || input.trim() === ""
            ? "bg-gray-300 text-gray-700 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
        >
          {isSending ? "Loading..." : "Send"}
        </button>
      </footer>
    </div>
  );
}
