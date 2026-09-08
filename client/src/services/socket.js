import { io } from "socket.io-client";

// Determine server URL (in dev, proxy is configured or fallback to localhost:5000)
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== "undefined" && window.location.port === "5173"
    ? "http://localhost:5000"
    : window.location.origin);

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ["websocket", "polling"],
});

// Socket connection state tracker
export function initSocketConnection(onStatusChange) {
  socket.on("connect", () => {
    console.log("[Socket.io] Connected to server:", socket.id);
    if (onStatusChange) onStatusChange({ connected: true });
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket.io] Disconnected:", reason);
    if (onStatusChange) onStatusChange({ connected: false, reason });
  });

  socket.on("connect_error", (error) => {
    console.warn("[Socket.io] Connection error:", error.message);
    if (onStatusChange) onStatusChange({ connected: false, error });
  });

  return () => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("connect_error");
  };
}
