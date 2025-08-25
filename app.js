/* ===== Helper DOM ===== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ===== Navbar: hamburger ===== */
const hamburger = $("#hamburger");
const navLinks = $("#navLinks");
if (hamburger) {
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("show");
    hamburger.classList.toggle("open");
  });
}

/* ===== Dark Mode ===== */
const dmBtn = $("#darkModeToggle");
const userPref = localStorage.getItem("kartunflix_theme");
if (userPref === "light") document.body.classList.add("light");

const applyIcon = () => dmBtn && (dmBtn.textContent = document.body.classList.contains("light") ? "🌞" : "🌙");
applyIcon();

dmBtn && dmBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("kartunflix_theme", document.body.classList.contains("light") ? "light" : "dark");
  applyIcon();
});

/* ===== Cards init ===== */
const cards = $$(".card");
cards.forEach(card => {
  const rating = parseFloat(card.dataset.rating || "0");
  const pct = Math.max(0, Math.min(5, rating)) / 5 * 100;
  const stars = $(".stars", card);
  if (stars) stars.style.setProperty("--pct", `${pct}%`);
});

/* ===== Search ===== */
const searchInput = $("#searchInput");
searchInput && searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  cards.forEach(card => {
    const title = (card.dataset.title || "").toLowerCase();
    const desc  = (card.dataset.desc || "").toLowerCase();
    card.style.display = (title.includes(q) || desc.includes(q)) ? "" : "none";
  });
});

/* ===== Filter Kategori ===== */
const chips = $$(".chip");
chips.forEach(btn => btn.addEventListener("click", () => {
  $(".chip.active")?.classList.remove("active");
  btn.classList.add("active");
  const cat = btn.dataset.category;
  cards.forEach(card => {
    card.style.display = (cat === "all" || card.dataset.category === cat) ? "" : "none";
  });
}));

/* ===== Toast Notification ===== */
const showToast = (msg) => {
  let toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(()=>toast.classList.add("show"),50);
  setTimeout(()=>{
    toast.classList.remove("show");
    setTimeout(()=>toast.remove(),400);
  },3000);
};

/* ===== Favorit ===== */
const FAV_KEY = "kartunflix_favorites";
const getFavs = () => JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
const setFavs = (arr) => localStorage.setItem(FAV_KEY, JSON.stringify(arr));
const favCount = $("#favCount");
const favIndicator = $("#favIndicator");

const updateFavCount = () => favCount && (favCount.textContent = getFavs().length);
updateFavCount();

const toggleFav = (title, btn) => {
  let favs = getFavs();
  if (favs.includes(title)) {
    favs = favs.filter(f => f !== title);
    btn.textContent = "❤️ Favorit";
    btn.classList.remove("active");
    showToast("❌ Dihapus dari Favorit");
  } else {
    favs.push(title);
    btn.textContent = "💖 Disimpan";
    btn.classList.add("active");
    showToast("✅ Disimpan ke Favorit");
  }
  setFavs(favs);
  updateFavCount();
};

cards.forEach(card => {
  const favBtn = $(".fav", card);
  if (!favBtn) return;
  const title = card.dataset.title;
  if (getFavs().includes(title)) {
    favBtn.textContent = "💖 Disimpan";
    favBtn.classList.add("active");
  }
  favBtn.addEventListener("click", () => toggleFav(title, favBtn));
});

favIndicator && favIndicator.addEventListener("click", (e) => {
  e.preventDefault();
  const favs = new Set(getFavs());
  if (!favs.size) { alert("Favoritmu masih kosong."); return; }
  cards.forEach(card => {
    const title = (card.dataset.title || "").toLowerCase();
    card.style.display = favs.has(title) ? "" : "none";
  });
});

/* ===== History ===== */
const HISTORY_KEY = "kartunflix_history";
const getHistory = () => JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
const setHistory = (arr) => localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
const addToHistory = (title) => {
  let history = getHistory();
  if (!history.includes(title)) history.unshift(title);
  if (history.length > 20) history = history.slice(0,20);
  setHistory(history);
  showToast("🎬 Ditambahkan ke Riwayat");
};

/* ===== Tonton ===== */
cards.forEach(card => {
  const link = card.dataset.link;
  $(".tonton", card)?.addEventListener("click", () => {
    const title = card.dataset.title;
    if (card.classList.contains("premium")) {
      window.location.href = "premium.html";
    } else if (link) {
      addToHistory(title);
      window.location.href = link;
    }
  });
});

/* ===== Infinite Scroll ===== */
let itemsToShow = 6;
const showCards = () => {
  cards.forEach((card, i) => {
    card.style.display = i < itemsToShow ? "" : "none";
  });
};
if (cards.length) showCards();

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    itemsToShow += 4;
    showCards();
  }
});

