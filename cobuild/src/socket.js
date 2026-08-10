import { io } from "socket.io-client";

export const SOCKET_URL = "https://websocket-cobuild.onrender.com";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
