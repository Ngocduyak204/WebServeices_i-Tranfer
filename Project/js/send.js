const socket = new WebSocket("ws://localhost:5000");

socket.onopen = () => {
  console.log("✅ WebSocket connected");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "file") {
    console.log("📩 Received encrypted file:", data);
    // Bạn có thể hiển thị thông tin, lưu file hoặc giải mã ở đây
  }
};

function base64ToPem(base64Str, type) {
  // type = "PUBLIC KEY" hoặc "PRIVATE KEY"
  const lineLength = 64;
  const lines = [];
  for (let i = 0; i < base64Str.length; i += lineLength) {
    lines.push(base64Str.substr(i, lineLength));
  }
  return `-----BEGIN ${type}-----\n${lines.join('\n')}\n-----END ${type}-----`;
}


export async function handleSend() {
  const fileInput = document.querySelectorAll("#fileInput");
  const file = fileInput[0].files[0];
  const privateKeyFile = fileInput[1].files[0];
  const email = document.querySelector("#email").value.trim();
  const senderEmail = localStorage.getItem("email");
  if(!senderEmail) {
    return alert("❌ Không tìm thấy email người gửi trong localStorage! Bạn đã đăng nhập chưa?");
  }
 
  if (!senderEmail) {
    return alert("❌ Không tìm thấy email người gửi trong localStorage! Bạn đã đăng nhập chưa?");
  }

  if (!file || !privateKeyFile || !email) {
    return alert("⚠️ Thiếu thông tin: cần file, private key và email người nhận!");
  }

  // Kiểm tra kích thước file
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return alert("❗ File quá lớn! Vui lòng chọn file nhỏ hơn 10MB.");
  }

// Lấy public key người nhận (dạng Base64, chưa có header/footer)
const pubRes = await fetch(`/api/public-key?email=${email}`);
const { publicKey: receiverPubKeyBase64 } = await pubRes.json();

// Chuyển sang PEM
const receiverPubKeyPem = base64ToPem(receiverPubKeyBase64, "PUBLIC KEY");
const receiverPublicKey = forge.pki.publicKeyFromPem(receiverPubKeyPem);

// Đọc private key người gửi (đọc file text, dạng Base64)
const privateKeyBase64 = await privateKeyFile.text();
const privateKeyPem = base64ToPem(privateKeyBase64, "PRIVATE KEY");
const senderPrivateKey = forge.pki.privateKeyFromPem(privateKeyPem);

  // Đọc và băm file
  const fileBuffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(fileBuffer);

  const md = forge.md.sha256.create();
  md.update(forge.util.createBuffer(fileBytes).getBytes());
  const signature = senderPrivateKey.sign(md);

  // Tạo AES key và IV
  const aesKey = forge.random.getBytesSync(32); // AES-256
  const iv = forge.random.getBytesSync(16);

  // Mã hóa file bằng AES-CBC
  const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(fileBytes));
  cipher.finish();
  const encryptedFile = cipher.output.getBytes(); // dạng binary string

  // Mã hóa AES key + IV bằng RSA của người nhận
  const encryptedAES = receiverPublicKey.encrypt(aesKey + iv, "RSA-OAEP");
  
  // Gửi dữ liệu
  socket.send(JSON.stringify({
  type: "file",
  filename: file.name,
  senderName: localStorage.getItem("name"),
  fileDataBase64: forge.util.encode64(encryptedFile),
  aesKeyEncrypted: forge.util.encode64(encryptedAES),
  signature: forge.util.encode64(signature),
  senderEmail: senderEmail,  
  receiverEmail: email       
  }));

  alert("✅ File đã được mã hóa và gửi!");
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("sendButton");
  btn.addEventListener("click", handleSend);
});