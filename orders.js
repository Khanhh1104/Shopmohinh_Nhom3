// ==========================================
// ORDERS (LocalStorage) - Đơn hàng & theo dõi
// ==========================================

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem('orders')) || [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
}

function canCustomerCancel(status) {
  return status === 'pending' || status === 'confirmed';
}

function formatStatus(status) {
  const map = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    packing: 'Đóng gói',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };
  return map[status] || status;
}

function getCurrentUsername() {
  try {
    return AppState?.currentUser?.username || null;
  } catch {
    return null;
  }
}

function createOrderFromCart({ customer, paymentMethod }) {
  const username = getCurrentUsername();

  const items = (AppState.cart || []).map((it) => ({
    id: it.id,
    name: it.name,
    price: it.price,
    quantity: it.quantity,
  }));

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const shippingFee = 30000;
  const total = subtotal + shippingFee;

  const now = Date.now();
  const id = now;
  const code = `OD${String(now).slice(-8)}`;

  return {
    id,
    code,
    createdAt: now,
    user: username
      ? { username, fullname: AppState.currentUser?.fullname || username }
      : null,
    customer: {
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
    },
    items,
    paymentMethod,
    totals: { subtotal, shippingFee, total },
    status: 'pending',
    history: [{ status: 'pending', at: now, note: 'Tạo đơn' }],
  };
}

