import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  useAddGroupMembersMutation,
  useRemoveGroupMemberMutation,
  useAssignGroupAdminMutation,
  useAvailableFriendsQuery,
} from "@/redux/api/api";
import { closeManageMembers } from "@/redux/reducers/chat";
import { useToast } from "@/hooks/use-toast";
import { X, Shield,  } from "lucide-react";

export default function ManageMembersDialog() {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [addMembers, { isLoading: isAdding }] = useAddGroupMembersMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveGroupMemberMutation();
  const [assignAdmin] = useAssignGroupAdminMutation();

  const { modals, selectedGroup } = useSelector((state) => state.chat);
  const isOpen = modals.manageMembers.isOpen;
  const groupId = modals.manageMembers.groupId;

  const { data: availableFriends } = useAvailableFriendsQuery(groupId, {
    skip: !isOpen,
  });

  const [selectedNewMembers, setSelectedNewMembers] = useState([]);
const { user } = useSelector((state) => state.auth);
const isAdmin = selectedGroup?.groupAdmin?._id === user?._id;

  const handleAddMembers = async () => {
    if (selectedNewMembers.length === 0) {
      toast({ description: "Select at least one member to add" });
      return;
    }

    try {
      await addMembers({
        chatId: groupId,
        members: selectedNewMembers,
      }).unwrap();

      toast({
        title: "Success",
        description: "Members added successfully",
      });

      setSelectedNewMembers([]);
    } catch (error) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to add members",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeMember({
        chatId: groupId,
        userId,
      }).unwrap();

      toast({
        title: "Success",
        description: "Member removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const handlePromoteAdmin = async (userId) => {
    try {
      await assignAdmin({
        chatId: groupId,
        userId,
      }).unwrap();

      toast({
        title: "Success",
        description: "Member promoted to admin",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to promote member",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) dispatch(closeManageMembers());
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
          <DialogDescription>
            Add new members or manage existing ones
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Members Section */}
          {isAdmin && availableFriends?.friends?.length > 0 && (
            <div className="space-y-3 pb-4 border-b">
              <p className="text-sm font-medium">Add Members</p>
              <ScrollArea className="h-40 border rounded-md p-2">
                {availableFriends.friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <span className="text-sm">{friend.name}</span>
                    <Button
                      size="sm"
                      variant={
                        selectedNewMembers.includes(friend._id)
                          ? "default"
                          : "outline"
                      }
                      onClick={() => {
                        setSelectedNewMembers((prev) =>
                          prev.includes(friend._id)
                            ? prev.filter((id) => id !== friend._id)
                            : [...prev, friend._id]
                        );
                      }}
                    >
                      {selectedNewMembers.includes(friend._id) ? "✓" : "+"}
                    </Button>
                  </div>
                ))}
              </ScrollArea>

              {selectedNewMembers.length > 0 && (
                <Button
                  onClick={handleAddMembers}
                  disabled={isAdding}
                  className="w-full"
                >
                  {isAdding ? "Adding..." : `Add ${selectedNewMembers.length} Member(s)`}
                </Button>
              )}
            </div>
          )}

       {/* Current Members Section */}
<div className="space-y-3">
  <p className="text-sm font-medium">Members</p>
  <ScrollArea className="h-64 border rounded-md p-2">
    {selectedGroup?.members?.map((member) => (
      <div
        key={member._id}
        className="flex items-center justify-between p-3 border-b last:border-b-0"
      >
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage 
              src={member.avatar?.url || member.avatar} 
              alt={member.name}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {member.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{member.name}</p>
            {selectedGroup?.groupAdmin?._id === member._id && (
              <Badge variant="secondary" className="text-xs mt-1">
                Admin
              </Badge>
            )}
          </div>
        </div>

        {isAdmin && selectedGroup?.groupAdmin?._id !== member._id && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handlePromoteAdmin(member._id)}
              title="Promote to admin"
            >
              <Shield className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRemoveMember(member._id)}
              title="Remove member"
              disabled={isRemoving}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    ))}
  </ScrollArea>
</div>


          <Button
            variant="outline"
            className="w-full"
            onClick={() => dispatch(closeManageMembers())}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}