import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard } from "lucide-react";

const shortcuts = [
  { keys: ["N"], action: "New Task" },
  { keys: ["?"], action: "Toggle Shortcuts" },
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "SELECT"
      )
        return;
      if (e.key === "?") setIsOpen((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="card-dark-strong p-4 mb-3 min-w-[200px]"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Keyboard Shortcuts
            </p>
            {shortcuts.map((s) => (
              <div
                key={s.action}
                className="flex items-center justify-between py-1.5"
              >
                <span className="text-sm text-gray-400">{s.action}</span>
                <div className="flex gap-1">
                  {s.keys.map((k) => (
                    <kbd
                      key={k}
                      className="px-2 py-0.5 text-xs rounded bg-[#111111] border border-[#2a2a2a] text-gray-300 font-mono"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="p-2.5 rounded-full bg-[#161616] border border-[#2a2a2a] text-gray-500 hover:text-lime-400 hover:border-lime-400/30 transition-all"
        title="Keyboard Shortcuts (?)"
      >
        <Keyboard size={16} />
      </button>
    </div>
  );
}
