const express = require("express");
const { WebSocket } = require("ws");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Aviator Proxy is running on Render!");
});

app.get("/connect", (req, res) => {
  const ws = new WebSocket("wss://game3.apac.spribegaming.com/BlueBox/websocket");

  ws.on("open", () => {
    console.log("✅ Connected to Aviator WebSocket");
  });

  ws.on("message", (msg) => {
    console.log("📩 Incoming:", msg.toString("base64"));
  });

  ws.on("close", () => {
    console.log("❌ WebSocket closed");
  });

  res.send("Proxy connected (check Render logs).");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
