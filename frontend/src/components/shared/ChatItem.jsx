import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AvatarCard from "./AvatarCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { MoreHorizontal } from "lucide-react";

const ChatItem = ({
  avatar = [],
  name,
  _id,
  groupChat = false,
  sameSender,
  isOnline,
  newMessageAlert,
  index = 0,
  handleDeleteChat,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
      className="relative group"
    >
      <Link
        to={`/chat/${_id}`}
        onContextMenu={(e) => {
          e.preventDefault();
          handleDeleteChat(e, _id, groupChat);
        }}
        className={cn(
          "flex gap-4 items-center p-4 relative transition-all duration-200 border-b border-border/50",
          sameSender
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-sidebar text-foreground hover:bg-sidebar/80",
          "group-hover:shadow-sm"
        )}
      >
        <div className="flex-shrink-0">
          <AvatarCard avatar={avatar} avatarSize="2.5rem" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "font-medium truncate",
                sameSender ? "text-primary-foreground" : "text-foreground"
              )}
            >
              {name}
            </p>
            {groupChat && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                Group
              </Badge>
            )}
          </div>

          {newMessageAlert && (
            <Badge
              variant="default"
              className={cn(
                "text-xs font-semibold",
                sameSender
                  ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {newMessageAlert.count} New{newMessageAlert.count > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
     {isOnline && !groupChat && (
  <div className="relative">
    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500/50 animate-ping" />
  </div>
)}
          
          {/* Context menu indicator */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteChat(e, _id, groupChat);
            }}
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded",
              sameSender
                ? "hover:bg-primary-foreground/20"
                : "hover:bg-sidebar/50"
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </Link>
    </motion.div>
  );
};

ChatItem.displayName = "ChatItem";

export default memo(ChatItem);