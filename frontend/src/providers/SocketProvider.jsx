import { createContext, useMemo, useEffect } from "react";
import io from "socket.io-client";
import { server } from "../constants/config";
import { useDispatch } from "react-redux";
import { setOnlineUsers } from "../redux/reducers/misc";

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const socket = useMemo(() => io(server, { withCredentials: true }), []);
  const dispatch = useDispatch();

  useEffect(() => {
    
    socket.on("ONLINE_USERS", (users) => {
   
      dispatch(setOnlineUsers(users));
    });

    return () => {
      socket.off("ONLINE_USERS");
    };
  }, [socket, dispatch]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;