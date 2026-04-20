// ==========================================
// 1. CÔNG CỤ BẢO MẬT & HIỆU NĂNG
// ==========================================
function escapeHTML(str) {
    if(typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}

let searchTimeout;
function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        AppState.currentPage = 1;
        render(); 
    }, 300);
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if(!container) return alert(msg);
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// TÍNH NĂNG MỚI: Hiển thị nút cuộn lên đầu trang khi kéo xuống sâu
window.onscroll = function() {
    const backToTopBtn = document.getElementById('backToTop');
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
};

// ==========================================
// 2. GIAO DIỆN CHUNG & RESPONSIVE
// ==========================================

// TÍNH NĂNG MỚI: Mở/Đóng Menu trên điện thoại
function toggleMobileMenu() {
    const nav = document.getElementById('main-nav');
    nav.classList.toggle('open');
}

function updateAuthBtn(){
    const area = document.getElementById('auth-btn');
    if(AppState.currentUser){
        area.innerHTML = `<span style="font-weight:bold; margin-right:10px; display:none; @media(min-width:768px){display:inline;}">Hi, ${escapeHTML(AppState.currentUser.fullname)}</span> 
        <button onclick="logout()">Thoát</button>`;
        if(AppState.currentUser.username === 'admin') {
             const adminPanel = document.getElementById('admin-panel');
             if(adminPanel) adminPanel.classList.remove('hidden');
             if(typeof renderAdmin === 'function') renderAdmin();
        }
    } else {
        area.innerHTML = `<button onclick="openModal()">👤 Đăng nhập</button>`;
    }
}

function applySiteConfig() {
    if(!AppState.siteConfig) return;
    document.documentElement.style.setProperty('--primary', AppState.siteConfig.primaryColor);
    document.body.style.background = AppState.siteConfig.bgStyle.includes('http') 
        ? `url('${AppState.siteConfig.bgStyle}') no-repeat center center fixed` 
        : AppState.siteConfig.bgStyle;
    document.body.style.backgroundSize = 'cover';
    renderBanners();
}

function renderBanners() {
    const container = document.getElementById('home-banner');
    if(!container) return;
    if(!AppState.siteConfig.banners || AppState.siteConfig.banners.length === 0) {
        return container.classList.remove('has-images');
    }
    
    container.classList.add('has-images');
    let slidesHtml = '', dotsHtml = '';
    
    AppState.siteConfig.banners.forEach((src, idx) => {
        slidesHtml += `<img src="${escapeHTML(src)}" class="banner-slide ${idx===0?'active':''}">`;
        dotsHtml += `<div class="banner-dot ${idx===0?'active':''}" onclick="goToBanner(${idx})"></div>`;
    });

    container.innerHTML = `${slidesHtml}
        <button class="banner-btn banner-prev" onclick="nextBanner(-1)">&#10094;</button>
        <button class="banner-btn banner-next" onclick="nextBanner(1)">&#10095;</button>
        <div class="banner-nav">${dotsHtml}</div>`;

    clearInterval(AppState.bannerInterval);
    AppState.bannerInterval = setInterval(() => nextBanner(1), 5000);
}

function nextBanner(dir) {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.banner-dot');
    if(!slides.length) return;
    
    slides[AppState.currentBanner].classList.remove('active');
    if(dots[AppState.currentBanner]) dots[AppState.currentBanner].classList.remove('active');
    
    AppState.currentBanner += dir;
    if(AppState.currentBanner >= slides.length) AppState.currentBanner = 0;
    if(AppState.currentBanner < 0) AppState.currentBanner = slides.length - 1;

    slides[AppState.currentBanner].classList.add('active');
    if(dots[AppState.currentBanner]) dots[AppState.currentBanner].classList.add('active');
}

