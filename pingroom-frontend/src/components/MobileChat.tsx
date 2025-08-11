import React, { useRef, useEffect } from "react";
import type { Message } from "../types";

type Props = {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  messages: Message[];
  text: string;
  setText: (v: string) => void;
  sendMessage: () => void;
};

export default function MobileChat({
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

  return (
    <>
      <button
        className="md:hidden fixed top-6 right-4 z-50 bg-indigo-600 text-white p-3 rounded-full shadow-lg"
        onClick={() => setChatOpen(true)}
      >
        💬
      </button>
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          chatOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">Chat</div>
          <button onClick={() => setChatOpen(false)} className="text-gray-600">
            Close
          </button>
        </div>
        <div className="p-3 overflow-y-auto h-[calc(100%-128px)]">
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
        <div className="p-3 border-t flex">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 border rounded-l px-3 py-2 focus:outline-none"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-indigo-500 text-white px-4 py-2 rounded-r"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
