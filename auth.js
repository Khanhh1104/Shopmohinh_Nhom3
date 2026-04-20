import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile, 
    GoogleAuthProvider,    
    signInWithPopup,        
    sendPasswordResetEmail
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

// --- LOGIC ĐĂNG KÝ ---
export async function handleRegister() {
    const fullname = document.getElementById('reg-fullname')?.value;
    const email = document.getElementById('reg-email')?.value;
    const pass = document.getElementById('reg-password')?.value;

    if(!email || !pass || !fullname) {
        return showToast("Vui lòng điền đủ thông tin!", "error");
    }

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
// Sửa trong file auth.js
export async function handleLogin() {
    const email = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        // --- ĐOẠN NÀY DÙNG ĐỂ GÁN QUYỀN ADMIN ---
       
        if (user.email === 'nhom3@gmail.com') {
            loginSuccess({
                username: 'admin', 
                fullname: 'Admin Quản Trị'
            });
        } else {
            loginSuccess({
                username: user.email,
                fullname: user.displayName || user.email.split('@')[0]
            });
        }
        
    } catch (error) {
        showToast("Tài khoản hoặc mật khẩu không chính xác!", "error");
    }
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
// --- LOGIC ĐĂNG NHẬP BẰNG GOOGLE ---
export async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Đăng nhập thành công, gọi hàm loginSuccess
        loginSuccess({
            username: user.email,
            fullname: user.displayName || 'Người dùng Google'
        });
    } catch (error) {
        console.error(error);
        showToast("Lỗi đăng nhập Google: " + error.message, "error");
    }
}

// --- LOGIC QUÊN MẬT KHẨU ---
export async function handleForgotPassword() {
    const email = document.getElementById('forgot-username').value;
    
    if(!email) {
        return showToast("Vui lòng nhập email của bạn!", "error");
    }

    try {
        // Firebase sẽ tự động gửi email chứa link reset password
        await sendPasswordResetEmail(auth, email);
        showToast("Đã gửi email khôi phục! Vui lòng kiểm tra hộp thư của bạn.", "success");
        switchTab('login'); // Chuyển người dùng về lại trang đăng nhập
    } catch (error) {
        console.error(error);
        showToast("Lỗi: Không tìm thấy tài khoản hoặc email sai!", "error");
    }
}
// --- QUAN TRỌNG: Đưa các hàm ra ngoài để HTML gọi được ---
window.openModal = openModal;
window.closeModal = closeModal;
window.switchTab = switchTab;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.logout = logout;
window.handleGoogleLogin = handleGoogleLogin;
window.handleForgotPassword = handleForgotPassword;