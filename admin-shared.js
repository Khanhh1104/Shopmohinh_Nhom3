function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[tag] || tag));
}

function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return alert(msg);
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Hiển thị toast được chuyển từ trang khác (ví dụ bị chặn quyền)
document.addEventListener('DOMContentLoaded', () => {
  try {
    const raw = sessionStorage.getItem('toast');
    if (!raw) return;
    sessionStorage.removeItem('toast');
    const t = JSON.parse(raw);
    if (t?.message) showToast(t.message, t.type || 'success');
  } catch {}
});

