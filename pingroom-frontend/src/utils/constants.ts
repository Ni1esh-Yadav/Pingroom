export const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:turn.pingroom.com:3478",
      username: "pingroom",
      credential: "supersecret",
    },
  ],
};
