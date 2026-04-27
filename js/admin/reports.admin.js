function getOrdersForReport() {
  try {
    return JSON.parse(localStorage.getItem('orders')) || [];
  } catch {
    return [];
  }
}

function monthKey(ts) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function renderAdminReports() {
  const wrap = document.getElementById('admin-reports-content');
  if (!wrap) return;

  const orders = getOrdersForReport().filter((o) => o.status === 'delivered');
  if (orders.length === 0) {
    wrap.innerHTML = `<p class="admin-hint">Chưa có đơn <strong>Đã giao</strong> để thống kê doanh thu.</p>`;
    return;
  }

  const byMonth = new Map();
  orders.forEach((o) => {
    const key = monthKey(o.createdAt);
    if (!byMonth.has(key)) byMonth.set(key, { revenue: 0, orders: 0, items: 0 });
    const agg = byMonth.get(key);
    agg.revenue += (o.totals?.total || 0);
    agg.orders += 1;
    agg.items += (o.items || []).reduce((s, it) => s + (it.quantity || 0), 0);
  });

  const rows = [...byMonth.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));

  let html = `<div style="overflow:auto">
    <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:14px;">
      <tr style="background:#f1f1f1; text-align:left">
        <th style="padding:10px; border:1px solid #ddd">Tháng</th>
        <th style="padding:10px; border:1px solid #ddd">Số đơn</th>
        <th style="padding:10px; border:1px solid #ddd">Số lượng bán</th>
        <th style="padding:10px; border:1px solid #ddd">Doanh thu</th>
      </tr>`;

  rows.forEach(([k, v]) => {
    html += `
      <tr>
        <td style="padding:10px; border:1px solid #ddd"><strong>${escapeHTML(k)}</strong></td>
        <td style="padding:10px; border:1px solid #ddd">${v.orders}</td>
        <td style="padding:10px; border:1px solid #ddd">${v.items}</td>
        <td style="padding:10px; border:1px solid #ddd; color:var(--primary); font-weight:800">${v.revenue.toLocaleString()} ₫</td>
      </tr>`;
  });

  html += `</table></div>`;
  wrap.innerHTML = html;
}

window.renderAdminReports = renderAdminReports;

