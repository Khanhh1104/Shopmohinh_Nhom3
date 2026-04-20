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

// ---> ĐÂY CHÍNH LÀ HÀM BỊ THIẾU <---
export function showForgotPassword() {
    switchTab('forgot');
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

// --- TÍNH NĂNG MỚI: QUÊN MẬT KHẨU (GỬI MAIL CHO ADMIN) ---
export function handleForgotPassword() {
    const adminEmail = "nhom3@gmail.com";
    const userEmail = document.getElementById('forgot-username')?.value || "Người dùng";
    
    // Hiển thị thông báo trước
    showToast(`Vui lòng liên hệ Admin qua email: ${adminEmail}`, "error");

    // Tự động soạn thảo nội dung mail
    const subject = encodeURIComponent("Yêu cầu hỗ trợ cấp lại mật khẩu - Gundam Store");
    const body = encodeURIComponent(`Chào Admin,\n\nTôi đã quên mật khẩu cho tài khoản: ${userEmail}.\nVui lòng hỗ trợ tôi khôi phục lại mật khẩu.\n\nTrân trọng!`);

    // Mở ứng dụng mail sau 1.5 giây
    setTimeout(() => {
        window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
    }, 1500);
}

function loginSuccess(user) {
    AppState.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    showToast('Xin chào, ' + user.fullname, 'success');
    closeModal();
    if(typeof updateAuthBtn === 'function') updateAuthBtn();
}

export function logout() {
    auth.signOut().then(() => {
        AppState.currentUser = null;
        localStorage.removeItem('currentUser');
        location.reload();
    });
}

// --- QUAN TRỌNG: Đưa các hàm ra ngoài để HTML gọi được ---
window.openModal = openModal;
window.closeModal = closeModal;
window.switchTab = switchTab;
window.showForgotPassword = showForgotPassword; // <--- CẬP NHẬT Ở ĐÂY NỮA
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.handleGoogleLogin = handleGoogleLogin;
window.handleForgotPassword = handleForgotPassword;
window.logout = logout;