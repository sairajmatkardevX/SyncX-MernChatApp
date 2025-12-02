import { createSlice } from "@reduxjs/toolkit";
import { getOrSaveFromStorage } from "../../lib/features";
import { NEW_MESSAGE_ALERT } from "../../constants/events";

const initialState = {
  notificationCount: 0,
  newMessagesAlert:
    getOrSaveFromStorage({
      key: NEW_MESSAGE_ALERT,
      get: true,
    }) || [],
  messages: [],

  selectedGroup: null,
  groupMembers: [],
  groupLoading: false,
  groupError: null,

  modals: {
    groupSettings: {
      isOpen: false,
      groupId: null,
    },
    manageMembers: {
      isOpen: false,
      groupId: null,
    },
    confirmLeave: {
      isOpen: false,
      groupId: null,
      isOnlyAdmin: false,
    },
    confirmDelete: {
      isOpen: false,
      groupId: null,
    },
  },
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    incrementNotification: (state) => {
      state.notificationCount += 1;
    },

    resetNotificationCount: (state) => {
      state.notificationCount = 0;
    },

    setNewMessagesAlert: (state, action) => {
      const chatId = action.payload.chatId;

      const index = state.newMessagesAlert.findIndex(
        (item) => item.chatId === chatId
      );

      if (index !== -1) {
        state.newMessagesAlert[index].count += 1;
      } else {
        state.newMessagesAlert.push({
          chatId,
          count: 1,
        });
      }
    },

    removeNewMessagesAlert: (state, action) => {
      state.newMessagesAlert = state.newMessagesAlert.filter(
        (item) => item.chatId !== action.payload
      );
    },

    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    setSelectedGroup: (state, action) => {
      state.selectedGroup = action.payload;
    },

    setGroupMembers: (state, action) => {
      state.groupMembers = action.payload;
    },

    setGroupLoading: (state, action) => {
      state.groupLoading = action.payload;
    },

    setGroupError: (state, action) => {
      state.groupError = action.payload;
    },

    openGroupSettings: (state, action) => {
      state.modals.groupSettings.isOpen = true;
      state.modals.groupSettings.groupId = action.payload;
    },

    closeGroupSettings: (state) => {
      state.modals.groupSettings.isOpen = false;
      state.modals.groupSettings.groupId = null;
    },

    openManageMembers: (state, action) => {
      state.modals.manageMembers.isOpen = true;
      state.modals.manageMembers.groupId = action.payload;
    },

    closeManageMembers: (state) => {
      state.modals.manageMembers.isOpen = false;
      state.modals.manageMembers.groupId = null;
    },

    openConfirmLeave: (state, action) => {
      state.modals.confirmLeave = {
        isOpen: true,
        groupId: action.payload.groupId,
        isOnlyAdmin: action.payload.isOnlyAdmin,
      };
    },

    closeConfirmLeave: (state) => {
      state.modals.confirmLeave = {
        isOpen: false,
        groupId: null,
        isOnlyAdmin: false,
      };
    },

    openConfirmDelete: (state, action) => {
      state.modals.confirmDelete.isOpen = true;
      state.modals.confirmDelete.groupId = action.payload;
    },

    closeConfirmDelete: (state) => {
      state.modals.confirmDelete.isOpen = false;
      state.modals.confirmDelete.groupId = null;
    },

    updateGroupMember: (state, action) => {
      const { userId, updates } = action.payload;
      const member = state.groupMembers.find((m) => m._id === userId);
      if (member) {
        Object.assign(member, updates);
      }
    },

    removeGroupMemberFromList: (state, action) => {
      state.groupMembers = state.groupMembers.filter(
        (m) => m._id !== action.payload
      );
    },

    addGroupMemberToList: (state, action) => {
      state.groupMembers.push(action.payload);
    },
  },
});

export default chatSlice;
export const {
  incrementNotification,
  resetNotificationCount,
  setNewMessagesAlert,
  removeNewMessagesAlert,
  addMessage,

  setSelectedGroup,
  setGroupMembers,
  setGroupLoading,
  setGroupError,
  openGroupSettings,
  closeGroupSettings,
  openManageMembers,
  closeManageMembers,
  openConfirmLeave,
  closeConfirmLeave,
  openConfirmDelete,
  closeConfirmDelete,
  updateGroupMember,
  removeGroupMemberFromList,
  addGroupMemberToList,
} = chatSlice.actions;
