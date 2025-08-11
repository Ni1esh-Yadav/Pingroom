import { useRef, useEffect } from "react";
import type { Message } from "../types";

type Props = {
  messages: Message[];
  text: string;
  setText: (v: string) => void;
  sendMessage: () => void;
};

export default function ChatSidebar({
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
    <aside className="hidden md:flex flex-col fixed right-6 top-24 w-80 h-[70vh] bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 border-b font-semibold">Chat</div>
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
    </aside>
  );
}
