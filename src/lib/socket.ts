/**
 * Singletons socket.io-client — deux namespaces :
 *   /pro-messages  — messagerie professionnelle (conversations)
 *   /care-cases    — coordination temps réel d'un dossier patient
 *
 * Usage :
 *   import { getProMessagesSocket, getCareSocket } from "@/lib/socket";
 *   const socket = getCareSocket(token);
 *   socket.emit("join_case", careCaseId);
 *   socket.on("note_created", handler);
 */

import { io, Socket } from "socket.io-client";

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000")
  .replace(/\/api\/?$/, "");

// ─── /pro-messages ────────────────────────────────────────────────────────────

let _proSocket: Socket | null = null;
let _proToken: string | null = null;

export function getProMessagesSocket(token: string): Socket {
  if (_proSocket && _proToken !== token) {
    _proSocket.disconnect();
    _proSocket = null;
  }
  if (!_proSocket) {
    _proToken = token;
    _proSocket = io(`${SOCKET_URL}/pro-messages`, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    _proSocket.on("connect", () => console.log("[SOCKET] /pro-messages connecté"));
    _proSocket.on("connect_error", (err) => console.warn("[SOCKET] /pro-messages erreur:", err.message));
  }
  return _proSocket;
}

export function disconnectProMessagesSocket(): void {
  if (_proSocket) { _proSocket.disconnect(); _proSocket = null; _proToken = null; }
}

// ─── /care-cases ─────────────────────────────────────────────────────────────

let _caseSocket: Socket | null = null;
let _caseToken: string | null = null;

export function getCareSocket(token: string): Socket {
  if (_caseSocket && _caseToken !== token) {
    _caseSocket.disconnect();
    _caseSocket = null;
  }
  if (!_caseSocket) {
    _caseToken = token;
    _caseSocket = io(`${SOCKET_URL}/care-cases`, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    _caseSocket.on("connect", () => console.log("[SOCKET] /care-cases connecté"));
    _caseSocket.on("connect_error", (err) => console.warn("[SOCKET] /care-cases erreur:", err.message));
  }
  return _caseSocket;
}

export function disconnectCareSocket(): void {
  if (_caseSocket) { _caseSocket.disconnect(); _caseSocket = null; _caseToken = null; }
}
