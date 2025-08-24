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
      {/* Floating button (visible when chat is closed, on all screens) */}
      {!chatOpen && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-lg"
          onClick={() => setChatOpen(true)}
        >
          💬
        </button>
      )}

      {/* Chat container */}
      <div
        className={`
          fixed top-0 right-0 h-full bg-white shadow-lg z-50
          transform transition-transform duration-300 flex flex-col
          ${chatOpen ? "translate-x-0" : "translate-x-full"}
          w-64 md:w-96 md:h-full md:top-0 md:rounded-lg md:overflow-hidden
        `}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">Chat</div>
          <button
            onClick={() => setChatOpen(false)}
            className="text-gray-600 font-medium"
          >
            ✖
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-3 overflow-y-auto">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`mb-2 flex ${
                m.from === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <span
                className={`px-3 py-2 rounded-lg text-sm ${
                  m.from === "me"
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {m.text}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t flex">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 border rounded-l px-3 py-2 focus:outline-none"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="bg-indigo-500 text-white px-4 py-2 rounded-r"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
