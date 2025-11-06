import { faker, simpleFaker } from "@faker-js/faker";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";

// Clean up invalid messages before seeding
const cleanInvalidMessages = async () => {
  try {
    const result = await Message.deleteMany({
      $or: [
        { 'attachment.url': { $exists: true, $eq: undefined } },
        { 'attachment.public_id': { $exists: true, $eq: undefined } },
        { 
          $and: [
            { 'attachment.url': { $exists: true } },
            { 'attachment.public_id': { $exists: false } }
          ]
        },
        { 
          $and: [
            { 'attachment.public_id': { $exists: true } },
            { 'attachment.url': { $exists: false } }
          ]
        }
      ]
    });

    console.log(`✅ Cleaned up ${result.deletedCount} invalid messages`);
    return result.deletedCount;
  } catch (error) {
    console.error("❌ Error cleaning messages:", error);
    throw error;
  }
};

const createSingleChats = async (numChats = 20) => {
  try {
    console.log("🔄 Creating single chats...");
    
    const users = await User.find().select("_id");
    
    if (users.length < 2) {
      throw new Error("Need at least 2 users to create single chats");
    }

    const maxChats = Math.min(numChats, (users.length * (users.length - 1)) / 2);
    const chatsPromise = [];
    const createdChats = new Set();

    for (let i = 0; i < users.length && chatsPromise.length < maxChats; i++) {
      for (let j = i + 1; j < users.length && chatsPromise.length < maxChats; j++) {
        const chatKey = [users[i]._id.toString(), users[j]._id.toString()].sort().join('-');
        
        if (!createdChats.has(chatKey)) {
          chatsPromise.push(
            Chat.create({
              name: faker.lorem.words(2),
              members: [users[i]._id, users[j]._id],
              groupChat: false,
            })
          );
          createdChats.add(chatKey);
        }
      }
    }

    const chats = await Promise.all(chatsPromise);
    console.log(`✅ ${chats.length} single chats created successfully`);
    return chats;
  } catch (error) {
    console.error("❌ Error creating single chats:", error);
    throw error;
  }
};

const createGroupChats = async (numChats = 10) => {
  try {
    console.log("🔄 Creating group chats...");
    
    const users = await User.find().select("_id");
    
    if (users.length < 3) {
      throw new Error("Need at least 3 users to create group chats");
    }

    const chatsPromise = [];

    for (let i = 0; i < numChats; i++) {
      const numMembers = simpleFaker.number.int({ 
        min: 3, 
        max: Math.min(8, users.length) 
      });
      
      const members = new Set();
      while (members.size < numMembers) {
        const randomIndex = Math.floor(Math.random() * users.length);
        members.add(users[randomIndex]._id);
      }

      const membersArray = Array.from(members);
      
      chatsPromise.push(
        Chat.create({
          groupChat: true,
          name: `${faker.lorem.words(2)} Group`,
          members: membersArray,
          creator: membersArray[0],
          groupAdmin: [membersArray[0]],
        })
      );
    }

    const chats = await Promise.all(chatsPromise);
    console.log(`✅ ${chats.length} group chats created successfully`);
    return chats;
  } catch (error) {
    console.error("❌ Error creating group chats:", error);
    throw error;
  }
};

const createMessages = async (numMessages = 100) => {
  try {
    console.log("🔄 Creating messages...");
    
    await cleanInvalidMessages();

    const users = await User.find().select("_id");
    const chats = await Chat.find().select("_id members");

    if (users.length === 0 || chats.length === 0) {
      throw new Error("No users or chats found. Please create users and chats first.");
    }

    const messagesPromise = [];
    let skipped = 0;

    for (let i = 0; i < numMessages; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomChat = chats[Math.floor(Math.random() * chats.length)];

      // Check if user is member of the chat
      if (!randomChat.members.includes(randomUser._id)) {
        skipped++;
        continue;
      }

      const messageData = {
        chat: randomChat._id,
        sender: randomUser._id,
        content: faker.lorem.sentence(),
        createdAt: faker.date.recent({ days: 30 }),
      };

      messagesPromise.push(Message.create(messageData));
    }

    const messages = await Promise.all(messagesPromise);
    console.log(`✅ ${messages.length} messages created successfully (${skipped} skipped)`);
    return messages;
  } catch (error) {
    console.error("❌ Error creating messages:", error);
    throw error;
  }
};

const createMessagesInAChat = async (chatId, numMessages = 50) => {
  try {
    console.log(`🔄 Creating messages in chat: ${chatId}...`);
    
    await cleanInvalidMessages();

    const chat = await Chat.findById(chatId).select("members");
    if (!chat) {
      throw new Error("Chat not found");
    }

    const messagesPromise = [];

    for (let i = 0; i < numMessages; i++) {
      const randomMemberIndex = Math.floor(Math.random() * chat.members.length);
      const randomUser = chat.members[randomMemberIndex];

      const messageDate = faker.date.between({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date()
      });

      const messageData = {
        chat: chatId,
        sender: randomUser,
        content: faker.lorem.sentence(),
        createdAt: messageDate,
        updatedAt: messageDate,
      };

      messagesPromise.push(Message.create(messageData));
    }

    const messages = await Promise.all(messagesPromise);
    console.log(`✅ ${messages.length} messages created in chat ${chatId} successfully`);
    return messages;
  } catch (error) {
    console.error("❌ Error creating messages in chat:", error);
    throw error;
  }
};

// Master seeding function
const seedAll = async () => {
  try {
    console.log("🌱 Starting database seeding...");
    
    // Clean up first
    await cleanInvalidMessages();
    
    // Create chats
    const singleChats = await createSingleChats(20);
    const groupChats = await createGroupChats(10);
    
    // Create messages
    const messages = await createMessages(150);
    
    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Summary:
      Single Chats: ${singleChats.length}
      Group Chats: ${groupChats.length}
      Messages: ${messages.length}
    `);
    
    process.exit(0);
  } catch (error) {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  }
};

// Individual seeding functions
const seedChatsOnly = async () => {
  try {
    await cleanInvalidMessages();
    await createSingleChats(20);
    await createGroupChats(10);
    console.log("✅ Chats seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Chats seeding failed:", error);
    process.exit(1);
  }
};

const seedMessagesOnly = async () => {
  try {
    await createMessages(150);
    console.log("✅ Messages seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Messages seeding failed:", error);
    process.exit(1);
  }
};

export {
  createSingleChats,
  createGroupChats,
  createMessages,
  createMessagesInAChat,
  cleanInvalidMessages,
  seedAll,
  seedChatsOnly,
  seedMessagesOnly
};