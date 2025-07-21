// Tạo và lưu mã OTP trong bộ nhớ tạm
const otpStore = {}; // { email: { code, expire } }

function generateOTP(email) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expire = Date.now() + 5 * 60 * 1000; // 5 phút
  otpStore[email] = { code, expire };
  return code;
}

function verifyOTP(email, inputCode) {
  const record = otpStore[email];
  if (!record) return false;
  const isValid = record.code === inputCode && Date.now() < record.expire;
  if (isValid) delete otpStore[email]; // Dùng xong thì xóa
  return isValid;
}

module.exports = { generateOTP, verifyOTP };
