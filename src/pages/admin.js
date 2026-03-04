// ===== Admin Panel Page =====
import Store from '../data/store.js';
import { getCurrentUser } from '../data/auth.js';
import { resolveDispute } from '../data/escrow.js';
import { showToast } from '../components/notifications.js';
import { showModal, closeModal } from '../components/notifications.js';
import { navigate } from '../router.js';
import { formatCurrency, formatDate, dealStatusLabel, dealStatusBadge, escrowStatusLabel, escrowStatusBadge, userRoleLabel, disputeResolutionLabel } from '../utils/format.js';

export function renderAdmin(container) {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        container.innerHTML = `
      <div class="container section text-center">
        <div class="empty-state">
          <div class="empty-state-icon">🔒</div>
          <h3>Ruxsat berilmagan</h3>
          <p class="text-muted">Admin panelga faqat administratorlar kira oladi</p>
          <a href="#/login" class="btn btn-primary mt-4">Kirish</a>
        </div>
      </div>
    `;
        return;
    }

    const users = Store.getAll('users').filter(u => u.role !== 'admin');
    const deals = Store.getAll('deals');
    const disputes = Store.getAll('disputes');
    const openDisputes = disputes.filter(d => d.status === 'open');

    container.innerHTML = `
    <div class="page-header">
      <div class="container">
        <h1>Admin Panel 🔑</h1>
        <p class="text-muted">Platforma boshqaruvi</p>
      </div>
    </div>

    <div class="container section">
      <!-- Stats -->
      <div class="grid grid-4 gap-4 mb-8">
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--blue-100);color:var(--blue-700);">👥</div>
          <div class="stat-value">${users.length}</div>
          <div class="stat-label">Foydalanuvchilar</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--green-100);color:var(--green-700);">📄</div>
          <div class="stat-value">${deals.length}</div>
          <div class="stat-label">Jami bitimlar</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--red-100);color:var(--red-600);">⚠️</div>
          <div class="stat-value">${openDisputes.length}</div>
          <div class="stat-label">Ochiq da'volar</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--yellow-100);color:var(--yellow-600);">💰</div>
          <div class="stat-value" style="font-size:var(--fs-xl);">${formatCurrency(deals.reduce((sum, d) => sum + (d.amount || 0), 0))}</div>
          <div class="stat-label">Jami oborot</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab active" data-tab="disputes">Da'volar (${openDisputes.length} ochiq)</button>
        <button class="tab" data-tab="deals">Bitimlar (${deals.length})</button>
        <button class="tab" data-tab="users">Foydalanuvchilar (${users.length})</button>
      </div>

      <!-- Disputes -->
      <div id="tab-disputes" class="tab-content">
        ${disputes.length > 0 ? `
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Bitim</th>
                  <th>Sabab</th>
                  <th>Holat</th>
                  <th>Qaror</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                ${disputes.map(d => {
        const deal = Store.getById('deals', d.deal_id);
        return `
                    <tr>
                      <td>
                        <a href="#/deal/${d.deal_id}" class="font-semibold">${deal?.title || 'Noma\'lum'}</a>
                        <br><span class="text-xs text-muted">${formatCurrency(deal?.amount)}</span>
                      </td>
                      <td class="text-sm">${d.reason}</td>
                      <td>
                        <span class="badge ${d.status === 'open' ? 'badge-red' : 'badge-green'}">
                          ${d.status === 'open' ? 'Ochiq' : 'Hal qilingan'}
                        </span>
                      </td>
                      <td class="text-sm">${d.resolution_type ? disputeResolutionLabel(d.resolution_type) : '-'}</td>
                      <td>
                        ${d.status === 'open' ? `
                          <div class="flex gap-2" style="flex-wrap:wrap;">
                            <button class="btn btn-sm btn-success resolve-btn" data-id="${d.id}" data-type="worker_full">Ishchiga</button>
                            <button class="btn btn-sm btn-danger resolve-btn" data-id="${d.id}" data-type="client_refund">Mijozga</button>
                            <button class="btn btn-sm btn-outline resolve-btn" data-id="${d.id}" data-type="split">50/50</button>
                          </div>
                        ` : '<span class="text-sm text-muted">Hal qilingan</span>'}
                      </td>
                    </tr>
                  `;
    }).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">✅</div>
            <h3>Da'volar yo'q</h3>
          </div>
        `}
      </div>

      <!-- Deals -->
      <div id="tab-deals" class="tab-content hidden">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Nomi</th>
                <th>Mijoz</th>
                <th>Ishchi</th>
                <th>Summa</th>
                <th>Holat</th>
                <th>Escrow</th>
                <th>Sana</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              ${deals.map(deal => {
        const client = Store.getById('users', deal.client_id);
        const worker = deal.worker_id ? Store.getById('users', deal.worker_id) : null;
        return `
                  <tr>
                    <td><a href="#/deal/${deal.id}" class="font-semibold">${deal.title}</a></td>
                    <td class="text-sm">${client?.full_name || '-'}</td>
                    <td class="text-sm">${worker?.full_name || '-'}</td>
                    <td class="font-semibold">${formatCurrency(deal.amount)}</td>
                    <td><span class="badge ${dealStatusBadge(deal.status)}">${dealStatusLabel(deal.status)}</span></td>
                    <td><span class="badge ${escrowStatusBadge(deal.escrow_status)}">${escrowStatusLabel(deal.escrow_status)}</span></td>
                    <td class="text-sm text-muted">${formatDate(deal.created_at)}</td>
                    <td>
                      <button class="btn btn-sm btn-ghost change-status-btn" data-deal="${deal.id}">Holatni o'zgartirish</button>
                    </td>
                  </tr>
                `;
    }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Users -->
      <div id="tab-users" class="tab-content hidden">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Ism</th>
                <th>Telefon</th>
                <th>Rol</th>
                <th>Reyting</th>
                <th>Bitimlar</th>
                <th>Balans</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td class="font-semibold">
                    <a href="#/${u.role === 'worker' ? 'worker' : 'client'}/${u.id}">${u.full_name}</a>
                  </td>
                  <td class="text-sm">${u.phone}</td>
                  <td><span class="badge badge-blue">${userRoleLabel(u.role)}</span></td>
                  <td>${u.rating}</td>
                  <td>${u.completed_deals}</td>
                  <td class="text-sm">${formatCurrency(u.balance)}</td>
                  <td>
                    <span class="badge ${u.blocked ? 'badge-red' : 'badge-green'}">
                      ${u.blocked ? 'Bloklangan' : 'Faol'}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm ${u.blocked ? 'btn-success' : 'btn-danger'} toggle-block-btn" data-user="${u.id}" data-blocked="${u.blocked}">
                      ${u.blocked ? 'Blokdan chiqarish' : 'Bloklash'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

    // Bind events
    bindAdminEvents();
}

function bindAdminEvents() {
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

    // Resolve disputes
    document.querySelectorAll('.resolve-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const disputeId = btn.dataset.id;
            const resType = btn.dataset.type;

            showModal("Da'voni hal qilish", `
        <p class="text-muted mb-4">Qaror: <strong>${disputeResolutionLabel(resType)}</strong></p>
        <div class="form-group">
          <label class="form-label">Izoh (ixtiyoriy)</label>
          <textarea class="form-textarea" id="admin-notes" placeholder="Admin izohi..."></textarea>
        </div>
        <div class="status-bar status-bar-warning">⚠️ Bu amal qaytarib bo'lmaydi!</div>
      `, `
        <div class="flex gap-3">
          <button class="btn btn-primary flex-1" id="confirm-resolve">Tasdiqlash</button>
          <button class="btn btn-ghost flex-1" id="cancel-resolve">Bekor qilish</button>
        </div>
      `);

            document.getElementById('confirm-resolve').addEventListener('click', () => {
                const notes = document.getElementById('admin-notes').value.trim();
                const result = resolveDispute(disputeId, resType, notes || disputeResolutionLabel(resType));
                closeModal();
                if (result.success) {
                    showToast(`Da'vo hal qilindi. Ishchi: ${formatCurrency(result.workerPayout)}, Mijoz: ${formatCurrency(result.clientRefund)}`, 'success');
                    renderAdmin(document.getElementById('main-content'));
                } else {
                    showToast(result.error, 'error');
                }
            });

            document.getElementById('cancel-resolve').addEventListener('click', closeModal);
        });
    });

    // Block/unblock users
    document.querySelectorAll('.toggle-block-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.dataset.user;
            const isBlocked = btn.dataset.blocked === 'true';
            Store.update('users', userId, { blocked: !isBlocked });
            showToast(isBlocked ? 'Foydalanuvchi blokdan chiqarildi' : 'Foydalanuvchi bloklandi', 'info');
            renderAdmin(document.getElementById('main-content'));
        });
    });

    // Change deal status
    document.querySelectorAll('.change-status-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dealId = btn.dataset.deal;
            const deal = Store.getById('deals', dealId);

            showModal('Bitim holatini o\'zgartirish', `
        <p class="text-muted mb-3">Joriy holat: <span class="badge ${dealStatusBadge(deal.status)}">${dealStatusLabel(deal.status)}</span></p>
        <div class="form-group">
          <label class="form-label">Yangi holat</label>
          <select class="form-select" id="new-deal-status">
            <option value="created" ${deal.status === 'created' ? 'selected' : ''}>Yaratilgan</option>
            <option value="funded" ${deal.status === 'funded' ? 'selected' : ''}>To'langan</option>
            <option value="in_progress" ${deal.status === 'in_progress' ? 'selected' : ''}>Bajarilmoqda</option>
            <option value="completed" ${deal.status === 'completed' ? 'selected' : ''}>Yakunlangan</option>
            <option value="disputed" ${deal.status === 'disputed' ? 'selected' : ''}>Da'vogar</option>
            <option value="resolved" ${deal.status === 'resolved' ? 'selected' : ''}>Hal qilingan</option>
            <option value="cancelled" ${deal.status === 'cancelled' ? 'selected' : ''}>Bekor qilingan</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Escrow holati</label>
          <select class="form-select" id="new-escrow-status">
            <option value="pending" ${deal.escrow_status === 'pending' ? 'selected' : ''}>Kutilmoqda</option>
            <option value="blocked" ${deal.escrow_status === 'blocked' ? 'selected' : ''}>Bloklangan</option>
            <option value="released" ${deal.escrow_status === 'released' ? 'selected' : ''}>Chiqarilgan</option>
            <option value="refunded" ${deal.escrow_status === 'refunded' ? 'selected' : ''}>Qaytarilgan</option>
            <option value="split" ${deal.escrow_status === 'split' ? 'selected' : ''}>Taqsimlangan</option>
          </select>
        </div>
      `, `<button class="btn btn-primary btn-block" id="save-deal-status">Saqlash</button>`);

            document.getElementById('save-deal-status').addEventListener('click', () => {
                const newStatus = document.getElementById('new-deal-status').value;
                const newEscrowStatus = document.getElementById('new-escrow-status').value;
                Store.update('deals', dealId, { status: newStatus, escrow_status: newEscrowStatus });

                const escrow = Store.getOneByField('escrows', 'deal_id', dealId);
                if (escrow) {
                    Store.update('escrows', escrow.id, { status: newEscrowStatus });
                }

                closeModal();
                showToast('Bitim holati yangilandi', 'success');
                renderAdmin(document.getElementById('main-content'));
            });
        });
    });
}
