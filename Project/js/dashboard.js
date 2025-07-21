(function () {
  // 1. Khởi tạo thông tin đường dẫn theo tiêu đề trang
  const pageTitle = document.title.trim().toLowerCase();
  const isHome = pageTitle === "trang chủ" || pageTitle === "intro";
  const path = isHome ? "page" : ".";
  const path_index = isHome ? "." : "..";
  const path_img = isHome ? "." : "..";

  // 2. Lấy dữ liệu đăng nhập từ localStorage
  function getCredentials() {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    return username && password ? { username, password } : { username: "", password: "" };
  }

  // 3. Dựng header
  function renderHeader() {
    const header = document.querySelector("header");
    if (!header) return;
    
    header.innerHTML = `
      <img src="${path_img}/assets/logo-iTranfer.png" alt="Logo" class="header__logo">
      <h1 class="header__title">i - Tranfer</h1>
      <ul class="header__links">
        <li><a class="header__link" href="${path_index}/intro.html">TRANG CHỦ</a></li>
        <li><a class="header__link" href="${path}/dangky.html">ĐĂNG KÝ</a></li>
        <li><a class="header__link" href="${path}/send.html">Send File</a></li>
        <li><a class="header__link" href="${path}/receive.html">Receive File</a></li>
        <li><a class="header__link" href="${path}/info.html">VỀ TÔI</a></li>
      </ul>
      <div class="header__wrapper">
        <!--<p class="header__btn-desc">CHỈ DÀNH CHO ADMIN</p>--!>
        <button id="login-btn" class="header__btn" onclick="handleLogin()">Đăng nhập</button>
      </div>
    `;

    if (pageTitle === "Đăng nhập") {
      const headerWrapper = document.querySelector(".header__wrapper");
      headerWrapper && headerWrapper.remove();
    }

    highlightActiveLink();
    updateLoginButton();
  }

  // 4. Dựng footer
  function renderFooter() {
    const footer = document.querySelector("footer");
    footer.innerHTML = `
      <div class="footer__main">
        <div class="footer__logo">
        <img src="${path_img}/assets/logo-iTranfer.png" alt="Logo">
        </div>
        <div class="footer__desc">
        <p class="footer__copyright">Bản quyền © 2024-2025 Ngoc Duy</p>
        </div>
      </div>

      <!--
        <div class="footer__pages">
          <h2><a class="footer__heading" href="${path_index}/intro.html">Trang chủ</a></h2>
          <h2><a class="footer__heading" href="${path}/info.html">Về tôi</a></h2>
        </div>
        <div class="footer__services">
          <h2 class="footer__heading">Dịch vụ</h2>
          <a href="${path}/send.html" class="footer__service">
            <img src="${path_img}/assets/send.svg" alt="">
            <p class="footer__desc">Gửi file</p>
          </a>
          <a href="${path}/receiver.html" class="footer__service">
            <img src="${path_img}/assets/receive.svg" alt="">
            <p class="footer__desc">Nhận file</p>
          </a>
        </div>
        <div class="footer__socials">
          <h2 class="footer__heading">Liên hệ</h2>
          <div class="footer__group">
            <a href="https://www.facebook.com/ngocduy204" class="footer__social" target="_blank">
              <img src="${path_img}/assets/facebook.svg" alt="Facebook">
              <p class="footer__desc">Facebook</p>
            </a>
            <a href="https://www.youtube.com/@duyhonguyenngoc7706" class="footer__social" target="_blank">
              <img src="${path_img}/assets/youtube.svg" alt="Youtube">
              <p class="footer__desc">Youtube</p>
            </a>
            <a href="tel:012345678" class="footer__social" target="_blank">
              <img src="${path_img}/assets/phone.svg" alt="Phone">
              <p class="footer__desc">012345678</p>
            </a>
            <a href="mailto:itranfer_nd@gmail.com" class="footer__social" target="_blank">
              <img src="${path_img}/assets/mail.svg" alt="Mail">
              <p class="footer__desc">itranfer_nd@gmail.com</p>
            </a>
          </div>
        </div>
      --/>
    `;
  }

  // 5. Tô sáng link tương ứng với trang hiện tại
  function highlightActiveLink() {
    const links = document.querySelectorAll(".header__link");
    links.forEach(link => {
      if (link.innerText.toLowerCase() === pageTitle.toLowerCase()) {
        link.classList.add("header__link-active");
      }
    });
  }

    // 6. Xử lý nút đăng nhập / đăng xuất ===
  function updateLoginButton() {
    const token = localStorage.getItem("token");
    const loginBtn = document.getElementById("login-btn");

    if (!loginBtn) return;

    if (token) {
      loginBtn.textContent = "Đăng xuất";
      loginBtn.onclick = () => {
        localStorage.removeItem("token");
        loginBtn.textContent = "Đăng nhập";
        loginBtn.onclick = () => {
          window.location.href = "/page/dangnhap.html";
        };
        window.location.reload(); // Reload trang sau logout
      };
    } else {
      loginBtn.textContent = "Đăng nhập";
      loginBtn.onclick = () => {
        window.location.href = "/page/dangnhap.html";
      };
    }
  }

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  updateLoginButton();
});

})();
  

//  Xử lý sự kiện cho nút "Get Started" và "Learn More"
  function handleGetStarted() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn) {
      handleLogout();
    } 

    if (isLoggedIn === "true") {
      // Nếu đã đăng nhập -> chuyển hướng đến dashboard
      window.location.href = "page/send.html";
    } else {
      // Nếu chưa đăng nhập -> chuyển hướng đến trang đăng nhập
      window.location.href = "page/dangnhap.html";
    }
  }

  function handleLearnMore() {
  // Chuyển hướng đến trang giới thiệu thêm
  window.location.href = "page/info.html";
  }
