import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// --- CÁC HÀM GIAO DIỆN (UI) ---
export function openModal() {
    document.getElementById('login-modal').classList.add('open');
}

export function closeModal() {
    document.getElementById('login-modal').classList.remove('open');
}

export function switchTab(tab) {
    document.getElementById('tab-login')?.classList.remove('active');
    document.getElementById('tab-register')?.classList.remove('active');
    
    if(tab === 'login' || tab === 'register') {
        document.getElementById('tab-' + tab).classList.add('active');
    }

    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('forgot-form').classList.add('hidden');

    document.getElementById(tab + '-form').classList.remove('hidden');
}

export function showForgotPassword() {
    switchTab('forgot');
}

// --- HÀM CẬP NHẬT HIỂN THỊ TÊN NGƯỜI DÙNG ---
// --- HÀM CẬP NHẬT GIAO DIỆN & PHÂN QUYỀN ADMIN ---
export function updateAuthBtn() {
    const authBtnContainer = document.getElementById('auth-btn');
    const adminPanel = document.getElementById('admin-panel'); // Trỏ tới khu vực quản trị
    
    if (!authBtnContainer) return;

    if (AppState.currentUser) {
        // 1. Hiển thị tên người dùng và nút Thoát
        authBtnContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; padding: 5px 15px; border-radius: 50px; border: 1px solid #eee; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <span style="font-weight: 600; color: var(--primary); font-size: 14px;">
                    Hi, ${AppState.currentUser.fullname}
                </span>
                <button onclick="logout()" style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 12px; padding: 0; text-decoration: underline;">
                    Thoát
                </button>
            </div>
        `;

        // 2. PHÂN QUYỀN: KIỂM TRA XEM CÓ PHẢI ADMIN KHÔNG
        // Cấp quyền cho email nhom3@gmail.com hoặc tài khoản 'admin' cũ
        if (AppState.currentUser.username === 'nhom3@gmail.com' || AppState.currentUser.username === 'admin') {
            if (adminPanel) {
                adminPanel.classList.remove('hidden'); // Mở khóa khu vực quản trị
                if (typeof renderAdmin === 'function') renderAdmin(); // Tải dữ liệu sản phẩm vào bảng
            }
        } else {
            // Nếu là người dùng bình thường -> Giấu khu vực quản trị
            if (adminPanel) adminPanel.classList.add('hidden');
        }

    } else {
        // Chưa đăng nhập: Hiển thị nút mặc định và giấu khu vực quản trị
        authBtnContainer.innerHTML = `<button onclick="openModal()">👤 Đăng nhập</button>`;
        if (adminPanel) adminPanel.classList.add('hidden');
    }
}

// --- LOGIC ĐĂNG KÝ ---
export async function handleRegister() {
    const fullname = document.getElementById('reg-fullname')?.value;
    const email = document.getElementById('reg-email')?.value;
    const pass = document.getElementById('reg-password')?.value;

    if(!email || !pass || !fullname) return showToast("Vui lòng điền đủ thông tin!", "error");

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(userCredential.user, { displayName: fullname });
        showToast("Đăng ký thành công!", "success");
        switchTab('login');
    } catch (error) {
        showToast("Lỗi: " + error.message, "error");
    }
}

// --- LOGIC ĐĂNG NHẬP ---
export async function handleLogin() {
    const email = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;
        loginSuccess({
            username: user.email,
            fullname: user.displayName || user.email.split('@')[0]
        });
    } catch (error) {
        showToast("Sai tài khoản hoặc mật khẩu!", "error");
    }
}

// --- LOGIC ĐĂNG NHẬP GOOGLE ---
export async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        loginSuccess({
            username: result.user.email,
            fullname: result.user.displayName
        });
    } catch (error) {
        showToast("Lỗi Google: " + error.message, "error");
    }
}

// --- QUÊN MẬT KHẨU ---
export function handleForgotPassword() {
    const adminEmail = "nhom3@gmail.com";
    const userEmail = document.getElementById('forgot-username')?.value || "Người dùng";
    showToast(`Vui lòng liên hệ Admin qua email: ${adminEmail}`, "error");
    const subject = encodeURIComponent("Yêu cầu hỗ trợ cấp lại mật khẩu - Gundam Store");
    const body = encodeURIComponent(`Chào Admin,\n\nTôi đã quên mật khẩu cho tài khoản: ${userEmail}.\nVui lòng hỗ trợ tôi khôi phục lại mật khẩu.\n\nTrân trọng!`);
    setTimeout(() => {
        window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
    }, 1500);
}

function loginSuccess(user) {
    AppState.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    showToast('Xin chào, ' + user.fullname, 'success');
    closeModal();
    updateAuthBtn(); // Cập nhật giao diện ngay lập tức
}

export function logout() {
    auth.signOut().then(() => {
        AppState.currentUser = null;
        localStorage.removeItem('currentUser');
        location.reload();
    });
}

// --- XUẤT HÀM RA NGOÀI CỬA SỔ TRÌNH DUYỆT ---
window.openModal = openModal;
window.closeModal = closeModal;
window.switchTab = switchTab;
window.showForgotPassword = showForgotPassword;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.handleGoogleLogin = handleGoogleLogin;
window.handleForgotPassword = handleForgotPassword;
window.logout = logout;
window.updateAuthBtn = updateAuthBtn;

// Tự động kiểm tra và hiển thị khi vừa mở web
updateAuthBtn();