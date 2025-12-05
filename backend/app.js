import express from "express";
import { connectDB } from "./utils/features.js";
import dotenv from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http";
import { v4 as uuid } from "uuid";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import {
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  ONLINE_USERS,
  START_TYPING,
  STOP_TYPING,
  GET_ONLINE_USERS,
} from "./constants/events.js";
import { getSockets } from "./lib/helper.js";
import { Message } from "./models/message.js";
import { corsOptions } from "./constants/config.js";
import { socketAuthenticator } from "./middlewares/auth.js";

import userRoute from "./routes/user.js";
import chatRoute from "./routes/chat.js";
import adminRoute from "./routes/admin.js";

dotenv.config({
  path: "./.env",
});

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
// 🔥 FIX: Make it case-insensitive
// 🔥 FIX: Keep it uppercase "PRODUCTION"
const envMode = process.env.NODE_ENV?.trim().toUpperCase() || "PRODUCTION";
const adminSecretKey = process.env.ADMIN_SECRET_KEY || "adsasdsdfsdfsdfd";
const userSocketIDs = new Map();
const onlineUsers = new Set();

connectDB(mongoURI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const server = createServer(app);

// 🔥 IMPROVED: Socket.io configuration with better settings
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL,
      "https://sync-x-mern-chat-app.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  },
  // 🔥 ADDED: Additional Socket.io settings for production
  transports: ["websocket", "polling"], // Allow both transports
  allowEIO3: true, // Backward compatibility
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
  upgradeTimeout: 30000, // 30 seconds
  maxHttpBufferSize: 1e8, // 100 MB
});

app.set("io", io);

// 🔥 IMPORTANT: CORS must come before other middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// 🔥 ADDED: Health check endpoint for UptimeRobot
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/admin", adminRoute);

app.get("/api/v1/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      {
        resource_type: "image",
        folder: "syncx-test",
      }
    );

    res.json({
      success: true,
      message: "Cloudinary is working!",
      result: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cloudinary error",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

// 🔥 IMPROVED: Socket authentication with better error handling
io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res || {},
    async (err) => {
      try {
        await socketAuthenticator(err, socket, next);
      } catch (error) {
        console.error("Socket authentication error:", error);
        next(error);
      }
    }
  );
});

io.on("connection", (socket) => {
  const user = socket.user;
  
  console.log("User connected:", user.name, socket.id);
  
  userSocketIDs.set(user._id.toString(), socket.id);
  onlineUsers.add(user._id.toString());

  // 🔥 IMPROVED: Emit to all clients including sender
  io.emit(ONLINE_USERS, Array.from(onlineUsers));
  
  console.log("Online users:", Array.from(onlineUsers).length);

  socket.on(GET_ONLINE_USERS, () => {
    socket.emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };

    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });
    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

    try {
      await Message.create(messageForDB);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on(START_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(START_TYPING, { chatId });
  });

  socket.on(STOP_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(STOP_TYPING, { chatId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", user.name, socket.id);
    
    userSocketIDs.delete(user._id.toString());
    onlineUsers.delete(user._id.toString());
    
    // 🔥 FIX: Use io.emit instead of socket.broadcast.emit for consistency
    io.emit(ONLINE_USERS, Array.from(onlineUsers));
    
    console.log("Online users after disconnect:", Array.from(onlineUsers).length);
  });
});

app.use(errorMiddleware);

server.listen(port, () => {
  console.log(`Server is running on port ${port} in ${envMode} Mode`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Client URL: ${process.env.CLIENT_URL}`);
});

export { envMode, adminSecretKey, userSocketIDs };