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
      // optionally show toast or redirect
      window.location.reload();
    } catch (err) {
      alert("Logout failed");
    }
  };

  const handleSendMessage = () => {
    sendMessage(text);
    setText("");
  };

  return (
    <div className=" min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6 font-sans">
      <h1 className="text-4xl font-extrabold text-indigo-700 mb-6 drop-shadow-sm">
        Pingroom{" "}
        {user && (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        )}
      </h1>

      {!partner && (
        <AuthPanel user={user} queued={queued} joinQueue={joinQueue} />
      )}

      {partner && (
        <>
          <PartnerPanel
            partner={partner}
            partnerName={partnerName}
            leave={leave}
          />

          <div className="relative">
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
        </>
      )}
    </div>
  );
}
