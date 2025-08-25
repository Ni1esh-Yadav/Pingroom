import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useWebRTC } from "./hooks/useWebRTC";
import type { Message, User } from "./types";
import AuthPanel from "./components/AuthPanel";
import PartnerPanel from "./components/PartnerPanel";
import VideoCall from "./components/VideoCall";
import Chat from "./components/Chat";

export default function App() {
  const { user, onLogout } = useAuth();
  const [partner, setPartner] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [partnerName, setPartnerName] = useState("");

  const {
    queued,
    isPiP,
    chatOpen,
    setChatOpen,
    localVideoRef,
    remoteVideoRef,
    joinQueue,
    leave,
    sendMessage,
    handlePiP,
  } = useWebRTC(user, setPartner, setPartnerName, setMessages);

  const handleLogout = async () => {
    try {
      await onLogout();
      window.location.reload();
    } catch (err) {
      alert("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 font-sans flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 rounded-2xl backdrop-blur-md shadow-md border border-white/40">
        {/* Brand */}
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
          Pingroom
        </h1>

        {/* Nav actions */}
        <div className="flex items-center gap-4">
          {/* Buy Me a Coffee */}
          <a
            href="https://buymeacoffee.com/ni1esh"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-xl font-semibold shadow transition-transform hover:scale-105"
          >
            ☕ Buy Me a Coffee
          </a>

          {user && (
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow transition-transform hover:scale-105"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Homepage / Auth */}
      {!partner && (
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-8">
          {/* Hero Section */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Talk to Developers 👨‍💻
          </h2>
          <p className="text-gray-600 max-w-xl mb-6">
            Pingroom’s video chat connects software developers and IT students
            in a simple, safe, and interactive way.
          </p>

          <AuthPanel user={user} queued={queued} joinQueue={joinQueue} />

          {/* Info cards */}
          <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl">
            <div className=" rounded-xl shadow p-6 text-left">
              <h3 className="text-xl font-bold mb-2">What is Pingroom?</h3>
              <p className="text-gray-600">
                A community-driven platform for software developers, engineers,
                and IT students. Randomly connect for one-on-one video or text
                chats.
              </p>
              <ul className="list-disc ml-6 mt-3 space-y-1 text-gray-700">
                <li>👨‍💻 Network with fellow developers</li>
                <li>📚 Learn from peers and professionals</li>
                <li>💬 Share ideas & experiences</li>
                <li>🌍 Connect worldwide</li>
              </ul>
            </div>

            <div className=" rounded-xl shadow p-6 text-left">
              <h3 className="text-xl font-bold mb-2">Do I need an account?</h3>
              <p className="text-gray-600">
                Yes!!. Sign in with your <b>GitHub account</b> to join.
              </p>
              <ul className="list-disc ml-6 mt-3 space-y-1 text-gray-700">
                <li>🔒 Only real developers can join</li>
                <li>🚀 One-click GitHub login</li>
                <li>👨‍💻 Start chatting instantly</li>
              </ul>
            </div>

            <div className=" rounded-xl shadow p-6 text-left">
              <h3 className="text-xl font-bold mb-2">Are you like Omegle?</h3>
              <p className="text-gray-600">
                Not at all. Pingroom is <b>for developers, by developers</b>. It
                focuses on IT and software development—not random casual chats.
              </p>
            </div>

            <div className=" rounded-xl shadow p-6 text-left">
              <h3 className="text-xl font-bold mb-2">Privacy First 🔐</h3>
              <p className="text-gray-600">
                Chats are anonymous unless you choose to share. Stay safe and
                avoid sharing personal information.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ⚠️ You must be 18+ or a verified IT student/professional to
                join.
              </p>
            </div>
          </div>
        </main>
      )}

      {/* Active chat view */}
      {partner && (
        <div className="flex-1 flex flex-col pt-2">
          <PartnerPanel
            partner={partner}
            partnerName={partnerName}
            leave={leave}
          />

          <div className="relative mt-4 flex-1">
            <VideoCall
              localVideoRef={localVideoRef}
              remoteVideoRef={remoteVideoRef}
              handlePiP={handlePiP}
              isPiP={isPiP}
            />

            <Chat
              chatOpen={chatOpen}
              setChatOpen={setChatOpen}
              messages={messages}
              text={text}
              setText={setText}
              sendMessage={sendMessage}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className=" backdrop-blur-sm text-gray-700 text-sm py-4 mt-8 text-center border-t border-white/30">
        © 2025-2026, Pingroom. All Rights Reserved.
      </footer>
    </div>
  );
}
