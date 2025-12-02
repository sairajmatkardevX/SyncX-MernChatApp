import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const ConfirmDeleteDialog = ({ open, handleClose, deleteHandler }) => {
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {/* Visually hidden title ensures screen reader accessibility */}
          <DialogTitle>
            <VisuallyHidden>Confirm Delete Dialog</VisuallyHidden>
          </DialogTitle>

          <DialogDescription>
            Are you sure you want to delete this group? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="destructive" onClick={deleteHandler} className="flex-1">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
