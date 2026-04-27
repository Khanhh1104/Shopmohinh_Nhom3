// ==========================================
// Customer Care Chat (no backend, no API key)
// ==========================================

const CHAT_STORAGE_KEY = 'supportChatHistory';

function loadChatHistory() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveChatHistory(history) {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(history.slice(-100)));
}

function normText(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function matchAny(text, keywords) {
  return keywords.some((k) => text.includes(k));
}

function formatMoney(n) {
  try {
    return (n || 0).toLocaleString() + ' ₫';
  } catch {
    return n + ' ₫';
  }
}

function buildBotReply(messageRaw) {
  const text = normText(messageRaw);

  // Basic greetings
  if (matchAny(text, ['hi', 'hello', 'xin chao', 'chao', 'alo'])) {
    return 'Chào bạn! Mình có thể hỗ trợ: tình trạng đơn hàng, phí vận chuyển, thanh toán, đổi trả, hoặc tư vấn chọn sản phẩm.';
  }

  // Orders
  if (matchAny(text, ['don hang', 'don', 'order', 'van chuyen', 'giao hang', 'tien do'])) {
    return 'Bạn có thể xem tiến độ đơn tại mục “📦 Đơn hàng” trên header. Nếu cần mình hỗ trợ nhanh, bạn gửi giúp “mã đơn” (VD: OD12345678).';
  }

  if (matchAny(text, ['huy', 'huy don', 'cancel'])) {
    return 'Bạn có thể hủy đơn khi đơn đang “Chờ xác nhận” hoặc “Đã xác nhận” trong mục “📦 Đơn hàng”. Nếu nút Hủy không còn hiện thì đơn đã chuyển sang “Đang giao/Đã giao”.';
  }

  // Shipping fee
  if (matchAny(text, ['phi ship', 'phi van chuyen', 'ship', 'van chuyen'])) {
    return 'Phí vận chuyển hiện tại đang tính mặc định 30,000 ₫/đơn (hiển thị ở bước checkout).';
  }

  // Payment
  if (matchAny(text, ['thanh toan', 'cod', 'chuyen khoan', 'qr'])) {
    return 'Bạn có thể chọn thanh toán COD hoặc Chuyển khoản (QR) ở bước checkout. Nếu chọn QR, hệ thống sẽ hiện mã để bạn quét.';
  }

  // Return policy (generic)
  if (matchAny(text, ['doi tra', 'hoan tien', 'bao hanh', 'chinh sach'])) {
    return 'Chính sách đổi trả phụ thuộc tình trạng sản phẩm và thời gian nhận hàng. Bạn kéo xuống cuối trang để xem mục “Chính sách”, hoặc mô tả vấn đề để mình hướng dẫn cụ thể.';
  }

  // Product / stock
  if (matchAny(text, ['het hang', 'con hang', 'ton kho', 'stock'])) {
    const outOfStock = (window.AppState?.products || []).filter((p) => (parseInt(p.stock) || 0) <= 0 && p.status !== 'preorder').length;
    if (outOfStock > 0) {
      return `Hiện có ${outOfStock} sản phẩm đang hết hàng. Admin sẽ nhập thêm hàng sớm. Bạn có thể đặt trước nếu sản phẩm có trạng thái “Pre-order”.`;
    }
    return 'Hiện tại không có cảnh báo hết hàng. Bạn mở chi tiết sản phẩm để xem tồn kho và trạng thái.';
  }

  // Price question
  if (matchAny(text, ['gia', 'bao nhieu', 'price'])) {
    return 'Bạn muốn hỏi giá sản phẩm nào? Bạn gửi tên hoặc mã sản phẩm, mình sẽ hướng dẫn cách tìm nhanh trên web.';
  }

  // Fallback
  return 'Mình đã ghi nhận. Bạn mô tả rõ hơn giúp mình: bạn đang gặp vấn đề ở bước nào (xem sản phẩm / giỏ hàng / đặt hàng / đơn hàng)?';
}

function ensureChatDom() {
  if (document.getElementById('support-chat-launcher')) return;

  const launcher = document.createElement('button');
  launcher.id = 'support-chat-launcher';
  launcher.innerText = 'Chat';
  launcher.onclick = () => toggleChat(true);

  const panel = document.createElement('div');
  panel.id = 'support-chat-panel';
  panel.className = 'hidden';
  panel.innerHTML = `
    <div class="chat-head">
      <div>
        <div class="chat-title">Hỗ trợ khách hàng</div>
        <div class="chat-sub">Trả lời nhanh theo FAQ</div>
      </div>
      <button class="chat-close" onclick="toggleChat(false)">×</button>
    </div>
    <div class="chat-body" id="support-chat-body"></div>
    <div class="chat-foot">
      <input id="support-chat-input" placeholder="Nhập tin nhắn..." />
      <button id="support-chat-send">Gửi</button>
    </div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const input = panel.querySelector('#support-chat-input');
  const sendBtn = panel.querySelector('#support-chat-send');
  const send = () => {
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    pushChatMessage('user', msg);
    const reply = buildBotReply(msg);
    setTimeout(() => pushChatMessage('bot', reply), 200);
  };

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
  });

  // initial messages
  const history = loadChatHistory();
  if (history.length === 0) {
    pushChatMessage('bot', 'Chào bạn! Mình có thể hỗ trợ đặt hàng, theo dõi đơn, thanh toán, đổi trả.');
  } else {
    history.forEach((m) => renderChatMessage(m));
    scrollChatToBottom();
  }
}

function toggleChat(open) {
  ensureChatDom();
  const panel = document.getElementById('support-chat-panel');
  if (!panel) return;
  panel.classList.toggle('hidden', !open);
  if (open) {
    scrollChatToBottom();
    document.getElementById('support-chat-input')?.focus();
  }
}

function scrollChatToBottom() {
  const body = document.getElementById('support-chat-body');
  if (!body) return;
  body.scrollTop = body.scrollHeight;
}

function pushChatMessage(role, text) {
  const history = loadChatHistory();
  const item = { role, text, at: Date.now() };
  history.push(item);
  saveChatHistory(history);
  renderChatMessage(item);
  scrollChatToBottom();
}

function renderChatMessage(item) {
  const body = document.getElementById('support-chat-body');
  if (!body) return;
  const div = document.createElement('div');
  div.className = `chat-msg ${item.role}`;
  div.innerText = item.text;
  body.appendChild(div);
}

// Expose
window.toggleChat = toggleChat;

document.addEventListener('DOMContentLoaded', () => {
  ensureChatDom();
});

