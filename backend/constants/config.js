const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const CHAT_APP_TOKEN = "SyncX-ChatAppToken";

export { corsOptions, CHAT_APP_TOKEN  };