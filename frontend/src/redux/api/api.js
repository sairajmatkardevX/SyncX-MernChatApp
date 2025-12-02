

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../../constants/config";

const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${server}/api/v1/`,
    credentials: "include", 
  }),
  tagTypes: ["Chat", "User", "Message"],

  endpoints: (builder) => ({
    myChats: builder.query({
      query: () => ({
        url: "chat/my",
        // ✅ No need for credentials here anymore, it's global
      }),
      providesTags: ["Chat", "User", "Message"],
    }),

    searchUser: builder.query({
      query: (name) => ({
        url: `user/search?name=${name}`,
      }),
      providesTags: ["User"],
    }),

    sendFriendRequest: builder.mutation({
      query: (data) => ({
        url: "user/sendrequest",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

 getNotifications: builder.query({
  query: () => ({
    url: `user/notifications`,
  }),
  keepUnusedDataFor: 0,
  providesTags: ["User"], 
}),

   acceptFriendRequest: builder.mutation({
  query: (data) => ({
    url: "user/acceptrequest",
    method: "PUT",
    body: data,
  }),
  invalidatesTags: ["Chat", "User"], 
}),

    chatDetails: builder.query({
      query: ({ chatId, populate = false }) => {
        let url = `chat/${chatId}`;
        if (populate) url += "?populate=true";
        return { url };
      },
      providesTags: ["Chat"],
    }),

    getMessages: builder.query({
      query: ({ chatId, page }) => ({
        url: `chat/message/${chatId}?page=${page}`,
      }),
      keepUnusedDataFor: 0,
    }),

    sendAttachments: builder.mutation({
      query: (data) => ({
        url: "chat/message",
        method: "POST",
        body: data,
      }),
    }),

    myGroups: builder.query({
      query: () => ({
        url: "chat/my/groups",
      }),
      providesTags: ["Chat"],
    }),

    availableFriends: builder.query({
      query: (chatId) => {
        let url = `user/friends`;
        if (chatId) url += `?chatId=${chatId}`;
        return { url };
      },
      providesTags: ["Chat"],
    }),

    newGroup: builder.mutation({
      query: ({ name, members }) => ({
        url: "chat/new",
        method: "POST",
        body: { name, members },
      }),
      invalidatesTags: ["Chat"],
    }),

    renameGroup: builder.mutation({
      query: ({ chatId, name }) => ({
        url: `chat/${chatId}`,
        method: "PUT",
        body: { name },
      }),
      invalidatesTags: ["Chat"],
    }),

    removeGroupMember: builder.mutation({
      query: ({ chatId, userId }) => ({
        url: `chat/removemember`,
        method: "PUT",
        body: { chatId, userId },
      }),
      invalidatesTags: ["Chat"],
    }),

    addGroupMembers: builder.mutation({
      query: ({ members, chatId }) => ({
        url: `chat/addmembers`,
        method: "PUT",
        body: { members, chatId },
      }),
      invalidatesTags: ["Chat"],
    }),

    deleteChat: builder.mutation({
      query: (chatId) => ({
        url: `chat/${chatId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chat"],
    }),

    
    leaveGroup: builder.mutation({
      query: (chatId) => {
        console.log("🔵 API CALL - Leave Group with chatId:", chatId);
        console.log("🔵 API CALL - Type of chatId:", typeof chatId);
        return {
          url: `chat/leave/${chatId}`, 
          method: "DELETE",
          
        };
      },
      invalidatesTags: ["Chat"],
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: "user/update",
        method: "PUT",
        body: data,
        formData: true,
      }),
      invalidatesTags: ["User"],
    }),

    updateUser: builder.mutation({
      query: ({ userId, data }) => ({
        url: `admin/user/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `admin/user/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User", "Chat"],
    }),

    removeFriend: builder.mutation({
      query: (data) => ({
        url: "user/removefriend",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Chat", "User"],
    }),

    deleteGroup: builder.mutation({
      query: (chatId) => ({
        url: `chat/group/${chatId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chat"],
    }),

    editGroup: builder.mutation({
      query: ({ chatId, data }) => ({
        url: `chat/edit-group/${chatId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Chat"],
    }),

    assignGroupAdmin: builder.mutation({
      query: ({ chatId, userId }) => ({
        url: "chat/assign-admin",
        method: "POST",
        body: { chatId, userId },
      }),
      invalidatesTags: ["Chat"],
    }),

    removeGroupAdmin: builder.mutation({
      query: (chatId) => ({
        url: `chat/remove-admin/${chatId}`,
        method: "POST",
      }),
      invalidatesTags: ["Chat"],
    }),

    deleteMessage: builder.mutation({
      query: ({ chatId, messageId }) => ({
        url: `chat/message/${chatId}/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chat", "Message"],
    }),

    getUserById: builder.query({
      query: (userId) => `user/user/${userId}`,
      providesTags: ["User"],
    }),
  }),
});

export default api;
export const {
  useMyChatsQuery,
  useLazySearchUserQuery,
  useSendFriendRequestMutation,
  useGetNotificationsQuery,
  useAcceptFriendRequestMutation,
  useChatDetailsQuery,
  useGetMessagesQuery,
  useSendAttachmentsMutation,
  useMyGroupsQuery,
  useAvailableFriendsQuery,
  useNewGroupMutation,
  useRenameGroupMutation,
  useRemoveGroupMemberMutation,
  useAddGroupMembersMutation,
  useDeleteChatMutation,
  useLeaveGroupMutation,
  useUpdateProfileMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRemoveFriendMutation,
  useDeleteGroupMutation,
  useEditGroupMutation,
  useAssignGroupAdminMutation,
  useRemoveGroupAdminMutation,
  useDeleteMessageMutation,
  useLazyGetUserByIdQuery,
} = api;