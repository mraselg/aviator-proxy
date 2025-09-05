const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());

let clients = [];

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.push(res);
  console.log("🌐 New frontend connected. Total:", clients.length);

  req.on("close", () => {
    clients = clients.filter(c => c !== res);
    console.log("❌ Frontend disconnected. Total:", clients.length);
  });
});

// Aviator server WebSocket
const AVIATOR_WS = "wss://game3.apac.spribegaming.com/BlueBox/websocket";
const ws = new WebSocket(AVIATOR_WS, {
  origin: "https://aviator-next.spribegaming.com",
});

ws.on("open", () => {
  console.log("✅ Connected to Aviator WebSocket");
});

ws.on("message", (msg) => {
  const base64 = msg.toString("base64");

  clients.forEach(c => c.write(`data: ${base64}\n\n`));

  console.log("📩 Aviator Message:", base64.slice(0, 50) + "...");
});

ws.on("close", () => {
  console.log("⚠️ Aviator WebSocket closed");
});

ws.on("error", (err) => {
  console.error("❌ WS Error:", err);
});

app.get("/", (req, res) => {
  res.send("✅ Aviator Proxy is running with SSE!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Proxy listening on ${PORT}`));
