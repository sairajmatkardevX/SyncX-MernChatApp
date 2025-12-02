# 💬 SyncX - MERN Real-Time Chat Application

A full-stack real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) featuring group chats, file sharing, real-time messaging, and modern UI.

![SyncX Banner](https://via.placeholder.com/1200x300/6366f1/ffffff?text=SyncX+Chat+Application)

## ✨ Features

### 👤 User Features
- 🔐 **User Authentication** - Secure registration and login with JWT
- 💬 **Real-Time Messaging** - Instant message delivery using Socket.io
- 👥 **Group Chats** - Create and manage group conversations
- 📎 **File Sharing** - Upload and share images, videos, audio, and documents
- 🌓 **Dark/Light Theme** - Toggle between dark and light modes
- 🔔 **Real-Time Notifications** - Get notified of new messages
- 👀 **Online Status** - See who's online in real-time
- ⌨️ **Typing Indicators** - Know when someone is typing
- 🖼️ **Profile Management** - Update profile picture and bio
- 🔍 **Search Users** - Find and connect with other users

### 👥 Group Features
- ➕ **Create Groups** - Start new group conversations
- 🖼️ **Group Avatar** - Set custom group images
- 📝 **Group Description** - Add group descriptions
- 👑 **Admin Controls** - Add/remove members, assign admins
- 🚪 **Leave Groups** - Exit groups anytime
- 🗑️ **Delete Groups** - Group admins can delete groups
- ⚙️ **Group Settings** - Manage group details and members

### 🔧 Admin Features
- 📊 **Dashboard** - View statistics and analytics
- 👥 **User Management** - View and manage all users
- 💬 **Chat Management** - Monitor all chats
- 📨 **Message Management** - Oversee all messages

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **RTK Query** - API calls and caching
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Framer Motion** - Animations
- **React Router** - Navigation
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time engine
- **JWT** - Authentication
- **Cloudinary** - File storage
- **Multer** - File uploads
- **bcrypt** - Password hashing

## 📁 Project Structure

```
SyncX/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── dialogs/
│   │   │   ├── layouts/
│   │   │   ├── shared/
│   │   │   ├── specific/
│   │   │   └── ui/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── redux/
│   │   └── utils/
│   └── package.json
│
└── backend/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middlewares/
    ├── utils/
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Git

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/syncx-chat.git
cd syncx-chat
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env` file:
```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/syncx-chat
JWT_SECRET=your_jwt_secret_key_here
ADMIN_SECRET_KEY=your_admin_secret_key_here
CLIENT_URL=http://localhost:5173

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env` file:
```env
VITE_SERVER_URL=http://localhost:3000
```

#### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
