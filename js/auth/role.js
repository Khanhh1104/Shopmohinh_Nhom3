const ADMIN_EMAILS = new Set(['nhom3@gmail.com']);
const ADMIN_USERNAMES = new Set(['admin']);

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAdminUser(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (typeof user.username === 'string' && ADMIN_USERNAMES.has(user.username)) return true;
  if (typeof user.username === 'string' && ADMIN_EMAILS.has(user.username)) return true; // username đang là email
  return false;
}

export function normalizeUserRole(user) {
  if (!user || typeof user !== 'object') return user;
  if (user.role === 'admin' || user.role === 'user') return user;
  const role = isAdminUser(user) ? 'admin' : 'user';
  return { ...user, role };
}

export function saveCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function requireAdminOrRedirect(options = {}) {
  const { redirectTo = 'index.html', message = 'Bạn không có quyền truy cập trang quản trị.' } = options;
  const normalized = normalizeUserRole(getCurrentUser());
  if (normalized && normalized !== getCurrentUser()) saveCurrentUser(normalized);

  if (!isAdminUser(normalized)) {
    try {
      sessionStorage.setItem('toast', JSON.stringify({ message, type: 'error' }));
    } catch {}
    window.location.replace(redirectTo);
    return false;
  }
  return true;
}

