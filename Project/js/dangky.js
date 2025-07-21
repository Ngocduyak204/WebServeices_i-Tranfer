function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    return /^\d{10,11}$/.test(phone);
}

function showMessage(msg, color = "green") {
  // Ẩn form
  const form = document.querySelector(".form");
  if (form) form.style.display = "none";

  // Tạo hoặc lấy phần tử thông báo
  let msgDiv = document.getElementById("signup-msg");
  if (!msgDiv) {
    msgDiv = document.createElement("div");
    msgDiv.id = "signup-msg";
    document.body.appendChild(msgDiv);
  }

  // Style cho thông báo
  msgDiv.textContent = msg;
  msgDiv.style.position = "fixed";
  msgDiv.style.top = "50%";
  msgDiv.style.left = "50%";
  msgDiv.style.transform = "translate(-50%, -50%)";
  msgDiv.style.fontSize = "32px";
  msgDiv.style.fontWeight = "bold";
  msgDiv.style.color = color;
  msgDiv.style.zIndex = 9999;
  msgDiv.style.textAlign = "center";
}


function showFieldError(fieldId, message) {
    const input= document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + "-error");
    
    if (input) {
        input.value = "";
        input.placeholder = message;
        input.style.borderColor = "red";
    }
    if (errorSpan) {
        errorSpan.textContent = "";
    }
}

function clearAllFieldErrors() {
    const fields = {
        username: "Enter your username",
        email: "Enter your email",
        password: "Enter your password",
        phone: "Enter your phone number"
    };

    for (const id in fields) {
        const input = document.getElementById(id);
        const errorSpan = document.getElementById(id + "-error");
        if (input) {
        input.placeholder = fields[id];
        input.style.borderColor = "#ccc";
        }
        if (errorSpan) errorSpan.textContent = "";
    }
}

async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
    );

    const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
        publicKey: btoa(String.fromCharCode(...new Uint8Array(publicKey))),
        privateKey: btoa(String.fromCharCode(...new Uint8Array(privateKey)))
    };
}

window.handleSignup = async function () {
    clearAllFieldErrors();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!username) return showFieldError("username", "Vui lòng nhập tên người dùng.");
    if (!validateEmail(email)) return showFieldError("email", "Email không hợp lệ.");
    if (password.length < 6) return showFieldError("password", "Mật khẩu phải từ 6 ký tự trở lên.");
    if (!validatePhone(phone)) return showFieldError("phone", "Số điện thoại phải có 10-11 chữ số.");

    try {
        const { publicKey, privateKey } = await generateKeyPair();

        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, phone, publicKey })
        });

        const data = await res.json();

        if (res.ok) {
            showMessage("Đăng ký thành công!", "green");

            // Tải file chứa privateKey
            const blob = new Blob([privateKey], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `private_key_${username}.txt`;
            a.click();

            setTimeout(() => window.location.href = "dangnhap.html", 2000);
        } else {
            showMessage("Đăng ký thất bại: " + (data.message || "Lỗi không xác định"), "red");
            setTimeout(() => {
                document.querySelector(".form").style.display = "";
                document.getElementById("signup-msg").style.display = "none";
            }, 3000);
        }
    } catch (err) {
        console.error(err);
        showMessage("Không thể kết nối server!", "red");
    }
};


document.getElementById("toggle-password").onclick = function () {
  const pwd = document.getElementById("password");
  if (pwd.type === "password") {
    pwd.type = "text";
    this.textContent = "🙈";
  } else {
    pwd.type = "password";
    this.textContent = "👁️";
  }
};
