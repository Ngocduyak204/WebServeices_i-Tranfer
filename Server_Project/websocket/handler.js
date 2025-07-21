const fs = require("fs");
const path = require("path");
const File = require("../models/File");

module.exports = function handleWebSocketConnection(ws, wss) {
  console.log("🔗 WebSocket client connected");

  ws.on("message", (message) => {
    console.log("📨 Message received:", message);
    try {
      const data = JSON.parse(message);

      if (data.type === "file") {
        const { filename, fileDataBase64 } = data;

        if (filename && fileDataBase64) {
          const buffer = Buffer.from(fileDataBase64, "base64");
          const filePath = path.join(__dirname, "..", "uploads", filename);

          (async () => {
            try {
              // Ghi file
              await fs.promises.writeFile(filePath, buffer);
              console.log("📁 File đã được lưu:", filename);

              // Lưu MongoDB
              console.log("🚀 Bắt đầu lưu vào MongoDB");
              await File.create({
                filename,
                senderEmail: data.senderEmail,
                receiverEmail: data.receiverEmail,
                encryptedAES: data.aesKeyEncrypted, 
                signature: data.signature,
                data: data.fileDataBase64,
                createdAt: new Date()
              });
              console.log("✅ File đã được lưu vào MongoDB:", filename);
            } catch (err) {
              console.error("❌ Lỗi khi lưu file hoặc MongoDB:", err);
            }
          })();
        }


        // Broadcast tới các client khác (nếu cần)
        // wss.clients.forEach((client) => {
        //   if (client !== ws && client.readyState === ws.OPEN) {
        //     client.send(JSON.stringify(data));
        //   }
        // });
      }

    } catch (error) {
      console.error("❌ WebSocket error:", error);
    }
  });

  ws.on("close", () => {
    console.log("🔌 WebSocket client disconnected");
  });
};
