import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsFileMenu } from "../../redux/reducers/misc";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Music, Video, File } from "lucide-react";
import FilePreviewDialog from "./FilePreviewDialog";
import toast from "react-hot-toast";

const FileMenu = ({ anchorE1, chatId, setMessages }) => {
  const { isFileMenu } = useSelector((state) => state.misc);
  const dispatch = useDispatch();

  const imageRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const fileRef = useRef(null);


  const fileMenuRef = useRef(null);


  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileType, setFileType] = useState("");

  const closeFileMenu = () => dispatch(setIsFileMenu(false));

 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isFileMenu &&
        fileMenuRef.current &&
        !fileMenuRef.current.contains(event.target) &&
        anchorE1 &&
        !anchorE1.contains(event.target)
      ) {
        closeFileMenu();
      }
    };

    if (isFileMenu) {
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }
  }, [isFileMenu, anchorE1]);


  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isFileMenu) {
        closeFileMenu();
      }
    };

    if (isFileMenu) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isFileMenu]);

  const selectFile = (ref, key) => {
    if (!ref.current) return;
    ref.current.dataset.fileType = key;
    ref.current.click();
  };

 
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const key = e.target.dataset.fileType || "Files";

    if (!files.length) {
      closeFileMenu();
      return;
    }

    if (files.length > 5) {
      toast.error(`You can only send 5 ${key} at a time`);
      e.target.value = "";
      return;
    }

  
    setSelectedFiles(files);
    setFileType(key);
    setPreviewOpen(true);
    closeFileMenu();


    e.target.value = "";
  };

  return (
    <>
      {/* File Inputs */}
      <input
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        ref={imageRef}
        onChange={handleFileSelect}
      />
      <input
        type="file"
        multiple
        accept="audio/*"
        className="hidden"
        ref={audioRef}
        onChange={handleFileSelect}
      />
      <input
        type="file"
        multiple
        accept="video/*"
        className="hidden"
        ref={videoRef}
        onChange={handleFileSelect}
      />
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileRef}
        onChange={handleFileSelect}
      />

      {/* File Type Menu  */}
      <AnimatePresence>
        {isFileMenu && anchorE1 && (
          <motion.div
            ref={fileMenuRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 flex flex-col items-start gap-3 p-3 rounded-2xl shadow-xl border border-border bg-card/95 backdrop-blur-md"
            style={{
              left: anchorE1.getBoundingClientRect().left - 40,
              top: anchorE1.getBoundingClientRect().top - 250,
            }}
          >
            <AttachmentButton
              icon={<Image className="h-5 w-5 text-pink-500" />}
              label="Image"
              onClick={() => selectFile(imageRef, "Images")}
            />
            <AttachmentButton
              icon={<Video className="h-5 w-5 text-blue-500" />}
              label="Video"
              onClick={() => selectFile(videoRef, "Videos")}
            />
            <AttachmentButton
              icon={<Music className="h-5 w-5 text-green-500" />}
              label="Audio"
              onClick={() => selectFile(audioRef, "Audios")}
            />
            <AttachmentButton
              icon={<File className="h-5 w-5 text-violet-500" />}
              label="Document"
              onClick={() => selectFile(fileRef, "Documents")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Dialog */}
      <FilePreviewDialog
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        files={selectedFiles}
        fileType={fileType}
        chatId={chatId}
        setMessages={setMessages}
      />
    </>
  );
};

const AttachmentButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="relative flex items-center gap-3 px-4 py-2 rounded-full bg-muted text-foreground border border-border shadow-sm 
      transition-all hover:scale-[1.03] active:scale-95 overflow-hidden group"
  >
    <span className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition duration-200" />
    <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-card shadow-sm">
      {icon}
    </div>
    <span className="relative text-sm font-medium">{label}</span>
  </button>
);

export default FileMenu;
