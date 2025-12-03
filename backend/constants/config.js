const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    "https://sync-x-mern-chat-app.vercel.app",
    "http://localhost:5173",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const CHAT_APP_TOKEN = "SyncX-ChatAppToken";

export { corsOptions, CHAT_APP_TOKEN };
