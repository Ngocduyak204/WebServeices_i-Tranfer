require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const WebSocket = require("ws");
const handleWebSocketConnection = require("./websocket/handler");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const path = require("path");
const frontendPath = path.join(__dirname, '..', 'Project');
app.use(express.static(frontendPath));

app.get('/page/dangky.html', (req, res) => {
  res.sendFile(path.join(frontendPath, 'page', 'dangky.html'));
});

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/i-Tranfer")
  .then(() => {
    console.log("✅ Kết nối MongoDB");

    // Khởi động WebSocket và routes SAU khi kết nối DB
    const handleWebSocketConnection = require("./websocket/handler");
    wss.on("connection", (ws) => handleWebSocketConnection(ws, wss));

    app.use("/api", require("./routes/auth"));
    app.use("/api", require("./routes/file"));
  })
  .catch((err) => console.error("❌ MongoDB lỗi:", err));

  mongoose.connection.once("open", () => {
  console.log("🧠 Đã kết nối DB:", mongoose.connection.name);
  });
  
// Middleware để parse JSON
app.use(express.json());

const cors = require("cors");
app.use(cors());

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});


