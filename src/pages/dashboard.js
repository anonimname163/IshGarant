// ===== Dashboard Page =====
import Store from '../data/store.js';
import { getCurrentUser } from '../data/auth.js';
import { requestWithdrawal, MIN_WITHDRAWAL, WITHDRAWAL_FEE_PERCENT } from '../data/escrow.js';
import { showToast } from '../components/notifications.js';
import { showModal, closeModal } from '../components/notifications.js';
import { navigate } from '../router.js';
import { formatCurrency, formatDate, dealStatusLabel, dealStatusBadge, truncateText } from '../utils/format.js';
import { renderNavbar } from '../components/navbar.js';

export function renderDashboard(container) {
    const user = getCurrentUser();
    if (!user) {
        container.innerHTML = `
      <div class="container section text-center">
        <div class="empty-state">
          <div class="empty-state-icon">🔒</div>
          <h3>Kirish kerak</h3>
          <p class="text-muted">Dashboard uchun tizimga kiring</p>
          <a href="#/login" class="btn btn-primary mt-4">Kirish</a>
        </div>
      </div>
    `;
        return;
    }

    if (user.role === 'worker') {
        renderWorkerDashboard(container, user);
    } else if (user.role === 'client') {
        renderClientDashboard(container, user);
    } else {
        navigate('/admin');
    }
}

