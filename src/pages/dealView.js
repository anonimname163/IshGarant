// ===== Deal View Page =====
import Store from '../data/store.js';
import { getCurrentUser } from '../data/auth.js';
import { completeDeal, acceptDeal, openDispute, getDealWithDetails } from '../data/escrow.js';
import { showToast } from '../components/notifications.js';
import { showModal, closeModal } from '../components/notifications.js';
import { navigate } from '../router.js';
import { formatCurrency, formatDate, dealStatusLabel, dealStatusBadge, escrowStatusLabel, escrowStatusBadge, renderStars } from '../utils/format.js';
import { renderNavbar } from '../components/navbar.js';

export function renderDealView(container, params) {
    const dealId = params?.id;
    const user = getCurrentUser();

    if (!dealId) {
        container.innerHTML = '<div class="container section"><p>Bitim topilmadi</p></div>';
        return;
    }

    const data = getDealWithDetails(dealId);
    if (!data || !data.deal) {
        container.innerHTML = '<div class="container section"><p>Bitim topilmadi</p></div>';
        return;
    }

    const { deal, client, worker, escrow, dispute, reviews } = data;
    const isClient = user && user.id === deal.client_id;
    const isWorker = user && user.id === deal.worker_id;

    container.innerHTML = `
    <div class="page-header">
      <div class="container">
        <p class="text-muted mb-2"><a href="#/dashboard">← Dashboard</a></p>
        <div class="flex-between" style="flex-wrap:wrap;gap:var(--sp-3);">
          <div>
            <h1>${deal.title}</h1>
            <div class="flex gap-3 mt-2" style="align-items:center;">
              <span class="badge ${dealStatusBadge(deal.status)}">${dealStatusLabel(deal.status)}</span>
              ${escrow ? `<span class="badge ${escrowStatusBadge(deal.escrow_status)}">Escrow: ${escrowStatusLabel(deal.escrow_status)}</span>` : ''}
            </div>
          </div>
          <div class="text-right">
            <div style="font-size:var(--fs-2xl);font-weight:800;color:var(--blue-700);">${formatCurrency(deal.amount)}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="container section">
      <div class="grid" style="grid-template-columns:2fr 1fr;gap:var(--sp-6);">
        <!-- Main content -->
        <div>
          <!-- Deal details -->
          <div class="card mb-6">
            <h3 class="mb-4">Bitim tafsilotlari</h3>
            <div class="mb-4">
              <label class="text-sm text-muted font-semibold">Tavsif</label>
              <p class="mt-1">${deal.description}</p>
            </div>
            <div class="mb-4">
              <label class="text-sm text-muted font-semibold">Qabul mezonlari</label>
              <p class="mt-1">${deal.acceptance_criteria}</p>
            </div>
            ${deal.additional_conditions ? `
              <div class="mb-4">
                <label class="text-sm text-muted font-semibold">Qo'shimcha shartlar</label>
                <p class="mt-1">${deal.additional_conditions}</p>
              </div>
            ` : ''}
            <div class="escrow-detail">
              <span class="text-muted">Muddat:</span>
              <strong>${formatDate(deal.deadline)}</strong>
            </div>
            <div class="escrow-detail">
              <span class="text-muted">Yaratilgan:</span>
              <span>${formatDate(deal.created_at)}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="card mb-6" id="deal-actions">
            <h3 class="mb-4">Amallar</h3>
            ${renderDealActions(deal, user, isClient, isWorker)}
          </div>

          <!-- Dispute info -->
          ${dispute ? `
            <div class="card mb-6" style="border-left:4px solid var(--red-500);">
              <h3 class="mb-3 text-danger">Da'vo</h3>
              <div class="escrow-detail"><span class="text-muted">Sabab:</span><span>${dispute.reason}</span></div>
              <div class="escrow-detail"><span class="text-muted">Holat:</span><span class="badge ${dispute.status === 'open' ? 'badge-red' : 'badge-green'}">${dispute.status === 'open' ? 'Ochiq' : 'Hal qilingan'}</span></div>
              ${dispute.admin_decision ? `
                <div class="escrow-detail"><span class="text-muted">Admin qarori:</span><strong>${dispute.admin_decision}</strong></div>
              ` : ''}
              ${dispute.evidence_description ? `
                <div class="escrow-detail"><span class="text-muted">Dalillar:</span><span>${dispute.evidence_description}</span></div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Reviews -->
          ${reviews && reviews.length > 0 ? `
            <div class="card">
              <h3 class="mb-3">Sharhlar</h3>
              ${reviews.map(r => {
        const reviewer = Store.getById('users', r.from_user_id);
        return `
                  <div class="review-card">
                    <div class="review-header">
                      <span class="review-author">${reviewer ? reviewer.full_name : 'Foydalanuvchi'}</span>
                      ${renderStars(r.rating)}
                    </div>
                    <p class="review-text mt-2">${r.text}</p>
                  </div>
                `;
    }).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Sidebar -->
        <div>
          <!-- Participants -->
          <div class="card mb-4">
            <h4 class="mb-3">Ishtirokchilar</h4>
            <div class="flex gap-3 mb-3" style="align-items:center;">
              <div class="profile-avatar" style="width:40px;height:40px;font-size:1rem;border-radius:var(--radius-md);">
                ${client?.full_name?.charAt(0) || '?'}
              </div>
              <div>
                <a href="#/client/${deal.client_id}" class="text-sm font-semibold">${client?.full_name || 'Noma\'lum'}</a>
                <p class="text-xs text-muted">Mijoz</p>
              </div>
            </div>
            ${worker ? `
              <div class="flex gap-3" style="align-items:center;">
                <div class="profile-avatar" style="width:40px;height:40px;font-size:1rem;border-radius:var(--radius-md);">
                  ${worker.full_name.charAt(0)}
                </div>
                <div>
                  <a href="#/worker/${deal.worker_id}" class="text-sm font-semibold">${worker.full_name}</a>
                  <p class="text-xs text-muted">Ishchi</p>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Escrow -->
          ${escrow ? `
            <div class="card">
              <h4 class="mb-3">Escrow holati</h4>
              <div class="escrow-detail"><span class="text-muted text-sm">Ish haqi:</span><strong class="text-sm">${formatCurrency(escrow.amount)}</strong></div>
              <div class="escrow-detail"><span class="text-muted text-sm">Komissiya:</span><strong class="text-sm">${formatCurrency(escrow.commission_amount)}</strong></div>
              <div class="escrow-detail"><span class="text-muted text-sm">Jami bloklangan:</span><strong class="text-sm">${formatCurrency(escrow.total_blocked)}</strong></div>
              <div class="escrow-detail"><span class="text-muted text-sm">Chiqarilgan:</span><strong class="text-sm text-success">${formatCurrency(escrow.released_amount)}</strong></div>
              <div class="escrow-detail" style="border-bottom:none;">
                <span class="text-muted text-sm">Holat:</span>
                <span class="badge ${escrowStatusBadge(escrow.status)}">${escrowStatusLabel(escrow.status)}</span>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

    // Bind action event listeners
    bindDealActions(dealId, user, isClient, isWorker);
}

function renderDealActions(deal, user, isClient, isWorker) {
    if (!user) return '<p class="text-muted">Amal qilish uchun tizimga kiring</p>';

    let actions = '';

    // Client can fund a created deal
    if (isClient && deal.status === 'created') {
        actions += `<a href="#/escrow-payment?deal=${deal.id}" class="btn btn-success btn-block mb-3">🔒 Escrow orqali to'lash</a>`;
    }

    // Worker can accept a funded deal
    if (isWorker && deal.status === 'funded') {
        actions += `<button class="btn btn-primary btn-block mb-3" id="accept-deal-btn">✓ Ishni qabul qilish</button>`;
    }

    // Client can confirm completion
    if (isClient && deal.status === 'in_progress') {
        actions += `<button class="btn btn-success btn-block mb-3" id="complete-deal-btn">✅ Ishni tasdiqlash va to'lovni chiqarish</button>`;
        actions += `<button class="btn btn-danger btn-block mb-3" id="dispute-deal-btn">⚠️ Da'vo ochish</button>`;
    }

    // Worker can open dispute for funded/in_progress
    if (isWorker && ['funded', 'in_progress'].includes(deal.status)) {
        actions += `<button class="btn btn-danger btn-block mb-3" id="dispute-deal-btn">⚠️ Da'vo ochish</button>`;
    }

    if (deal.status === 'completed' && !Store.getByField('reviews', 'from_user_id', user.id).find(r => r.deal_id === deal.id)) {
        actions += `<button class="btn btn-outline btn-block mb-3" id="leave-review-btn">⭐ Sharh qoldirish</button>`;
    }

    if (!actions) {
        const statusMessages = {
            'completed': '✅ Bu bitim muvaffaqiyatli yakunlangan',
            'disputed': '⚠️ Bu bitim da\'vo holatida — admin qaror kutilmoqda',
            'resolved': '✅ Bu bitim hal qilingan',
        };
        actions = `<div class="status-bar ${deal.status === 'disputed' ? 'status-bar-warning' : 'status-bar-success'}">${statusMessages[deal.status] || 'Amallar mavjud emas'}</div>`;
    }

    return actions;
}

function bindDealActions(dealId, user, isClient, isWorker) {
    const acceptBtn = document.getElementById('accept-deal-btn');
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            const result = acceptDeal(dealId, user.id);
            if (result.success) {
                showToast('Ish qabul qilindi! Endi ishlashni boshlang.', 'success');
                navigate(`/deal/${dealId}`);
            } else {
                showToast(result.error, 'error');
            }
        });
    }

    const completeBtn = document.getElementById('complete-deal-btn');
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            showModal('Ishni tasdiqlash', `
        <p class="text-muted mb-4">Ishni tasdiqlash va to'lovni ishchiga o'tkazishni xohlaysizmi?</p>
        <div class="status-bar status-bar-warning mb-4">⚠️ Bu amal qaytarib bo'lmaydi!</div>
      `, `
        <div class="flex gap-3">
          <button class="btn btn-success flex-1" id="confirm-complete">✅ Tasdiqlash</button>
          <button class="btn btn-ghost flex-1" id="cancel-complete">Bekor qilish</button>
        </div>
      `);

            document.getElementById('confirm-complete').addEventListener('click', () => {
                const result = completeDeal(dealId, user.id);
                closeModal();
                if (result.success) {
                    showToast(`Pul ishchiga o'tkazildi: ${formatCurrency(result.releasedAmount)}`, 'success');
                    renderNavbar();
                    navigate(`/deal/${dealId}`);
                } else {
                    showToast(result.error, 'error');
                }
            });

            document.getElementById('cancel-complete').addEventListener('click', closeModal);
        });
    }

    const disputeBtn = document.getElementById('dispute-deal-btn');
    if (disputeBtn) {
        disputeBtn.addEventListener('click', () => {
            showModal("Da'vo ochish", `
        <div class="form-group">
          <label class="form-label">Sabab</label>
          <textarea class="form-textarea" id="dispute-reason" placeholder="Da'vo sababini batafsil yozing..." required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Dalillar tavsifi (ixtiyoriy)</label>
          <textarea class="form-textarea" id="dispute-evidence" placeholder="Rasm yoki dalillar haqida yozing..."></textarea>
        </div>
      `, `
        <div class="flex gap-3">
          <button class="btn btn-danger flex-1" id="confirm-dispute">Da'vo ochish</button>
          <button class="btn btn-ghost flex-1" id="cancel-dispute">Bekor qilish</button>
        </div>
      `);

            document.getElementById('confirm-dispute').addEventListener('click', () => {
                const reason = document.getElementById('dispute-reason').value.trim();
                if (!reason) { showToast('Sababni kiriting', 'warning'); return; }
                const evidence = document.getElementById('dispute-evidence').value.trim();
                const result = openDispute(dealId, user.id, reason, evidence);
                closeModal();
                if (result.success) {
                    showToast("Da'vo ochildi. Admin ko'rib chiqadi.", 'info');
                    navigate(`/deal/${dealId}`);
                } else {
                    showToast(result.error, 'error');
                }
            });

            document.getElementById('cancel-dispute').addEventListener('click', closeModal);
        });
    }

    const reviewBtn = document.getElementById('leave-review-btn');
    if (reviewBtn) {
        reviewBtn.addEventListener('click', () => {
            const deal = Store.getById('deals', dealId);
            const toUserId = isClient ? deal.worker_id : deal.client_id;

            showModal('Sharh qoldirish', `
        <div class="form-group">
          <label class="form-label">Reyting</label>
          <select class="form-select" id="review-rating">
            <option value="5">⭐⭐⭐⭐⭐ — A'lo</option>
            <option value="4">⭐⭐⭐⭐ — Yaxshi</option>
            <option value="3">⭐⭐⭐ — O'rtacha</option>
            <option value="2">⭐⭐ — Yomon</option>
            <option value="1">⭐ — Juda yomon</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Izoh</label>
          <textarea class="form-textarea" id="review-text" placeholder="Sharhingizni yozing..."></textarea>
        </div>
      `, `<button class="btn btn-primary btn-block" id="submit-review">Yuborish</button>`);

            document.getElementById('submit-review').addEventListener('click', () => {
                const rating = parseInt(document.getElementById('review-rating').value);
                const text = document.getElementById('review-text').value.trim();
                if (!text) { showToast('Izoh yozing', 'warning'); return; }

                Store.create('reviews', {
                    deal_id: dealId,
                    from_user_id: user.id,
                    to_user_id: toUserId,
                    rating,
                    text
                });

                // Update target user rating
                const targetReviews = Store.getByField('reviews', 'to_user_id', toUserId);
                const avgRating = targetReviews.reduce((sum, r) => sum + r.rating, 0) / targetReviews.length;
                Store.update('users', toUserId, { rating: Math.round(avgRating * 10) / 10 });

                closeModal();
                showToast('Sharh qoldirildi!', 'success');
                navigate(`/deal/${dealId}`);
            });
        });
    }
}
