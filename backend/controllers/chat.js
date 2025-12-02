import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import { Chat } from "../models/chat.js";
import {
  deleteFilesFromCloudinary,
  emitEvent,
  uploadFilesToCloudinary,
  uploadSingleFileToCloudinary,
  deleteSingleFileFromCloudinary
} from "../utils/features.js";
import {
  ALERT,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  REFETCH_CHATS,
} from "../constants/events.js";
import { getOtherMember } from "../lib/helper.js";
import { User } from "../models/user.js";
import { Message } from "../models/message.js";


const newGroupChat = TryCatch(async (req, res, next) => {
  const { name, members } = req.body;

  const allMembers = [...members, req.user];

  // Create group with admin
  const group = await Chat.create({
    name,
    groupChat: true,
    creator: req.user,
    groupAdmin: req.user, 
    members: allMembers,
  });

  emitEvent(req, ALERT, allMembers, `Welcome to ${name} group`);
  emitEvent(req, REFETCH_CHATS, members);

  return res.status(201).json({
    success: true,
    message: "Group Created",
    group,
  });
});


const getMyChats = TryCatch(async (req, res, next) => {
  const chats = await Chat.find({ members: req.user })
    .populate("members", "name avatar username")
    .populate("groupAdmin", "name avatar")
    .populate("creator", "name avatar");

  const transformedChats = chats
    .map(({ 
      _id, 
      name, 
      members, 
      groupChat, 
      groupAdmin, 
      groupImage, 
      groupDescription 
    }) => {
      
      if (!groupChat) {
        
        if (members.length !== 2) {
          console.error(`❌ Invalid individual chat ${_id}: has ${members.length} members`);
          return null; 
        }

        const otherMember = getOtherMember(members, req.user);
        
       
        if (!otherMember) {
          console.error(`❌ Could not find other member in chat ${_id}`);
          return null;
        }

        return {
          _id,
          groupChat: false,
          avatar: [otherMember.avatar?.url || otherMember.avatar],
          name: otherMember.name,
          members: [{
            _id: otherMember._id,
            name: otherMember.name,
            username: otherMember.username,
            avatar: otherMember.avatar?.url || otherMember.avatar,
          }],
          groupAdmin: null,
          groupImage: null,
          groupDescription: null,
        };
      }

    
      return {
        _id,
        groupChat: true,
        avatar: groupImage?.url 
          ? [groupImage.url]
          : members.slice(0, 3).map(({ avatar }) => avatar?.url || avatar),
        name,
        members: members
          .filter(member => member._id.toString() !== req.user.toString())
          .map(member => ({
            _id: member._id,
            name: member.name,
            username: member.username,
            avatar: member.avatar?.url || member.avatar,
          })),
        groupAdmin,
        groupImage,
        groupDescription,
      };
    })
    .filter(Boolean); 

  return res.status(200).json({
    success: true,
    chats: transformedChats,
  });
});
const getMyGroups = TryCatch(async (req, res, next) => {
  const chats = await Chat.find({
    members: req.user,
    groupChat: true,
  })
    .populate("members", "name avatar")
    .populate("groupAdmin", "name avatar");

  const groups = chats.map(({ members, _id, groupChat, name, groupAdmin, groupImage, groupDescription }) => ({
    _id,
    groupChat,
    name,
    avatar: groupImage?.url 
      ? [groupImage.url]  
      : members.slice(0, 3).map(({ avatar }) => avatar.url), 
    groupAdmin,
    groupImage,  
    groupDescription,  
  }));

  return res.status(200).json({
    success: true,
    groups,
  });
});


const addMembers = TryCatch(async (req, res, next) => {
  const { chatId, members } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Chat not found", 404));
  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));

  if (chat.groupAdmin.toString() !== req.user.toString())
    return next(new ErrorHandler("Only group admin can add members", 403));

  const allNewMembersPromise = members.map((i) => User.findById(i, "name"));
  const allNewMembers = await Promise.all(allNewMembersPromise);

  const uniqueMembers = allNewMembers
    .filter((i) => !chat.members.includes(i._id.toString()))
    .map((i) => i._id);

  chat.members.push(...uniqueMembers);

  if (chat.members.length > 100)
    return next(new ErrorHandler("Group members limit reached", 400));

  await chat.save();

  const allUsersName = allNewMembers.map((i) => i.name).join(", ");

  emitEvent(
    req,
    ALERT,
    chat.members,
    `${allUsersName} has been added in the group`
  );

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Members added successfully",
  });
});


