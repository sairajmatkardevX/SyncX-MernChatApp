import { memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAsyncMutation, useErrors } from "../../hooks/hook";
import {
  useAcceptFriendRequestMutation,
  useGetNotificationsQuery,
} from "../../redux/api/api";
import { setIsNotification } from "../../redux/reducers/misc";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { transformImage } from "../../lib/features";
import { UserPlus, Bell } from "lucide-react";

const Notifications = () => {
  const { isNotification } = useSelector((state) => state.misc);
  const dispatch = useDispatch();

  const { isLoading, data, error, isError } = useGetNotificationsQuery();
  const [acceptRequest] = useAsyncMutation(useAcceptFriendRequestMutation);

const friendRequestHandler = async ({ _id, accept }) => {
  try {
    console.log("🔵 Friend request handler:", { _id, accept });
    
    //  Don't close dialog immediately - wait for success
    const result = await acceptRequest(
      accept ? "Accepting..." : "Rejecting...", 
      { requestId: _id, accept }
    );
    
    console.log("✅ Request processed:", result);
    
    //  Close dialog only after successful mutation
    dispatch(setIsNotification(false));
  } catch (error) {
    console.error("❌ Error handling friend request:", error);
  }
};

  const closeHandler = () => dispatch(setIsNotification(false));

  useErrors([{ error, isError }]);

  return (
    <Dialog open={isNotification} onOpenChange={(open) => !open && closeHandler()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden"> {/* ✅ Wider */}
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-card-foreground text-lg">
                  Notifications
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  {data?.allRequests?.length || 0} pending friend requests
                </DialogDescription>
              </div>
            </div>
            {data?.allRequests?.length > 0 && (
              <Badge variant="default" className="ml-auto">
                {data.allRequests.length}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[500px]">
          <div className="p-6 pt-4 space-y-4"> 
            {isLoading ? (
              <>
                <NotificationSkeleton />
                <NotificationSkeleton />
                <NotificationSkeleton />
              </>
            ) : data?.allRequests?.length > 0 ? (
              data.allRequests.map(({ sender, _id }) => (
                <NotificationItem
                  sender={sender}
                  _id={_id}
                  handler={friendRequestHandler}
                  key={_id}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm mt-2">Friend requests will appear here</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/*  Footer with summary */}
        {data?.allRequests?.length > 0 && (
          <div className="px-6 py-4 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground text-center">
              Review and respond to your friend requests
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const NotificationItem = memo(({ sender, _id, handler }) => {
  const { name, avatar } = sender;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-border rounded-lg bg-card hover:bg-card/80 transition-colors"> {/* ✅ Better layout */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-14 w-14 flex-shrink-0 border-2 border-background ring-2 ring-primary/10">
          <AvatarImage src={transformImage(avatar)} alt={name} />
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
            {name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-card-foreground mb-1">
            {name}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <UserPlus className="h-3 w-3" />
            Sent you a friend request
          </p>
        </div>
      </div>

      <div className="flex gap-2 w-full sm:w-auto sm:flex-shrink-0"> {/* Full width on mobile */}
        <Button 
          size="sm" 
          onClick={() => handler({ _id, accept: true })}
          className="flex-1 sm:flex-none h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Accept
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handler({ _id, accept: false })}
          className="flex-1 sm:flex-none h-9 px-4 border-border hover:bg-muted"
        >
          Reject
        </Button>
      </div>
    </div>
  );
});
NotificationItem.displayName = "NotificationItem";

const NotificationSkeleton = () => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-border rounded-lg">
    <Skeleton className="h-14 w-14 rounded-full" />
    <div className="flex-1 space-y-2 w-full">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <div className="flex gap-2 w-full sm:w-auto">
      <Skeleton className="h-9 flex-1 sm:w-20" />
      <Skeleton className="h-9 flex-1 sm:w-20" />
    </div>
  </div>
);

export default Notifications;