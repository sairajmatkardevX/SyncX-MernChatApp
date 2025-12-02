import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAsyncMutation, useErrors } from "../../hooks/hook";
import { useAddGroupMembersMutation, useAvailableFriendsQuery } from "../../redux/api/api";
import { setIsAddMember } from "../../redux/reducers/misc";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import UserItem from "../shared/UserItem";
import { Button } from "@/components/ui/button";

const AddMemberDialog = ({ chatId }) => {
  const dispatch = useDispatch();
  const { isAddMember } = useSelector((state) => state.misc);

  const { isLoading, data, isError, error } = useAvailableFriendsQuery(chatId);
  const [addMembers, isLoadingAddMembers] = useAsyncMutation(useAddGroupMembersMutation);

  const [selectedMembers, setSelectedMembers] = useState([]);

  const selectMemberHandler = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((curr) => curr !== id)
        : [...prev, id]
    );
  };

  const closeHandler = () => {
    dispatch(setIsAddMember(false));
    setSelectedMembers([]);
  };

  const addMemberSubmitHandler = () => {
    addMembers("Adding Members...", { members: selectedMembers, chatId });
    closeHandler();
  };

  useErrors([{ isError, error }]);

  return (
    <Dialog open={isAddMember} onOpenChange={(open) => !open && closeHandler()}>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          {/* Visually hidden title for accessibility */}
          <DialogTitle>
            <VisuallyHidden>Add Member</VisuallyHidden>
          </DialogTitle>
          <DialogDescription className="text-center">
            Select friends to add to this group
          </DialogDescription>

          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-xs text-muted-foreground">Selected: </span>
              {selectedMembers.map((memberId) => {
                const member = data?.friends?.find((f) => f._id === memberId);
                return member ? (
                  <Badge key={memberId} variant="secondary" className="text-xs">
                    {member.name}
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[300px] px-6">
          <div className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
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
                No Friends Available
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4">
          <div className="flex w-full items-center justify-between">
            <Button variant="outline" onClick={closeHandler} className="flex-1 mr-2">
              Cancel
            </Button>
            <Button
              onClick={addMemberSubmitHandler}
              disabled={isLoadingAddMembers || selectedMembers.length === 0}
              className="flex-1 ml-2"
            >
              {isLoadingAddMembers ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  Adding...
                </>
              ) : (
                `Add Members (${selectedMembers.length})`
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