const removeMember = TryCatch(async (req, res, next) => {
  
  const userId = req.body.userId || req.params.memberId;
  const chatId = req.body.chatId || req.params.chatId;

  if (!userId || !chatId) {
    return next(new ErrorHandler("User ID and Chat ID are required", 400));
  }

  const [chat, userThatWillBeRemoved] = await Promise.all([
    Chat.findById(chatId),
    User.findById(userId, "name"),
  ]);

  if (!chat) return next(new ErrorHandler("Chat not found", 404));
  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));

  if (chat.groupAdmin.toString() !== req.user.toString())
    return next(new ErrorHandler("Only group admin can remove members", 403));

  if (chat.members.length <= 3)
    return next(new ErrorHandler("Group must have at least 3 members", 400));

  if (userId.toString() === chat.groupAdmin.toString())
    return next(new ErrorHandler("Group admin cannot remove themselves", 400));

  const allChatMembers = chat.members.map((i) => i.toString());

  chat.members = chat.members.filter(
    (member) => member.toString() !== userId.toString()
  );

  await chat.save();

  emitEvent(req, ALERT, chat.members, {
    message: `${userThatWillBeRemoved.name} has been removed from the group`,
    chatId,
  });

  emitEvent(req, REFETCH_CHATS, allChatMembers);

  return res.status(200).json({
    success: true,
    message: "Member removed successfully",
  });
});



const leaveGroup = TryCatch(async (req, res, next) => {
 
  const chatId = req.params.chatId || req.params.id;
  const userId = req.user;


  if (!chatId) {
    console.log("❌ No chatId provided!");
    return next(new ErrorHandler("Chat ID is required", 400));
  }

  const chat = await Chat.findById(chatId);


  if (!chat) return next(new ErrorHandler("Chat not found", 404));
  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));

  
  const isMember = chat.members.some(member => 
    member.toString() === userId.toString()
  );
  
  if (!isMember) {
    return next(new ErrorHandler("You are not a member of this group", 400));
  }

  
  if (chat.groupAdmin.toString() === userId.toString()) {
    const otherMembers = chat.members.filter(
      (member) => member.toString() !== userId.toString()
    );

    if (otherMembers.length === 0) {
     
      await Promise.all([
        chat.deleteOne(),
        Message.deleteMany({ chat: chatId }),
      ]);
      
      emitEvent(req, REFETCH_CHATS, [userId]);
      
      return res.status(200).json({
        success: true,
        message: "Group deleted as you were the only member",
      });
    }

    
    chat.groupAdmin = otherMembers[0];
    
    const newAdmin = await User.findById(otherMembers[0], "name");
    
    emitEvent(req, ALERT, chat.members, {
      message: `${newAdmin.name} is now the group admin`,
      chatId,
    });
  }


  const remainingMembers = chat.members.filter(
    (member) => member.toString() !== userId.toString()
  );


  chat.members = remainingMembers;
  
  const [user] = await Promise.all([
    User.findById(userId, "name"),
    chat.save(),
  ]);

 

  
  emitEvent(req, ALERT, remainingMembers, {
    message: `${user.name} has left the group`,
    chatId,
  });

  emitEvent(req, REFETCH_CHATS, [...remainingMembers, userId]);

  return res.status(200).json({
    success: true,
    message: "Left group successfully",
  });
});


const deleteGroup = TryCatch(async (req, res, next) => {
  const { chatId } = req.params;
  const userId = req.user;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Group not found", 404));
  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));

  if (chat.groupAdmin.toString() !== userId.toString()) {
    return next(new ErrorHandler("Only group admin can delete the group", 403));
  }

 
  if (chat.members.length <= 3) {
    return next(new ErrorHandler(
      "Cannot delete group with 3 or fewer members. Please remove members first or transfer admin rights.",
      400
    ));
  }

  const messagesWithAttachments = await Message.find({
    chat: chatId,
    attachments: { $exists: true, $ne: [] },
  });

  const public_ids = [];
  messagesWithAttachments.forEach(({ attachments }) =>
    attachments.forEach(({ public_id }) => public_ids.push(public_id))
  );

 
  if (chat.groupImage && chat.groupImage.public_id) {
    public_ids.push(chat.groupImage.public_id);
  }

  await Promise.all([
    deleteFilesFromCloudinary(public_ids),
    chat.deleteOne(),
    Message.deleteMany({ chat: chatId }),
  ]);

  emitEvent(req, REFETCH_CHATS, chat.members);

  res.status(200).json({
    success: true,
    message: "Group deleted successfully",
  });
});

