import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import AvatarCard from "../shared/AvatarCard";

const ChatHeader = ({ 
  chat, 
  isOnline, 
  isGroup, 
  members = [], 
  currentUser,
  otherUser 
}) => {
  const navigate = useNavigate();

  if (!chat) return null;

  const handleBack = () => {
    navigate("/");
  };

  //  For 1-on-1 chats: use otherUser data
  //  For groups: use chat data
  const displayName = isGroup ? chat.name : otherUser?.name || "User";
  
  //  Get avatar URL from populated user data
  const getAvatarUrl = () => {
    if (isGroup) {
      // Group: use custom group image or member avatars
      return chat.groupImage?.url || null;
    } else {
      // 1-on-1: use other user's avatar
      return otherUser?.avatar?.url || otherUser?.avatar || null;
    }
  };

  const avatarUrl = getAvatarUrl();

  //  Get fallback initial for avatar
  const getAvatarFallback = () => {
    if (isGroup) {
      return chat.name?.charAt(0)?.toUpperCase() || "G";
    } else {
      return otherUser?.name?.charAt(0)?.toUpperCase() || "U";
    }
  };



  return (
    <div className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-10">
      {/* Left Section - Back + Avatar + Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Back Button - Only on Mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="flex-shrink-0 hover:bg-accent md:hidden"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Avatar Section */}
        <div className="flex-shrink-0 relative">
          {isGroup ? (
            //  GROUP CHAT AVATAR
            chat.groupImage?.url ? (
              // Custom group image
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage
                  src={chat.groupImage.url}
                  alt={chat.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getAvatarFallback()}
                </AvatarFallback>
              </Avatar>
            ) : (
              // Member avatars grid for group without custom image
              <AvatarCard
                avatar={
                  members
                    .slice(0, 3)
                    .map((m) => m.avatar?.url || m.avatar)
                    .filter(Boolean)
                }
                max={3}
                avatarSize="2.5rem"
              />
            )
          ) : (
            //  1-ON-1 CHAT AVATAR
            <>
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage
                  src={avatarUrl}
                  alt={displayName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getAvatarFallback()}
                </AvatarFallback>
              </Avatar>

              {/*  Online Status Indicator (only for 1-on-1) */}
              {isOnline && (
                <div 
                  className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card shadow-lg animate-pulse"
                  title="Online"
                />
              )}
              {!isOnline && (
                <div 
                  className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-card"
                  title="Offline"
                />
              )}
            </>
          )}
        </div>

        {/* Name and Status Section */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h2 className="font-semibold text-foreground truncate text-sm md:text-base">
            {displayName}
          </h2>

          {/* Status / Member Count */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isGroup ? (
              //  GROUP: Show member count
              <>
                <Users className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {members.length} {members.length === 1 ? "member" : "members"}
                </span>
              </>
            ) : (
              // ✅ 1-ON-1: Show online/offline status
              <span className="flex items-center gap-1">
                {/* Status Dot */}
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isOnline
                      ? "bg-green-500 animate-pulse"
                      : "bg-gray-400"
                  }`}
                />
                {/* Status Text */}
                <span className="truncate">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default memo(ChatHeader);