import { transformImage } from "../../lib/features";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const AvatarCard = ({ avatar = [], max = 4, avatarSize = "3rem", overlap = 0.75 }) => {
  const displayedAvatars = avatar.slice(0, max);
  const remainingCount = avatar.length - max;
  const sizeInRem = parseFloat(avatarSize);
  const overlapOffset = sizeInRem * overlap;

  return (
    <TooltipProvider>
      <div 
        className="flex relative" 
        style={{ 
          width: `${sizeInRem + (displayedAvatars.length - 1) * overlapOffset}rem`, 
          height: avatarSize 
        }}
      >
        {displayedAvatars.map((avatarUrl, index) => (
          <Tooltip key={`${avatarUrl}-${index}`}>
            <TooltipTrigger asChild>
              <Avatar
                className="absolute border-2 border-background shadow-sm hover:scale-105 transition-transform cursor-pointer"
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  left: `${index * overlapOffset}rem`,
                  zIndex: displayedAvatars.length - index,
                }}
              >
                <AvatarImage 
                  src={transformImage(avatarUrl)} 
                  alt={`Avatar ${index + 1}`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {avatarUrl?.name?.charAt(0)?.toUpperCase() || 
                   avatarUrl?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {typeof avatarUrl === 'object' ? avatarUrl.name : `User ${index + 1}`}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar 
                className="absolute border-2 border-background bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  left: `${displayedAvatars.length * overlapOffset}rem`,
                }}
              >
                <AvatarFallback className="text-xs font-medium bg-primary/20 text-primary">
                  +{remainingCount}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{remainingCount} more members</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AvatarCard;