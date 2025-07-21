let userEmail = "";

function showMessage(msg, color = "green") {
  // Hiển thị thông báo ngay trên .form
  let msgDiv = document.getElementById("login-msg");
  if (!msgDiv) {
    msgDiv = document.createElement("div");
    msgDiv.id = "login-msg";
    msgDiv.style.margin = "10px 0";
    msgDiv.style.fontWeight = "bold";
    document.querySelector(".form").prepend(msgDiv);

    const otpForm = document.getElementById("otp-form");
    if (otpForm && otpForm.parentNode) {
      otpForm.parentNode.insertBefore(msgDiv, otpForm);
    } else {
      document.querySelector(".form").prepend(msgDiv);
    }
  }
  msgDiv.textContent = msg;
  msgDiv.style.color = color;
  msgDiv.style.display = "block";
}


function showLoginError(fieldId, message) {
    const input= document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + "-error");
    
    if (input) {
        input.value = "";
        input.placeholder = message;
        input.style.borderColor = "red";
    }
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.style.color = "red";
    }
}

function clearAllFieldErrors() {
    const fields = {
        username: "Enter your username",        
        password: "Enter your password",
        otp: "Nhập mã OTP"        
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

async function handleLogin  () {
    clearAllFieldErrors();

    const username = document.getElementById("username").value.trim();    
    const password = document.getElementById("password").value.trim();
    
    if (!username) {
        showLoginError("username", "Vui lòng nhập tên người dùng.");
        return;
    }   
    if (password.length < 6) {
        showLoginError("password", "Mật khẩu phải từ 6 ký tự trở lên.");
        return;
    }
    
    try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      userEmail = data.email || "";   
      showMessage("OTP đã được gửi. Vui lòng kiểm tra email hoặc điện thoại.", "green");

      // Ẩn form login, hiện form nhập OTP
      document.getElementById("otp-form").classList.remove("hidden");
      if (document.querySelector(".list")) {
        document.querySelector(".list").classList.add("hidden");
      }

    } else {
      showMessage(data.error || "Đăng nhập thất bại", "red");
    }
  } catch (err) {
    showMessage("Không thể kết nối server!", "red");
  }
}

window.handleVerifyOtp = async function () {
  clearAllFieldErrors();
  const otp = document.getElementById("otp").value.trim();
  const username = document.getElementById("username").value.trim(); // Hoặc dùng email

  if (!otp) {
    showLoginError("otp", "Vui lòng nhập mã OTP.");
    return;
  }

  try {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, otp }),
    });

    const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token); 
    localStorage.setItem("email", userEmail); 
    showMessage("Xác minh thành công!", "green");

    sendTestData(); 

    setTimeout(() => {
      window.location.href = "/intro.html"; // Hoặc trang chính
    }, 2000);
  } else {
    showLoginError("otp", data.message || "Mã OTP không hợp lệ.");
  }
} catch (err) {
  showLoginError("otp", "Lỗi kết nối server.");
}
};

function sendTestData() {
  const token = localStorage.getItem("token");
  if (!token) return console.warn("Chưa có token, chưa gửi được");

  const data = { message: "Test gửi dữ liệu" };

  fetch("/api/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => console.log("Kết quả gửi:", data))
    .catch((err) => console.error("Lỗi gửi:", err));
}


// Ẩn OTP form nếu có
const msgDiv = document.getElementById("login-msg");
if (msgDiv) msgDiv.style.display = "none";
const otpForm = document.getElementById("otp-form");
if (otpForm) otpForm.classList.add("hidden");

window.onload = function () {
  const togglePwdBtn = document.getElementById("toggle-password");
  if (togglePwdBtn) {
    togglePwdBtn.onclick = function () {
      const pwd = document.getElementById("password");
      if (pwd.type === "password") {
        pwd.type = "text";
        this.textContent = "🙈";
      } else {
        pwd.type = "password";
        this.textContent = "👁️";
      }
    };
  }
};

function handleSignup() {
  // Chuyển hướng sang trang đăng ký
  window.location.href = "dangky.html";
}

function handleForgotPassword() {
  // Chuyển hướng sang trang quên mật khẩu
  window.location.href = "quenMK.html";
}