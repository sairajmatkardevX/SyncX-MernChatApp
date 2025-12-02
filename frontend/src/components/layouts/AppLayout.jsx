import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  NEW_MESSAGE_ALERT,
  NEW_REQUEST,
  ONLINE_USERS,
  REFETCH_CHATS,
} from "../../constants/events";
import { useErrors, useSocketEvents } from "../../hooks/hook";
import { getOrSaveFromStorage } from "../../lib/features";
import { useMyChatsQuery } from "../../redux/api/api";
import {
  incrementNotification,
  setNewMessagesAlert,
} from "../../redux/reducers/chat";
import {
  setIsDeleteMenu,
  setIsMobile,
  setSelectedDeleteChat,
  setOnlineUsers,
} from "../../redux/reducers/misc";
import { useSocket } from "../../hooks/useSocket";
import DeleteChatMenu from "../dialogs/DeleteChatMenu";
import Title from "../shared/Title";
import ChatList from "../specific/ChatList";
import Profile from "../specific/Profile";
import Header from "./Header";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

import { LayoutLoader } from "../layouts/Loaders";

const AppLayout = ({ children }) => {
  const params = useParams();

  const dispatch = useDispatch();
  const socket = useSocket();

  const chatId = params.chatId;
  const deleteMenuAnchor = useRef(null);

  const [onlineUsers, setOnlineUsersState] = useState([]);
  const [isThemeReady, setIsThemeReady] = useState(false);

  const { isMobile } = useSelector((state) => state.misc);
  const { user } = useSelector((state) => state.auth);
  const { newMessagesAlert } = useSelector((state) => state.chat);

  const { isLoading, data, isError, error, refetch } = useMyChatsQuery("");

  useEffect(() => {
    dispatch(setOnlineUsers(onlineUsers));
  }, [onlineUsers, dispatch]);

  useErrors([{ isError, error }]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsThemeReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    getOrSaveFromStorage({ key: NEW_MESSAGE_ALERT, value: newMessagesAlert });
  }, [newMessagesAlert]);

  const handleDeleteChat = (e, chatId, groupChat) => {
    dispatch(setIsDeleteMenu(true));
    dispatch(setSelectedDeleteChat({ chatId, groupChat }));
    deleteMenuAnchor.current = e.currentTarget;
  };

  const handleMobileClose = () => dispatch(setIsMobile(false));

  const newMessageAlertListener = useCallback(
    (data) => {
      if (data.chatId === chatId) return;
      dispatch(setNewMessagesAlert(data));
    },
    [chatId, dispatch]
  );

  const newRequestListener = useCallback(() => {
    dispatch(incrementNotification());
  }, [dispatch]);

  const refetchListener = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("❌ Error refetching chats:", error);
    }
  }, [refetch]);

  const onlineUsersListener = useCallback((data) => {
    setOnlineUsersState(data);
  }, []);

  const eventHandlers = {
    [NEW_MESSAGE_ALERT]: newMessageAlertListener,
    [NEW_REQUEST]: newRequestListener,
    [REFETCH_CHATS]: refetchListener,
    [ONLINE_USERS]: onlineUsersListener,
  };

  useSocketEvents(socket, eventHandlers);

  if (!isThemeReady) {
    return (
      <>
        <Title />
        <LayoutLoader />
      </>
    );
  }

  return (
    <>
      <Title />
      <Header />

      <DeleteChatMenu dispatch={dispatch} deleteMenuAnchor={deleteMenuAnchor} />

      {/* Mobile Sidebar */}
      <Sheet open={isMobile} onOpenChange={handleMobileClose}>
        <SheetContent
          side="left"
          className="w-[320px] max-w-[85vw] p-0 bg-sidebar border-r border-border"
        >
          {isLoading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-12 w-full bg-background/80" />
              <Skeleton className="h-12 w-full bg-background/80" />
              <Skeleton className="h-12 w-full bg-background/80" />
            </div>
          ) : (
            <ChatList
              w="100%"
              chats={data?.chats}
              chatId={chatId}
              handleDeleteChat={handleDeleteChat}
              newMessagesAlert={newMessagesAlert}
              onlineUsers={onlineUsers}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Desktop Layout - 3 Column */}
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        {/* Left Sidebar - Chat List */}
        <div className="hidden md:block w-80 h-full border-r border-border bg-sidebar">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-12 w-full bg-background/80" />
                <Skeleton className="h-12 w-full bg-background/80" />
                <Skeleton className="h-12 w-full bg-background/80" />
                <Skeleton className="h-12 w-full bg-background/80" />
              </div>
            ) : (
              <ChatList
                chats={data?.chats}
                chatId={chatId}
                handleDeleteChat={handleDeleteChat}
                newMessagesAlert={newMessagesAlert}
                onlineUsers={onlineUsers}
              />
            )}
          </ScrollArea>
        </div>

        {/* Center - Main Chat Area */}
        <div className="flex-1 min-w-0 h-full bg-background">{children}</div>

        {/* Right Sidebar - Profile */}
        <div className="hidden lg:flex lg:flex-col w-96 h-full border-l border-border bg-sidebar overflow-hidden">
          <div className="p-6 h-full flex items-center justify-center">
            {user ? (
              <Profile user={user} />
            ) : (
              <div className="text-center">
                <div className="space-y-3">
                  <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                    <svg
                      className="h-8 w-8 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    No profile available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AppLayout;
