import mongoose, { Schema, model, Types } from "mongoose";

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    groupChat: {
      type: Boolean,
      default: false,
    },
    creator: {
      type: Types.ObjectId,
      ref: "User",
    },
   
    groupAdmin: {
      type: Types.ObjectId,
      ref: "User",
      required: function() { return this.groupChat; }
    },
    members: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    
    groupDescription: {
      type: String,
      default: "",
    },
   
    groupImage: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: null,
      },
    },
  },
  { timestamps: true }
);

//  Check if user is group admin
schema.methods.isGroupAdmin = function(userId) {
  if (!this.groupChat) return false;
  return this.groupAdmin.toString() === userId.toString();
};

//  Check if user is member of the chat
schema.methods.isMember = function(userId) {
  return this.members.some(member => member.toString() === userId.toString());
};

//  Check if user can delete group (only group admin)
schema.methods.canDeleteGroup = function(userId) {
  return this.groupChat && this.isGroupAdmin(userId);
};

//  Check if user can leave group (members but not admin)
schema.methods.canLeaveGroup = function(userId) {
  return this.groupChat && 
         this.isMember(userId) && 
         !this.isGroupAdmin(userId);
};

//  Check if user can edit group (only group admin)
schema.methods.canEditGroup = function(userId) {
  return this.groupChat && this.isGroupAdmin(userId);
};

//  Check if user can manage members (only group admin)
schema.methods.canManageMembers = function(userId) {
  return this.groupChat && this.isGroupAdmin(userId);
};

export const Chat = mongoose.models.Chat || model("Chat", schema);