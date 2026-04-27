// ==========================================
// CUSTOMERS (LocalStorage) - Hồ sơ khách hàng
// ==========================================

function getCustomers() {
  try {
    return JSON.parse(localStorage.getItem('customers')) || [];
  } catch {
    return [];
  }
}

function saveCustomers(customers) {
  localStorage.setItem('customers', JSON.stringify(customers));
}

function getCurrentUsername() {
  try {
    return AppState?.currentUser?.username || null;
  } catch {
    return null;
  }
}

function upsertCustomerProfile(profile) {
  const username = getCurrentUsername();
  if (!username) return null;

  const customers = getCustomers();
  const idx = customers.findIndex((c) => c.username === username);
  const now = Date.now();

  const base = {
    username,
    fullname: AppState.currentUser?.fullname || username,
    role: AppState.currentUser?.role || 'user',
    status: 'pending', // duyệt theo status: pending/active/blocked
    phone: '',
    address: '',
    gender: '',
    birthday: '',
    note: '',
    createdAt: now,
    updatedAt: now,
  };

  const next = {
    ...(idx === -1 ? base : { ...customers[idx], updatedAt: now }),
    ...profile,
    username,
  };

  if (idx === -1) customers.unshift(next);
  else customers[idx] = next;

  saveCustomers(customers);
  return next;
}

function getCustomerByUsername(username) {
  return getCustomers().find((c) => c.username === username) || null;
}

function showCustomerProfile() {
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
        <p>Vui lòng đăng nhập để cập nhật hồ sơ khách hàng.</p>
        <button class="btn-submit" style="width:auto;margin-top:20px; padding: 10px 20px" onclick="openModal()">Đăng nhập</button>
      </div>`;
    return;
  }

  const current = getCustomerByUsername(username) || upsertCustomerProfile({});
  const safe = (v) => (typeof escapeHTML === 'function' ? escapeHTML(v || '') : (v || ''));

  const status = current?.status || 'pending';
  const statusText = status === 'active' ? 'Đã duyệt' : (status === 'blocked' ? 'Bị chặn' : 'Chờ duyệt');

  document.getElementById('detail').innerHTML = `
    <div class="card" style="padding:25px; max-width: 900px; margin: 0 auto;">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center; flex-wrap:wrap;">
        <h2 style="margin:0">Hồ sơ khách hàng</h2>
        <button class="btn-submit" style="width:auto; padding:10px 14px; background:#64748b" onclick="location.hash=''">⬅ Về trang chủ</button>
      </div>

      <div style="margin-top:10px; padding:10px 12px; border:1px solid #eee; border-radius:10px; background:#f8fafc; color:#475569;">
        <div><strong>Tài khoản:</strong> ${safe(username)}</div>
        <div><strong>Trạng thái:</strong> ${safe(statusText)}</div>
      </div>

      <div style="margin-top:14px; display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label>Họ và tên</label>
          <input id="pf-fullname" value="${safe(current?.fullname)}" placeholder="Nhập họ tên" />
        </div>
        <div class="form-group">
          <label>Số điện thoại</label>
          <input id="pf-phone" value="${safe(current?.phone)}" placeholder="Nhập số điện thoại" />
        </div>
        <div class="form-group" style="grid-column: 1 / -1;">
          <label>Địa chỉ</label>
          <input id="pf-address" value="${safe(current?.address)}" placeholder="Nhập địa chỉ nhận hàng" />
        </div>
        <div class="form-group">
          <label>Giới tính</label>
          <select id="pf-gender">
            <option value="" ${!current?.gender ? 'selected' : ''}>--</option>
            <option value="male" ${current?.gender === 'male' ? 'selected' : ''}>Nam</option>
            <option value="female" ${current?.gender === 'female' ? 'selected' : ''}>Nữ</option>
            <option value="other" ${current?.gender === 'other' ? 'selected' : ''}>Khác</option>
          </select>
        </div>
        <div class="form-group">
          <label>Ngày sinh</label>
          <input id="pf-birthday" type="date" value="${safe(current?.birthday)}" />
        </div>
        <div class="form-group" style="grid-column: 1 / -1;">
          <label>Ghi chú</label>
          <textarea id="pf-note" rows="3" placeholder="Ví dụ: thời gian nhận hàng thuận tiện...">${safe(current?.note)}</textarea>
        </div>
      </div>

      <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn-submit" style="width:auto; padding:10px 16px;" onclick="saveCustomerProfileFromForm()">💾 Lưu hồ sơ</button>
        <button class="btn-submit" style="width:auto; padding:10px 16px; background:#0f172a;" onclick="location.hash='#orders'">📦 Xem đơn hàng</button>
      </div>

      <div class="admin-hint" style="margin-top:10px;">
        Lưu ý: nếu hồ sơ đang “Chờ duyệt”, admin có thể duyệt trong mục quản trị khách hàng.
      </div>
    </div>
  `;
}

function saveCustomerProfileFromForm() {
  const username = getCurrentUsername();
  if (!username) return showToast?.('Bạn cần đăng nhập.', 'error');

  const fullname = document.getElementById('pf-fullname')?.value?.trim() || '';
  const phone = document.getElementById('pf-phone')?.value?.trim() || '';
  const address = document.getElementById('pf-address')?.value?.trim() || '';
  const gender = document.getElementById('pf-gender')?.value || '';
  const birthday = document.getElementById('pf-birthday')?.value || '';
  const note = document.getElementById('pf-note')?.value?.trim() || '';

  if (!fullname || !phone) {
    return showToast?.('Vui lòng nhập Họ tên và SĐT.', 'error');
  }

  // Khi khách tự cập nhật, giữ nguyên status hiện tại (pending/active/blocked)
  const existing = getCustomerByUsername(username) || {};
  const saved = upsertCustomerProfile({
    fullname,
    phone,
    address,
    gender,
    birthday,
    note,
    status: existing.status || 'pending',
  });

  showToast?.('Đã lưu hồ sơ khách hàng.', 'success');
  return saved;
}

// Expose
window.getCustomers = getCustomers;
window.saveCustomers = saveCustomers;
window.upsertCustomerProfile = upsertCustomerProfile;
window.getCustomerByUsername = getCustomerByUsername;
window.showCustomerProfile = showCustomerProfile;
window.saveCustomerProfileFromForm = saveCustomerProfileFromForm;

