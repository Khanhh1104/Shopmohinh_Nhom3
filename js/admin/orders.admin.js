function getAllOrders() {
  try {
    return JSON.parse(localStorage.getItem('orders')) || [];
  } catch {
    return [];
  }
}

function saveAllOrders(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
}

function fmtStatusAdmin(status) {
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

function setOrderStatus(orderId, nextStatus) {
  const orders = getAllOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return showToast('Không tìm thấy đơn.', 'error');

  const now = Date.now();
  const order = orders[idx];
  orders[idx] = {
    ...order,
    status: nextStatus,
    history: [...(order.history || []), { status: nextStatus, at: now, note: 'Admin cập nhật' }],
  };
  saveAllOrders(orders);
  showToast('Đã cập nhật trạng thái đơn.', 'success');
  renderAdminOrders();
}

function renderAdminOrders() {
  const wrap = document.getElementById('admin-orders-content');
  if (!wrap) return;

  const orders = getAllOrders();
  if (orders.length === 0) {
    wrap.innerHTML = `<p class="admin-hint">Chưa có đơn nào.</p>`;
    return;
  }

  let html = `<div style="overflow:auto">
    <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:14px;">
      <tr style="background:#f1f1f1; text-align:left">
        <th style="padding:10px; border:1px solid #ddd">Mã</th>
        <th style="padding:10px; border:1px solid #ddd">Khách</th>
        <th style="padding:10px; border:1px solid #ddd">Tổng</th>
        <th style="padding:10px; border:1px solid #ddd">Trạng thái</th>
        <th style="padding:10px; border:1px solid #ddd">Cập nhật</th>
      </tr>`;

  orders.forEach((o) => {
    const total = (o.totals?.total || 0).toLocaleString();
    const customerName = o.customer?.name || o.user?.fullname || o.user?.username || '—';
    html += `
      <tr>
        <td style="padding:10px; border:1px solid #ddd"><strong>${escapeHTML(o.code)}</strong><br><small>${escapeHTML(new Date(o.createdAt).toLocaleString())}</small></td>
        <td style="padding:10px; border:1px solid #ddd">${escapeHTML(customerName)}<br><small>${escapeHTML(o.customer?.phone || '')}</small></td>
        <td style="padding:10px; border:1px solid #ddd; color:var(--primary); font-weight:800">${total} ₫</td>
        <td style="padding:10px; border:1px solid #ddd">${escapeHTML(fmtStatusAdmin(o.status))}</td>
        <td style="padding:10px; border:1px solid #ddd; white-space:nowrap;">
          <button onclick="adminSetOrderStatus(${o.id}, 'confirmed')" style="padding:6px 10px; border:none; background:#0ea5e9; color:#fff; border-radius:6px; cursor:pointer;">Xác nhận</button>
          <button onclick="adminSetOrderStatus(${o.id}, 'packing')" style="padding:6px 10px; border:none; background:#6366f1; color:#fff; border-radius:6px; cursor:pointer; margin-left:6px;">Đóng gói</button>
          <button onclick="adminSetOrderStatus(${o.id}, 'shipping')" style="padding:6px 10px; border:none; background:#f59e0b; color:#fff; border-radius:6px; cursor:pointer; margin-left:6px;">Giao</button>
          <button onclick="adminSetOrderStatus(${o.id}, 'delivered')" style="padding:6px 10px; border:none; background:#22c55e; color:#fff; border-radius:6px; cursor:pointer; margin-left:6px;">Hoàn tất</button>
          <button onclick="adminSetOrderStatus(${o.id}, 'cancelled')" style="padding:6px 10px; border:none; background:#ef4444; color:#fff; border-radius:6px; cursor:pointer; margin-left:6px;">Hủy</button>
        </td>
      </tr>`;
  });

  html += `</table></div>`;
  wrap.innerHTML = html;
}

window.renderAdminOrders = renderAdminOrders;
window.adminSetOrderStatus = setOrderStatus;

