import { compare } from "bcrypt";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import { getOtherMember } from "../lib/helper.js";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Request } from "../models/request.js";
import { User } from "../models/user.js";
import { Message } from "../models/message.js";
import {
  cookieOptions,
  emitEvent,
  sendToken,
  uploadFilesToCloudinary,
  deleteFilesFromCloudinary,
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import { CHAT_APP_TOKEN } from "../constants/config.js";

const newUser = TryCatch(async (req, res, next) => {
  const { name, username, password, bio } = req.body;

  const file = req.file;

  if (!file) return next(new ErrorHandler("Please Upload Avatar"));

  const result = await uploadFilesToCloudinary([file]);

  const avatar = {
    public_id: result[0].public_id,
    url: result[0].url,
  };

  const user = await User.create({
    name,
    bio,
    username,
    password,
    avatar,
  });

  sendToken(res, user, 201, "User created");
});


const login = TryCatch(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).select("+password");

  if (!user) return next(new ErrorHandler("Invalid Username or Password", 404));

  const isMatch = await compare(password, user.password);

  if (!isMatch)
    return next(new ErrorHandler("Invalid Username or Password", 404));

  sendToken(res, user, 200, `Welcome Back, ${user.name}`);
});

const getMyProfile = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user);

  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({
    success: true,
    user,
  });
});


const logout = TryCatch(async (req, res) => {
  return res
    .status(200)
    .cookie(CHAT_APP_TOKEN, "", { ...cookieOptions, maxAge: 0 })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});
const searchUser = TryCatch(async (req, res) => {
  const { name = "" } = req.query;

  
  const myChats = await Chat.find({ groupChat: false, members: req.user });

  
  const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

  
  const excludedUsers = [...allUsersFromMyChats, req.user];

 
  const allUsersExceptMeAndFriends = await User.find({
    _id: { $nin: excludedUsers },
    name: { $regex: name, $options: "i" },
  });


  const users = allUsersExceptMeAndFriends.map(({ _id, name, avatar }) => ({
    _id,
    name,
    avatar: avatar.url,
  }));

  return res.status(200).json({
    success: true,
    users,
  });
});
const sendFriendRequest = TryCatch(async (req, res, next) => {
  const { userId } = req.body;

  const request = await Request.findOne({
    $or: [
      { sender: req.user, receiver: userId },
      { sender: userId, receiver: req.user },
    ],
  });

  if (request) return next(new ErrorHandler("Request already sent", 400));

  await Request.create({
    sender: req.user,
    receiver: userId,
  });

  emitEvent(req, NEW_REQUEST, [userId]);

  return res.status(200).json({
    success: true,
    message: "Friend Request Sent",
  });
});


const acceptFriendRequest = TryCatch(async (req, res, next) => {
  const { requestId, accept } = req.body;


  const request = await Request.findById(requestId)
    .populate("sender", "name")
    .populate("receiver", "name");

  if (!request) return next(new ErrorHandler("Request not found", 404));

  if (request.receiver._id.toString() !== req.user.toString())
    return next(
      new ErrorHandler("You are not authorized to accept this request", 401)
    );

  if (!accept) {
    await request.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Friend Request Rejected",
    });
  }

  const members = [request.sender._id, request.receiver._id];

  const chat = await Chat.create({
    members,
    name: `${request.sender.name}-${request.receiver.name}`,
  });

  

 
  await request.deleteOne();

 

 
  emitEvent(req, REFETCH_CHATS, members);

  return res.status(200).json({
    success: true,
    message: "Friend Request Accepted",
    senderId: request.sender._id,
    chatId: chat._id,
  });
});
const getMyNotifications = TryCatch(async (req, res) => {
  const requests = await Request.find({ receiver: req.user }).populate(
    "sender",
    "name avatar"
  );

  const allRequests = requests.map(({ _id, sender }) => ({
    _id,
    sender: {
      _id: sender._id,
      name: sender.name,
      avatar: sender.avatar.url,
    },
  }));

  return res.status(200).json({
    success: true,
    allRequests,
  });
});

