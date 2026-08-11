/* =========================================================
   COFFEE ORDER — Module Khách hàng
   Lưu ý cho nhóm: các key localStorage dưới đây LÀ hợp đồng dữ liệu
   dùng chung với module Thu ngân + Bếp (thành viên 3) và Admin (Vũ).
   Khi Vũ có schema MySQL thật, ta sẽ thay các hàm getMenu()/saveOrder()...
   bằng fetch() gọi API PHP, còn giao diện giữ nguyên.
   ========================================================= */

const LS_CART = 'coffee_cart';
const LS_ORDERS = 'coffee_orders';       // mảng đơn hàng dùng chung toàn hệ thống (mock)
const LS_USER = 'coffee_user';           // { phone, points }
const LS_TABLE = 'coffee_table';         // số bàn lấy từ QR

// ----- Dữ liệu menu mẫu (sau này thay bằng API GET /api/menu.php) -----
const MENU = [
  { id: 'ca-phe-den', cat: 'Cà phê', name: 'Cà phê đen đá', price: 25000, icon: '☕', desc: 'Đậm vị, rang mộc' },
  { id: 'ca-phe-sua', cat: 'Cà phê', name: 'Cà phê sữa đá', price: 29000, icon: '☕', desc: 'Sữa đặc truyền thống' },
  { id: 'bac-xiu', cat: 'Cà phê', name: 'Bạc xỉu', price: 32000, icon: '🥛', desc: 'Nhiều sữa, ít cà phê' },
  { id: 'espresso', cat: 'Cà phê', name: 'Espresso', price: 35000, icon: '☕', desc: 'Single shot nguyên chất' },
  { id: 'tra-dao', cat: 'Trà trái cây', name: 'Trà đào cam sả', price: 39000, icon: '🍑', desc: 'Đào miếng, thơm sả' },
  { id: 'tra-vai', cat: 'Trà trái cây', name: 'Trà vải', price: 35000, icon: '🍒', desc: 'Vải tươi, mát lạnh' },
  { id: 'tra-tac', cat: 'Trà trái cây', name: 'Trà tắc', price: 25000, icon: '🍋', desc: 'Chua ngọt vừa miệng' },
  { id: 'matcha-da-xay', cat: 'Đá xay', name: 'Matcha đá xay', price: 45000, icon: '🍵', desc: 'Matcha Nhật, kem tươi' },
  { id: 'choco-da-xay', cat: 'Đá xay', name: 'Chocolate đá xay', price: 45000, icon: '🍫', desc: 'Socola đắng, kem tươi' },
  { id: 'ca-phe-muoi', cat: 'Cà phê', name: 'Cà phê muối', price: 32000, icon: '☕', desc: 'Vị mặn béo lạ miệng' },
  { id: 'ca-phe-trung', cat: 'Cà phê', name: 'Cà phê trứng', price: 39000, icon: '☕', desc: 'Kem trứng béo thơm' },
  { id: 'americano', cat: 'Cà phê', name: 'Americano', price: 35000, icon: '☕', desc: 'Espresso pha loãng, nhẹ vị' },
  { id: 'tra-oolong', cat: 'Trà trái cây', name: 'Trà ổi hồng', price: 39000, icon: '🌸', desc: 'Ổi hồng, thơm nhẹ' },
  { id: 'tra-chanh-day', cat: 'Trà trái cây', name: 'Trà chanh dây', price: 35000, icon: '🍋', desc: 'Chua thanh, giải khát' },
  { id: 'tra-dua-luoi', cat: 'Trà trái cây', name: 'Trà dưa lưới', price: 42000, icon: '🍈', desc: 'Dưa lưới tươi, mát lành' },
  { id: 'da-xay-oreo', cat: 'Đá xay', name: 'Oreo đá xay', price: 45000, icon: '🍪', desc: 'Bánh Oreo, kem tươi' },
  { id: 'da-xay-dau', cat: 'Đá xay', name: 'Dâu đá xay', price: 45000, icon: '🍓', desc: 'Dâu tây tươi xay kem' },
  { id: 'tra-sua-tran-chau', cat: 'Trà sữa', name: 'Trà sữa trân châu', price: 39000, icon: '🧋', desc: 'Trân châu đen dai mềm' },
  { id: 'tra-sua-hongkong', cat: 'Trà sữa', name: 'Trà sữa Hồng Kông', price: 42000, icon: '🧋', desc: 'Đậm vị trà, béo sữa' },
  { id: 'tra-sua-matcha', cat: 'Trà sữa', name: 'Trà sữa matcha', price: 45000, icon: '🧋', desc: 'Matcha Nhật kết hợp sữa' },
  { id: 'nuoc-ep-cam', cat: 'Nước ép', name: 'Nước ép cam', price: 35000, icon: '🍊', desc: 'Cam vắt nguyên chất' },
  { id: 'nuoc-ep-dua-hau', cat: 'Nước ép', name: 'Nước ép dưa hấu', price: 32000, icon: '🍉', desc: 'Tươi mát, ít ngọt' },
  { id: 'soda-viet-quat', cat: 'Nước ép', name: 'Soda việt quất', price: 39000, icon: '🫐', desc: 'Sủi bọt, chua nhẹ' },
  { id: 'banh-tiramisu', cat: 'Bánh ngọt', name: 'Bánh Tiramisu', price: 42000, icon: '🍰', desc: 'Lát bánh, vị cà phê' },
  { id: 'banh-croissant', cat: 'Bánh ngọt', name: 'Croissant bơ', price: 28000, icon: '🥐', desc: 'Bơ Pháp, nướng giòn' },
  { id: 'banh-flan', cat: 'Bánh ngọt', name: 'Bánh flan cà phê', price: 25000, icon: '🍮', desc: 'Caramel béo mịn' },
  { id: 'banh-cookie', cat: 'Bánh ngọt', name: 'Cookie bơ đậu phộng', price: 22000, icon: '🍪', desc: 'Giòn tan, thơm bơ' },
];

