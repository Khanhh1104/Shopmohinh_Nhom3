// ==========================================
// 1. QUẢN LÝ SẢN PHẨM
// ==========================================
function saveProduct(){
    const nameInput = document.getElementById('name').value.trim();
    const priceInput = parseInt(document.getElementById('price').value);

    // Validate (Kiểm tra lỗi nhập liệu)
    if(!nameInput || isNaN(priceInput)) {
        return showToast('Vui lòng nhập Tên và Giá bán hợp lệ!', 'error');
    }

    const idx = document.getElementById('editIndex').value;
    const newP = {
        id: idx === '' ? Date.now() : AppState.products[idx].id,
        name: nameInput,
        category: document.getElementById('cat').value,
        price: priceInput,
        originalPrice: parseInt(document.getElementById('originalPrice').value) || 0,
        stock: parseInt(document.getElementById('stock').value) || 0,
        status: document.getElementById('status').value,
        images: document.getElementById('images').value.split('\n').filter(x => x.trim() !== ''),
        video: document.getElementById('video').value.trim(),
        desc: document.getElementById('desc').value.trim()
    };
    
    if(idx === '') {
        AppState.products.push(newP);
        showToast('Đã thêm sản phẩm mới!', 'success');
    } else {
        AppState.products[idx] = newP;
        showToast('Đã cập nhật sản phẩm!', 'success');
    }
    
    localStorage.setItem('products', JSON.stringify(AppState.products));
    
    // Reset Form (Làm trống các ô nhập liệu sau khi lưu)
    clearAdminForm();
    if(typeof render === 'function') render();
    renderAdmin();
}

function clearAdminForm() {
    document.getElementById('editIndex').value = '';
    document.getElementById('name').value = '';
    document.getElementById('price').value = '';
    document.getElementById('originalPrice').value = '';
    document.getElementById('stock').value = '';
    document.getElementById('status').value = 'available';
    document.getElementById('images').value = '';
    document.getElementById('video').value = '';
    document.getElementById('desc').value = '';
}

function renderAdmin(){
    let html = '<div style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">';
    
    AppState.products.forEach((p, i) => {
        const mainImg = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/50';
        html += `
        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(255,255,255,0.1); transition: 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
            <img src="${escapeHTML(mainImg)}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
            <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${escapeHTML(p.name)}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.5);">${p.category} | Kho: ${p.stock}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: var(--primary); font-size: 14px; margin-bottom: 4px;">${p.price.toLocaleString()}₫</div>
                <div style="display: flex; gap: 6px; justify-content: flex-end;">
                    <button onclick="edit(${i})" style="width: 32px; height: 32px; border-radius: 8px; border: none; background: #f59e0b; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;" title="Sửa">✎</button>
                    <button onclick="del(${i})" style="width: 32px; height: 32px; border-radius: 8px; border: none; background: #ef4444; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;" title="Xóa">🗑</button>
                </div>
            </div>
        </div>`;
    });
    
    if (AppState.products.length === 0) html = '<p style="text-align:center; color:rgba(255,255,255,0.5); padding:20px;">Chưa có sản phẩm nào.</p>';
    html += '</div>';
    document.getElementById('admin-list').innerHTML = html;
}

function edit(i){
    const p = AppState.products[i];
    document.getElementById('editIndex').value = i;
    document.getElementById('name').value = p.name;
    document.getElementById('cat').value = p.category;
    document.getElementById('price').value = p.price;
    document.getElementById('originalPrice').value = p.originalPrice || '';
    document.getElementById('stock').value = p.stock || 0;
    document.getElementById('status').value = p.status || 'available';
    document.getElementById('images').value = Array.isArray(p.images) ? p.images.join('\n') : (p.image || p.images || '');
    document.getElementById('video').value = p.video || '';
    document.getElementById('desc').value = p.desc;
    
    // Cuộn lên khu vực nhập liệu
    document.getElementById('admin-panel').scrollIntoView({behavior: "smooth"});
}

function del(i){
    // BẢO MẬT UX: Thêm xác nhận trước khi xóa
    if(confirm(`Bạn có chắc chắn muốn xóa "${AppState.products[i].name}" không?`)){
        AppState.products.splice(i, 1);
        localStorage.setItem('products', JSON.stringify(AppState.products));
        showToast('Đã xóa sản phẩm!', 'success');
        if(typeof render === 'function') render(); 
        renderAdmin();
    }
}

// ==========================================
// 2. CẤU HÌNH GIAO DIỆN & NGÂN HÀNG
// ==========================================
function saveSiteConfig() {
    AppState.siteConfig.primaryColor = document.getElementById('cfg-color').value;
    AppState.siteConfig.bgStyle = document.getElementById('cfg-bg').value;
    AppState.siteConfig.banners = document.getElementById('cfg-banners').value.split('\n').filter(x => x.trim() !== '');
    
    localStorage.setItem('siteConfig', JSON.stringify(AppState.siteConfig));
    showToast('Đã lưu giao diện thành công!', 'success');
    
    // Gọi hàm bên main.js để áp dụng ngay lập tức
    if(typeof applySiteConfig === 'function') applySiteConfig();
}

function saveBankConfig(){
    AppState.bankInfo = {
        name: document.getElementById('cfg-bank-name').value,
        num: document.getElementById('cfg-bank-num').value,
        owner: document.getElementById('cfg-bank-owner').value,
        qr: document.getElementById('cfg-bank-qr').value
    };
    localStorage.setItem('bankInfo', JSON.stringify(AppState.bankInfo));
    showToast('Đã lưu thông tin ngân hàng!', 'success');
}

// Tự động điền dữ liệu cấu hình vào form Admin khi mở
document.addEventListener("DOMContentLoaded", () => {
    // Chờ HTML load xong mới điền config
    setTimeout(() => {
        if(document.getElementById('cfg-color') && AppState.siteConfig) {
            document.getElementById('cfg-color').value = AppState.siteConfig.primaryColor || '#e3001b';
            document.getElementById('cfg-bg').value = AppState.siteConfig.bgStyle || '';
            document.getElementById('cfg-banners').value = (AppState.siteConfig.banners || []).join('\n');
        }
        
        // Tạo form cấu hình ngân hàng (vì trong HTML bạn để trống thẻ div này)
        const bankArea = document.getElementById('bank-config-area');
        if(bankArea && AppState.bankInfo) {
            bankArea.innerHTML = `
                <h3>Cấu hình Chuyển khoản</h3>
                <div class="form-group"><label>Tên Ngân hàng</label><input id="cfg-bank-name" value="${AppState.bankInfo.name || ''}"></div>
                <div class="form-group"><label>Số tài khoản</label><input id="cfg-bank-num" value="${AppState.bankInfo.num || ''}"></div>
                <div class="form-group"><label>Chủ tài khoản</label><input id="cfg-bank-owner" value="${AppState.bankInfo.owner || ''}"></div>
                <div class="form-group"><label>Link QR Code</label><input id="cfg-bank-qr" value="${AppState.bankInfo.qr || ''}"></div>
                <button onclick="saveBankConfig()" class="btn-submit" style="background:#2563eb;">Lưu Cấu Hình Bank</button>
            `;
        }
    }, 500);
});