const getMyFriends = TryCatch(async (req, res) => {
  const chatId = req.query.chatId;

  const chats = await Chat.find({
    members: req.user,
    groupChat: false,
  }).populate("members", "name avatar");


  const friends = chats
    .map(({ members }) => {
      const otherUser = getOtherMember(members, req.user);

     
      if (!otherUser) {
        console.error("❌ Could not find other member in chat");
        return null;
      }

      return {
        _id: otherUser._id,
        name: otherUser.name,
        avatar: otherUser.avatar?.url || otherUser.avatar, 
      };
    })
    .filter(Boolean); 

  

  if (chatId) {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const availableFriends = friends.filter(
      (friend) => !chat.members.includes(friend._id)
    );

    return res.status(200).json({
      success: true,
      friends: availableFriends,
    });
  } else {
    return res.status(200).json({
      success: true,
      friends,
    });
  }
});

const updateProfile = TryCatch(async (req, res, next) => {
  const { name, username, bio } = req.body;
  const userId = req.user; 
  const file = req.file;

  
  if (!userId) return next(new ErrorHandler("Unauthorized", 401));

  
  const user = await User.findById(userId);
  if (!user) return next(new ErrorHandler("User not found", 404));

  
  if (name) user.name = name;
  if (username) user.username = username;
  if (bio !== undefined) user.bio = bio;


  if (file) {
   
    if (user.avatar?.public_id) {
      try {
        await deleteFilesFromCloudinary([user.avatar.public_id]);
      } catch (err) {
        console.error("Error deleting old avatar:", err);
      }
    }

   
    const result = await uploadFilesToCloudinary([file]);
    user.avatar = {
      public_id: result[0].public_id,
      url: result[0].url,
    };
  }

 
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
}); 
const removeFriend = TryCatch(async (req, res, next) => {
  const { friendId } = req.body;
  const userId = req.user;

  console.log("🗑️ Remove friend request:", { userId, friendId });

  
  if (!friendId) {
    return next(new ErrorHandler("Friend ID is required", 400));
  }

  
  if (!friendId.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new ErrorHandler("Invalid friend ID", 400));
  }

  
  if (userId.toString() === friendId.toString()) {
    return next(new ErrorHandler("Cannot remove yourself", 400));
  }

  try {
    
    const chat = await Chat.findOne({
      groupChat: false,
      members: { $all: [userId, friendId] },
    });

    if (!chat) {
      console.log("❌ Chat not found between users:", { userId, friendId });
      return next(new ErrorHandler("Friend chat not found", 404));
    }

  

    const messagesWithAttachments = await Message.find({
      chat: chat._id,
      attachments: { $exists: true, $ne: [] },
    });

   

  
    const public_ids = [];
    messagesWithAttachments.forEach(({ attachments }) =>
      attachments.forEach(({ public_id }) => public_ids.push(public_id))
    );

    await Promise.all([
      public_ids.length > 0 
        ? deleteFilesFromCloudinary(public_ids)
        : Promise.resolve(),
      Chat.findByIdAndDelete(chat._id),
      Message.deleteMany({ chat: chat._id }),
    ]);

    


    emitEvent(req, REFETCH_CHATS, [userId, friendId]);

    return res.status(200).json({
      success: true,
      message: "Friend removed successfully",
    });
  } catch (error) {
    console.error("❌ Error removing friend:", error);
    return next(
      new ErrorHandler("Error removing friend: " + error.message, 500)
    );
  }
});
const getUserById = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorHandler("User ID is required", 400));
  }

  const user = await User.findById(userId).select("name avatar username bio");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  return res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar.url,
    },
  });
});
export {
  acceptFriendRequest,
  getMyFriends,
  getMyNotifications,
  getMyProfile,
  login,
  logout,
  newUser,
  searchUser,
  sendFriendRequest,
  updateProfile,
  removeFriend,
  getUserById,
};
