// ===== Client Profile Page =====
import Store from '../data/store.js';
import { renderStars } from '../utils/format.js';

export function renderClientProfile(container, params) {
    const clientId = params?.id;
    if (!clientId) {
        container.innerHTML = '<div class="container section"><p>Mijoz topilmadi</p></div>';
        return;
    }

    const client = Store.getById('users', clientId);
    if (!client || client.role !== 'client') {
        container.innerHTML = '<div class="container section"><p>Mijoz topilmadi</p></div>';
        return;
    }

    const profile = Store.getOneByField('clientProfiles', 'user_id', clientId);
    const reviews = Store.getByField('reviews', 'to_user_id', clientId);

    container.innerHTML = `
    <div class="page-header">
      <div class="container">
        <p class="text-muted mb-2"><a href="#/">← Bosh sahifaga</a></p>
        <h1>Mijoz profili</h1>
      </div>
    </div>

    <div class="container section">
      <div class="card mb-6">
        <div class="profile-header">
          <div class="profile-avatar" style="background:linear-gradient(135deg, var(--green-500), var(--green-700));">
            ${client.full_name.charAt(0)}
          </div>
          <div class="profile-info">
            <h2>${client.full_name}</h2>
            <div class="profile-meta mt-2">
              <span class="profile-meta-item">👤 Mijoz</span>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-3 gap-4 mb-6">
          <div class="stat-card text-center">
            <div class="stat-value" style="color:var(--yellow-500);">
              ${renderStars(client.rating)}
            </div>
            <div class="stat-label">${client.rating} / 5 reyting</div>
          </div>
          <div class="stat-card text-center">
            <div class="stat-value">${client.completed_deals}</div>
            <div class="stat-label">Jami bitimlar</div>
          </div>
          <div class="stat-card text-center">
            <div class="stat-value" style="color:var(--green-600);">${profile?.payment_discipline_score || 0}%</div>
            <div class="stat-label">To'lov intizomi</div>
          </div>
        </div>

        <!-- Reviews from workers -->
        <div>
          <h3 class="mb-3">Ishchilardan sharhlar</h3>
          ${reviews.length > 0 ? reviews.map(r => {
        const reviewer = Store.getById('users', r.from_user_id);
        return `
              <div class="review-card">
                <div class="review-header">
                  <span class="review-author">${reviewer ? reviewer.full_name : 'Ishchi'}</span>
                  <span class="review-date">${renderStars(r.rating)}</span>
                </div>
                <p class="review-text mt-2">${r.text}</p>
              </div>
            `;
    }).join('') : `
            <div class="empty-state" style="padding:var(--sp-6);">
              <p class="text-muted">Hali sharhlar yo'q</p>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}