const editGroup = TryCatch(async (req, res, next) => {
  const { chatId } = req.params;
  const { name, description } = req.body;
  const userId = req.user;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Group not found", 404));
  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));

  if (chat.groupAdmin.toString() !== userId.toString())
    return next(new ErrorHandler("Only group admin can edit the group", 403));

  if (name) chat.name = name;
  if (description) chat.groupDescription = description;

  // ✅ FIX: Handle single image upload properly
  if (req.file) {
    // ✅ Delete old image from cloudinary if exists
    if (chat.groupImage && chat.groupImage.public_id) {
      await deleteSingleFileFromCloudinary(chat.groupImage.public_id);
    }

    // ✅ FIX: Use single file upload instead of multiple
    const uploadedImage = await uploadSingleFileToCloudinary(req.file);
    
    // ✅ Save as object with public_id and url
    chat.groupImage = {
      public_id: uploadedImage.public_id,
      url: uploadedImage.url,
    };
  }

  await chat.save();

  // Populate before sending response
  const updatedChat = await Chat.findById(chatId)
    .populate("members", "name avatar")
    .populate("groupAdmin", "name avatar");

  emitEvent(req, ALERT, chat.members, {
    message: "Group details have been updated",
    chatId,
  });

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Group updated successfully",
    chat: updatedChat,
  });
});


const assignGroupAdmin = TryCatch(async (req, res, next) => {
  const { chatId, userId } = req.body;
  const requestUserId = req.user;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Group not found", 404));
  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));

  if (chat.groupAdmin.toString() !== requestUserId.toString())
    return next(new ErrorHandler("Only group admin can assign admin role", 403));

  // Check if user to be promoted is a member
  if (!chat.members.includes(userId))
    return next(new ErrorHandler("User is not a member of this group", 400));

  // Check if user is already admin
  if (chat.groupAdmin.toString() === userId.toString())
    return next(new ErrorHandler("User is already a group admin", 400));

  chat.groupAdmin = userId;
  await chat.save();

  const newAdmin = await User.findById(userId, "name");

  emitEvent(req, ALERT, chat.members, {
    message: `${newAdmin.name} has been promoted to group admin`,
    chatId,
  });

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Admin assigned successfully",
  });
});


const removeGroupAdmin = TryCatch(async (req, res, next) => {
  const { chatId } = req.params;
  const requestUserId = req.user;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Group not found", 404));
  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));

  if (chat.groupAdmin.toString() !== requestUserId.toString())
    return next(
      new ErrorHandler("Only current group admin can remove admin role", 403)
    );

  const otherMembers = chat.members.filter(
    (member) => member.toString() !== chat.groupAdmin.toString()
  );

  if (otherMembers.length === 0)
    return next(
      new ErrorHandler("Cannot remove admin: no other members available", 400)
    );

  const newAdmin = otherMembers[0];
  chat.groupAdmin = newAdmin;
  await chat.save();

  const newAdminUser = await User.findById(newAdmin, "name");

  emitEvent(req, ALERT, chat.members, {
    message: `${newAdminUser.name} has been promoted to group admin`,
    chatId,
  });

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Admin role removed and transferred successfully",
  });
});


const deleteMessage = TryCatch(async (req, res, next) => {
  const { messageId, chatId } = req.params;
  const userId = req.user;

  const message = await Message.findById(messageId);
  const chat = await Chat.findById(chatId);

  if (!message) return next(new ErrorHandler("Message not found", 404));
  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  
  if (message.sender.toString() !== userId.toString())
    return next(
      new ErrorHandler("You can only delete your own messages", 403)
    );

  if (!chat.members.includes(userId))
    return next(
      new ErrorHandler("You are not a member of this chat", 403)
    );

  if (message.attachments && message.attachments.length > 0) {
    const public_ids = message.attachments.map((att) => att.public_id);
    await deleteFilesFromCloudinary(public_ids);
  }

  await Message.deleteOne({ _id: messageId });

  emitEvent(req, ALERT, chat.members, {
    message: "A message has been deleted",
    chatId,
  });

  return res.status(200).json({
    success: true,
    message: "Message deleted successfully",
  });
});


