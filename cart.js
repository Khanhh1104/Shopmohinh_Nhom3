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
    if(item) item.quantity++; 
    else AppState.cart.push({...p, quantity: 1});
    
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
        itemsHtml += `
        <div style="display:flex; gap:15px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:15px; align-items:center;">
            <img src="${img}" style="width:70px; height:70px; object-fit:cover; border-radius:6px">
            <div style="flex:1">
                <div style="font-weight:600; font-size:15px; margin-bottom:5px">${safeName}</div>
                <div style="font-size:13px; color:#777">SL: ${p.quantity} x ${p.price.toLocaleString()}₫</div>
            </div>
            <div style="font-weight:bold; font-size:16px">${(p.price * p.quantity).toLocaleString()}₫</div>
            <button onclick="removeFromCart(${i})" style="border:none; background:#fee2e2; color:#ef4444; border-radius:4px; padding:5px 10px; cursor:pointer; font-weight:bold">×</button>
        </div>`;
    });
    
    const nameStr = AppState.currentUser ? escapeHTML(AppState.currentUser.fullname) : '';
    
    let html = `<div class="checkout-container" style="display: grid; grid-template-columns: 1fr 380px; gap: 30px; align-items: start; max-width: 1200px; margin: auto;">
        <div class="checkout-section" style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #eee;">
            <div class="checkout-header" style="font-size: 18px; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">1. THÔNG TIN GIAO HÀNG</div>
            <div class="form-group"><label style="display:block; margin-bottom:5px">Họ và tên</label><input id="cName" value="${nameStr}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; margin-bottom:15px"></div>
            <div class="form-group"><label style="display:block; margin-bottom:5px">Số điện thoại</label><input id="cPhone" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; margin-bottom:15px"></div>
            <div class="form-group"><label style="display:block; margin-bottom:5px">Địa chỉ</label><input id="cAddr" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; margin-bottom:15px"></div>
        </div>
        
        <div class="checkout-section" style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #eee;">
            <div class="checkout-header" style="font-size: 18px; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">2. ĐƠN HÀNG CỦA BẠN</div>
            <div style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">${itemsHtml}</div>
            <div class="order-summary-row" style="display:flex; justify-content:space-between; margin-bottom:10px"><span>Tạm tính:</span> <span>${total.toLocaleString()} ₫</span></div>
            <div class="order-summary-row" style="display:flex; justify-content:space-between; margin-bottom:10px"><span>Phí vận chuyển:</span> <span>30,000 ₫</span></div>
            <div class="order-total" style="display:flex; justify-content:space-between; font-size:20px; font-weight:bold; color:var(--primary); margin-top:20px; padding-top:15px; border-top:1px dashed #ddd;"><span>TỔNG CỘNG:</span> <span>${(total+30000).toLocaleString()} ₫</span></div>
            
            <div style="margin-top: 25px;">
                <div class="checkout-header" style="font-size:16px; margin-bottom:10px; font-weight:bold">3. THANH TOÁN</div>
                <div class="payment-option selected" id="pay-cod" onclick="selectPayment('cod')" style="border:1px solid var(--primary); background:#fff5f5; padding:15px; border-radius:6px; margin-bottom:10px; cursor:pointer; display:flex; align-items:center;">
                    <div class="payment-icon" style="margin-right:15px; font-size:20px">💵</div><div><strong>Thanh toán COD</strong></div>
                </div>
                <div class="payment-option" id="pay-bank" onclick="selectPayment('bank')" style="border:1px solid #ddd; padding:15px; border-radius:6px; margin-bottom:10px; cursor:pointer; display:flex; align-items:center;">
                    <div class="payment-icon" style="margin-right:15px; font-size:20px">🏦</div><div><strong>Chuyển khoản (QR)</strong></div>
                </div>
                <input type="hidden" id="selected-payment" value="cod">
            </div>
            <button onclick="processOrder()" class="btn-submit" style="width:100%; padding:15px; font-size:16px; font-weight:bold; background:var(--primary); color:white; border:none; border-radius:6px; margin-top:20px; cursor:pointer;">ĐẶT HÀNG NGAY</button>
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
    showToast('Đặt hàng thành công! Đơn hàng sẽ sớm được giao.', 'success');
    AppState.cart = [];
    localStorage.removeItem('cart');
    setTimeout(() => { location.hash=''; render(); }, 1500);
}

function closeQrModal() { 
    const modal = document.getElementById('qr-modal');
    if(modal) modal.classList.remove('open'); 
}
function confirmBankTransfer() { 
    closeQrModal(); 
    finishOrder('Chuyển khoản'); 
}