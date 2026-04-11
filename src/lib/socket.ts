/**
 * Singleton socket.io-client — namespace /pro-messages
 *
 * Usage :
 *   import { getProMessagesSocket } from "@/lib/socket";
 *   const socket = getProMessagesSocket(token);
 *   socket.on("new_message", handler);
 *   socket.disconnect(); // cleanup
 *
 * Le socket est créé à la demande et réutilisé si déjà connecté.
 * Passe le JWT dans socket.handshake.auth.token (vérifié côté serveur).
 */

import { io, Socket } from "socket.io-client";

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000")
  // Assurer que l'URL pointe vers la racine (pas /api)
  .replace(/\/api\/?$/, "");

let _socket: Socket | null = null;
let _currentToken: string | null = null;

export function getProMessagesSocket(token: string): Socket {
  // Recréer si le token a changé (reconnexion après refresh)
  if (_socket && _currentToken !== token) {
    _socket.disconnect();
    _socket = null;
  }

  if (!_socket) {
    _currentToken = token;
    _socket = io(`${SOCKET_URL}/pro-messages`, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    _socket.on("connect", () => {
      console.log("[SOCKET] Connecté au namespace /pro-messages");
    });

    _socket.on("connect_error", (err) => {
      console.warn("[SOCKET] Erreur de connexion :", err.message);
    });

    _socket.on("disconnect", (reason) => {
      console.log("[SOCKET] Déconnecté :", reason);
    });
  }

  return _socket;
}

export function disconnectProMessagesSocket(): void {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
    _currentToken = null;
  }
}
