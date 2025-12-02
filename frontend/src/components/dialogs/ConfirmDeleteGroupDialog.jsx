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
import { useDeleteGroupMutation } from "@/redux/api/api";
import { closeConfirmDelete } from "@/redux/reducers/chat";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

export default function ConfirmDeleteGroupDialog() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteGroup, { isLoading }] = useDeleteGroupMutation();

  const { modals, selectedGroup } = useSelector((state) => state.chat);
  const isOpen = modals.confirmDelete.isOpen;
  const groupId = modals.confirmDelete.groupId;

  const handleConfirmDelete = async () => {
    try {
      await deleteGroup(groupId).unwrap();

      toast({
        title: "Success",
        description: "Group deleted successfully",
      });

      dispatch(closeConfirmDelete());
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete group",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open) dispatch(closeConfirmDelete());
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex gap-2 items-start">
            <Trash2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <AlertDialogTitle>Delete Group Permanently?</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                This will permanently delete "{selectedGroup?.name}" and all its messages. This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
          <p className="text-sm text-red-700">
            ⚠️ All group members will lose access to this group and its message history.
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Deleting..." : "Delete Group"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}