import React from "react";
import { Rnd } from "react-rnd";

type Props = {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  handlePiP: () => void;
  isPiP: boolean;
};

export default function VideoCall({
  localVideoRef,
  remoteVideoRef,
  handlePiP,
  isPiP,
}: Props) {
  return (
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
  );
}
