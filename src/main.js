// ===== IshGarant — Main Entry Point =====
import { initSeedData } from './data/store.js';
import { registerRoute, initRouter } from './router.js';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';

// Pages
import { renderHome } from './pages/home.js';
import { renderAbout } from './pages/about.js';
import { renderLogin, renderRegister } from './pages/auth.js';
import { renderWorkerProfile } from './pages/workerProfile.js';
import { renderClientProfile } from './pages/clientProfile.js';
import { renderCreateDeal } from './pages/createDeal.js';
import { renderEscrowPayment } from './pages/escrowPayment.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderDealView } from './pages/dealView.js';
import { renderAdmin } from './pages/admin.js';
import { renderSettings } from './pages/settings.js';

// Initialize seed data
initSeedData();

// Register routes
registerRoute('/', renderHome);
registerRoute('/about', renderAbout);
registerRoute('/login', renderLogin);
registerRoute('/register', renderRegister);
registerRoute('/worker/:id', renderWorkerProfile);
registerRoute('/client/:id', renderClientProfile);
registerRoute('/create-deal', renderCreateDeal);
registerRoute('/escrow-payment', renderEscrowPayment);
registerRoute('/dashboard', renderDashboard);
registerRoute('/deal/:id', renderDealView);
registerRoute('/admin', renderAdmin);
registerRoute('/settings', renderSettings);

// Render shell
renderNavbar();
renderFooter();

// Re-render navbar on route change
window.addEventListener('hashchange', () => {
    renderNavbar();
});

// Initialize router
initRouter();
