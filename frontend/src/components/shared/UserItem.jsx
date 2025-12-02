import { memo } from "react";
import { transformImage } from "../../lib/features";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Check } from "lucide-react";

const UserItem = ({
  user,
  handler,
  handlerIsLoading,
  isAdded = false,
  styling = {},
}) => {
  const { name, _id, avatar } = user;

  return (
    <div className="flex items-center gap-4 p-3 w-full" style={styling}>
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={transformImage(avatar)} alt={name} />
        <AvatarFallback>
          {name?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <p className="flex-1 text-sm font-medium truncate">
        {name}
      </p>

      <Button
        size="sm"
        variant={
          isAdded ? "outline" : 
          handlerIsLoading ? "secondary" : "default"
        }
        onClick={() => handler(_id)}
        disabled={handlerIsLoading || isAdded}
        className="h-8 w-8 p-0 flex-shrink-0"
      >
        {handlerIsLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isAdded ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default memo(UserItem);