function renderWorkerDashboard(container, user) {
    const allDeals = Store.getByField('deals', 'worker_id', user.id);
    const activeDeals = allDeals.filter(d => ['funded', 'in_progress', 'disputed'].includes(d.status));
    const completedDeals = allDeals.filter(d => ['completed', 'resolved'].includes(d.status));
    const withdrawals = Store.getByField('withdrawals', 'worker_id', user.id);

    container.innerHTML = `
    <div class="page-header">
      <div class="container">
        <h1>Salom, ${user.full_name}! 👷</h1>
        <p class="text-muted">Ishchi dashboard</p>
      </div>
    </div>

    <div class="container section">
      <!-- Stats -->
      <div class="grid grid-4 gap-4 mb-8">
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--blue-100);color:var(--blue-700);">💼</div>
          <div class="stat-value">${activeDeals.length}</div>
          <div class="stat-label">Faol bitimlar</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--green-100);color:var(--green-700);">✅</div>
          <div class="stat-value">${completedDeals.length}</div>
          <div class="stat-label">Bajarilgan</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--yellow-100);color:var(--yellow-600);">⭐</div>
          <div class="stat-value">${user.rating}</div>
          <div class="stat-label">Reyting</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--green-100);color:var(--green-700);">💰</div>
          <div class="stat-value" style="font-size:var(--fs-xl);">${formatCurrency(user.balance)}</div>
          <div class="stat-label">Balans</div>
        </div>
      </div>

      <!-- Balance & Withdraw -->
      <div class="card mb-6" style="background:linear-gradient(135deg, var(--blue-900), #0F2557);color:white;border:none;">
        <div class="flex-between" style="flex-wrap:wrap;gap:var(--sp-4);">
          <div>
            <p style="color:rgba(255,255,255,0.7);font-size:var(--fs-sm);">Joriy balans</p>
            <div style="font-size:var(--fs-4xl);font-weight:800;">${formatCurrency(user.balance)}</div>
            <p style="color:rgba(255,255,255,0.5);font-size:var(--fs-xs);margin-top:var(--sp-1);">
              Minimal yechish: ${formatCurrency(MIN_WITHDRAWAL)} | Komissiya: ${WITHDRAWAL_FEE_PERCENT}%
            </p>
          </div>
          <button class="btn btn-success btn-lg" id="withdraw-btn" ${user.balance < MIN_WITHDRAWAL ? 'disabled' : ''}>
            💸 Pul yechish
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab active" data-tab="active">Faol bitimlar (${activeDeals.length})</button>
        <button class="tab" data-tab="completed">Bajarilgan (${completedDeals.length})</button>
        <button class="tab" data-tab="withdrawals">Yechishlar (${withdrawals.length})</button>
      </div>

      <!-- Active deals -->
      <div id="tab-active" class="tab-content">
        ${activeDeals.length > 0 ? activeDeals.map(deal => renderDealCard(deal)).join('') : `
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <h3>Faol bitimlar yo'q</h3>
            <p class="text-muted">Mijozlar siz bilan bitim tuzganda bu yerda ko'rinadi</p>
          </div>
        `}
      </div>

      <!-- Completed deals -->
      <div id="tab-completed" class="tab-content hidden">
        ${completedDeals.length > 0 ? completedDeals.map(deal => renderDealCard(deal)).join('') : `
          <div class="empty-state">
            <div class="empty-state-icon">✅</div>
            <h3>Bajarilgan bitimlar yo'q</h3>
          </div>
        `}
      </div>

      <!-- Withdrawals -->
      <div id="tab-withdrawals" class="tab-content hidden">
        ${withdrawals.length > 0 ? `
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Sana</th>
                  <th>Summa</th>
                  <th>Komissiya</th>
                  <th>Sof summa</th>
                  <th>Holat</th>
                  <th>Tranzaksiya ID</th>
                </tr>
              </thead>
              <tbody>
                ${withdrawals.map(w => `
                  <tr>
                    <td>${formatDate(w.created_at)}</td>
                    <td>${formatCurrency(w.amount)}</td>
                    <td class="text-danger">${formatCurrency(w.fee)}</td>
                    <td class="font-semibold">${formatCurrency(w.net_amount)}</td>
                    <td><span class="badge badge-green">Bajarildi</span></td>
                    <td class="text-xs text-muted">${w.transaction_id}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">💸</div>
            <h3>Yechishlar tarixi yo'q</h3>
          </div>
        `}
      </div>
    </div>
  `;

    bindDashboardEvents(user);
}

function renderClientDashboard(container, user) {
    const allDeals = Store.getByField('deals', 'client_id', user.id);
    const activeDeals = allDeals.filter(d => ['created', 'funded', 'in_progress', 'disputed'].includes(d.status));
    const completedDeals = allDeals.filter(d => ['completed', 'resolved'].includes(d.status));

    container.innerHTML = `
    <div class="page-header">
      <div class="container">
        <div class="flex-between" style="flex-wrap:wrap;gap:var(--sp-4);">
          <div>
            <h1>Salom, ${user.full_name}! 👤</h1>
            <p class="text-muted">Mijoz dashboard</p>
          </div>
          <a href="#/create-deal" class="btn btn-primary btn-lg">+ Yangi bitim</a>
        </div>
      </div>
    </div>

    <div class="container section">
      <!-- Stats -->
      <div class="grid grid-4 gap-4 mb-8">
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--blue-100);color:var(--blue-700);">💼</div>
          <div class="stat-value">${activeDeals.length}</div>
          <div class="stat-label">Faol bitimlar</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--green-100);color:var(--green-700);">✅</div>
          <div class="stat-value">${completedDeals.length}</div>
          <div class="stat-label">Bajarilgan</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--yellow-100);color:var(--yellow-600);">⭐</div>
          <div class="stat-value">${user.rating}</div>
          <div class="stat-label">Reyting</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--blue-100);color:var(--blue-700);">💳</div>
          <div class="stat-value" style="font-size:var(--fs-xl);">${formatCurrency(user.balance)}</div>
          <div class="stat-label">Balans</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab active" data-tab="active">Faol bitimlar (${activeDeals.length})</button>
        <button class="tab" data-tab="completed">Bajarilgan (${completedDeals.length})</button>
        <button class="tab" data-tab="all">Barcha (${allDeals.length})</button>
      </div>

      <div id="tab-active" class="tab-content">
        ${activeDeals.length > 0 ? activeDeals.map(deal => renderDealCard(deal)).join('') : `
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <h3>Faol bitimlar yo'q</h3>
            <p class="text-muted">Yangi bitim yarating</p>
            <a href="#/create-deal" class="btn btn-primary mt-4">+ Yangi bitim</a>
          </div>
        `}
      </div>

      <div id="tab-completed" class="tab-content hidden">
        ${completedDeals.length > 0 ? completedDeals.map(deal => renderDealCard(deal)).join('') : `
          <div class="empty-state">
            <div class="empty-state-icon">✅</div>
            <h3>Bajarilgan bitimlar yo'q</h3>
          </div>
        `}
      </div>

      <div id="tab-all" class="tab-content hidden">
        ${allDeals.length > 0 ? allDeals.map(deal => renderDealCard(deal)).join('') : `
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <h3>Bitimlar yo'q</h3>
          </div>
        `}
      </div>
    </div>
  `;

    bindDashboardEvents(user);
}

function renderDealCard(deal) {
    const client = Store.getById('users', deal.client_id);
    const worker = deal.worker_id ? Store.getById('users', deal.worker_id) : null;

    return `
    <div class="deal-card mb-3" onclick="window.location.hash='/deal/${deal.id}'">
      <div class="deal-card-header">
        <div>
          <h4 style="font-size:var(--fs-base);margin-bottom:4px;">${deal.title}</h4>
          <p class="text-sm text-muted">${truncateText(deal.description, 80)}</p>
        </div>
        <span class="deal-card-amount">${formatCurrency(deal.amount)}</span>
      </div>
      <div class="deal-card-footer">
        <div class="flex gap-3" style="align-items:center;">
          <span class="badge ${dealStatusBadge(deal.status)}">${dealStatusLabel(deal.status)}</span>
          <span class="text-xs text-muted">Muddat: ${formatDate(deal.deadline)}</span>
        </div>
        <div class="text-xs text-muted">
          ${worker ? `Ishchi: ${worker.full_name}` : ''}
          ${client ? `Mijoz: ${client.full_name}` : ''}
        </div>
      </div>
    </div>
  `;
}

function bindDashboardEvents(user) {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            tab.classList.add('active');
            const target = document.getElementById(`tab-${tab.dataset.tab}`);
            if (target) target.classList.remove('hidden');
        });
    });

    // Withdraw
    const withdrawBtn = document.getElementById('withdraw-btn');
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', () => {
            showModal('Pul yechish', `
        <div class="form-group">
          <label class="form-label">Summa (UZS)</label>
          <input type="number" class="form-input" id="withdraw-amount" placeholder="100 000" min="${MIN_WITHDRAWAL}">
          <span class="form-hint">Minimal: ${formatCurrency(MIN_WITHDRAWAL)} | Komissiya: ${WITHDRAWAL_FEE_PERCENT}%</span>
          <span class="form-hint">Mavjud: ${formatCurrency(user.balance)}</span>
        </div>
        <div id="withdraw-calc" class="card-flat mt-3" style="padding:var(--sp-3);display:none;">
          <div class="escrow-detail text-sm"><span class="text-muted">Summa:</span><span id="w-amount">-</span></div>
          <div class="escrow-detail text-sm"><span class="text-muted">Komissiya (${WITHDRAWAL_FEE_PERCENT}%):</span><span id="w-fee" class="text-danger">-</span></div>
          <div class="escrow-detail text-sm" style="border-bottom:none;"><span class="font-semibold">Sof summa:</span><strong id="w-net">-</strong></div>
        </div>
      `, `<button class="btn btn-success btn-block" id="confirm-withdraw">Yechish</button>`);

            const amountInput = document.getElementById('withdraw-amount');
            const calcDiv = document.getElementById('withdraw-calc');

            amountInput.addEventListener('input', () => {
                const amount = parseInt(amountInput.value) || 0;
                if (amount >= MIN_WITHDRAWAL) {
                    const fee = Math.round(amount * WITHDRAWAL_FEE_PERCENT / 100);
                    document.getElementById('w-amount').textContent = formatCurrency(amount);
                    document.getElementById('w-fee').textContent = formatCurrency(fee);
                    document.getElementById('w-net').textContent = formatCurrency(amount - fee);
                    calcDiv.style.display = 'block';
                } else {
                    calcDiv.style.display = 'none';
                }
            });

            document.getElementById('confirm-withdraw').addEventListener('click', () => {
                const amount = parseInt(amountInput.value);
                const result = requestWithdrawal(user.id, amount);
                closeModal();
                if (result.success) {
                    showToast(`${formatCurrency(result.netAmount)} muvaffaqiyatli yechildi!`, 'success');
                    renderNavbar();
                    renderDashboard(document.getElementById('main-content'));
                } else {
                    showToast(result.error, 'error');
                }
            });
        });
    }
}
