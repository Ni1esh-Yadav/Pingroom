import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import { log } from "./logger";

export type Client = {
  id: string;
  ws: WebSocket;
  busy: boolean;
  meta?: any;
};

export function createSignalingServer(server: http.Server) {
  const wss = new WebSocketServer({ server, path: "/signaling" });
  const clients = new Map<string, Client>();
  const queue: Client[] = [];

  function pairClients(a: Client, b: Client) {
    a.busy = true;
    b.busy = true;
    // notify both
    const payloadA = JSON.stringify({
      type: "paired",
      partner: { id: b.id, meta: b.meta },
    });
    const payloadB = JSON.stringify({
      type: "paired",
      partner: { id: a.id, meta: a.meta },
    });
    a.ws.send(payloadA);
    b.ws.send(payloadB);
  }

  wss.on("connection", function connection(ws, req) {
    const id = Math.random().toString(36).slice(2);
    const client: Client = { id, ws, busy: false };
    clients.set(id, client);
    log("ws connected", id);

    ws.on("message", (message) => {
      try {
        const msg = JSON.parse(String(message));
        if (msg.type === "join") {
          client.meta = msg.meta || {};
          // check if someone in queue
          const partner = queue.shift();
          if (partner && !partner.busy) {
            pairClients(client, partner);
          } else {
            queue.push(client);
            ws.send(JSON.stringify({ type: "queued" }));
          }
        }

        if (msg.type === "signal") {
          // forward to partner by id
          const to = msg.to as string;
          const target = clients.get(to);
          if (target)
            target.ws.send(
              JSON.stringify({
                type: "signal",
                from: client.id,
                data: msg.data,
              })
            );
        }

        if (msg.type === "msg") {
          // text chat: forward
          const to = msg.to as string;
          const target = clients.get(to);
          if (target)
            target.ws.send(
              JSON.stringify({ type: "msg", from: client.id, text: msg.text })
            );
        }

        if (msg.type === "leave") {
          client.busy = false;

          if (msg.to) {
            const partner = clients.get(msg.to);
            if (partner) {
              partner.busy = false;

              // Send a system message to partner
              if (partner.ws.readyState === WebSocket.OPEN) {
                partner.ws.send(
                  JSON.stringify({
                    type: "system",
                    text: `${
                      client.meta?.login || "Your partner"
                    } left the chat. Please click "Next" to find a new Developer.`,
                  })
                );
              }

              // ❌ Removed: queue.push(partner);
              // ✅ Now partner must manually click "Next" or "Find a partner" to rejoin queue
            }
          }

          // Remove leaver from queue if present
          const idx = queue.findIndex((c) => c.id === client.id);
          if (idx >= 0) queue.splice(idx, 1);

          // No auto-requeue for leaver — must send "join" to continue
        }

        if (msg.type === "report") {
          // client reports partner or IP. leave to REST /reports route normally
          log("report received", msg);
        }
      } catch (e) {
        console.warn("Invalid ws message", e);
      }
    });

    ws.on("close", () => {
      clients.delete(id);
      // remove from queue if present
      const idx = queue.findIndex((c) => c.id === id);
      if (idx >= 0) queue.splice(idx, 1);
      log("ws closed", id);
    });
  });

  return wss;
}
