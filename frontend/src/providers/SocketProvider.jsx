import { createContext, useMemo, useEffect, useRef } from "react";
import io from "socket.io-client";
import { server } from "../constants/config";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers } from "../redux/reducers/misc";

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  
 
  const { user } = useSelector((state) => state.auth);

  
  const socket = useMemo(() => {
  
    if (!user) {
      console.log("❌ No user found, not creating socket");
      return null;
    }

    console.log("✅ Creating socket connection for user:", user.name);

    const newSocket = io(server, {
      withCredentials: true, 
      transports: ["websocket", "polling"], 
      reconnection: true,
      reconnectionAttempts: 10, 
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000, 
      autoConnect: true,
   
      upgrade: true,
      rememberUpgrade: true,
      path: "/socket.io/",
    });

    socketRef.current = newSocket;
    return newSocket;
  }, [user]); 

  useEffect(() => {
   
    if (!socket) {
      console.log("❌ No socket, skipping event listeners");
      return;
    }

    console.log("🔌 Setting up socket event listeners");

    
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      
      socket.emit("GET_ONLINE_USERS");
    });

    
    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      if (reason === "io server disconnect") {
      
        socket.connect();
      }
    });

    
    socket.on("ONLINE_USERS", (users) => {
      console.log("👥 Received online users:", users);
      dispatch(setOnlineUsers(users));
    });

  
    socket.on("connect_error", (error) => {
      console.error("🔥 Socket connection error:", error.message);
      console.error("Error details:", {
        type: error.type,
        description: error.description,
      });
    });

    
    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      
      socket.emit("GET_ONLINE_USERS");
    });

    socket.on("reconnect_error", (error) => {
      console.error("🔥 Reconnection error:", error);
    });

    socket.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed after all attempts");
    });

    
    return () => {
      console.log("🧹 Cleaning up socket event listeners");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("ONLINE_USERS");
      socket.off("connect_error");
      socket.off("reconnect_attempt");
      socket.off("reconnect");
      socket.off("reconnect_error");
      socket.off("reconnect_failed");
    };
  }, [socket, dispatch]);

 
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log("🔌 Disconnecting socket on cleanup");
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;