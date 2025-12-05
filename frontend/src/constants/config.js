
export const server = import.meta.env.VITE_SERVER || "http://localhost:3000";


console.log("🌐 Connecting to server:", server);


if (!server.startsWith("http://") && !server.startsWith("https://")) {
  console.error("❌ Invalid server URL format:", server);
}


export const config = {
  server,
  socketPath: "/socket.io/",
  apiVersion: "v1",
  apiBase: `${server}/api/v1`,
};