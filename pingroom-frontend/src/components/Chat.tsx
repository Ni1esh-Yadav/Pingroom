import { useRef, useEffect } from "react";
import type { Message } from "../types";

type Props = {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  messages: Message[];
  text: string;
  setText: (v: string) => void;
  sendMessage: (text: string) => void;
};

export default function Chat({
  chatOpen,
  setChatOpen,
  messages,
  text,
  setText,
  sendMessage,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (text.trim()) {
      sendMessage(text.trim());
      setText(""); // clear input after sending
    }
  };

  return (
    <>
      {/* Floating button */}
      {!chatOpen && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transform transition-all"
          onClick={() => setChatOpen(true)}
        >
          💬
        </button>
      )}

      {/* Chat container */}
      <div
        className={`
          fixed top-0 right-0 h-full z-50 flex flex-col
          transform transition-transform duration-300
          ${chatOpen ? "translate-x-0" : "translate-x-full"}
          w-72 sm:w-80 md:w-96
        `}
      >
        <div className="flex flex-col backdrop-blur-lg shadow-2xl rounded-l-2xl h-full">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r  text-white rounded-tl-2xl">
            <div className="font-bold text-black">Chat</div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white/80 hover:text-white text-lg"
            >
              ✖
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${
                  m.from === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <span
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[75%] shadow-sm ${
                    m.from === "me"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {m.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSend}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-md hover:scale-105 transform transition"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