function goToBanner(idx) {
    const slides = document.querySelectorAll('.banner-slide');
    if(!slides.length) return;
    document.querySelector('.banner-slide.active')?.classList.remove('active');
    document.querySelector('.banner-dot.active')?.classList.remove('active');
    AppState.currentBanner = idx;
    document.querySelectorAll('.banner-slide')[AppState.currentBanner].classList.add('active');
    document.querySelectorAll('.banner-dot')[AppState.currentBanner].classList.add('active');
    clearInterval(AppState.bannerInterval);
    AppState.bannerInterval = setInterval(() => nextBanner(1), 5000);
}

// ==========================================
// 3. RENDER SẢN PHẨM, LỌC & SẮP XẾP
// ==========================================
function render(){
    if(typeof updateCartCount === 'function') updateCartCount();
    
    if(location.hash.startsWith('#product-')) return showDetail();
    if(location.hash === '#cart' && typeof showCart === 'function') return showCart();

    document.getElementById('product-list').classList.remove('hidden');
    document.getElementById('pagination').classList.remove('hidden');
    document.getElementById('intro-panel').classList.add('hidden');

    const bannerDiv = document.getElementById('home-banner');
    const toolbarDiv = document.getElementById('toolbar');
    const categoryVal = document.getElementById('category').value;
    const searchVal = document.getElementById('search').value;
    const sortVal = document.getElementById('sort') ? document.getElementById('sort').value : 'default';
    
    // Ẩn/Hiện Banner và Toolbar tương ứng
    const isHome = categoryVal === 'all' && searchVal === '';
    if(bannerDiv) bannerDiv.style.display = isHome ? 'block' : 'none';
    if(toolbarDiv) toolbarDiv.style.display = 'flex'; // Luôn hiện thanh toolbar ở trang danh sách
    
    document.getElementById('detail').innerHTML = '';

    // 1. Lọc theo tên và danh mục
    const search = searchVal.toLowerCase();
    let filtered = AppState.products.filter(p => p.name.toLowerCase().includes(search));
    if(categoryVal !== 'all') filtered = filtered.filter(p => p.category === categoryVal);

    // 2. TÍNH NĂNG MỚI: Sắp xếp danh sách sản phẩm theo giá
    if(sortVal === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price); // Giá: Thấp -> Cao
    } else if (sortVal === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price); // Giá: Cao -> Thấp
    }

    const totalPages = Math.ceil(filtered.length / AppState.perPage) || 1;
    if(AppState.currentPage > totalPages) AppState.currentPage = 1;
    
    const start = (AppState.currentPage - 1) * AppState.perPage;
    const pageItems = filtered.slice(start, start + AppState.perPage);

    const container = document.getElementById('product-list');
    container.innerHTML = '';
    
    if(pageItems.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; padding:20px; font-size:16px;">Không tìm thấy sản phẩm nào.</p>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    pageItems.forEach(p => {
        const safeName = escapeHTML(p.name);
        const mainImg = escapeHTML(Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.image || p.images || 'https://via.placeholder.com/300'));
        let priceHtml = `<span class="price">${p.price.toLocaleString()} ₫</span>`;
        let badgeHtml = '';
        let btnHtml = `<button onclick="addToCart(${p.id})">THÊM VÀO GIỎ</button>`;

        if(p.originalPrice > p.price) {
            priceHtml = `<span class="price">${p.price.toLocaleString()} ₫ <span class="old-price">${p.originalPrice.toLocaleString()} ₫</span></span>`;
            badgeHtml += `<div class="sale-badge">Giảm ${Math.round((1 - p.price/p.originalPrice)*100)}%</div>`;
        }
        if(p.status === 'preorder') {
            badgeHtml += `<div class="preorder-badge">ĐẶT TRƯỚC</div>`;
            btnHtml = `<button onclick="addToCart(${p.id})" style="border-color:#2563eb; color:#2563eb">ĐẶT TRƯỚC</button>`;
        } else if(p.stock <= 0) {
            btnHtml = `<button disabled>HẾT HÀNG</button>`;
        }

        container.innerHTML += `
        <div class="card">
            ${badgeHtml}
            <a href="#product-${p.id}"><img src="${mainImg}" loading="lazy" alt="${safeName}"></a>
            <div class="card-content">
                <h3 style="font-size: 16px; margin-bottom:10px;"><a href="#product-${p.id}" style="color:var(--dark); text-decoration:none">${safeName}</a></h3>
                ${priceHtml}
                <div class="card-actions" style="margin-top:10px;">${btnHtml}</div>
            </div>
        </div>`;
    });

    let pag = '';
    for(let i=1; i<=totalPages; i++){
        // Khi chuyển trang, tự động cuộn lên đầu màn hình
        pag += `<button class="${AppState.currentPage === i ? 'active' : ''}" onclick="AppState.currentPage=${i}; window.scrollTo({top: 0, behavior: 'smooth'}); render()">${i}</button>`;
    }
    document.getElementById('pagination').innerHTML = pag;
}