// API dùng bởi cart.js
function placeOrder({ customer, paymentMethod }) {
  const order = createOrderFromCart({ customer, paymentMethod });
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

function cancelOrderByCustomer(orderId) {
  const username = getCurrentUsername();
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return { ok: false, message: 'Không tìm thấy đơn.' };

  const order = orders[idx];
  if (!order.user || order.user.username !== username) {
    return { ok: false, message: 'Bạn không có quyền hủy đơn này.' };
  }
  if (!canCustomerCancel(order.status)) {
    return { ok: false, message: 'Đơn này không thể hủy ở trạng thái hiện tại.' };
  }

  const now = Date.now();
  orders[idx] = {
    ...order,
    status: 'cancelled',
    history: [...(order.history || []), { status: 'cancelled', at: now, note: 'Khách hủy' }],
  };
  saveOrders(orders);
  return { ok: true };
}

function showOrders() {
  document.getElementById('product-list').classList.add('hidden');
  document.getElementById('pagination').classList.add('hidden');
  document.getElementById('intro-panel').classList.add('hidden');
  if (document.getElementById('home-banner')) document.getElementById('home-banner').style.display = 'none';
  if (document.getElementById('toolbar')) document.getElementById('toolbar').style.display = 'none';

  const username = getCurrentUsername();
  if (!username) {
    document.getElementById('detail').innerHTML = `
      <div class="card" style="padding:40px;text-align:center">
        <h2>Bạn cần đăng nhập</h2>
        <p>Vui lòng đăng nhập để xem đơn hàng của bạn.</p>
        <button class="btn-submit" style="width:auto;margin-top:20px; padding: 10px 20px" onclick="openModal()">Đăng nhập</button>
      </div>`;
    return;
  }

  const orders = getOrders().filter((o) => o.user?.username === username);
  if (orders.length === 0) {
    document.getElementById('detail').innerHTML = `
      <div class="card" style="padding:40px;text-align:center">
        <h2>Chưa có đơn hàng</h2>
        <p>Bạn chưa đặt đơn nào.</p>
        <button class="btn-submit" style="width:auto;margin-top:20px; padding: 10px 20px" onclick="location.hash=''">Quay lại mua sắm</button>
      </div>`;
    return;
  }

  let html = `<div class="card" style="padding:25px; max-width: 1000px; margin: 0 auto;">
    <h2 style="margin-top:0">Đơn hàng của bạn</h2>
    <div style="overflow:auto">
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <tr style="background:#f1f1f1; text-align:left">
          <th style="padding:10px; border:1px solid #ddd">Mã</th>
          <th style="padding:10px; border:1px solid #ddd">Ngày</th>
          <th style="padding:10px; border:1px solid #ddd">Tổng</th>
          <th style="padding:10px; border:1px solid #ddd">Trạng thái</th>
          <th style="padding:10px; border:1px solid #ddd">Hành động</th>
        </tr>`;

  orders.forEach((o) => {
    const date = new Date(o.createdAt).toLocaleString();
    const total = (o.totals?.total || 0).toLocaleString();
    const canCancel = canCustomerCancel(o.status);
    html += `
      <tr>
        <td style="padding:10px; border:1px solid #ddd"><strong>${escapeHTML(o.code)}</strong></td>
        <td style="padding:10px; border:1px solid #ddd">${escapeHTML(date)}</td>
        <td style="padding:10px; border:1px solid #ddd; color:var(--primary); font-weight:700">${total} ₫</td>
        <td style="padding:10px; border:1px solid #ddd">${escapeHTML(formatStatus(o.status))}</td>
        <td style="padding:10px; border:1px solid #ddd">
          <button onclick="viewOrderDetail(${o.id})" style="padding:6px 10px; border:1px solid #ddd; background:#fff; border-radius:6px; cursor:pointer">Xem</button>
          ${canCancel ? `<button onclick="customerCancelOrder(${o.id})" style="padding:6px 10px; border:none; background:#ef4444; color:#fff; border-radius:6px; cursor:pointer; margin-left:6px">Hủy</button>` : ``}
        </td>
      </tr>`;
  });

  html += `</table></div></div>`;
  document.getElementById('detail').innerHTML = html;
}

function viewOrderDetail(orderId) {
  const username = getCurrentUsername();
  const order = getOrders().find((o) => o.id === orderId && o.user?.username === username);
  if (!order) return showToast('Không tìm thấy đơn.', 'error');

  let items = '';
  order.items.forEach((it) => {
    items += `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #eee">
      <div>${escapeHTML(it.name)} <small style="color:#64748b">x${it.quantity}</small></div>
      <div style="font-weight:700">${(it.price * it.quantity).toLocaleString()} ₫</div>
    </div>`;
  });

  const his = (order.history || [])
    .map((h) => `<li>${escapeHTML(formatStatus(h.status))} - ${escapeHTML(new Date(h.at).toLocaleString())}</li>`)
    .join('');

  document.getElementById('detail').innerHTML = `
    <div class="card" style="padding:25px; max-width: 900px; margin: 0 auto;">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center; flex-wrap:wrap;">
        <h2 style="margin:0">Chi tiết đơn ${escapeHTML(order.code)}</h2>
        <button class="btn-submit" style="width:auto; padding:10px 14px; background:#64748b" onclick="location.hash='#orders'">⬅ Quay lại</button>
      </div>
      <div style="margin-top:14px; display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background:#f8fafc; border:1px solid #eee; border-radius:8px; padding:12px;">
          <div style="font-weight:800; margin-bottom:6px;">Thông tin giao hàng</div>
          <div><strong>Họ tên:</strong> ${escapeHTML(order.customer?.name || '')}</div>
          <div><strong>SĐT:</strong> ${escapeHTML(order.customer?.phone || '')}</div>
          <div><strong>Địa chỉ:</strong> ${escapeHTML(order.customer?.address || '')}</div>
        </div>
        <div style="background:#f8fafc; border:1px solid #eee; border-radius:8px; padding:12px;">
          <div style="font-weight:800; margin-bottom:6px;">Trạng thái</div>
          <div><strong>Hiện tại:</strong> ${escapeHTML(formatStatus(order.status))}</div>
          <div><strong>Thanh toán:</strong> ${escapeHTML(order.paymentMethod || '')}</div>
          <div><strong>Tổng:</strong> ${(order.totals?.total || 0).toLocaleString()} ₫</div>
        </div>
      </div>
      <div style="margin-top:14px;">
        <div style="font-weight:800; margin-bottom:6px;">Sản phẩm</div>
        ${items}
      </div>
      <div style="margin-top:14px;">
        <div style="font-weight:800; margin-bottom:6px;">Tiến độ</div>
        <ul style="margin:0; padding-left: 18px; color:#475569">${his}</ul>
      </div>
    </div>`;
}

function customerCancelOrder(orderId) {
  if (!confirm('Bạn chắc chắn muốn hủy đơn này?')) return;
  const res = cancelOrderByCustomer(orderId);
  if (!res.ok) return showToast(res.message || 'Không thể hủy.', 'error');
  showToast('Đã hủy đơn thành công.', 'success');
  showOrders();
}

// Expose
window.showOrders = showOrders;
window.placeOrder = placeOrder;
window.customerCancelOrder = customerCancelOrder;
window.viewOrderDetail = viewOrderDetail;

