import { io } from "socket.io-client";

// Backend Socket.IO sunucusuna bağlan
const socket = io("http://192.168.1.13:3001", {
  transports: ["websocket"],
});

export default socket;