const sendAttachments = TryCatch(async (req, res, next) => {
  const { chatId, caption } = req.body;
  const files = req.files || [];

  if (!files.length)
    return next(new ErrorHandler("Please upload at least one attachment", 400));

  if (files.length > 5)
    return next(new ErrorHandler("You can upload up to 5 files only", 400));

  const [chat, me] = await Promise.all([
    Chat.findById(chatId),
    User.findById(req.user, "name avatar"),
  ]);

  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  const attachments = await uploadFilesToCloudinary(files);

  const message = await Message.create({
    content: caption?.trim() || "",
    attachments,
    sender: me._id,
    chat: chatId,
  });

  const populatedMessage = await message.populate("sender", "name avatar");

  emitEvent(req, NEW_MESSAGE, chat.members, {
    message: {
      ...populatedMessage.toObject(),
      sender: {
        _id: me._id,
        name: me.name,
        avatar: me.avatar?.url || null,
      },
    },
    chatId,
  });

  emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

  return res.status(200).json({
    success: true,
    message: {
      ...populatedMessage.toObject(),
      sender: {
        _id: me._id,
        name: me.name,
        avatar: me.avatar?.url || null,
      },
    },
  });
});


const getChatDetails = TryCatch(async (req, res, next) => {
  if (req.query.populate === "true") {
    const chat = await Chat.findById(req.params.id)
      .populate("members", "name avatar")
      .populate("groupAdmin", "name avatar")
      .lean();

    if (!chat) return next(new ErrorHandler("Chat not found", 404));

    
    chat.members = chat.members.map(({ _id, name, avatar }) => ({
      _id,
      name,
      avatar: {
        url: avatar?.url || avatar,  
        public_id: avatar?.public_id || null,
      },
    }));

    return res.status(200).json({
      success: true,
      chat,
    });
  } else {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return next(new ErrorHandler("Chat not found", 404));

    return res.status(200).json({
      success: true,
      chat,
    });
  }
});


const renameGroup = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;
  const { name } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Chat not found", 404));
  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));

  if (chat.groupAdmin.toString() !== req.user.toString())
    return next(new ErrorHandler("Only group admin can rename the group", 403));

  chat.name = name;
  await chat.save();

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Group renamed successfully",
  });
});

const deleteChat = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;
  const userId = req.user;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  if (chat.groupChat && chat.groupAdmin.toString() !== userId.toString())
    return next(new ErrorHandler("Only group admin can delete the group", 403));

  if (!chat.groupChat && !chat.members.includes(userId.toString())) {
    return next(
      new ErrorHandler("You are not allowed to delete this chat", 403)
    );
  }

  const messagesWithAttachments = await Message.find({
    chat: chatId,
    attachments: { $exists: true, $ne: [] },
  });

  const public_ids = [];
  messagesWithAttachments.forEach(({ attachments }) =>
    attachments.forEach(({ public_id }) => public_ids.push(public_id))
  );

  await Promise.all([
    deleteFilesFromCloudinary(public_ids),
    chat.deleteOne(),
    Message.deleteMany({ chat: chatId }),
  ]);

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Chat deleted successfully",
  });
});

const getMessages = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;
  const { page = 1 } = req.query;

  const resultPerPage = 20;
  const skip = (page - 1) * resultPerPage;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Chat not found", 404));
  if (!chat.members.includes(req.user.toString()))
    return next(
      new ErrorHandler("You are not allowed to access this chat", 403)
    );

  const [messages, totalMessagesCount] = await Promise.all([
    Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(resultPerPage)
      .populate("sender", "name")
      .lean(),
    Message.countDocuments({ chat: chatId }),
  ]);

  const totalPages = Math.ceil(totalMessagesCount / resultPerPage) || 0;

  return res.status(200).json({
    success: true,
    messages: messages.reverse(),
    totalPages,
  });
});

export {
  newGroupChat,
  getMyChats,
  getMyGroups,
  addMembers,
  removeMember,
  leaveGroup,
  deleteGroup,
  sendAttachments,
  getChatDetails,
  renameGroup,
  deleteChat,
  getMessages,
  editGroup,
  assignGroupAdmin,
  removeGroupAdmin,
  deleteMessage,
};