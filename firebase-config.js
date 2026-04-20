// Bắt buộc phải dùng link CDN https://...
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzMqa-cVf6kXuCljDsjDrvCVA58zEZvgk",
  authDomain: "shop-mo-hinh.firebaseapp.com",
  projectId: "shop-mo-hinh",
  storageBucket: "shop-mo-hinh.firebasestorage.app",
  messagingSenderId: "970393567250",
  appId: "1:970393567250:web:81583c1666f6e513ed58cb",
  measurementId: "G-8E2LR4D20D"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Cực kỳ quan trọng: xuất (export) biến auth ra ngoài