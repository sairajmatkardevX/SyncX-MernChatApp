
import { createContext, useMemo, useEffect } from "react";
import io from "socket.io-client";
import { server } from "../constants/config";
import { useDispatch } from "react-redux";
import { setOnlineUsers } from "../redux/reducers/misc";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events";

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();

  const socket = useMemo(
    () =>
      io(server, {
        withCredentials: true,
        transports: ["websocket", "polling"],
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


    socket.on(NEW_REQUEST, () => {
      console.log("🔔 New friend request received!");
      
      
      dispatch({ 
        type: "api/invalidateTags", 
        payload: ["User"] 
      });
    });

    
    socket.on(REFETCH_CHATS, () => {
      console.log("🔄 Refetching chats...");
      
     
      dispatch({ 
        type: "api/invalidateTags", 
        payload: ["Chat", "User"] 
      });
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

   
    return () => {
      socket.off("ONLINE_USERS");
      socket.off(NEW_REQUEST);
      socket.off(REFETCH_CHATS);
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, [socket, dispatch]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;