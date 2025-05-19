const products = [
  {
    id: 1,
    name: "Cristiano Ronaldo",
    price: 79.99,
    image: "imges/cris.webp",
    stock: 10
  },
  {
    id: 2,
    name: "Mithgal Al-horine",
    price: 1000000000.99,
    image: "imges/me.jpeg",
    stock: 8
  },
  {
    id: 1,
    name: "Cristiano Ronaldo",
    price: 79.99,
    image: "imges/cris.webp",
    stock: 10
  },
  {
    id: 2,
    name: "Mithgal Al-horine",
    price: 1000000000.99,
    image: "imges/me.jpeg",
    stock: 8
  },
  {
    id: 1,
    name: "Cristiano Ronaldo",
    price: 79.99,
    image: "imges/cris.webp",
    stock: 10
  },
  {
    id: 2,
    name: "Mithgal Al-horine",
    price: 1000000000.99,
    image: "imges/me.jpeg",
    stock: 8
  }
];

let cart = [];
let darkMode = false;

const productsContainer = document.querySelector('.products');
const cartContainer = document.querySelector('.scroll-box ul');
const totalPriceEl = document.querySelector('.total-price');
const clearCartBtn = document.querySelector('.clear-button');
const proceedBtn = document.querySelector('.proceed-button');
const searchInput = document.getElementById('search');
const themeToggleBtn = document.getElementById('moon');
const cartIcon = document.querySelector('.fa-cart-shopping');
const rightSection = document.querySelector('.right-section');

function init() {
  loadFromLocalStorage();
  renderProducts();
  renderCart();
  updateTotal();
  applyTheme();
  setupEventListeners();
}

function loadFromLocalStorage() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    cart.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) product.stock -= item.quantity;
    });
  }
  const savedTheme = localStorage.getItem('darkMode');
  if (savedTheme) {
    darkMode = JSON.parse(savedTheme);
  }
}

function saveToLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
  localStorage.setItem('darkMode', JSON.stringify(darkMode));
}

function renderProducts(filterText = '') {
  productsContainer.innerHTML = '';
  const filtered = products.filter(p => p.name.toLowerCase().includes(filterText.toLowerCase()));

  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p class="price">$${product.price.toFixed(2)}</p>
      <p>In Stock: ${product.stock}</p>
      <button ${product.stock === 0 ? 'disabled' : ''} class="add-to-cart" data-id="${product.id}">
        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    `;
    productsContainer.appendChild(card);
  });
}

function renderCart() {
  cartContainer.innerHTML = '';
  if (cart.length === 0) {
    const li = document.createElement('li');
    li.innerHTML = `<p>Nothing</p>`;
    cartContainer.appendChild(li);
    return;
  }

  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <img src="${item.image}" alt="${item.name}" style="width:50px; height:50px; object-fit:cover; margin-right: 10px;">
      <span>${item.name} - $${item.price.toFixed(2)}</span>
      <div style="display: inline-block; margin-left: 10px;">
        <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
        <span style="margin: 0 5px;">${item.quantity}</span>
        <button class="quantity-btn" data-id="${item.id}" data-action="increase" ${isAtStockLimit(item) ? 'disabled' : ''}>+</button>
      </div>
      <button class="remove-btn" data-id="${item.id}" style="margin-left: 10px;">Remove</button>
    `;
    cartContainer.appendChild(li);
  });
}

function isAtStockLimit(cartItem) {
  const product = products.find(p => p.id === cartItem.id);
  if (!product) return true;
  return cartItem.quantity >= cartItem.quantity + product.stock ? true : false;
}

function updateTotal() {
  let total = 0;
  let count = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
    count += item.quantity;
  });
  totalPriceEl.textContent = `Total: $${total.toFixed(2)} (${count} ${count === 1 ? 'item' : 'items'})`;
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || product.stock <= 0) return;

  const cartItem = cart.find(item => item.id === productId);
  if (cartItem) {
    if (product.stock > 0) {
      cartItem.quantity++;
      product.stock--;
    }
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    product.stock--;
  }
  saveToLocalStorage();
  renderProducts(searchInput.value);
  renderCart();
  updateTotal();
}

function removeFromCart(productId) {
  const index = cart.findIndex(item => item.id === productId);
  if (index === -1) return;
  const item = cart[index];
  const product = products.find(p => p.id === productId);
  if (product) product.stock += item.quantity;
  cart.splice(index, 1);
  saveToLocalStorage();
  renderProducts(searchInput.value);
  renderCart();
  updateTotal();
}

function updateQuantity(productId, delta) {
  const cartItem = cart.find(item => item.id === productId);
  const product = products.find(p => p.id === productId);
  if (!cartItem || !product) return;

  const newQuantity = cartItem.quantity + delta;

  if (delta > 0) {
    if (product.stock > 0) {
      cartItem.quantity = newQuantity;
      product.stock--;
    }
  } else if (delta < 0 && newQuantity > 0) {
    cartItem.quantity = newQuantity;
    product.stock++;
  }

  if (cartItem.quantity === 0) {
    removeFromCart(productId);
    return;
  }

  saveToLocalStorage();
  renderProducts(searchInput.value);
  renderCart();
  updateTotal();
}

function clearCart() {
  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (product) product.stock += item.quantity;
  });
  cart = [];
  saveToLocalStorage();
  renderProducts(searchInput.value);
  renderCart();
  updateTotal();
}

function toggleTheme() {
  darkMode = !darkMode;
  applyTheme();
  saveToLocalStorage();
}

function applyTheme() {
  if (darkMode) {
    document.body.setAttribute('data-theme', 'dark');
    themeToggleBtn.classList.remove('fa-moon');
    themeToggleBtn.classList.add('fa-sun');
  } else {
    document.body.setAttribute('data-theme', 'light');
    themeToggleBtn.classList.remove('fa-sun');
    themeToggleBtn.classList.add('fa-moon');
  }
}

function setupEventListeners() {
  searchInput.addEventListener('input', e => {
    renderProducts(e.target.value);
  });

  productsContainer.addEventListener('click', e => {
    if (e.target.classList.contains('add-to-cart')) {
      const id = parseInt(e.target.dataset.id);
      addToCart(id);
    }
  });

  cartContainer.addEventListener('click', e => {
    const id = parseInt(e.target.dataset.id);
    if (e.target.classList.contains('quantity-btn')) {
      const action = e.target.dataset.action;
      if (action === 'increase') {
        updateQuantity(id, 1);
      } else if (action === 'decrease') {
        updateQuantity(id, -1);
      }
    }
else if (e.target.classList.contains('remove-btn')) {
removeFromCart(id);
}
});

clearCartBtn.addEventListener('click', () => {
clearCart();
});

proceedBtn.addEventListener('click', () => {
if (cart.length === 0) {
alert('Your cart is empty!');
} else {
alert('Proceeding to checkout...');
// يمكنك إضافة عملية دفع أو صفحة جديدة هنا
}
});

themeToggleBtn.addEventListener('click', () => {
toggleTheme();
});
}

init();