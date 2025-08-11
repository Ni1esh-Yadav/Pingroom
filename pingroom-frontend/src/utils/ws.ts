export const safeSend = (ws: WebSocket | null, obj: any) => {
  try {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj));
    }
  } catch (e) {
    console.warn("ws send failed", e);
  }
};