// ==========================================
// 4. CHI TIẾT SẢN PHẨM & GALLERY
// ==========================================
function showDetail(){
    const id = parseInt(location.hash.replace('#product-',''));
    const p = AppState.products.find(x => x.id === id);
    if(!p) { location.hash = ''; return; }
    
    document.getElementById('product-list').classList.add('hidden');
    document.getElementById('pagination').classList.add('hidden');
    if(document.getElementById('home-banner')) document.getElementById('home-banner').style.display = 'none';
    if(document.getElementById('toolbar')) document.getElementById('toolbar').style.display = 'none'; // Ẩn toolbar khi xem chi tiết
    document.getElementById('intro-panel').classList.add('hidden');

    const safeName = escapeHTML(p.name);
    const safeDesc = escapeHTML(p.desc);
    
    let imgList = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
    if(imgList.length === 0) imgList = ['https://via.placeholder.com/400'];
    
    AppState.currentGalleryImages = imgList;
    AppState.currentGalleryIndex = 0;

    let thumbs = '';
    imgList.forEach((img, index) => {
        thumbs += `<img src="${escapeHTML(img)}" class="thumb-item ${index===0?'active':''}" onclick="changeMedia(this, '${escapeHTML(img)}', 'image')">`;
    });
    if(p.video) {
        thumbs += `<div class="thumb-item thumb-video" onclick="changeMedia(this, '${escapeHTML(p.video)}', 'video')"><img src="https://img.youtube.com/vi/${escapeHTML(p.video)}/0.jpg" style="width:100%;height:100%;object-fit:cover;"></div>`;
    }

    let stockStatus = p.stock > 0 ? `<span style="color:green; font-weight:bold">Còn ${p.stock} sản phẩm</span>` : (p.status === 'preorder' ? `<span style="color:#2563eb; font-weight:bold">Hàng đặt trước</span>` : `<span style="color:red; font-weight:bold">Hết hàng</span>`);
    let detailPriceHtml = `${p.price.toLocaleString()} ₫`;
    if(p.originalPrice > p.price) {
        detailPriceHtml = `${p.price.toLocaleString()} ₫ <span style="text-decoration:line-through; color:#999; font-size:0.6em">${p.originalPrice.toLocaleString()} ₫</span>`;
    }

    let mainBtnHtml = `<button class="btn-submit" onclick="addToCart(${p.id})" style="background: #f59e0b; padding: 12px 20px;">🛒 Thêm vào giỏ</button>
                       <button class="btn-submit" onclick="buyNow(${p.id})" style="padding: 12px 20px;">🔥 Mua ngay</button>`;
    if (p.status === 'preorder') {
        mainBtnHtml = `<button class="btn-submit" onclick="addToCart(${p.id})" style="background: #2563eb; padding: 12px 20px;">📅 Đặt trước ngay</button>`;
    } else if (p.stock <= 0) {
        mainBtnHtml = `<button class="btn-submit" disabled style="background: #ccc; cursor:not-allowed; padding: 12px 20px;">🚫 Hết hàng</button>`;
    }

    let detailHtml = `
    <div class="card" style="padding: 30px; max-width: 1000px; margin: 0 auto; border: none; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-radius:10px;">
        <div style="display: flex; gap: 40px; flex-wrap: wrap;">
            
            <div class="gallery-container" style="max-width: 450px; flex: 1;">
                <div id="main-media-view" class="main-media" onmousemove="zoomImage(event)" onmouseleave="resetZoom(event)">
                    <div class="nav-arrow prev" onclick="navigateGallery(-1)">&#10094;</div>
                    <img src="${escapeHTML(imgList[0])}" id="main-img">
                    <div class="nav-arrow next" onclick="navigateGallery(1)">&#10095;</div>
                </div>
                <div class="thumb-list" style="margin-top:15px">${thumbs}</div>
            </div>

            <div style="flex: 1; min-width: 300px;">
                <h2 style="color: #0f172a; margin-top: 0; font-size:28px">${safeName}</h2>
                <p style="font-size:15px; color:#666"><strong>Mã SP:</strong> #${p.id} | <strong>Cấp độ:</strong> <span style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px; color:#333">${escapeHTML(p.category)}</span></p>
                <p style="font-size:15px;"><strong>Tình trạng:</strong> ${stockStatus}</p>
                <div class="price" style="font-size: 2.2em; margin: 20px 0; color: var(--primary);">${detailPriceHtml}</div>
                <div style="line-height: 1.6; background:#f8fafc; padding:15px; border-radius:6px; font-size:14px; border:1px solid #eee">
                    <strong>Thông tin mô tả:</strong><br><br>${safeDesc.replace(/\n/g, '<br>')}
                </div>
                
                <div style="margin-top: 30px; display: flex; gap: 10px; flex-wrap: wrap;">
                    ${mainBtnHtml}
                    <button class="btn-submit" onclick="location.hash=''" style="background: #64748b; width:auto; padding: 12px 20px;">⬅ Quay lại</button>
                </div>
            </div>
        </div>
    </div>`;

    const suggested = AppState.products.filter(prod => prod.category === p.category && prod.id !== p.id).slice(0, 4);
    if (suggested.length > 0) {
        detailHtml += `<div style="max-width: 1000px; margin: 40px auto 0;">
            <h3 style="border-bottom: 2px solid var(--primary); padding-bottom: 10px; margin-bottom: 20px; text-transform: uppercase;">Sản phẩm liên quan</h3>
            <div class="grid">`;
        suggested.forEach(s => {
            const sImg = escapeHTML(Array.isArray(s.images) && s.images.length > 0 ? s.images[0] : (s.image || s.images || ''));
            detailHtml += `
            <div class="card">
                <a href="#product-${s.id}"><img src="${sImg}"></a>
                <div class="card-content">
                    <h3 style="font-size:14px; height: 35px; overflow:hidden"><a href="#product-${s.id}" style="color:var(--dark); text-decoration:none">${escapeHTML(s.name)}</a></h3>
                    <span class="price">${s.price.toLocaleString()} ₫</span>
                    <div class="card-actions" style="margin-top:10px"><button onclick="addToCart(${s.id})">THÊM VÀO GIỎ</button></div>
                </div>
            </div>`;
        });
        detailHtml += `</div></div>`;
    }
    document.getElementById('detail').innerHTML = detailHtml;
}

