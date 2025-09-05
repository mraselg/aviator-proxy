const express = require("express");
const { WebSocket } = require("ws");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;
const AVIATOR_WS = "wss://game3.apac.spribegaming.com/BlueBox/websocket";

let aviatorWs;

// 🔌 Connect to Aviator
function connectAviator() {
  aviatorWs = new WebSocket(AVIATOR_WS);

  aviatorWs.on("open", () => console.log("✅ Connected to Aviator WebSocket"));
  aviatorWs.on("close", () => {
    console.log("⚠️ Aviator WebSocket closed → Reconnecting...");
    setTimeout(connectAviator, 5000);
  });
  aviatorWs.on("message", (msg) => {
    console.log("📩 From Aviator:", msg.toString());
  });
}

connectAviator();

// 📝 Receive JSON from frontend and forward → Aviator
app.post("/send", (req, res) => {
  try {
    const msg = JSON.stringify(req.body);
    aviatorWs.send(msg);
    res.json({ success: true, sent: req.body });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔍 Test Route
app.get("/", (req, res) => {
  res.send("✅ Aviator Proxy is running!");
});

app.listen(PORT, () => console.log(`🚀 Proxy listening on ${PORT}`));
