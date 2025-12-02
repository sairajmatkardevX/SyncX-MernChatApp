import { useDispatch, useSelector } from "react-redux";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLeaveGroupMutation } from "@/redux/api/api";
import { closeConfirmLeave, openManageMembers } from "@/redux/reducers/chat";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function ConfirmLeaveGroupDialog() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leaveGroup, { isLoading }] = useLeaveGroupMutation();

  const { modals, selectedGroup } = useSelector((state) => state.chat);
  const isOpen = modals.confirmLeave.isOpen;
  const groupId = modals.confirmLeave.groupId;
  const isOnlyAdmin = modals.confirmLeave.isOnlyAdmin;

  const handleConfirmLeave = async () => {
    try {
      const result = await leaveGroup(groupId).unwrap();

      toast({
        title: "Success",
        description: result.message || "You left the group successfully",
      });

      dispatch(closeConfirmLeave());
      navigate("/groups");
    } catch (error) {
      console.error("❌ Leave group error:", error);

      toast({
        title: "Error",
        description: error?.data?.message || "Failed to leave group",
        variant: "destructive",
      });
    }
  };

  const handleTransferAdmin = () => {
    dispatch(closeConfirmLeave());
    dispatch(openManageMembers(groupId));
  };

  if (isOnlyAdmin) {
    return (
      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) dispatch(closeConfirmLeave());
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex gap-2 items-start">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <AlertDialogTitle>Cannot Leave Group</AlertDialogTitle>
                <AlertDialogDescription className="mt-2">
                  You are the only admin in this group. Please promote another
                  member to admin before leaving, or delete the group.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleTransferAdmin}
              variant="default"
              className="w-full"
            >
              Transfer Admin Role
            </Button>
            <Button
              onClick={() => dispatch(closeConfirmLeave())}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) dispatch(closeConfirmLeave());
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave Group?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to leave "{selectedGroup?.name}"? You won't be
            able to see messages from this group anymore.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end pt-4">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmLeave}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Leaving..." : "Leave Group"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
