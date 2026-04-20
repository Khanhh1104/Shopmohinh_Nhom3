// ==========================================
// HÀM BẢO MẬT: Băm mật khẩu (Hashing)
// ==========================================
function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

function openModal() {
    document.getElementById('login-modal').classList.add('open');
}

function closeModal() {
    document.getElementById('login-modal').classList.remove('open');
}

// Xử lý chuyển đổi giữa các Tab (Đăng nhập, Đăng ký, Quên mật khẩu)
function switchTab(tab){
    // Xóa active tất cả các tab
    document.getElementById('tab-login')?.classList.remove('active');
    document.getElementById('tab-register')?.classList.remove('active');
    
    // Thêm active cho tab được chọn
    if(tab === 'login' || tab === 'register') {
        document.getElementById('tab-' + tab).classList.add('active');
    }

    // Ẩn tất cả form
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('forgot-form').classList.add('hidden');

    // Hiện form tương ứng
    document.getElementById(tab + '-form').classList.remove('hidden');
}

// Chuyển sang giao diện Quên mật khẩu
function showForgotPassword() {
    switchTab('forgot');
    document.getElementById('tab-login').classList.remove('active'); // Tắt gạch chân tab
}

// TÍNH NĂNG MỚI: Xử lý nút Ẩn/Hiện mật khẩu (Biểu tượng con mắt)
function togglePassword(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        iconElement.innerText = '🙈'; // Đổi icon nhắm mắt
    } else {
        input.type = 'password';
        iconElement.innerText = '👁️'; // Đổi icon mở mắt
    }
}

function handleRegister(){
    const user = document.getElementById('reg-username').value.trim();
    const name = document.getElementById('reg-fullname').value.trim();
    const pass = document.getElementById('reg-password').value;

    if(!user || !pass || !name) return showToast('Vui lòng điền đủ thông tin!', 'error');
    if(pass.length < 6) return showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if(users.some(u => u.username === user) || user === 'admin') return showToast('Tên tài khoản đã tồn tại!', 'error');

    // Mã hóa mật khẩu trước khi lưu
    const hashedPassword = hashPassword(pass);
    
    users.push({username: user, fullname: name, password: hashedPassword});
    localStorage.setItem('users', JSON.stringify(users));
    
    showToast('Đăng ký thành công! Hãy đăng nhập.', 'success');
    switchTab('login');
    document.getElementById('username').value = user;
    document.getElementById('reg-password').value = '';
}

function handleLogin() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;

    if(!user || !pass) return showToast('Vui lòng nhập đủ tài khoản và mật khẩu!', 'error');

    const inputHash = hashPassword(pass);
    const adminHash = hashPassword('phungthanhdo'); 

    if(user === 'admin' && inputHash === adminHash){
        loginSuccess({username: 'admin', fullname: 'Admin Quản Trị'});
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const found = users.find(u => u.username === user && u.password === inputHash);
    
    if(found) {
        loginSuccess(found);
    } else {
        showToast('Sai tài khoản hoặc mật khẩu!', 'error');
    }
}

function loginSuccess(user){
    AppState.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    showToast('Xin chào, ' + user.fullname, 'success');
    closeModal();
    
    if(typeof updateAuthBtn === 'function') updateAuthBtn();
    
    if(user.username === 'admin'){
         const adminPanel = document.getElementById('admin-panel');
         if(adminPanel) adminPanel.classList.remove('hidden');
         if(typeof renderAdmin === 'function') renderAdmin();
    }
}

function logout(){
    AppState.currentUser = null;
    localStorage.removeItem('currentUser');
    location.reload();
}

// TÍNH NĂNG MỚI: Mô phỏng gửi lại mật khẩu
function handleForgotPassword() {
    const user = document.getElementById('forgot-username').value.trim();
    if(!user) return showToast('Vui lòng nhập tên đăng nhập!', 'error');
    
    // Báo ảo là đã gửi email
    showToast('Mã xác nhận đã được gửi về email đăng ký của bạn.', 'success');
    setTimeout(() => {
        switchTab('login');
    }, 2000);
}