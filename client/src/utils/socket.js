import { io } from "socket.io-client";

// Connect to your backend (update the URL if needed)
const socket = io(import.meta.env.VITE_APP_BASE_URL, {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;