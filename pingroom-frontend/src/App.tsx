import React, { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";

type Message = { from: "me" | "partner"; text: string };

type User = {
  id: string | number;
  username?: string;
  login?: string;
  displayName?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  email?: string | null;
};

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:turn.pingroom.com:3478",
      username: "pingroom",
      credential: "supersecret",
    },
  ],
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  const [queued, setQueued] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [partnerName, setPartnerName] = useState<string>("");

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const partnerIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // UI-only state
  const [isPiP, setIsPiP] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // fetch current user on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:4000/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data ?? null);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to fetch /auth/me", err);
        setUser(null);
      }
    })();
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        wsRef.current?.close();
      } catch (e) {}
      try {
        pcRef.current?.close();
      } catch (e) {}
      pcRef.current = null;
      wsRef.current = null;
    };
  }, []);

  // helper: safely send via websocket
  const safeSend = (obj: any) => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(obj));
      }
    } catch (e) {
      console.warn("ws send failed", e);
    }
  };

  const createPeerConnection = (partnerId: string | null) => {
    const pc = new RTCPeerConnection(ICE_CONFIG);

    pc.onicecandidate = (e) => {
      if (e.candidate && partnerId) {
        safeSend({
          type: "signal",
          to: partnerId,
          data: { candidate: e.candidate },
        });
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const connectWS = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(
      `${wsProtocol}://${window.location.hostname}:4000/signaling`
    );
    wsRef.current = ws;

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "queued") {
          setQueued(true);
        } else if (msg.type === "paired") {
          setQueued(false);
          setPartner(msg.partner);
          partnerIdRef.current = String(msg.partner.id);
          setPartnerName(
            msg.partner.displayName ||
              msg.partner.username ||
              msg.partner.login ||
              msg.partner.meta?.login ||
              "Unknown"
          );
          // create PC and start negotiation
          await startWebRTC();
        } else if (msg.type === "signal") {
          await handleSignal(msg);
        } else if (msg.type === "msg") {
          setMessages((m) => [...m, { from: "partner", text: msg.text }]);
        } else if (msg.type === "system") {
          setMessages((m) => [...m, { from: "partner", text: msg.text }]);
        } else if (msg.type === "partner-left") {
          // remote user disconnected
          leave(false);
        }
      } catch (e) {
        console.warn("failed to handle ws message", e);
      }
    };

    ws.onclose = () => {
      setQueued(false);
      setPartner(null);
      partnerIdRef.current = null;
      wsRef.current = null;
    };

    ws.onerror = (err) => {
      console.warn("ws error", err);
    };
  };

  const joinQueue = () => {
    if (!user) {
      window.location.href = "http://localhost:4000/auth/github";
      return;
    }

    connectWS();
    setMessages([]);

    const sendJoin = () => {
      safeSend({ type: "join", meta: { login: user.login ?? user.username } });
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      sendJoin();
    } else {
      wsRef.current?.addEventListener("open", sendJoin, { once: true });
    }
  };

  const leave = (shouldRequeue = false) => {
    if (partnerIdRef.current) {
      safeSend({ type: "leave", to: partnerIdRef.current });
    }

    try {
      pcRef.current?.getSenders()?.forEach((s) => {
        try {
          s.track?.stop();
        } catch (e) {}
      });
    } catch (e) {}

    pcRef.current?.close();
    pcRef.current = null;
    setPartner(null);
    partnerIdRef.current = null;
    setQueued(false);
    setChatOpen(false);

    if (isPiP && document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
      setIsPiP(false);
    }

    if (shouldRequeue) {
      // small delay to ensure server-side state cleaned up
      setTimeout(() => joinQueue(), 250);
    }
  };

  const startWebRTC = async () => {
    if (!partnerIdRef.current) return;
    if (pcRef.current) return; // already created

    const pc = createPeerConnection(partnerIdRef.current);

    // get local stream only once
    if (!localVideoRef.current?.srcObject) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        // add tracks to peer connection
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // ensure PiP leave event handled for this element
        try {
          localVideoRef.current?.addEventListener("leavepictureinpicture", () =>
            setIsPiP(false)
          );
        } catch (e) {}
      } catch (e) {
        console.error("getUserMedia failed", e);
      }
    }

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      safeSend({
        type: "signal",
        to: partnerIdRef.current,
        data: { sdp: pc.localDescription },
      });
    } catch (e) {
      console.error("Failed to create/send offer", e);
    }
  };

  const handleSignal = async (msg: any) => {
    // Ensure partner id is set if present
    if (msg.from) partnerIdRef.current = String(msg.from);

    // create pc if not present (we might be the callee)
    if (!pcRef.current && partnerIdRef.current) {
      createPeerConnection(partnerIdRef.current);
    }

    const pc = pcRef.current;
    if (!pc) return;

    if (msg.data?.sdp) {
      try {
        const remoteDesc = new RTCSessionDescription(msg.data.sdp);
        await pc.setRemoteDescription(remoteDesc);

        if (remoteDesc.type === "offer") {
          // ensure local stream exists before answering
          if (!localVideoRef.current?.srcObject) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
              });
              stream.getTracks().forEach((t) => pc.addTrack(t, stream));
              if (localVideoRef.current)
                localVideoRef.current.srcObject = stream;

              try {
                localVideoRef.current?.addEventListener(
                  "leavepictureinpicture",
                  () => setIsPiP(false)
                );
              } catch (e) {}
            } catch (e) {
              console.error("getUserMedia for answer failed", e);
            }
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          safeSend({
            type: "signal",
            to: partnerIdRef.current,
            data: { sdp: pc.localDescription },
          });
        }
      } catch (e) {
        console.error("handleSignal sdp failed", e);
      }
    }

    if (msg.data?.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(msg.data.candidate));
      } catch (e) {
        console.warn("addIceCandidate failed", e);
      }
    }
  };

  const sendMessage = () => {
    if (!partnerIdRef.current) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    safeSend({ type: "msg", to: partnerIdRef.current, text: trimmed });
    setMessages((m) => [...m, { from: "me", text: trimmed }]);
    setText("");
  };

  const handlePiP = async () => {
    try {
      if (!localVideoRef.current) return;

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
        return;
      }

      // request PiP for local video
      await (localVideoRef.current as any).requestPictureInPicture();
      setIsPiP(true);
    } catch (err) {
      console.error("PiP error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6 font-sans">
      <h1 className="text-4xl font-extrabold text-indigo-700 mb-6 drop-shadow-sm">
        Pingroom
      </h1>

      {!user && (
        <div className="bg-white shadow-lg rounded-xl p-6 max-w-md">
          <p className="mb-4 text-gray-600 text-lg">
            Welcome to Pingroom — login to meet developers.
          </p>
          <a
            href="http://localhost:4000/auth/github"
            className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-5 py-3 rounded-lg shadow"
          >
            Login with GitHub
          </a>
        </div>
      )}

      {user && !partner && (
        <div className="bg-white shadow-lg rounded-xl p-6 max-w-md">
          <div className="flex items-center gap-4 mb-5">
            {(user.avatar || user.avatar_url) && (
              <img
                src={user.avatar || user.avatar_url || ""}
                alt="avatar"
                className="w-12 h-12 rounded-full border-2 border-indigo-500"
              />
            )}
            <div>
              <strong className="text-lg text-gray-800">
                {user.displayName ?? user.username ?? user.login}
              </strong>
              {user.email && (
                <div className="text-sm text-gray-500">{user.email}</div>
              )}
            </div>
          </div>

          <button
            onClick={joinQueue}
            className="bg-green-500 hover:bg-green-600 transition text-white px-5 py-3 rounded-lg shadow w-full"
          >
            {queued ? "Waiting for partner..." : "Find a partner"}
          </button>
        </div>
      )}

      {partner && (
        <>
          <div className="bg-white shadow-lg rounded-xl p-4 mb-4 flex items-center gap-3">
            {(partner.avatar || partner.avatar_url) && (
              <img
                src={partner.avatar || partner.avatar_url || ""}
                alt="avatar"
                className="w-10 h-10 rounded-full border"
              />
            )}
            <div className="text-gray-800">
              <strong>Chatting with {partnerName}</strong>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => leave(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
              >
                Leave
              </button>
              <button
                onClick={() => leave(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg"
              >
                Next
              </button>
            </div>
          </div>

          <div className="relative">
            <Rnd
              default={{ x: 60, y: 120, width: 520, height: 360 }}
              minWidth={300}
              minHeight={200}
              bounds="window"
              dragAxis="both"
              style={{ position: "fixed" }}
              cancel=".local-video-overlay"
              className="bg-black rounded-lg overflow-hidden"
            >
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              <Rnd
                default={{ x: 300, y: 180, width: 200, height: 140 }}
                bounds="parent"
                enableResizing={false}
                className="local-video-overlay z-30"
              >
                <div className="w-full h-full bg-black rounded-lg overflow-hidden shadow-lg border-2 border-white relative">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={handlePiP}
                      className="bg-white/90 hover:bg-white text-black px-2 py-1 rounded shadow text-xs"
                    >
                      {isPiP ? "Exit PiP" : "PiP"}
                    </button>
                  </div>
                </div>
              </Rnd>
            </Rnd>

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
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-gray-600"
                >
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
          </div>
        </>
      )}
    </div>
  );
}
