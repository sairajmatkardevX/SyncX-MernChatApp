import { memo } from "react";
import moment from "moment";
import { fileFormat } from "../../lib/features";
import RenderAttachment from "./RenderAttachment";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";

const MessageComponent = ({ message, user }) => {
 
  if (!message || !message.sender) {
    console.warn("Invalid message:", message);
    return null;
  }

  const { sender, content, attachments = [], createdAt } = message;
  const sameSender = sender?._id === user?._id;
  const timeAgo = createdAt ? moment(createdAt).fromNow() : "";


  const messageText = typeof content === 'string' ? content.trim() : '';

  return (
    <div className={cn("flex w-full mb-4", sameSender ? "justify-end" : "justify-start")}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "max-w-[75%] md:max-w-[60%] rounded-2xl p-4 space-y-3 relative shadow-md",
          sameSender
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-secondary text-secondary-foreground rounded-bl-sm"
        )}
      >
        {/* Sender name */}
        {!sameSender && sender?.name && (
          <p className="text-xs font-semibold opacity-70">{sender.name}</p>
        )}

        {/* ✅ ATTACHMENTS FIRST */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((attachment, index) => {
              const url = attachment?.url;
              const file = url ? fileFormat(url) : 'file';

             
              if (!url) {
                console.warn("Attachment missing URL:", attachment);
                return null;
              }

              return (
                <motion.div
                  key={attachment._id || attachment.public_id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-lg overflow-hidden border border-current/20"
                >
                  {RenderAttachment(file, url)}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ✅ CAPTION/CONTENT BELOW ATTACHMENTS */}
        {messageText && (
          <p className={cn(
            "text-sm break-words leading-relaxed",
            attachments.length > 0 && "mt-2" 
          )}>
            {messageText}
          </p>
        )}

        {/* Timestamp */}
        <div className="flex items-center justify-end gap-1 mt-2">
          <p className="text-xs opacity-60">{timeAgo}</p>
          {sameSender && <CheckCheck className="h-3 w-3 opacity-60" />}
        </div>
      </motion.div>
    </div>
  );
};

MessageComponent.displayName = "MessageComponent";

export default memo(MessageComponent);