function zoomImage(e) {
    const container = e.currentTarget;
    const img = container.querySelector('img');
    if(!img) return; 
    const xPercent = (e.offsetX / container.offsetWidth) * 100;
    const yPercent = (e.offsetY / container.offsetHeight) * 100;
    img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
}

function resetZoom(e) {
    const img = e.currentTarget.querySelector('img');
    if(img) img.style.transformOrigin = "center center";
}

function navigateGallery(direction) {
    AppState.currentGalleryIndex += direction;
    if (AppState.currentGalleryIndex >= AppState.currentGalleryImages.length) AppState.currentGalleryIndex = 0;
    if (AppState.currentGalleryIndex < 0) AppState.currentGalleryIndex = AppState.currentGalleryImages.length - 1;

    const newSrc = AppState.currentGalleryImages[AppState.currentGalleryIndex];
    const view = document.getElementById('main-media-view');
    view.innerHTML = `
        <div class="nav-arrow prev" onclick="navigateGallery(-1)">&#10094;</div>
        <img src="${escapeHTML(newSrc)}" id="main-img" style="animation:fadeIn 0.3s">
        <div class="nav-arrow next" onclick="navigateGallery(1)">&#10095;</div>
    `;
    document.querySelectorAll('.thumb-item').forEach((item, index) => {
        item.classList.toggle('active', index === AppState.currentGalleryIndex);
    });
}

