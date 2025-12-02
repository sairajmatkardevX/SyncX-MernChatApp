import { transformImage } from "../../lib/features";
import { File, Music, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RenderAttachment = (file, url, className) => {
  

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "download";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  switch (file) {
    case "video":
      return (
        <div
          className={cn(
            "relative rounded-xl overflow-hidden border border-border bg-card shadow-sm",
            className
          )}
        >
          <video
            src={url}
            preload="none"
            className="w-52 h-40 object-cover rounded-xl"
            controls
            poster={transformImage(url, 200)}
          />
          <div className="absolute bottom-2 right-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-md bg-primary/80 hover:bg-primary text-primary-foreground border border-primary-foreground/20"
              onClick={handleDownload}
              title="Download video"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );

    case "image":
      return (
        <div
          className={cn(
            "relative rounded-xl overflow-hidden border border-border bg-card shadow-sm",
            className
          )}
        >
          <img
            src={transformImage(url, 400)}
            alt="Shared image"
            className="w-52 h-40 object-cover rounded-xl"
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-md bg-primary/80 hover:bg-primary text-primary-foreground border border-primary-foreground/20"
              onClick={handleDownload}
              title="Download image"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );

    case "audio":
      return (
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl bg-muted border border-border shadow-sm w-64",
            className
          )}
        >
          {/* Audio icon without filename */}
          <div className="p-2 rounded-full bg-primary/10 text-primary flex-shrink-0">
            <Music className="h-4 w-4" />
          </div>

          {/* Audio Player & Download */}
          <div className="flex items-center gap-2 flex-1">
            <audio src={url} preload="none" controls className="flex-1 h-6" />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 p-0 flex-shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={handleDownload}
              title="Download audio"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );

    default:
      return (
        <div className={cn("flex items-center gap-2 p-3 rounded-xl bg-card border border-border shadow-sm hover:bg-accent/50 transition group", className)}>
          <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          {/* Removed filename display */}
          <div className="flex-1"></div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 p-0 flex-shrink-0 text-primary hover:bg-primary/10 hover:text-primary opacity-100 transition"
            onClick={handleDownload}
            title="Download file"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      );
  }
};

export default RenderAttachment;