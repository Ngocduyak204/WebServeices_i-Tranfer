const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed with bcrypt
  phone: { type: String, required: true, unique: true },
  publicKey: { type: String, required: true }, // RSA public key
});

module.exports = mongoose.model('User', userSchema);