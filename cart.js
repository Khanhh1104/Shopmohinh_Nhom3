// Khởi tạo dữ liệu giỏ hàng và ngân hàng cho AppState (để tránh lỗi undefined)
AppState.cart = JSON.parse(localStorage.getItem('cart')) || [];


function updateCartCount() {
    const count = AppState.cart.reduce((acc, item) => acc + item.quantity, 0);
    const countBadge = document.getElementById('cart-count');
    if(countBadge) countBadge.innerText = count;
}

function addToCart(id){
    const p = AppState.products.find(x => x.id === id);
    if(!p) return;
    
    const item = AppState.cart.find(x => x.id === id);
    const maxQty = (p.status === 'preorder') ? Infinity : (parseInt(p.stock) || 0);
    if(maxQty <= 0 && p.status !== 'preorder') {
        return showToast('Sản phẩm đã hết hàng!', 'error');
    }

    if(item) {
        if(item.quantity + 1 > maxQty) return showToast('Vượt quá số lượng tồn kho!', 'error');
        item.quantity++;
    } else {
        AppState.cart.push({...p, quantity: 1});
    }
    
    localStorage.setItem('cart', JSON.stringify(AppState.cart));
    showToast('Đã thêm ' + p.name + ' vào giỏ!', 'success');
    updateCartCount();
}

function removeFromCart(i){
    AppState.cart.splice(i,1);
    localStorage.setItem('cart', JSON.stringify(AppState.cart));
    showCart();
}

function buyNow(id){
    addToCart(id);
    location.hash = '#cart';
}

