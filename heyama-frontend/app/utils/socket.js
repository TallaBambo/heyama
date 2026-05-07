import { io } from "socket.io-client";

const backEndUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

export const socket = io(backEndUrl, {
  withCredentials: true,
  autoConnect: true,
  transports: ["websocket"],
});
