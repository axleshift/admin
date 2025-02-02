import { io } from "socket.io-client";

// Connect to your backend (update the URL if needed)
const socket = io("http://localhost:5053", {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