function showCart(){
    document.getElementById('product-list').classList.add('hidden');
    document.getElementById('pagination').classList.add('hidden');
    document.getElementById('intro-panel').classList.add('hidden');
    if(document.getElementById('home-banner')) document.getElementById('home-banner').style.display='none';
    
    if(AppState.cart.length === 0){
        document.getElementById('detail').innerHTML=`<div class="card" style="padding:40px;text-align:center"><h2>Giỏ hàng trống</h2><p>Bạn chưa chọn sản phẩm nào.</p><button class="btn-submit" style="width:auto;margin-top:20px; padding: 10px 20px" onclick="location.hash=''">Quay lại mua sắm</button></div>`;
        return;
    }
    
    let total=0;
    let itemsHtml='';
    AppState.cart.forEach((p, i)=>{
        total += p.price * p.quantity;
        const img = escapeHTML(Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.image || p.images || 'https://via.placeholder.com/70'));
        const safeName = escapeHTML(p.name);
        const stockP = AppState.products.find(x => x.id === p.id);
        const maxQty = (stockP && stockP.status === 'preorder') ? Infinity : (parseInt(stockP?.stock) || 0);
        const canInc = p.quantity + 1 <= maxQty;
        const canDec = p.quantity - 1 >= 1;

        itemsHtml += `
        <div style="display:flex; gap:15px; margin-bottom:15px; padding-bottom:15px; border-bottom:1px solid #f1f5f9; align-items:center;">
            <div style="position:relative;">
                <img src="${img}" style="width:70px; height:70px; object-fit:cover; border-radius:12px; border:1px solid #f1f5f9;">
                <span style="position:absolute; top:-8px; right:-8px; background:var(--primary); color:white; width:22px; height:22px; border-radius:50%; font-size:11px; display:flex; align-items:center; justify-content:center; border:2px solid white;">${p.quantity}</span>
            </div>
            <div style="flex:1">
                <div style="font-weight:600; font-size:14px; color:#1e293b; margin-bottom:4px; line-height:1.4">${safeName}</div>
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <button onclick="decCartQty(${i})" ${canDec ? '' : 'disabled'} style="width:24px; height:24px; border-radius:4px; border:1px solid #e2e8f0; background:#fff; cursor:pointer; color:#64748b;">-</button>
                    <button onclick="incCartQty(${i})" ${canInc ? '' : 'disabled'} style="width:24px; height:24px; border-radius:4px; border:1px solid #e2e8f0; background:#fff; cursor:pointer; color:#64748b;">+</button>
                    <span style="font-size:13px; color:#777">x ${p.price.toLocaleString()}₫</span>
                </div>
                ${maxQty !== Infinity ? `<div style="font-size:12px; color:#94a3b8; margin-top:4px;">Tồn kho: ${maxQty}</div>` : `<div style="font-size:12px; color:#94a3b8; margin-top:4px;">Pre-order</div>`}
            </div>
            <div style="font-weight:bold; font-size:16px">${(p.price * p.quantity).toLocaleString()}₫</div>
            <button onclick="removeFromCart(${i})" style="border:none; background:#fee2e2; color:#ef4444; border-radius:4px; padding:5px 10px; cursor:pointer; font-weight:bold">×</button>
        </div>`;
    });
    
    const nameStr = AppState.currentUser ? escapeHTML(AppState.currentUser.fullname) : '';
    
    let html = `<div class="checkout-container" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 30px; align-items: start; max-width: 1100px; margin: 20px auto; padding: 0 15px;">
        <div class="checkout-left">
            <div class="checkout-section" style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
                <div class="checkout-header" style="font-size: 18px; font-weight: 800; margin-bottom: 25px; color: #0f172a; display: flex; align-items: center; gap: 10px;">
                    <span style="background: var(--primary); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">1</span>
                    THÔNG TIN GIAO HÀNG
                </div>
                <div class="form-group" style="margin-bottom: 20px;"><label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600; color:#64748b;">Họ và tên</label><input id="cName" value="${nameStr}" placeholder="Nhập tên người nhận" style="width:100%; padding:12px 15px; border:1px solid #e2e8f0; border-radius:10px; font-size:15px; outline:none; transition:0.2s;" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='#e2e8f0'"></div>
                <div style="display:grid; grid-template-columns: 1fr; gap: 20px;">
                    <div class="form-group" style="margin-bottom: 20px;"><label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600; color:#64748b;">Số điện thoại</label><input id="cPhone" placeholder="VD: 0912345678" style="width:100%; padding:12px 15px; border:1px solid #e2e8f0; border-radius:10px; font-size:15px; outline:none;"></div>
                </div>
                <div class="form-group"><label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600; color:#64748b;">Địa chỉ nhận hàng</label><textarea id="cAddr" placeholder="Số nhà, tên đường, phường/xã..." rows="2" style="width:100%; padding:12px 15px; border:1px solid #e2e8f0; border-radius:10px; font-size:15px; outline:none; resize:none;"></textarea></div>
            </div>

            <div class="checkout-section" style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; margin-top: 25px;">
                <div class="checkout-header" style="font-size: 18px; font-weight: 800; margin-bottom: 25px; color: #0f172a; display: flex; align-items: center; gap: 10px;">
                    <span style="background: var(--primary); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">2</span>
                    PHƯƠNG THỨC THANH TOÁN
                </div>
                <div style="display: grid; gap: 12px;">
                    <div class="payment-option selected" id="pay-cod" onclick="selectPayment('cod')" style="border:2px solid var(--primary); background:#fff5f5; padding:18px; border-radius:12px; cursor:pointer; display:flex; align-items:center; transition:0.2s;">
                        <div style="background:white; width:45px; height:45px; border-radius:10px; display:flex; align-items:center; justify-content:center; margin-right:15px; font-size:24px; box-shadow:0 2px 5px rgba(0,0,0,0.05)">💵</div>
                        <div style="flex:1"><strong style="display:block; color:#1e293b;">Thanh toán khi nhận hàng (COD)</strong><small style="color:#64748b">Trả tiền khi shipper giao mô hình tới</small></div>
                    </div>
                    <div class="payment-option" id="pay-bank" onclick="selectPayment('bank')" style="border:2px solid #f1f5f9; padding:18px; border-radius:12px; cursor:pointer; display:flex; align-items:center; transition:0.2s;">
                        <div style="background:white; width:45px; height:45px; border-radius:10px; display:flex; align-items:center; justify-content:center; margin-right:15px; font-size:24px; box-shadow:0 2px 5px rgba(0,0,0,0.05)">🏦</div>
                        <div style="flex:1"><strong style="display:block; color:#1e293b;">Chuyển khoản Ngân hàng (QR)</strong><small style="color:#64748b">Quét mã QR để xác nhận đơn hàng nhanh hơn</small></div>
                    </div>
                </div>
                <input type="hidden" id="selected-payment" value="cod">
            </div>
        </div>
        
        <div class="checkout-right" style="position: sticky; top: 100px;">
            <div class="checkout-section" style="background: white; padding: 25px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
                <div class="checkout-header" style="font-size: 16px; font-weight: 800; margin-bottom: 20px; color: #0f172a;">ĐƠN HÀNG CỦA BẠN</div>
                <div style="max-height: 350px; overflow-y: auto; padding-right: 5px; margin-bottom: 20px;" class="custom-scroll">${itemsHtml}</div>
                
                <div style="background:#f8fafc; padding:20px; border-radius:12px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:14px; color:#64748b;"><span>Tạm tính:</span> <span style="font-weight:600; color:#1e293b;">${total.toLocaleString()} ₫</span></div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:14px; color:#64748b;"><span>Phí vận chuyển:</span> <span style="font-weight:600; color:#1e293b;">30,000 ₫</span></div>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:15px; border-top:2px dashed #e2e8f0;">
                        <span style="font-weight:700; color:#0f172a;">TỔNG CỘNG:</span> 
                        <span style="font-size:22px; font-weight:800; color:var(--primary);">${(total+30000).toLocaleString()} ₫</span>
                    </div>
                </div>

                <button onclick="processOrder()" class="btn-submit" style="width:100%; padding:18px; font-size:16px; font-weight:800; background:var(--primary); color:white; border:none; border-radius:12px; margin-top:25px; cursor:pointer; box-shadow: 0 8px 15px rgba(227, 0, 27, 0.2); transition:0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">XÁC NHẬN ĐẶT HÀNG</button>
                <p style="text-align:center; font-size:12px; color:#94a3b8; margin-top:15px;">(Vui lòng kiểm tra kỹ thông tin trước khi đặt)</p>
            </div>
        </div>
    </div>`;
    document.getElementById('detail').innerHTML = html;
}

