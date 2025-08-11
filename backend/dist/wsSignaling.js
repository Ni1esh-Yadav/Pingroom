"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSignalingServer = createSignalingServer;
const ws_1 = __importStar(require("ws"));
const logger_1 = require("./logger");
function createSignalingServer(server) {
    const wss = new ws_1.WebSocketServer({ server, path: "/signaling" });
    const clients = new Map();
    const queue = [];
    function pairClients(a, b) {
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
        const client = { id, ws, busy: false };
        clients.set(id, client);
        (0, logger_1.log)("ws connected", id);
        ws.on("message", (message) => {
            try {
                const msg = JSON.parse(String(message));
                if (msg.type === "join") {
                    client.meta = msg.meta || {};
                    // check if someone in queue
                    const partner = queue.shift();
                    if (partner && !partner.busy) {
                        pairClients(client, partner);
                    }
                    else {
                        queue.push(client);
                        ws.send(JSON.stringify({ type: "queued" }));
                    }
                }
                if (msg.type === "signal") {
                    // forward to partner by id
                    const to = msg.to;
                    const target = clients.get(to);
                    if (target)
                        target.ws.send(JSON.stringify({
                            type: "signal",
                            from: client.id,
                            data: msg.data,
                        }));
                }
                if (msg.type === "msg") {
                    // text chat: forward
                    const to = msg.to;
                    const target = clients.get(to);
                    if (target)
                        target.ws.send(JSON.stringify({ type: "msg", from: client.id, text: msg.text }));
                }
                if (msg.type === "leave") {
                    client.busy = false;
                    if (msg.to) {
                        const partner = clients.get(msg.to);
                        if (partner) {
                            partner.busy = false;
                            // Send a system message to partner
                            if (partner.ws.readyState === ws_1.default.OPEN) {
                                partner.ws.send(JSON.stringify({
                                    type: "system",
                                    text: `${client.meta?.login || "Your partner"} left the chat. Please click "Next" to find a new Developer.`,
                                }));
                            }
                            // ❌ Removed: queue.push(partner);
                            // ✅ Now partner must manually click "Next" or "Find a partner" to rejoin queue
                        }
                    }
                    // Remove leaver from queue if present
                    const idx = queue.findIndex((c) => c.id === client.id);
                    if (idx >= 0)
                        queue.splice(idx, 1);
                    // No auto-requeue for leaver — must send "join" to continue
                }
                if (msg.type === "report") {
                    // client reports partner or IP. leave to REST /reports route normally
                    (0, logger_1.log)("report received", msg);
                }
            }
            catch (e) {
                console.warn("Invalid ws message", e);
            }
        });
        ws.on("close", () => {
            clients.delete(id);
            // remove from queue if present
            const idx = queue.findIndex((c) => c.id === id);
            if (idx >= 0)
                queue.splice(idx, 1);
            (0, logger_1.log)("ws closed", id);
        });
    });
    return wss;
}
