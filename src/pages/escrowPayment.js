// ===== Escrow Payment Page =====
import Store from '../data/store.js';
import { getCurrentUser } from '../data/auth.js';
import { fundDeal, COMMISSION_PERCENT } from '../data/escrow.js';
import { showToast } from '../components/notifications.js';
import { navigate, getParams } from '../router.js';
import { formatCurrency } from '../utils/format.js';

export function renderEscrowPayment(container) {
    const user = getCurrentUser();
    const { params } = getParams();
    const dealId = params.deal;

    if (!user || !dealId) {
        container.innerHTML = '<div class="container section text-center"><p>Bitim topilmadi</p></div>';
        return;
    }

    const deal = Store.getById('deals', dealId);
    if (!deal) {
        container.innerHTML = '<div class="container section text-center"><p>Bitim topilmadi</p></div>';
        return;
    }

    const worker = Store.getById('users', deal.worker_id);
    const commission = Math.round(deal.amount * COMMISSION_PERCENT / 100);
    const total = deal.amount + commission;

    if (deal.status !== 'created') {
        container.innerHTML = `
      <div class="container section">
        <div class="container-sm">
          <div class="card text-center" style="padding:var(--sp-8);">
            <div style="font-size:3rem;margin-bottom:var(--sp-4);">✅</div>
            <h2 class="mb-3">Pul allaqachon bloklangan</h2>
            <p class="text-muted mb-6">Bu bitim uchun escrow to'lovi amalga oshirilgan.</p>
            <a href="#/deal/${dealId}" class="btn btn-primary">Bitimni ko'rish</a>
          </div>
        </div>
      </div>
    `;
        return;
    }

    container.innerHTML = `
    <div class="page-header">
      <div class="container">
        <h1>Escrow to'lovi</h1>
        <p>Pul xavfsiz bloklanadi — ishchi ishni bajarganda chiqariladi</p>
      </div>
    </div>

    <div class="container section">
      <div class="container-sm">
        <div class="escrow-box mb-6">
          <span style="font-size:3rem;">🔒</span>
          <p class="text-muted mt-3">Bloklanadigan summa</p>
          <div class="escrow-amount">${formatCurrency(total)}</div>
          <p class="text-sm text-muted">Pul xavfsiz bloklanadi</p>
        </div>

        <div class="card mb-6" style="padding:var(--sp-6);">
          <h3 class="mb-4">To'lov tafsilotlari</h3>
          <div class="escrow-detail">
            <span class="text-muted">Bitim:</span>
            <strong>${deal.title}</strong>
          </div>
          <div class="escrow-detail">
            <span class="text-muted">Ishchi:</span>
            <strong>${worker ? worker.full_name : '-'}</strong>
          </div>
          <div class="escrow-detail">
            <span class="text-muted">Ish haqi:</span>
            <strong>${formatCurrency(deal.amount)}</strong>
          </div>
          <div class="escrow-detail">
            <span class="text-muted">Platforma komissiyasi (${COMMISSION_PERCENT}%):</span>
            <strong>${formatCurrency(commission)}</strong>
          </div>
          <div class="escrow-detail" style="border-bottom:none;padding-top:var(--sp-4);">
            <span class="font-semibold" style="font-size:var(--fs-lg);">Jami:</span>
            <strong style="font-size:var(--fs-lg);color:var(--blue-700);">${formatCurrency(total)}</strong>
          </div>
        </div>

        <div class="status-bar status-bar-info mb-6">
          🔐 Pul IshGarant escrow hisobida xavfsiz saqlanadi. Ishchi ishni bajargandan keyin va siz tasdiqlaganingizdan keyin o'tkaziladi.
        </div>

        <div class="card-flat mb-4" style="padding:var(--sp-4);">
          <p class="text-sm text-muted">
            <strong>Sizning balansingiz:</strong> ${formatCurrency(user.balance)}
            ${user.balance < total ? '<span class="text-danger ml-2">⚠️ Mablag\' yetarli emas</span>' : '<span class="text-success ml-2">✓ Yetarli</span>'}
          </p>
        </div>

        <button class="btn btn-success btn-block btn-lg" id="fund-btn" ${user.balance < total ? 'disabled' : ''}>
          🔒 Escrow orqali to'lash
        </button>

        <div id="payment-result" class="hidden mt-6"></div>
      </div>
    </div>
  `;

    document.getElementById('fund-btn').addEventListener('click', () => {
        const btn = document.getElementById('fund-btn');
        btn.disabled = true;
        btn.textContent = '⏳ To\'lov amalga oshirilmoqda...';

        // Simulate payment delay
        setTimeout(() => {
            const result = fundDeal(dealId, user.id);
            if (result.success) {
                showToast('Pul muvaffaqiyatli bloklandi!', 'success');
                document.getElementById('payment-result').classList.remove('hidden');
                document.getElementById('payment-result').innerHTML = `
          <div class="status-bar status-bar-success" style="flex-direction:column;align-items:center;padding:var(--sp-6);">
            <div style="font-size:2.5rem;margin-bottom:var(--sp-3);">✅</div>
            <h3 style="color:var(--green-700);">Pul bloklandi!</h3>
            <p class="text-sm text-muted mt-2">Tranzaksiya ID: TXN-${Date.now()}</p>
            <a href="#/deal/${dealId}" class="btn btn-primary mt-4">Bitimni ko'rish</a>
          </div>
        `;
                btn.classList.add('hidden');
            } else {
                showToast(result.error, 'error');
                btn.disabled = false;
                btn.textContent = '🔒 Escrow orqali to\'lash';
            }
        }, 1500);
    });
}