/* ===== Animasi Scroll fade-in ===== */
document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(".fade-in-up");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  elements.forEach(el => observer.observe(el));
});
// Tambah riwayat saat klik "Tonton"
document.querySelectorAll(".tonton").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    const title = card.dataset.title;
    const img = card.querySelector("img").src;

    let history = JSON.parse(localStorage.getItem("history")) || [];
    history.unshift({ title, img, date: new Date().toLocaleString() });
    localStorage.setItem("history", JSON.stringify(history));

    showToast(`▶️ ${title} ditambahkan ke Riwayat`);
  });
});

// Load riwayat di history.html
if (document.getElementById("historyList")) {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  const list = document.getElementById("historyList");

  if (history.length === 0) {
    list.innerHTML = "<p>Belum ada riwayat tontonan</p>";
  } else {
    history.forEach(item => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <div class="thumb"><img src="${item.img}" alt="${item.title}"></div>
        <div class="card-body">
          <h3>${item.title}</h3>
          <small>Ditonton pada: ${item.date}</small>
        </div>
      `;
      list.appendChild(div);
    });
  }
}
// Detail film
if (document.getElementById("filmDetail")) {
  const params = new URLSearchParams(window.location.search);
  const film = params.get("film");

  const data = {
    upin: { title: "Upin & Ipin", img: "images/upin-ipin.jpeg", desc: "Kisah kembar lucu dari Malaysia." },
    adit: { title: "Adit Sopo Jarwo", img: "images/adit.jpeg", desc: "Petualangan Adit dan kawan-kawan." },
    naruto: { title: "Naruto", img: "images/naruto.jpeg", desc: "Perjuangan Naruto jadi Hokage." },
    zaman: { title: "Pada Zaman Dahulu", img: "images/pada-zaman-dahulu.jpeg", desc: "Dongeng klasik penuh nilai moral." }
  };

  const f = data[film];
  if (f) {
    document.getElementById("filmDetail").innerHTML = `
      <div class="card" style="max-width:600px;margin:auto;">
        <div class="thumb"><img src="${f.img}" alt="${f.title}"></div>
        <div class="card-body">
          <h2>${f.title}</h2>
          <p>${f.desc}</p>
          <button class="btn btn-primary fav">❤️ Tambah ke Favorit</button>
          <button class="btn btn-outline tonton">▶️ Tonton</button>
        </div>
      </div>
    `;
  }
}
// Register
const regForm = document.getElementById("registerForm");
if (regForm) {
  regForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("regEmail").value;
    const pass = document.getElementById("regPass").value;
    localStorage.setItem("user", JSON.stringify({ email, pass }));
    showToast("✅ Registrasi berhasil!");
    setTimeout(() => window.location = "login.html", 1500);
  });
}

// Login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const pass = document.getElementById("loginPass").value;
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.email === email && user.pass === pass) {
      showToast("🎉 Login sukses!");
      localStorage.setItem("loggedIn", "true");
      setTimeout(() => window.location = "index.html", 1500);
    } else {
      showToast("❌ Email/Password salah!");
    }
  });
}
// ====== DEFAULT USER (biar gampang login) ======
if (!localStorage.getItem("user")) {
  localStorage.setItem("user", JSON.stringify({
    email: "admin@kartunflix.com",
    pass: "12345"
  }));
}
// ====== Navbar Login/Logout + Sapaan Nama ======
const navRight = document.querySelector(".nav-right");

if (navRight) {
  const loggedIn = localStorage.getItem("loggedIn") === "true";
  const user = JSON.parse(localStorage.getItem("user"));
  const loginBtn = document.querySelector(".btn-outline");

  if (loggedIn && user) {
    // Pakai nama custom
    const greetName = "Geraldhino"; // bisa diganti sesuai kebutuhan
    const greet = document.createElement("span");
    greet.textContent = `👋 Hai, ${greetName}`;
    greet.style.marginRight = "1rem";
    greet.style.fontWeight = "600";
    greet.style.color = "white";

    navRight.prepend(greet);

    // Ubah tombol login jadi logout
    if (loginBtn) {
      loginBtn.textContent = "Logout";
      loginBtn.classList.remove("btn-outline");
      loginBtn.classList.add("btn-primary");

      loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("loggedIn");
        showToast("🚪 Logout berhasil!");
        setTimeout(() => window.location = "login.html", 1000);
      });
    }
  } else {
    // Kalau belum login, tetap tampil Login
    if (loginBtn) {
      loginBtn.textContent = "Login";
      loginBtn.href = "login.html";
    }
  }
}
