import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEditGroupMutation } from "@/redux/api/api";
import { closeGroupSettings } from "@/redux/reducers/chat";
import { useToast } from "@/hooks/use-toast";
import { Camera, X } from "lucide-react";

export default function GroupSettingsDialog() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [editGroup, { isLoading }] = useEditGroupMutation();

  const { modals, selectedGroup } = useSelector((state) => state.chat);
  const isOpen = modals.groupSettings.isOpen;
  const groupId = modals.groupSettings.groupId;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
    imagePreview: null,
  });

  // Initialize form data when dialog opens or selectedGroup changes
  useEffect(() => {
    if (selectedGroup) {
      setFormData({
        name: selectedGroup.name || "",
        description: selectedGroup.groupDescription || "",
        image: null,
        imagePreview: selectedGroup.groupImage?.url || null,
      });
    }
  }, [selectedGroup, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image: null,
      imagePreview: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      
      if (formData.description) {
        data.append("description", formData.description.trim());
      }
      
      if (formData.image) {
        data.append("avatar", formData.image);
      }

    
      await editGroup({ 
        chatId: groupId, 
        data
      }).unwrap();

      toast({
        title: "Success",
        description: "Group updated successfully",
      });

      dispatch(closeGroupSettings());
    } catch (error) {
      console.error("Edit group error:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update group",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    dispatch(closeGroupSettings());
    
    if (formData.imagePreview && formData.image) {
      URL.revokeObjectURL(formData.imagePreview);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Update group name, description, and icon
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Image Upload - Clickable Avatar */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Group Icon</label>
            <div className="flex items-center gap-4">
              {/* Clickable Avatar Preview */}
              <div className="relative">
                <Avatar
                  className="w-20 h-20 cursor-pointer hover:opacity-80 transition-opacity border-2 border-border"
                  onClick={handleAvatarClick}
                >
                  <AvatarImage
                    src={formData.imagePreview}
                    alt="Group icon"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {formData.name?.charAt(0)?.toUpperCase() || "G"}
                  </AvatarFallback>
                </Avatar>
                
                {/* Camera Icon Overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <Camera className="w-8 h-8 text-white" />
                </div>

                {/* Remove Image Button */}
                {formData.imagePreview && (
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="hidden"
              />

              {/* Upload Instructions */}
              <div className="flex-1 text-sm text-muted-foreground">
                <p className="font-medium mb-1">Click the avatar to upload</p>
                <p className="text-xs">
                  Recommended: Square image, max 5MB
                </p>
                <p className="text-xs">
                  Formats: JPG, PNG, GIF, WebP
                </p>
              </div>
            </div>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Group Name *
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter group name"
              disabled={isLoading}
              required
            />
          </div>

          {/* Group Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter group description (optional)"
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? "Updating..." : "Update Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}