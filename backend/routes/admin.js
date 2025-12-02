import express from "express";
import {
  adminLogin,
  adminLogout,
  allChats,
  allMessages,
  allUsers,
  getAdminData,
  getDashboardStats,
  updateUser,
  deleteUser,
} from "../controllers/admin.js";
import { adminLoginValidator, validateHandler } from "../lib/validator.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

app.post("/verify", adminLoginValidator(), validateHandler, adminLogin);

app.get("/logout", adminLogout);

// Only Admin Can Accecss these Routes

app.use(adminOnly);

app.get("/", getAdminData);

app.get("/users", allUsers);
app.get("/chats", allChats);
app.get("/messages", allMessages);

app.get("/stats", getDashboardStats);
// CRUD Routes
app.put("/user/:id", updateUser);
app.delete("/user/:id", deleteUser);

export default app;