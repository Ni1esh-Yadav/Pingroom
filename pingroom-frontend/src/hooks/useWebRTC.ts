import { useEffect, useRef, useState } from "react";
import { ICE_CONFIG } from "../utils/constants";
import { safeSend } from "../utils/ws";
import type { Message, User } from "../types";

export const useWebRTC = (
  user: User | null,
  setPartner: (u: User | null) => void,
  setPartnerName: (n: string) => void,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  const [queued, setQueued] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const partnerIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      try {
        wsRef.current?.close();
      } catch {}
      try {
        pcRef.current?.close();
      } catch {}
      pcRef.current = null;
      wsRef.current = null;
    };
  }, []);

  const createPeerConnection = (partnerId: string | null) => {
    const pc = new RTCPeerConnection(ICE_CONFIG);
    pc.onicecandidate = (e) => {
      if (e.candidate && partnerId) {
        safeSend(wsRef.current, {
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
    const ws =
  window.location.hostname === "localhost"
    ? new WebSocket("ws://localhost:4000/signaling")
    : new WebSocket("wss://pingroom.onrender.com/signaling");
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
          await startWebRTC();
        } else if (msg.type === "signal") {
          await handleSignal(msg);
        } else if (msg.type === "msg" || msg.type === "system") {
          setMessages((m) => [...m, { from: "partner", text: msg.text }]);
        } else if (msg.type === "partner-left") {
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
    ws.onerror = (err) => console.warn("ws error", err);
  };

  const joinQueue = () => {
    if (!user) {
      window.location.href = "https://pingroom.onrender.com/auth/github";
      return;
    }
    connectWS();
    setMessages([]);
    const sendJoin = () => {
      safeSend(wsRef.current, {
        type: "join",
        meta: { login: user.login ?? user.username },
      });
    };
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      sendJoin();
    } else {
      wsRef.current?.addEventListener("open", sendJoin, { once: true });
    }
  };

  const leave = (shouldRequeue = false) => {
    if (partnerIdRef.current) {
      safeSend(wsRef.current, { type: "leave", to: partnerIdRef.current });
    }
    try {
      pcRef.current?.getSenders()?.forEach((s) => s.track?.stop());
    } catch {}
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
      setTimeout(() => joinQueue(), 250);
    }
  };

  const startWebRTC = async () => {
    if (!partnerIdRef.current || pcRef.current) return;
    const pc = createPeerConnection(partnerIdRef.current);
    if (!localVideoRef.current?.srcObject) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        localVideoRef.current?.addEventListener(
          "leavepictureinpicture",
          () => setIsPiP(false)
        );
      } catch (e) {
        console.error("getUserMedia failed", e);
      }
    }
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      safeSend(wsRef.current, {
        type: "signal",
        to: partnerIdRef.current,
        data: { sdp: pc.localDescription },
      });
    } catch (e) {
      console.error("Failed to create/send offer", e);
    }
  };

  const handleSignal = async (msg: any) => {
    if (msg.from) partnerIdRef.current = String(msg.from);
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
          if (!localVideoRef.current?.srcObject) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
              });
              stream.getTracks().forEach((t) => pc.addTrack(t, stream));
              if (localVideoRef.current)
                localVideoRef.current.srcObject = stream;
              localVideoRef.current?.addEventListener(
                "leavepictureinpicture",
                () => setIsPiP(false)
              );
            } catch (e) {
              console.error("getUserMedia for answer failed", e);
            }
          }
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          safeSend(wsRef.current, {
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

  const sendMessage = (text: string) => {
    if (!partnerIdRef.current) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    safeSend(wsRef.current, {
      type: "msg",
      to: partnerIdRef.current,
      text: trimmed,
    });
    setMessages((m) => [...m, { from: "me", text: trimmed }]);
  };

  const handlePiP = async () => {
    try {
      if (!localVideoRef.current) return;
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
        return;
      }
      await (localVideoRef.current as any).requestPictureInPicture();
      setIsPiP(true);
    } catch (err) {
      console.error("PiP error:", err);
    }
  };

  return {
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
  };
};
