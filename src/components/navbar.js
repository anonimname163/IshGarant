// ===== Navbar Component =====
import { getCurrentUser, logout } from '../data/auth.js';
import { navigate } from '../router.js';

export function renderNavbar() {
    const nav = document.getElementById('navbar');
    const user = getCurrentUser();

    let links = `
    <a href="#/">Bosh sahifa</a>
    <a href="#/about">Biz haqimizda</a>
  `;

    let authSection = '';
    let mobileMenu = '';

    if (user) {
        if (user.role === 'worker') {
            links += `<a href="#/dashboard">Dashboard</a>`;
        } else if (user.role === 'client') {
            links += `
        <a href="#/dashboard">Dashboard</a>
        <a href="#/create-deal">Bitim yaratish</a>
      `;
        } else if (user.role === 'admin') {
            links += `<a href="#/admin">Admin panel</a>`;
        }

        authSection = `
      <div class="navbar-auth">
        <span class="text-sm text-muted">${user.full_name}</span>
        <button class="btn btn-sm btn-ghost" id="logout-btn">Chiqish</button>
      </div>
    `;
    } else {
        authSection = `
      <div class="navbar-auth">
        <a href="#/login" class="btn btn-sm btn-outline">Kirish</a>
        <a href="#/register" class="btn btn-sm btn-primary">Ro'yxatdan o'tish</a>
      </div>
    `;
    }

    nav.className = 'navbar';
    nav.innerHTML = `
    <div class="navbar-inner">
      <a href="#/" class="navbar-brand">
        Ish<span>Garant</span>
      </a>
      <div class="navbar-links" id="nav-links">
        ${links}
      </div>
      ${authSection}
      <button class="navbar-toggle" id="nav-toggle" aria-label="Menyu">☰</button>
    </div>
    <div class="mobile-menu" id="mobile-menu">
      ${links}
      ${user
            ? `<button class="btn btn-sm btn-ghost w-full" id="mobile-logout-btn">Chiqish</button>`
            : `<a href="#/login" class="btn btn-sm btn-outline w-full">Kirish</a>
           <a href="#/register" class="btn btn-sm btn-primary w-full">Ro'yxatdan o'tish</a>`
        }
    </div>
  `;

    // Toggle mobile menu
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('mobile-menu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('open');
        });
    }

    // Logout handlers
    const logoutBtn = document.getElementById('logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

    function handleLogout() {
        logout();
        navigate('/');
        renderNavbar();
    }

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
}
