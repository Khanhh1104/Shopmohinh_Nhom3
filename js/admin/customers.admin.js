function renderAdminCustomers() {
  const wrap = document.getElementById('admin-customers-content');
  if (!wrap) return;

  const customers = (typeof getCustomers === 'function') ? getCustomers() : [];
  if (customers.length === 0) {
    wrap.innerHTML = `<p class="admin-hint">Chưa có khách hàng nào. (Khách sẽ được tạo hồ sơ khi đặt hàng.)</p>`;
    return;
  }

  let html = `<div style="overflow:auto">
    <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:14px;">
      <tr style="background:#f1f1f1; text-align:left">
        <th style="padding:10px; border:1px solid #ddd">Email</th>
        <th style="padding:10px; border:1px solid #ddd">Họ tên</th>
        <th style="padding:10px; border:1px solid #ddd">SĐT</th>
        <th style="padding:10px; border:1px solid #ddd">Địa chỉ</th>
        <th style="padding:10px; border:1px solid #ddd">Giới tính</th>
        <th style="padding:10px; border:1px solid #ddd">Ngày sinh</th>
        <th style="padding:10px; border:1px solid #ddd">Trạng thái</th>
        <th style="padding:10px; border:1px solid #ddd">Hành động</th>
      </tr>`;

  customers.forEach((c) => {
    html += `
      <tr>
        <td style="padding:10px; border:1px solid #ddd"><strong>${escapeHTML(c.username)}</strong></td>
        <td style="padding:10px; border:1px solid #ddd">${escapeHTML(c.fullname || '')}</td>
        <td style="padding:10px; border:1px solid #ddd">${escapeHTML(c.phone || '')}</td>
        <td style="padding:10px; border:1px solid #ddd">${escapeHTML(c.address || '')}</td>
        <td style="padding:10px; border:1px solid #ddd">${escapeHTML(c.gender || '')}</td>
        <td style="padding:10px; border:1px solid #ddd">${escapeHTML(c.birthday || '')}</td>
        <td style="padding:10px; border:1px solid #ddd">${escapeHTML(c.status || 'pending')}</td>
        <td style="padding:10px; border:1px solid #ddd; white-space:nowrap;">
          <button onclick="adminEditCustomer('${escapeHTML(c.username)}')" style="padding:6px 10px; border:1px solid #ddd; background:#fff; border-radius:6px; cursor:pointer;">Sửa</button>
          <button onclick="adminSetCustomerStatus('${escapeHTML(c.username)}','active')" style="padding:6px 10px; border:none; background:#22c55e; color:#fff; border-radius:6px; cursor:pointer; margin-left:6px;">Duyệt</button>
          <button onclick="adminSetCustomerStatus('${escapeHTML(c.username)}','blocked')" style="padding:6px 10px; border:none; background:#ef4444; color:#fff; border-radius:6px; cursor:pointer; margin-left:6px;">Chặn</button>
          <button onclick="adminDeleteCustomer('${escapeHTML(c.username)}')" style="padding:6px 10px; border:1px solid #ddd; background:#fff; border-radius:6px; cursor:pointer; margin-left:6px;">Xóa</button>
        </td>
      </tr>`;
  });

  html += `</table></div>`;
  wrap.innerHTML = html;
}

function adminSetCustomerStatus(username, status) {
  const customers = getCustomers();
  const idx = customers.findIndex((c) => c.username === username);
  if (idx === -1) return showToast('Không tìm thấy khách hàng.', 'error');
  customers[idx] = { ...customers[idx], status, updatedAt: Date.now() };
  saveCustomers(customers);
  showToast('Đã cập nhật trạng thái khách hàng.', 'success');
  renderAdminCustomers();
}

function adminDeleteCustomer(username) {
  if (!confirm('Xóa hồ sơ khách hàng này?')) return;
  const customers = getCustomers().filter((c) => c.username !== username);
  saveCustomers(customers);
  showToast('Đã xóa hồ sơ khách hàng.', 'success');
  renderAdminCustomers();
}

function adminEditCustomer(username) {
  const c = getCustomers().find((x) => x.username === username);
  if (!c) return showToast('Không tìm thấy khách hàng.', 'error');

  const fullname = prompt('Họ tên', c.fullname || '') ?? c.fullname;
  const phone = prompt('SĐT', c.phone || '') ?? c.phone;
  const address = prompt('Địa chỉ', c.address || '') ?? c.address;
  const gender = prompt('Giới tính (male/female/other)', c.gender || '') ?? c.gender;
  const birthday = prompt('Ngày sinh (YYYY-MM-DD)', c.birthday || '') ?? c.birthday;
  const note = prompt('Ghi chú', c.note || '') ?? c.note;

  const customers = getCustomers();
  const idx = customers.findIndex((x) => x.username === username);
  customers[idx] = { ...customers[idx], fullname, phone, address, gender, birthday, note, updatedAt: Date.now() };
  saveCustomers(customers);
  showToast('Đã cập nhật thông tin khách hàng.', 'success');
  renderAdminCustomers();
}

window.renderAdminCustomers = renderAdminCustomers;
window.adminSetCustomerStatus = adminSetCustomerStatus;
window.adminDeleteCustomer = adminDeleteCustomer;
window.adminEditCustomer = adminEditCustomer;

