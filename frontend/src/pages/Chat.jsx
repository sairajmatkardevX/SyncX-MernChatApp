import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import AppLayout from "../components/layouts/AppLayout";
import { useSocket } from "../hooks/useSocket";
import {
  ALERT,
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
  GET_ONLINE_USERS,
} from "../constants/events";
import { useChatDetailsQuery, useGetMessagesQuery } from "../redux/api/api";
import { useErrors, useSocketEvents } from "../hooks/hook";
import { useInfiniteScrollTop } from "6pp";
import { useDispatch, useSelector } from "react-redux";
import { setIsFileMenu } from "../redux/reducers/misc";
import { removeNewMessagesAlert } from "../redux/reducers/chat";
import { TypingLoader } from "../components/layouts/Loaders";
import { useNavigate, useParams } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

import FileMenu from "../components/dialogs/FileMenu";
import MessageComponent from "../components/shared/MessageComponent";
import ChatHeader from "../components/specific/ChatHeader";

import { Paperclip, Send } from "lucide-react";

const Chat = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { onlineUsers } = useSelector((state) => state.misc);

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);

  const [IamTyping, setIamTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const typingTimeout = useRef(null);

  const chatDetails = useChatDetailsQuery({
    chatId,
    skip: !chatId,
    populate: true,
  });

  const oldMessagesChunk = useGetMessagesQuery({ chatId, page });

  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    containerRef,
    oldMessagesChunk.data?.totalPages,
    page,
    setPage,
    oldMessagesChunk.data?.messages
  );

  const errors = [
    { isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
  ];

  const chatData = chatDetails?.data?.chat;
  const members = chatData?.members || [];

  const getOtherUser = () => {
    if (!chatData || chatData.groupChat) return null;

    return members.find((member) => member._id !== user?._id);
  };

  const otherUser = getOtherUser();

  const isOnline = useMemo(() => {
    if (!chatData || chatData.groupChat) return false;
    if (!otherUser || !otherUser._id) return false;

    return onlineUsers.includes(otherUser._id);
  }, [chatData, otherUser, onlineUsers]);
  const messageOnChange = (e) => {
    setMessage(e.target.value);

    if (!IamTyping) {
      socket.emit(START_TYPING, {
        members: members.map((m) => m._id),
        chatId,
      });
      setIamTyping(true);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, {
        members: members.map((m) => m._id),
        chatId,
      });
      setIamTyping(false);
    }, 2000);
  };

  const handleFileOpen = (e) => {
    dispatch(setIsFileMenu(true));
    setFileMenuAnchor(e.currentTarget);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socket.emit(NEW_MESSAGE, {
      chatId,
      members: members.map((m) => m._id),
      message,
    });
    setMessage("");
  };

  useEffect(() => {
    dispatch(removeNewMessagesAlert(chatId));

    return () => {
      setMessages([]);
      setMessage("");
      setOldMessages([]);
      setPage(1);
    };
  }, [chatId]);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, oldMessages]);

  useEffect(() => {
    if (chatDetails.isError) navigate("/");
  }, [chatDetails.isError, navigate]);

  const newMessagesListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;

      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg._id === data.message._id);
        if (messageExists) {
          return prev;
        }

        return [...prev, data.message];
      });
    },
    [chatId]
  );

  useEffect(() => {
    socket.emit(GET_ONLINE_USERS);
  }, [socket]);
  const startTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(true);
    },
    [chatId]
  );

  const stopTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
    },
    [chatId]
  );

  const alertListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      const messageForAlert = {
        content: data.message,
        sender: { _id: "admin", name: "Admin" },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, messageForAlert]);
    },
    [chatId]
  );

  useSocketEvents(socket, {
    [ALERT]: alertListener,
    [NEW_MESSAGE]: newMessagesListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
  });

  useErrors(errors);

  const allMessages = [...oldMessages, ...messages];

  return (
    <AppLayout>
      {chatDetails.isLoading ? (
        <div className="h-full flex flex-col">
          <div className="h-16 border-b border-border flex items-center px-4 gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="h-8 w-1/2" />
          </div>
        </div>
      ) : (
        <Fragment>
          {/*  Chat Header - Pass all required props */}
          <ChatHeader
            chat={chatData}
            isOnline={isOnline}
            isGroup={chatData?.groupChat}
            members={members}
            currentUser={user}
            otherUser={otherUser}
          />

          {/* Messages Area */}
          <ScrollArea className="h-[calc(100%-8rem)] bg-background p-4">
            <div ref={containerRef} className="flex flex-col">
              {allMessages.map((msg) => (
                <MessageComponent
                  key={msg._id || msg.createdAt}
                  message={msg}
                  user={user}
                />
              ))}
              {userTyping && <TypingLoader />}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <form onSubmit={submitHandler} className="h-16">
            <div className="flex items-center h-full p-4 gap-2 relative bg-card border-t border-border">
              <button
                type="button"
                onClick={handleFileOpen}
                className="relative flex items-center justify-center w-10 h-10 rounded-full rotate-45 group transition-all duration-200"
              >
                <span className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200" />
                <Paperclip className="relative h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              </button>

              <Input
                placeholder="Type Message Here..."
                value={message}
                onChange={messageOnChange}
                className="flex-1 pl-12 pr-20 bg-popover rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              <button
                type="submit"
                className="relative flex items-center justify-center w-10 h-10 rounded-full -rotate-45 group transition-all duration-200"
              >
                <span className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200" />
                <Send className="relative h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              </button>
            </div>
          </form>

          <FileMenu
            anchorE1={fileMenuAnchor}
            chatId={chatId}
            setMessages={setMessages}
          />
        </Fragment>
      )}
    </AppLayout>
  );
};

export default Chat;
