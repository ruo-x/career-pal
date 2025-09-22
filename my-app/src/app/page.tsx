import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between h-[10vh] px-6 bg-gray-100">
        <h1 className="text-3xl font-bold">Career Pal</h1>
        <button className="rounded-full border border-black/10 dark:border-white/15 px-4 sm:px-5 h-10 sm:h-12 text-sm sm:text-base hover:bg-gray-200 dark:hover:bg-gray-800 transition">
          Clear
        </button>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col gap-8 items-center sm:items-start px-6 py-4 overflow-auto">
        <p>Contents here</p>
      </main>

      {/* Footer */}
      <footer className="flex rounded-3xl items-center justify-center gap-4 h-[20vh] px-6 py-15 bg-gray-100">
        <textarea
          name="userPrompt"
          className="flex-1 rounded-2xl border border-black/30 p-4 text-sm resize-none"
        />
        <button className="flex items-center justify-center gap-2 rounded-full bg-black text-white px-4 sm:px-5 h-10 sm:h-12 text-xs sm:text-base hover:bg-gray-800 dark:hover:bg-gray-300 transition">
          Send
        </button>
      </footer>
    </div>
  );
}
