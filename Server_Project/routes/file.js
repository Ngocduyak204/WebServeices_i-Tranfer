const express = require("express");
const File = require("../models/File");
const User = require("../models/User");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.get("/public-key", async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email });
  if (!user || !user.publicKey)
    return res.status(404).json({ message: "Không tìm thấy public key" });

  res.json({ publicKey: user.publicKey });
});

router.get('/files', async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 }); // Lấy tất cả file, mới nhất trước
    res.json(files);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách file:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách file" });
  }
});

router.get("/download/:filename", async (req, res) => {
  const filename = req.params.filename;
  console.log("📥 Download request:", filename);

  try {
    const file = await File.findOne({ filename });
    if (!file) return res.status(404).json({ message: "Không tìm thấy file" });

    const sender = await User.findOne({ email: file.senderEmail });
    if (!sender || !sender.publicKey)
      return res.status(404).json({ message: "Không tìm thấy public key người gửi" });

    res.json({
      filename: file.filename,
      encryptedData: file.data,
      encryptedAES: file.encryptedAES,
      signature: file.signature,
      senderPublicKey: sender.publicKey
    });
  } catch (err) {
    console.error("❌ Lỗi tải file:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
