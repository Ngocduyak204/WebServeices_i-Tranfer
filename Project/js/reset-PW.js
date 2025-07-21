async function resetPassword() {
      const token = new URLSearchParams(window.location.search).get("token");
      const newPassword = document.getElementById("password").value.trim();
      const messageDiv = document.getElementById("message");

      if (!newPassword || newPassword.length < 6) {
        messageDiv.textContent = "Mật khẩu phải từ 6 ký tự trở lên.";
        messageDiv.style.color = "red";
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword })
        });

        const data = await res.json();
        messageDiv.textContent = data.message;
        messageDiv.style.color = res.ok ? "green" : "red";

        if (res.ok) {
          setTimeout(() => window.location.href = "./dangnhap.html", 3000);
        }
      } catch (err) {
        messageDiv.textContent = "Không thể kết nối máy chủ.";
        messageDiv.style.color = "red";
      }
    }

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