const CATEGORIES = [...new Set(MENU.map(p => p.cat))];

const ORDER_STAGES = ['Chờ xác nhận', 'Đã xác nhận', 'Đang pha chế', 'Hoàn thành'];

// ---------- Helpers chung ----------
function money(n) { return n.toLocaleString('vi-VN') + '₫'; }

function getUser() {
  return JSON.parse(localStorage.getItem(LS_USER) || 'null');
}
function setUser(u) { localStorage.setItem(LS_USER, JSON.stringify(u)); }

function getTable() {
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get('table');
  if (fromUrl) localStorage.setItem(LS_TABLE, fromUrl);
  return localStorage.getItem(LS_TABLE) || null;
}

// Đặt số bàn sau khi quét QR thành công (từ scan.html)
function setTableFromScan(rawValue) {
  // Hỗ trợ 2 kiểu mã QR:
  // 1. QR chứa thẳng URL đầy đủ, vd: https://domain/index.html?table=05
  // 2. QR chỉ chứa mã bàn, vd: "05" hoặc "BAN-05"
  let table = rawValue.trim();
  try {
    const url = new URL(rawValue);
    const t = url.searchParams.get('table');
    if (t) table = t;
  } catch (e) { /* không phải URL, dùng nguyên giá trị làm mã bàn */ }
  table = table.replace(/^BAN-?/i, '');
  localStorage.setItem(LS_TABLE, table);
  return table;
}

function getCart() { return JSON.parse(localStorage.getItem(LS_CART) || '[]'); }
function setCart(cart) { localStorage.setItem(LS_CART, JSON.stringify(cart)); }

function addToCart(productId) {
  const cart = getCart();
  const line = cart.find(l => l.id === productId);
  if (line) line.qty += 1; else cart.push({ id: productId, qty: 1 });
  setCart(cart);
  updateBottombarBadges();
  showToast('Đã thêm vào giỏ');
}

function setQty(productId, qty) {
  let cart = getCart();
  if (qty <= 0) cart = cart.filter(l => l.id !== productId);
  else { const line = cart.find(l => l.id === productId); if (line) line.qty = qty; }
  setCart(cart);
  updateBottombarBadges();
}

function cartLinesWithProduct() {
  return getCart().map(l => ({ ...l, product: MENU.find(p => p.id === l.id) })).filter(l => l.product);
}

function cartTotal() {
  return cartLinesWithProduct().reduce((sum, l) => sum + l.product.price * l.qty, 0);
}

function cartCount() {
  return getCart().reduce((sum, l) => sum + l.qty, 0);
}

function getOrders() { return JSON.parse(localStorage.getItem(LS_ORDERS) || '[]'); }
function setOrders(orders) { localStorage.setItem(LS_ORDERS, JSON.stringify(orders)); }

function placeOrder() {
  const lines = cartLinesWithProduct();
  if (!lines.length) return null;
  const user = getUser();
  const order = {
    id: 'DH' + Date.now().toString().slice(-6),
    table: getTable(),
    phone: user ? user.phone : null,
    items: lines.map(l => ({ id: l.id, name: l.product.name, price: l.product.price, qty: l.qty })),
    total: cartTotal(),
    status: ORDER_STAGES[0],
    createdAt: new Date().toISOString(),
  };
  const orders = getOrders();
  orders.unshift(order);
  setOrders(orders);
  setCart([]);

  // Tích điểm demo: 1 điểm / 10.000đ, cộng ngay khi đặt (thực tế nên cộng khi "Hoàn thành")
  if (user) {
    user.points = (user.points || 0) + Math.floor(order.total / 10000);
    setUser(user);
  }
  return order;
}

function myOrders() {
  const user = getUser();
  const table = getTable();
  return getOrders().filter(o => (user && o.phone === user.phone) || o.table === table);
}

// ---------- UI bits dùng chung nhiều trang ----------
function showToast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 1600);
}

function renderTopbar(pointsVisible = true) {
  const table = getTable();
  const user = getUser();
  document.querySelectorAll('.table-tag').forEach(el => el.textContent = table ? ('Bàn ' + table) : 'Chưa quét bàn');
  document.querySelectorAll('.points').forEach(el => {
    el.textContent = pointsVisible && user ? '★ ' + (user.points || 0) + ' điểm' : '';
  });
}

function updateBottombarBadges() {
  document.querySelectorAll('.js-cart-count').forEach(el => el.textContent = cartCount());
  document.querySelectorAll('.js-cart-amount').forEach(el => el.textContent = money(cartTotal()));
  document.querySelectorAll('.js-cart-fab').forEach(el => {
    el.style.display = cartCount() > 0 ? 'flex' : 'none';
  });
}

// Poll để mô phỏng realtime: khi module Thu ngân/Bếp cập nhật localStorage
// ở tab khác trên cùng trình duyệt, trang theo dõi đơn sẽ tự refresh.
function pollOrders(callback, intervalMs = 2000) {
  callback();
  return setInterval(callback, intervalMs);
}
window.addEventListener('storage', (e) => {
  if (e.key === LS_ORDERS && typeof window.onOrdersChanged === 'function') window.onOrdersChanged();
});

document.addEventListener('DOMContentLoaded', () => {
  getTable();
  renderTopbar();
  updateBottombarBadges();
});
