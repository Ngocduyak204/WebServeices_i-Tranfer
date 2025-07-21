const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: String,
  senderEmail: String,
   receiverEmail: String,
  encryptedAES: String,
  signature: String,
  data: String, // Dữ liệu file mã hóa (nếu không lưu file vào ổ cứng)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("File", fileSchema);