function selectPayment(method) {
    document.getElementById('selected-payment').value = method;
    const isCod = method === 'cod';
    
    const payCod = document.getElementById('pay-cod');
    const payBank = document.getElementById('pay-bank');
    
    payCod.className = isCod ? 'payment-option selected' : 'payment-option';
    payCod.style.borderColor = isCod ? 'var(--primary)' : '#ddd';
    payCod.style.background = isCod ? '#fff5f5' : 'transparent';
    
    payBank.className = !isCod ? 'payment-option selected' : 'payment-option';
    payBank.style.borderColor = !isCod ? 'var(--primary)' : '#ddd';
    payBank.style.background = !isCod ? '#fff5f5' : 'transparent';
}

function processOrder(){
    if(!document.getElementById('cName').value || !document.getElementById('cPhone').value) {
        return showToast('Vui lòng điền đủ thông tin giao hàng!', 'error');
    }
    const method = document.getElementById('selected-payment').value;
    if(method === 'bank') {
        const qrModal = document.getElementById('qr-modal');
        if(qrModal) {
            document.getElementById('qr-img').src = AppState.bankInfo.qr;
            document.getElementById('qr-bank-name').innerText = AppState.bankInfo.name;
            document.getElementById('qr-bank-num').innerText = AppState.bankInfo.num;
            document.getElementById('qr-bank-owner').innerText = AppState.bankInfo.owner;
            qrModal.classList.add('open');
        } else {
            showToast('Lỗi: Không tìm thấy khung quét mã QR!', 'error');
        }
    } else {
        finishOrder('COD');
    }
}

function finishOrder(method) {
    const customer = {
        name: document.getElementById('cName').value,
        phone: document.getElementById('cPhone').value,
        address: document.getElementById('cAddr').value
    };

    // Lưu hồ sơ khách hàng để admin quản lý (Đợt 3)
    if(typeof upsertCustomerProfile === 'function' && AppState.currentUser) {
        upsertCustomerProfile({
            fullname: customer.name || AppState.currentUser.fullname,
            phone: customer.phone,
            address: customer.address
        });
    }

    if(typeof placeOrder !== 'function') {
        showToast('Lỗi hệ thống đơn hàng. Vui lòng tải lại trang.', 'error');
        return;
    }

    const order = placeOrder({ customer, paymentMethod: method });
    showToast(`Đặt hàng thành công! Mã đơn: ${order.code}`, 'success');

    AppState.cart = [];
    localStorage.removeItem('cart');
    updateCartCount();
    setTimeout(() => { location.hash='#orders'; if(typeof render === 'function') render(); }, 800);
}

function closeQrModal() { 
    const modal = document.getElementById('qr-modal');
    if(modal) modal.classList.remove('open'); 
}
function confirmBankTransfer() { 
    closeQrModal(); 
    finishOrder('Chuyển khoản'); 
}

function incCartQty(i) {
    const item = AppState.cart[i];
    if(!item) return;
    const p = AppState.products.find(x => x.id === item.id);
    const maxQty = (p && p.status === 'preorder') ? Infinity : (parseInt(p?.stock) || 0);
    if(maxQty !== Infinity && item.quantity + 1 > maxQty) return showToast('Vượt quá số lượng tồn kho!', 'error');
    item.quantity++;
    localStorage.setItem('cart', JSON.stringify(AppState.cart));
    showCart();
    updateCartCount();
}

function decCartQty(i) {
    const item = AppState.cart[i];
    if(!item) return;
    if(item.quantity - 1 < 1) return;
    item.quantity--;
    localStorage.setItem('cart', JSON.stringify(AppState.cart));
    showCart();
    updateCartCount();
}