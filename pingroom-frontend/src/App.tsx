import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useWebRTC } from "./hooks/useWebRTC";
import type { Message, User } from "./types";
import AuthPanel from "./components/AuthPanel";
import PartnerPanel from "./components/PartnerPanel";
import VideoCall from "./components/VideoCall";
import ChatSidebar from "./components/ChatSidebar";
import MobileChat from "./components/MobileChat";

export default function App() {
  const { user } = useAuth();
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

  const handleSendMessage = () => {
    sendMessage(text);
    setText("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6 font-sans">
      <h1 className="text-4xl font-extrabold text-indigo-700 mb-6 drop-shadow-sm">
        Pingroom
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

            <ChatSidebar
              messages={messages}
              text={text}
              setText={setText}
              sendMessage={handleSendMessage}
            />

            <MobileChat
              chatOpen={chatOpen}
              setChatOpen={setChatOpen}
              messages={messages}
              text={text}
              setText={setText}
              sendMessage={handleSendMessage}
            />
          </div>
        </>
      )}
    </div>
  );
}
