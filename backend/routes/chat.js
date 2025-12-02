import express from "express";
import {
  addMembers,
  deleteChat,
  deleteGroup,
  deleteMessage,
  editGroup,
  getChatDetails,
  getMessages,
  getMyChats,
  getMyGroups,
  leaveGroup,
  newGroupChat,
  removeMember,
  renameGroup,
  sendAttachments,
  assignGroupAdmin,
  removeGroupAdmin,
} from "../controllers/chat.js";
import {
  addMemberValidator,
  assignAdminValidator,
  chatIdValidator,
  chatIdParamValidator,
  deleteMessageValidator,
  editGroupValidator,
  newGroupValidator,
  removeAdminValidator,
  removeMemberValidator,
  renameValidator,
  sendAttachmentsValidator,
  validateHandler,
} from "../lib/validator.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { attachmentsMulter, singleAvatar } from "../middlewares/multer.js";

const app = express.Router();


app.use(isAuthenticated);

// ===== GROUP CREATION & RETRIEVAL =====
app.post("/new", newGroupValidator(), validateHandler, newGroupChat);
app.get("/my", getMyChats);
app.get("/my/groups", getMyGroups);

// ===== GROUP MEMBER MANAGEMENT =====
app.put("/addmembers", addMemberValidator(), validateHandler, addMembers);
app.put("/removemember", removeMemberValidator(), validateHandler, removeMember);

app.delete(
  "/group/:chatId/members/:memberId",
  chatIdParamValidator("chatId"),
  validateHandler,
  removeMember
);

// ===== GROUP ADMIN ASSIGNMENT =====
app.post(
  "/assign-admin",
  assignAdminValidator(),
  validateHandler,
  assignGroupAdmin
);
app.post(
  "/remove-admin/:chatId",
  removeAdminValidator(),
  validateHandler,
  removeGroupAdmin
);

// ===== GROUP OPERATIONS =====
// 
app.put(
  "/edit-group/:chatId",
  singleAvatar, 
  editGroupValidator(),
  validateHandler,
  editGroup
);
app.delete("/leave/:chatId", chatIdParamValidator("chatId"), validateHandler, leaveGroup);

app.delete("/group/:chatId", chatIdParamValidator("chatId"), validateHandler, deleteGroup);

// ===== MESSAGE OPERATIONS =====
app.post(
  "/message",
  attachmentsMulter, 
  sendAttachmentsValidator(),
  validateHandler,
  sendAttachments
);
app.get("/message/:id", chatIdValidator(), validateHandler, getMessages);
app.delete(
  "/message/:chatId/:messageId",
  deleteMessageValidator(),
  validateHandler,
  deleteMessage
);

// ===== CHAT DETAILS, RENAME & DELETE =====
app
  .route("/:id")
  .get(chatIdValidator(), validateHandler, getChatDetails)
  .put(renameValidator(), validateHandler, renameGroup)
  .delete(chatIdValidator(), validateHandler, deleteChat);

export default app;