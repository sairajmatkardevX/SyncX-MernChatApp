import { useState, useMemo } from "react";
import ChatItem from "../shared/ChatItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";


const ChatList = ({
  w = "100%",
  chats = [],
  chatId,
  onlineUsers = [],
  newMessagesAlert = [],
  handleDeleteChat,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Memoize filtered chats for performance
  const filteredChats = useMemo(() => {
    return chats.filter(chat =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  const renderNoChats = () => (
    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground p-4 text-center">
      <div className="text-sm">
        {searchTerm ? "No chats match your search" : "No chats found"}
      </div>
      {!searchTerm && (
        <div className="text-xs mt-1 text-muted-foreground/70">
          Start a new conversation to see it here
        </div>
      )}
    </div>
  );

  return (
    <div className={`w-full h-full flex flex-col  ${w}`}>
      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-background"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {filteredChats.length > 0 ? (
          <div className="flex flex-col">
            {filteredChats.map(({ _id, name, avatar, groupChat, members }, index) => {
              const newMessage = newMessagesAlert.find(alert => alert.chatId === _id);
              
              const isOnline = !groupChat && members?.length > 0
                ? onlineUsers.includes(members[0]._id)
                : false;

              return (
                <ChatItem
                  key={_id}
                  index={index}
                  _id={_id}
                  name={name}
                  avatar={avatar}
                  groupChat={groupChat}
                  sameSender={chatId === _id}
                  newMessageAlert={newMessage}
                  isOnline={isOnline}
                  handleDeleteChat={handleDeleteChat}
                />
              );
            })}
          </div>
        ) : (
          renderNoChats()
        )}
      </ScrollArea>
    </div>
  );
};

export default ChatList;