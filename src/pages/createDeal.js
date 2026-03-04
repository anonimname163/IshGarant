// ===== Create Deal Page =====
import Store from '../data/store.js';
import { getCurrentUser } from '../data/auth.js';
import { createDeal } from '../data/escrow.js';
import { showToast } from '../components/notifications.js';
import { navigate, getParams } from '../router.js';
import { formatCurrency } from '../utils/format.js';

export function renderCreateDeal(container) {
    const user = getCurrentUser();
    if (!user || user.role !== 'client') {
        container.innerHTML = `
      <div class="container section text-center">
        <div class="empty-state">
          <div class="empty-state-icon">🔒</div>
          <h3>Kirish kerak</h3>
          <p class="text-muted">Bitim yaratish uchun mijoz sifatida kiring</p>
          <a href="#/login" class="btn btn-primary mt-4">Kirish</a>
        </div>
      </div>
    `;
        return;
    }

    const { params } = getParams();
    const workers = Store.getByField('users', 'role', 'worker').filter(w => !w.blocked);
    let currentStep = 1;

    container.innerHTML = `
    <div class="page-header">
      <div class="container">
        <h1>Yangi bitim yaratish</h1>
        <p>Bosqichma-bosqich to'ldiring</p>
      </div>
    </div>

    <div class="container section">
      <div class="container-md">
        <div class="card" style="padding:var(--sp-8);">
          <!-- Progress -->
          <div class="progress-labels">
            <span class="progress-label active" id="pl-1">1. Tavsif</span>
            <span class="progress-label" id="pl-2">2. Shartlar</span>
            <span class="progress-label" id="pl-3">3. Qo'shimcha</span>
            <span class="progress-label" id="pl-4">4. Tasdiqlash</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-step active" id="ps-1"></div>
            <div class="progress-step" id="ps-2"></div>
            <div class="progress-step" id="ps-3"></div>
            <div class="progress-step" id="ps-4"></div>
          </div>

          <form id="deal-form">
            <!-- Step 1: Description -->
            <div class="wizard-step active" id="step-1">
              <h3 class="mb-4">Ish tavsifi</h3>
              <div class="form-group">
                <label class="form-label">Ishchi tanlang</label>
                <select class="form-select" id="deal-worker" required>
                  <option value="">Ishchi tanlang...</option>
                  ${workers.map(w => `
                    <option value="${w.id}" ${params.worker === w.id ? 'selected' : ''}>
                      ${w.full_name} (★ ${w.rating})
                    </option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Bitim nomi</label>
                <input type="text" class="form-input" id="deal-title" placeholder="Masalan: Kvartira ta'mirlash" required>
              </div>
              <div class="form-group">
                <label class="form-label">Batafsil tavsif</label>
                <textarea class="form-textarea" id="deal-description" placeholder="Ish haqida batafsil yozing..." required style="min-height:120px;"></textarea>
              </div>
            </div>

            <!-- Step 2: Terms -->
            <div class="wizard-step" id="step-2">
              <h3 class="mb-4">Moliyaviy shartlar</h3>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Summa (UZS)</label>
                  <input type="number" class="form-input" id="deal-amount" placeholder="500 000" min="50000" required>
                  <span class="form-hint">Minimal: 50 000 so'm</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Muddat</label>
                  <input type="date" class="form-input" id="deal-deadline" required>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Qabul mezonlari</label>
                <textarea class="form-textarea" id="deal-criteria" placeholder="Ish qabul qilinishi uchun bajarilishi kerak bo'lgan shartlarni yozing..." required></textarea>
                <span class="form-hint">Aniq va tushunarli yozing — bu nizolarda hal qiluvchi omil bo'ladi</span>
              </div>
            </div>

            <!-- Step 3: Additional conditions -->
            <div class="wizard-step" id="step-3">
              <h3 class="mb-4">Qo'shimcha shartlar</h3>
              <div class="form-group">
                <label class="form-label">Qo'shimcha talablar (ixtiyoriy)</label>
                <textarea class="form-textarea" id="deal-conditions" placeholder="Masalan: Materiallar mijoz tomonidan ta'minlanadi..." style="min-height:120px;"></textarea>
                <span class="form-hint">Bu ixtiyoriy. Qo'shimcha shartu-sharoitlar kiritishingiz mumkin.</span>
              </div>
            </div>

            <!-- Step 4: Review -->
            <div class="wizard-step" id="step-4">
              <h3 class="mb-4">Bitim tekshiruvi</h3>
              <div class="status-bar status-bar-info mb-4">
                ℹ️ Barcha ma'lumotlarni tekshiring va tasdiqlang
              </div>
              <div id="deal-summary" class="card-flat" style="padding:var(--sp-5);"></div>
            </div>

            <!-- Actions -->
            <div class="wizard-actions">
              <button type="button" class="btn btn-ghost" id="prev-btn" style="visibility:hidden;">← Oldingi</button>
              <button type="button" class="btn btn-primary" id="next-btn">Keyingi →</button>
              <button type="submit" class="btn btn-success btn-lg hidden" id="submit-btn">✓ Bitim yaratish</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

    const totalSteps = 4;

    function updateProgress() {
        for (let i = 1; i <= totalSteps; i++) {
            const step = document.getElementById(`step-${i}`);
            const ps = document.getElementById(`ps-${i}`);
            const pl = document.getElementById(`pl-${i}`);

            step.classList.toggle('active', i === currentStep);
            ps.classList.toggle('active', i === currentStep);
            ps.classList.toggle('completed', i < currentStep);
            pl.classList.toggle('active', i === currentStep);
            pl.classList.toggle('completed', i < currentStep);
        }

        document.getElementById('prev-btn').style.visibility = currentStep === 1 ? 'hidden' : 'visible';
        document.getElementById('next-btn').classList.toggle('hidden', currentStep === totalSteps);
        document.getElementById('submit-btn').classList.toggle('hidden', currentStep !== totalSteps);

        if (currentStep === totalSteps) {
            renderSummary();
        }
    }

    function renderSummary() {
        const workerId = document.getElementById('deal-worker').value;
        const worker = Store.getById('users', workerId);
        const amount = parseInt(document.getElementById('deal-amount').value) || 0;
        const commission = Math.round(amount * 0.03);
        const total = amount + commission;

        document.getElementById('deal-summary').innerHTML = `
      <div class="escrow-detail"><span class="text-muted">Ishchi:</span><strong>${worker ? worker.full_name : '-'}</strong></div>
      <div class="escrow-detail"><span class="text-muted">Nomi:</span><strong>${document.getElementById('deal-title').value}</strong></div>
      <div class="escrow-detail"><span class="text-muted">Tavsif:</span><span>${document.getElementById('deal-description').value}</span></div>
      <div class="escrow-detail"><span class="text-muted">Summa:</span><strong>${formatCurrency(amount)}</strong></div>
      <div class="escrow-detail"><span class="text-muted">Platforma komissiyasi (3%):</span><strong>${formatCurrency(commission)}</strong></div>
      <div class="escrow-detail"><span class="text-muted">Jami bloklanadigan summa:</span><strong style="color:var(--blue-700);">${formatCurrency(total)}</strong></div>
      <div class="escrow-detail"><span class="text-muted">Muddat:</span><strong>${document.getElementById('deal-deadline').value}</strong></div>
      <div class="escrow-detail"><span class="text-muted">Qabul mezonlari:</span><span>${document.getElementById('deal-criteria').value}</span></div>
      ${document.getElementById('deal-conditions').value ? `
        <div class="escrow-detail"><span class="text-muted">Qo'shimcha:</span><span>${document.getElementById('deal-conditions').value}</span></div>
      ` : ''}
    `;
    }

    function validateStep(step) {
        if (step === 1) {
            if (!document.getElementById('deal-worker').value) { showToast('Ishchi tanlang', 'warning'); return false; }
            if (!document.getElementById('deal-title').value.trim()) { showToast('Bitim nomini kiriting', 'warning'); return false; }
            if (!document.getElementById('deal-description').value.trim()) { showToast('Tavsifni kiriting', 'warning'); return false; }
        }
        if (step === 2) {
            const amount = parseInt(document.getElementById('deal-amount').value);
            if (!amount || amount < 50000) { showToast('Minimal summa 50 000 so\'m', 'warning'); return false; }
            if (!document.getElementById('deal-deadline').value) { showToast('Muddatni kiriting', 'warning'); return false; }
            if (!document.getElementById('deal-criteria').value.trim()) { showToast('Qabul mezonlarini kiriting', 'warning'); return false; }
        }
        return true;
    }

    document.getElementById('next-btn').addEventListener('click', () => {
        if (!validateStep(currentStep)) return;
        if (currentStep < totalSteps) {
            currentStep++;
            updateProgress();
        }
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateProgress();
        }
    });

    document.getElementById('deal-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const deal = createDeal({
            client_id: user.id,
            worker_id: document.getElementById('deal-worker').value,
            title: document.getElementById('deal-title').value.trim(),
            description: document.getElementById('deal-description').value.trim(),
            amount: parseInt(document.getElementById('deal-amount').value),
            deadline: document.getElementById('deal-deadline').value,
            acceptance_criteria: document.getElementById('deal-criteria').value.trim(),
            additional_conditions: document.getElementById('deal-conditions').value.trim()
        });

        showToast('Bitim yaratildi! Endi escrow to\'lovini amalga oshiring.', 'success');
        navigate(`/escrow-payment?deal=${deal.id}`);
    });
}
