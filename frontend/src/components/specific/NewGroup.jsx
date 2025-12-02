import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useAvailableFriendsQuery,
  useNewGroupMutation,
} from "../../redux/api/api";
import { useAsyncMutation, useErrors } from "../../hooks/hook";
import { setIsNewGroup } from "../../redux/reducers/misc";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import UserItem from "../shared/UserItem";


const NewGroup = () => {
  const { isNewGroup } = useSelector((state) => state.misc);
  const dispatch = useDispatch();

  const { isError, isLoading, error, data } = useAvailableFriendsQuery();
  const [newGroup, isLoadingNewGroup] = useAsyncMutation(useNewGroupMutation);

  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  useErrors([{ isError, error }]);

  const selectMemberHandler = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((user) => user !== id) : [...prev, id]
    );
  };

  const submitHandler = () => {
    if (!groupName.trim()) return toast.error("Group name is required");
    if (selectedMembers.length < 2)
      return toast.error("Please select at least 2 members");

    newGroup("Creating New Group...", {
      name: groupName,
      members: selectedMembers,
    });

    closeHandler();
  };

  const closeHandler = () => {
    dispatch(setIsNewGroup(false));
    setGroupName("");
    setSelectedMembers([]);
  };

  return (
    <Dialog open={isNewGroup} onOpenChange={(open) => !open && closeHandler()}>
      <DialogContent className="sm:max-w-[425px] gap-6">
        {/* Use VisuallyHidden if you want to hide the title from view but keep it accessible */}
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-card-foreground">
            New Group
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Create a new group chat with your friends
          </DialogDescription>
        </DialogHeader>

        {/* Group Name Input */}
        <div className="space-y-2">
          <Label htmlFor="group-name" className="text-card-foreground">
            Group Name
          </Label>
          <Input
            id="group-name"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="bg-background"
          />
        </div>

        {/* Members Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-card-foreground">Members</Label>
            {selectedMembers.length > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {selectedMembers.length} selected
              </Badge>
            )}
          </div>

          <ScrollArea className="h-64 rounded-md border border-border bg-background p-2">
            <div className="space-y-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : data?.friends?.length > 0 ? (
                data.friends.map((user) => (
                  <UserItem
                    key={user._id}
                    user={user}
                    handler={selectMemberHandler}
                    isAdded={selectedMembers.includes(user._id)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No friends available to add
                </div>
              )}
            </div>
          </ScrollArea>

          {selectedMembers.length < 2 && (
            <p className="text-xs text-muted-foreground">
              Select at least 2 friends to create a group
            </p>
          )}
        </div>

        {/* Submit Actions */}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={closeHandler}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            onClick={submitHandler}
            disabled={
              isLoadingNewGroup || selectedMembers.length < 2 || !groupName.trim()
            }
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoadingNewGroup ? (
              <div className="flex items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Creating...
              </div>
            ) : (
              "Create Group"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewGroup;
