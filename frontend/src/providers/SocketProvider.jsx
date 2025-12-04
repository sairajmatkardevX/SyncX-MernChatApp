import { createContext, useMemo, useEffect } from "react";
import io from "socket.io-client";
import { server } from "../constants/config";
import { useDispatch } from "react-redux";
import { setOnlineUsers } from "../redux/reducers/misc";

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();

 
  const socket = useMemo(
    () =>
      io(server, {
        withCredentials: true,
        transports: ["websocket", "polling"], // 
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }),
    []
  );

  useEffect(() => {
    socket.on("ONLINE_USERS", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      socket.off("ONLINE_USERS");
      socket.off("connect_error");
    };
  }, [socket, dispatch]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;