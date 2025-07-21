const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const otpUtil = require("../utils/otp"); 
const authMiddleware = require("../middleware/authMiddleware"); // Giả sử bạn đã tạo middleware này
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; 
const otpStore={};

// Đăng ký
router.post("/register", async (req, res) => {
    console.log("Dữ liệu nhận được từ frontend:", req.body); // <== Thêm dòng này
    const { username, email, password, phone, publicKey } = req.body;

  // Kiểm tra thiếu field
  if (!username || !email || !password || !phone || !publicKey) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
  }

  try {
    // Kiểm tra trùng username, email, hoặc phone
    const existingUser = await User.findOne({ 
      $or: [ { username }, { email }, { phone } ]
    });

    if (existingUser) {
      return res.status(400).json({ message: "Tài khoản đã tồn tại" });
    }

    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hash, phone, publicKey });

    res.status(200).json({ message: "Đăng ký thành công" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});


// Đăng nhập
router.post("/login", async (req, res) => {
    console.log("Dữ liệu nhận được từ frontend:", req.body); // <== Thêm dòng này
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({ error: "Tên người dùng không tồn tại" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Mật khẩu không đúng" });
  }

  // Tạo và log OTP lên console
  const otp = otpUtil.generateOTP(user.email || user.phone);
  otpStore[user.username] = otp; // Lưu OTP vào bộ nhớ tạm
  console.log(`OTP cho ${user.email || user.phone}: ${otp}`);

  return res.json({ message: "Đăng nhập thành công. Đã tạo OTP.", email: user.email });
});

router.post("/verify-otp", async(req, res) => {
  const { username, otp } = req.body;

  if (!otp || !username) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }

  const savedOtp = otpStore[username];
  if (otp === savedOtp) {
    // Xác minh thành công
    delete otpStore[username]; // Xóa sau khi dùng

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({ message: "OTP hợp lệ", token });
  } else {
    return res.status(400).json({ message: "Mã OTP không đúng" });
  }
});

router.post("/send", authMiddleware, (req, res) => {
  const { message } = req.body;
  console.log("📩 Dữ liệu từ frontend gửi lên:", message);

  res.status(200).json({ message: "Đã nhận dữ liệu từ frontend", received: message });
});


// --- Quên mật khẩu ---
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Vui lòng nhập email." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại." });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `http://localhost:5000/page/reset-password.html?token=${token}`;

    // Thực tế: gửi email bằng nodemailer
    console.log(`Link đặt lại mật khẩu cho ${email}: ${resetLink}`);

    res.status(200).json({ message: "Đã tạo link đặt lại mật khẩu." });
  } catch (error) {
    console.error("Lỗi forgot-password:", error);
    res.status(500).json({ message: "Không thể xử lý yêu cầu." });
  }
});

// --- Đặt lại mật khẩu ---
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Thiếu token hoặc mật khẩu mới." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Đặt lại mật khẩu thành công." });
  } catch (error) {
    console.error("Lỗi reset-password:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Link đặt lại mật khẩu đã hết hạn." });
    }
    res.status(500).json({ message: "Không thể đặt lại mật khẩu." });
  }
});

module.exports = router;
