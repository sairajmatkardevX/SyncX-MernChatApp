

import jwt from "jsonwebtoken";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import { ErrorHandler } from "../utils/utility.js";
import { cookieOptions } from "../utils/features.js";
import { adminSecretKey } from "../app.js";

const adminLogin = TryCatch(async (req, res, next) => {
  const { secretKey } = req.body;

  const isMatched = secretKey === adminSecretKey;

  if (!isMatched) return next(new ErrorHandler("Invalid Admin Key", 401));

  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET);
  return res
    .status(200)
    .cookie("SyncX-ChatAppToken", token, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 15,
    })
    .json({
      success: true,
      message: "Authenticated Successfully, Welcome BOSS",
    });
});

const adminLogout = TryCatch(async (req, res, next) => {
  return res
    .status(200)
    .cookie("SyncX-ChatAppToken", "", {
      ...cookieOptions,
      maxAge: 0,
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});

const getAdminData = TryCatch(async (req, res, next) => {
  return res.status(200).json({
    admin: true,
  });
});

const allUsers = TryCatch(async (req, res) => {
  const users = await User.find({});

  const transformedUsers = await Promise.all(
    users.map(async ({ name, username, avatar, _id, bio }) => {
      const [groups, friends] = await Promise.all([
        Chat.countDocuments({ groupChat: true, members: _id }),
        Chat.countDocuments({ groupChat: false, members: _id }),
      ]);

      return {
        name,
        username,
        avatar: avatar.url,
        _id,
        bio: bio || "", 
        groups,
        friends,
      };
    })
  );

  return res.status(200).json({
    status: "success",
    users: transformedUsers,
  });
});

const allChats = TryCatch(async (req, res) => {
  const chats = await Chat.find({})
    .populate("members", "name avatar")
    .populate("creator", "name avatar");

  const transformedChats = await Promise.all(
    chats.map(async ({ members, _id, groupChat, name, creator }) => {
      const totalMessages = await Message.countDocuments({ chat: _id });

      return {
        _id,
        groupChat,
        name,
        avatar: members.slice(0, 3).map((member) => member.avatar.url),
        members: members.map(({ _id, name, avatar }) => ({
          _id,
          name,
          avatar: avatar.url,
        })),
        creator: {
          name: creator?.name || "None",
          avatar: creator?.avatar.url || "",
        },
        totalMembers: members.length,
        totalMessages,
      };
    })
  );

  return res.status(200).json({
    status: "success",
    chats: transformedChats,
  });
});



const allMessages = TryCatch(async (req, res) => {
  try {
    

    const messages = await Message.find({})
      .populate("sender", "name avatar")
      .populate("chat", "groupChat")
      .lean();

   
    const transformedMessages = messages.map((message) => {
     
      let senderAvatarUrl = null;
      
      if (message.sender?.avatar) {
        
        if (typeof message.sender.avatar === "object" && message.sender.avatar.url) {
          senderAvatarUrl = message.sender.avatar.url;
        }
       
        else if (typeof message.sender.avatar === "string") {
          senderAvatarUrl = message.sender.avatar;
        }
      }

      return {
        _id: message._id,
        content: message.content || "",
        attachments: message.attachments || [],
        createdAt: message.createdAt,
        chat: message.chat?._id || message.chat,
        groupChat: message.chat?.groupChat || false,
        sender: {
          _id: message.sender?._id || "unknown",
          name: message.sender?.name || "Unknown User",
          avatar: senderAvatarUrl, 
        },
      };
    });

   

    return res.status(200).json({
      success: true,
      messages: transformedMessages,
    });
  } catch (error) {
   
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});
const getDashboardStats = TryCatch(async (req, res) => {
  const [groupsCount, usersCount, messagesCount, totalChatsCount] =
    await Promise.all([
      Chat.countDocuments({ groupChat: true }),
      User.countDocuments(),
      Message.countDocuments(),
      Chat.countDocuments(),
    ]);

  const today = new Date();

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const last7DaysMessages = await Message.find({
    createdAt: {
      $gte: last7Days,
      $lte: today,
    },
  }).select("createdAt");

  const messages = new Array(7).fill(0);
  const dayInMiliseconds = 1000 * 60 * 60 * 24;

  last7DaysMessages.forEach((message) => {
    const indexApprox =
      (today.getTime() - message.createdAt.getTime()) / dayInMiliseconds;
    const index = Math.floor(indexApprox);

    messages[6 - index]++;
  });

  const stats = {
    groupsCount,
    usersCount,
    messagesCount,
    totalChatsCount,
    messagesChart: messages,
  };

  return res.status(200).json({
    success: true,
    stats,
  });
});

const updateUser = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, username, bio } = req.body;


  const user = await User.findById(id);
  if (!user) {
    console.log("❌ User not found:", id); 
    return next(new ErrorHandler("User not found", 404));
  }

  
  if (username && username !== user.username) {
    const existingUser = await User.findOne({ username, _id: { $ne: id } });
    if (existingUser) {
      return next(new ErrorHandler("Username already taken", 400));
    }
  }

 
  if (name !== undefined) user.name = name;
  if (username !== undefined) user.username = username;
  if (bio !== undefined) user.bio = bio;

  await user.save();



  res.status(200).json({
    success: true,
    message: "User updated successfully",
  });
});


const deleteUser = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  

  const user = await User.findById(id);
  if (!user) {
  
    return next(new ErrorHandler("User not found", 404));
  }


  await Chat.updateMany({ members: id }, { $pull: { members: id } });


  await Chat.deleteMany({
    groupChat: false,
    members: { $size: 0 },
  });

  
  await Message.deleteMany({ sender: id });

  await User.findByIdAndDelete(id);

  

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

export {
  allUsers,
  allChats,
  allMessages,
  getDashboardStats,
  adminLogin,
  adminLogout,
  getAdminData,
  updateUser,
  deleteUser,
};