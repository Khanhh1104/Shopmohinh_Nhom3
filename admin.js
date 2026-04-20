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
    render();
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
    let html = '<table style="width:100%; border-collapse:collapse; margin-top:15px; font-size:14px;">';
    html += '<tr style="background:#f1f1f1; text-align:left"><th style="padding:10px; border:1px solid #ddd">Tên SP</th><th style="padding:10px; border:1px solid #ddd">Giá</th><th style="padding:10px; border:1px solid #ddd">Hành động</th></tr>';
    
    AppState.products.forEach((p, i) => {
        html += `
        <tr>
            <td style="padding:10px; border:1px solid #ddd"><strong>${escapeHTML(p.name)}</strong><br><small>${p.category} | Kho: ${p.stock}</small></td>
            <td style="padding:10px; border:1px solid #ddd; color:var(--primary)">${p.price.toLocaleString()} ₫</td>
            <td style="padding:10px; border:1px solid #ddd">
                <button onclick="edit(${i})" style="padding:5px 10px; background:#f59e0b; color:white; border:none; border-radius:4px; cursor:pointer">Sửa</button> 
                <button onclick="del(${i})" style="padding:5px 10px; background:#ef4444; color:white; border:none; border-radius:4px; cursor:pointer">Xóa</button>
            </td>
        </tr>`;
    });
    html += '</table>';
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
        render(); 
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