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

// Tải danh sách file
async function loadFiles() {
  const response = await fetch("/api/files");
  const files = await response.json();

  const table = document.querySelector("table");
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);
  tbody.innerHTML = "";

  files.forEach(file => {
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = file.filename;

    const tdSender = document.createElement("td");
    tdSender.textContent = file.senderEmail;

    const tdDate = document.createElement("td");
    const createdAt = new Date(file.createdAt).toLocaleString();
    tdDate.textContent = createdAt;

    const tdAction = document.createElement("td");
    const btn = document.createElement("button");
    btn.textContent = "Download";
    btn.onclick = () => handleDownload(file.filename, file.senderEmail);
    tdAction.appendChild(btn);

    tr.appendChild(tdName);
    tr.appendChild(tdSender);
    tr.appendChild(tdDate);
    tr.appendChild(tdAction);
    tbody.appendChild(tr);
  });
}

// Xử lý tải và giải mã
async function handleDownload(filename, senderEmail) {
  const privateKeyFile = document.querySelector("#fileInput").files[0];
  if (!privateKeyFile) {
    alert("⚠️ Vui lòng chọn private key (.pem)");
    return;
  }

  const privateKeyBase64 = await privateKeyFile.text();
  const privateKeyPem = base64ToPem(privateKeyBase64.trim(), "PRIVATE KEY");

  let senderPrivateKey;
  try {
    senderPrivateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  } catch (e) {
    return alert("⚠️ Private key không hợp lệ hoặc sai định dạng PEM!");
  }

  const res = await fetch(`/api/download/${encodeURIComponent(filename)}`);
  if (!res.ok) return alert("❌ Lỗi tải file");

  const data = await res.json();

  const encryptedData = forge.util.decode64(data.encryptedData);
  const encryptedAES = forge.util.decode64(data.encryptedAES);
  const signature = forge.util.decode64(data.signature);
  const senderPublicKeyPem = base64ToPem(data.senderPublicKey, "PUBLIC KEY");
  const senderPublicKey = forge.pki.publicKeyFromPem(senderPublicKeyPem);

  // 1. Giải mã AES key
  let decrypted;

  try {
    decrypted = senderPrivateKey.decrypt(encryptedAES, 'RSA-OAEP');
  } catch (err) {
    return alert("❌ Giải mã AES key thất bại. Sai private key?");
  }

  const aesKey = decrypted.slice(0, 32);
  const iv = decrypted.slice(32, 48);

  // 2. Giải mã nội dung file
  const decipher = forge.cipher.createDecipher("AES-CBC", aesKey);
  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(encryptedData));
  const ok = decipher.finish();
  if (!ok) return alert("❌ Giải mã file thất bại");

  const plainBytes = decipher.output.getBytes();

  // 3. Băm nội dung file
  const hash = forge.md.sha256.create();
  hash.update(plainBytes);
  const computedHash = hash.digest().bytes();

  // 4. Xác minh chữ ký
  const isValid = senderPublicKey.verify(computedHash, signature);
  if (!isValid) return alert("❌ Chữ ký không hợp lệ. File có thể đã bị thay đổi hoặc giả mạo.");

  // 5. Tải file về
  const blob = new Blob([forge.util.binary.raw.decode(plainBytes)]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();

  alert("✅ File đã được xác minh và giải mã thành công");
}

// Gọi khi tải trang
window.onload = loadFiles;
