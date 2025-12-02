export const sampleChats = [
  {
    avatar: ["https://www.w3schools.com/howto/img_avatar.png"],
    name: "John Doe",
    _id: "1",
    groupChat: false,
    members: ["1", "2"], 
  },
  {
    avatar: ["https://www.w3schools.com/howto/img_avatar.png"],
    name: "John Boe",
    _id: "2",
    groupChat: true,
    members: ["1", "2"],
  },
];

export const sampleUsers = [
  {
    avatar: ["https://www.w3schools.com/howto/img_avatar.png"],
    name: "John Doe",
    _id: "1",
  },
  {
    avatar: ["https://www.w3schools.com/howto/img_avatar.png"],
    name: "John Boe",
    _id: "2",
  },
];
export const sampleNotifications = [
  {
    sender: {
      avatar: ["https://www.w3schools.com/howto/img_avatar.png"],
      name: "John Doe",
    },
    _id: "1",
  },
  {
    sender: {
      avatar: ["https://www.w3schools.com/howto/img_avatar.png"],
      name: "John Boe",
    },
    _id: "2",
  },
];

export const sampleMessages = [
  {
    attachments: [],
    content: "hello",
    _id: "lby2fbgil",
    sender: {
      _id: "user._id",
      name: "Jhatu",
    },
    chat: "chatId",
    createdAt: "2021-10-01T06:00:00.000Z",
  },
  {
    attachments: [
      {
        public_id: "degge2",
        url: "https://www.w3schools.com/howto/img_avatar.png",
      },
    ],
    content: "",
    _id: "uhciufhi",
    sender: {
      _id: "sddsdssdd",
      name: "Jhatu2",
    },
    chat: "chatId",
    createdAt: "2021-10-01T06:00:00.000Z",
  },
];

export const dashboardData = {
  users: [
    {
      name: "John Doe",
      avatar: "https://www.w3schools.com/howto/img_avatar.png",
      _id: "1",
      username: "john doe",
      friends: 20,
      groups: 5,
    },
    {
      name: "John Boe",
      avatar: "https://www.w3schools.com/howto/img_avatar.png",
      _id: "2",
      username: "john boe",
      friends: 22,
      groups: 15,
    },
  ],

  chats: [
    {
      name: "MuthMaster",
      avatar: ["https://www.w3schools.com/howto/img_avatar.png"],
      _id: "1",
      groupChat: false,
      members: ["1", "2"],
      totalMembers: 2,
      totalMessages: 20,
      creator: {
        name: "John Doe",
        avatar: "https://www.w3schools.com/howto/img_avatar.png",
      },
    },
    {
      name: "hilaDala",
      avatar: ["https://www.w3schools.com/howto/img_avatar.png"],
      _id: "2",
      groupChat: true,
      members: ["1", "2"],
      totalMembers: 2,
      totalMessages: 20,
      creator: {
        name: "John Boe",
        avatar: "https://www.w3schools.com/howto/img_avatar.png",
      },
    },
  ],

  messages: [
    {
      attachments: [],
      content: "laudaa ka msg",
      _id: "msg1",
      sender: {
        _id: "user._id",
        name: "Gendu",
      },
      chat: "chatId",
      createdAt: "2021-10-01T06:00:00.000Z",
    },
    {
      attachments: [
        {
          public_id: "degge2",
          url: "https://www.w3schools.com/howto/img_avatar.png",
        },
      ],
      content: "Another message",
      _id: "msg2",
      sender: {
        _id: "user2._id",
        name: "Gendu2",
      },
      chat: "chatId",
      createdAt: "2021-10-01T07:00:00.000Z",
    },
  ],
};
