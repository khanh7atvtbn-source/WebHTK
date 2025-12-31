function login(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const error = document.getElementById("error");

  if (username === "admin" && password === "123") {
    localStorage.setItem("isLogin", "true");
    localStorage.setItem("username", username);
    window.location.href = "admin.html";
    return;
  }

  error.innerText = "Sai tài khoản hoặc mật khẩu!";
}
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

let products = [];

function loadProducts() {
  const localData = localStorage.getItem("products");

  if (localData) {
    products = JSON.parse(localData);
    renderProducts();
    renderAdminList();
  } else {
    fetch("data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Không tìm thấy data.json");
        return res.json();
      })
      .then((data) => {
        products = data;
        localStorage.setItem("products", JSON.stringify(products));
        renderProducts();
        renderAdminList();
      })
      .catch((err) => console.error("Lỗi load data.json:", err));
  }
}

function renderProducts() {
  const container = document.getElementById("productContainer");
  if (!container) return;

  container.innerHTML = products
    .map(
      (p) => `
      <div class="product-card">
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="price">${p.price.toLocaleString()}đ</p>
        <button onclick="addToCart('${p.name}', ${p.price})">
          Thêm vào giỏ
        </button>
      </div>
    `
    )
    .join("");
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price) {
  const item = cart.find((i) => i.name === name);
  item ? item.quantity++ : cart.push({ name, price, quantity: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  showToast();
}

function loadCart() {
  const list = document.getElementById("cartList");
  const totalEl = document.getElementById("totalPrice");
  if (!list || !totalEl) return;

  list.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    total += item.price * item.quantity;
    list.innerHTML += `
      <li>
        ${item.name} x ${item.quantity}
        <button onclick="removeItem(${i})">❌</button>
      </li>
    `;
  });

  totalEl.innerText = total.toLocaleString();
}

function removeItem(i) {
  cart.splice(i, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

function clearCart() {
  if (!confirm("Bạn chắc chắn muốn xoá giỏ hàng?")) return;
  cart = [];
  localStorage.removeItem("cart");
  loadCart();
}

function addProduct() {
  const name = document.getElementById("name")?.value.trim();
  const price = document.getElementById("price")?.value;
  const image = document.getElementById("preview")?.src;

  if (!name || !price || !image) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  products.push({ name, price: Number(price), image });
  localStorage.setItem("products", JSON.stringify(products));
  renderAdminList();
  alert("Thêm sản phẩm thành công (demo)");
}

function renderAdminList() {
  const list = document.getElementById("list");
  if (!list) return;

  list.innerHTML = products
    .map(
      (p, i) => `
      <li>
        ${p.name} - ${p.price.toLocaleString()}đ
        <button onclick="deleteProduct(${i})">❌</button>
      </li>
    `
    )
    .join("");
}

function deleteProduct(i) {
  if (!confirm("Xoá sản phẩm này?")) return;
  products.splice(i, 1);
  localStorage.setItem("products", JSON.stringify(products));
  renderAdminList();
}

const imageInput = document.getElementById("imageUpload");
if (imageInput) {
  imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById("preview").src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function showToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCart();
});
