import { io } from "socket.io-client";

const backEndUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts`;

export const socket = io(backEndUrl, {
  withCredentials: true,
  autoConnect: true,
  transports: ["websocket"],
});