function changeMedia(el, src, type) {
    document.querySelectorAll('.thumb-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');

    if (type === 'image') {
        AppState.currentGalleryIndex = AppState.currentGalleryImages.indexOf(src);
    }

    const view = document.getElementById('main-media-view');
    if(type === 'image') {
        view.innerHTML = `
            <div class="nav-arrow prev" onclick="navigateGallery(-1)">&#10094;</div>
            <img src="${escapeHTML(src)}" style="width:100%;height:100%;object-fit:contain;animation:fadeIn 0.3s">
            <div class="nav-arrow next" onclick="navigateGallery(1)">&#10095;</div>
        `;
    } else if (type === 'video') {
        view.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${escapeHTML(src)}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
}

// ==========================================
// 5. ĐIỀU HƯỚNG TỪ MENU
// ==========================================
function showIntro(element) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if(element) element.classList.add('active');

    document.getElementById('product-list').classList.add('hidden');
    document.getElementById('pagination').classList.add('hidden');
    document.getElementById('detail').innerHTML = '';
    if(document.getElementById('home-banner')) document.getElementById('home-banner').style.display = 'none';
    if(document.getElementById('toolbar')) document.getElementById('toolbar').style.display = 'none'; // Ẩn toolbar
    document.getElementById('intro-panel').classList.remove('hidden');
    
    // Đóng menu mobile nếu đang mở
    document.getElementById('main-nav').classList.remove('open');
}

function selectCategory(cat, element) {
    document.getElementById('category').value = cat;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if(element) element.classList.add('active');

    // Reset bộ lọc sắp xếp về mặc định khi chuyển danh mục
    if(document.getElementById('sort')) document.getElementById('sort').value = 'default';

    if(location.hash !== '') {
        location.hash = ''; 
    } else {
        render(); 
    }
    
    // Đóng menu mobile nếu đang mở
    document.getElementById('main-nav').classList.remove('open');
}

// ==========================================
// 6. KHỞI CHẠY KHI TẢI TRANG
// ==========================================
window.onhashchange = render;
updateAuthBtn();
applySiteConfig();
render();
// ==========================================
// HÀM ẨN / HIỆN MẬT KHẨU (CON MẮT)
// ==========================================
function togglePassword(inputId, iconElement) {
    const input = document.getElementById(inputId);
    
    // Nếu đang là password (bị ẩn) -> Chuyển thành text (hiện)
    if (input.type === 'password') {
        input.type = 'text';
        iconElement.innerText = '🙈'; // Đổi icon thành mắt nhắm
    } 
    // Nếu đang là text (hiện) -> Chuyển lại thành password (ẩn)
    else {
        input.type = 'password';
        iconElement.innerText = '👁️'; // Đổi icon thành mắt mở
    }
}

// Mở khóa hàm ra toàn cục (đề phòng file main.js bị đóng gói)
window.togglePassword = togglePassword;