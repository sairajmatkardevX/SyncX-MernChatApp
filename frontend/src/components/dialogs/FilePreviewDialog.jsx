import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUploadingLoader } from "../../redux/reducers/misc";
import { useSendAttachmentsMutation } from "../../redux/api/api";
import toast from "react-hot-toast";
import {
  Send,
  File as FileIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const FilePreviewDialog = ({ isOpen, onClose, files = [], fileType, chatId }) => {
  const [caption, setCaption] = useState("");
  const dispatch = useDispatch();
  const [sendAttachments] = useSendAttachmentsMutation();

  if (!isOpen || !files.length) return null;

  /** File Type Icons */
  const getFileIcon = () => {
    const icons = {
      Images: <ImageIcon className="h-5 w-5 text-pink-500" />,
      Videos: <VideoIcon className="h-5 w-5 text-blue-500" />,
      Audios: <MusicIcon className="h-5 w-5 text-green-500" />,
    };
    return icons[fileType] || <FileIcon className="h-5 w-5 text-violet-500" />;
  };

  /** Format Size */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  };

  /** Render Preview */
  const renderPreview = (file) => {
    const blobUrl = URL.createObjectURL(file);
    const cleanup = () => URL.revokeObjectURL(blobUrl);

    if (file.type.startsWith("image/")) {
      return <img src={blobUrl} alt={file.name} className="w-full h-32 object-cover rounded-lg" onLoad={cleanup} />;
    }
    if (file.type.startsWith("video/")) {
      return <video src={blobUrl} className="w-full h-32 object-cover rounded-lg" controls />;
    }
    if (file.type.startsWith("audio/")) {
      return (
        <div className="flex flex-col items-center justify-center h-24 bg-muted rounded-lg p-3">
          <MusicIcon className="h-8 w-8 text-green-500 mb-1" />
          <audio src={blobUrl} controls className="w-full mt-1" />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-24 bg-muted rounded-lg p-3">
        <FileIcon className="h-8 w-8 text-violet-500 mb-1" />
        <p className="text-xs text-center truncate w-full">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>
    );
  };

  /** Upload Handler */
  const handleSend = async () => {
    dispatch(setUploadingLoader(true));
    const loadingId = toast.loading(`Sending ${fileType}...`);

    try {
      const formData = new FormData();
      formData.append("chatId", chatId);
      if (caption.trim()) formData.append("caption", caption.trim());
      files.forEach((file) => formData.append("attachments", file));

      const res = await sendAttachments(formData);

      if (res.data?.message) {
        toast.success(`${fileType} sent`, { id: loadingId });
        setCaption("");
        onClose();
      } else {
        toast.error(res.error?.data?.message || `Failed to send ${fileType}`, { id: loadingId });
      }
    } catch {
      toast.error("Upload failed", { id: loadingId });
    } finally {
      dispatch(setUploadingLoader(false));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] p-0">
       
        
        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            {getFileIcon()}
            <div>
              <DialogTitle className="text-lg font-semibold">Send {fileType}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {files.length} {files.length === 1 ? "file" : "files"} selected
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* File Preview */}
        <ScrollArea className="max-h-[40vh] px-4 py-3">
          <div className={cn("grid gap-3", files.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
            {files.map((file, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden bg-card">
                {renderPreview(file)}
                <div className="p-2 border-t border-border bg-muted/30">
                  <p className="text-xs font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Caption */}
        <div className="px-4 py-3 border-t border-border">
          <Input
            placeholder="Add a caption (optional)..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full text-sm"
            maxLength={200}
          />
          {!!caption && (
            <p className="text-xs text-muted-foreground mt-1 text-right">{caption.length}/200</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="gap-2" onClick={handleSend}>
            <Send className="h-3.5 w-3.5" /> Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewDialog;