// proxy.js
const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");

const app = express();
app.use(cors());

const server = createServer(app);
const wss = new WebSocket.Server({ server });

const AVIATOR_WS = "wss://game3.apac.spribegaming.com/BlueBox/websocket";

let aviatorSocket = null;
let clients = [];

function connectAviator() {
  aviatorSocket = new WebSocket(AVIATOR_WS, {
    headers: {
      Origin: "https://aviator-next.spribegaming.com",
      "User-Agent": "Mozilla/5.0",
    },
  });

  aviatorSocket.on("open", () => {
    console.log("✅ Connected to Aviator WebSocket");
  });

  aviatorSocket.on("message", (msg) => {
    try {
      // Decode Base64 → Buffer → JSON/Text
      const decoded = Buffer.from(msg.toString(), "base64").toString("utf-8");

      clients.forEach((res) => res.write(`data: ${decoded}\n\n`));
    } catch (e) {
      console.error("❌ Decode error", e.message);
    }
  });

  aviatorSocket.on("close", () => {
    console.log("⚠️ Aviator WebSocket closed. Reconnecting...");
    setTimeout(connectAviator, 3000);
  });

  aviatorSocket.on("error", (err) => {
    console.error("❌ WS Error:", err.message);
  });
}
connectAviator();

// SSE endpoint
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write("retry: 10000\n\n");
  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((c) => c !== res);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Proxy listening on ${PORT}`);
});
