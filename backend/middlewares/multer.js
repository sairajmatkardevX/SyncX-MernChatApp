import multer from "multer";

const multerUpload = multer({ 
  limits: { 
    fileSize: 1024 * 1024 * 5 // 5MB per file
  } 
});

// For multiple file attachments - field name "attachments"
export const attachmentsMulter = multerUpload.array("attachments", 5); // Max 5 files
export const singleAvatar = multerUpload.single("avatar");