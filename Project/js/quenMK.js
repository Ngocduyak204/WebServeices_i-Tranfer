function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showMessage(msg, color = "green") {
  // Hiện thông báo
  let msgDiv = document.getElementById("reset-msg");
  if (!msgDiv) {
    msgDiv = document.createElement("div");
    msgDiv.id = "reset-msg";
    msgDiv.style.margin = "10px 0";
    msgDiv.style.fontWeight = "bold";
    document.querySelector(".form").prepend(msgDiv);

    const resetFom = document.getElementById("reset-msg");
    if (resetForm && resetForm.parentNode) {
      resetForm.parentNode.insertBefore(msgDiv, resetForm);
    } else {
      document.querySelector(".form").prepend(msgDiv);
    }

  }
  msgDiv.textContent = msg;
  msgDiv.style.color = color;
  msgDiv.style.display = "block";
}

function showResetError(fieldid,message) {
    const input= document.getElementById(fieldid);
    const errorSpan = document.getElementById(fieldid + "-error");

    if (input) {
        input.value = "";
        input.placeholder = message;
        input.style.borderColor = "red";
    }
}

function clearAllFieldErrors() {
  const fields = {
    email: "Email"
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

window.handleResetPassword = async function () {
  clearAllFieldErrors();
  // Lấy giá trị email từ input
  const email = document.getElementById("email").value.trim();

  if (!email) {
      showResetError("email","Vui lòng nhập email của bạn");
      return;
  }
  if (!validateEmail(email)) {
      showResetError("email","Email không hợp lệ");
      return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
    });

    const result = await response.json();

    if (response.ok) {
      showMessage("Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến.", "green");
      setTimeout(() => {
        window.location.href = "dangnhap.html";
      }, 3000);
    } else {
      showMessage(result.message || "Có lỗi xảy ra khi gửi yêu cầu.", "red");
    }
  } catch (error) {
    console.error("Lỗi khi gửi yêu cầu:", error);
    showMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.", "red");
  }
    
};