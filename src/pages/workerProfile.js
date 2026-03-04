// ===== Worker Profile Page =====
import Store from '../data/store.js';
import { renderStars, formatCurrency } from '../utils/format.js';
import { getCurrentUser } from '../data/auth.js';

export function renderWorkerProfile(container, params) {
    const workerId = params?.id;
    if (!workerId) {
        container.innerHTML = '<div class="container section"><p>Ishchi topilmadi</p></div>';
        return;
    }

    const worker = Store.getById('users', workerId);
    if (!worker || worker.role !== 'worker') {
        container.innerHTML = '<div class="container section"><p>Ishchi topilmadi</p></div>';
        return;
    }

    const profile = Store.getOneByField('workerProfiles', 'user_id', workerId);
    const reviews = Store.getByField('reviews', 'to_user_id', workerId);
    const currentUser = getCurrentUser();

    container.innerHTML = `
    <div class="page-header">
      <div class="container">
        <p class="text-muted mb-2"><a href="#/">← Bosh sahifaga</a></p>
        <h1>Ishchi profili</h1>
      </div>
    </div>

    <div class="container section">
      <div class="card mb-6">
        <div class="profile-header">
          <div class="profile-avatar">${worker.full_name.charAt(0)}</div>
          <div class="profile-info" style="flex:1;">
            <div class="flex-between" style="flex-wrap:wrap;gap:var(--sp-3);">
              <div>
                <h2>${worker.full_name}</h2>
                <div class="profile-meta mt-2">
                  ${profile?.location ? `<span class="profile-meta-item">📍 ${profile.location}</span>` : ''}
                  ${profile?.age ? `<span class="profile-meta-item">🎂 ${profile.age} yosh</span>` : ''}
                  <span class="profile-meta-item">
                    ${profile?.verification_status === 'verified'
            ? '<span class="badge badge-green">✓ Tasdiqlangan</span>'
            : '<span class="badge badge-yellow">Tasdiqlanmagan</span>'
        }
                  </span>
                </div>
              </div>
              ${currentUser && currentUser.role === 'client' ? `
                <a href="#/create-deal?worker=${workerId}" class="btn btn-primary">Bitim boshlash</a>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-3 gap-4 mb-6">
          <div class="stat-card text-center">
            <div class="stat-value" style="color:var(--yellow-500);">
              ${renderStars(worker.rating)}
            </div>
            <div class="stat-label">${worker.rating} / 5 reyting</div>
          </div>
          <div class="stat-card text-center">
            <div class="stat-value">${worker.completed_deals}</div>
            <div class="stat-label">Bajarilgan ishlar</div>
          </div>
          <div class="stat-card text-center">
            <div class="stat-value">${reviews.length}</div>
            <div class="stat-label">Sharhlar</div>
          </div>
        </div>

        <!-- Bio -->
        ${profile?.bio ? `
          <div class="mb-6">
            <h3 class="mb-3">Haqida</h3>
            <p class="text-muted">${profile.bio}</p>
          </div>
        ` : ''}

        <!-- Specialties -->
        ${profile?.specialties?.length ? `
          <div class="mb-6">
            <h3 class="mb-3">Mutaxassisliklar</h3>
            <div class="flex gap-2" style="flex-wrap:wrap;">
              ${profile.specialties.map(s => `<span class="badge badge-blue">${s}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Portfolio -->
        <div class="mb-6">
          <h3 class="mb-3">Portfolio</h3>
          ${profile?.portfolio_images?.length ? `
            <div class="portfolio-grid">
              ${profile.portfolio_images.map(img => `
                <div class="portfolio-item">
                  <img src="${img}" alt="Portfolio">
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="portfolio-grid">
              <div class="portfolio-item">🏠</div>
              <div class="portfolio-item">🔧</div>
              <div class="portfolio-item">🏗️</div>
            </div>
            <p class="text-xs text-muted mt-2">Portfolio rasmlari hali yuklanmagan</p>
          `}
        </div>

        <!-- Reviews -->
        <div>
          <h3 class="mb-3">Sharhlar</h3>
          ${reviews.length > 0 ? reviews.map(r => {
            const reviewer = Store.getById('users', r.from_user_id);
            return `
              <div class="review-card">
                <div class="review-header">
                  <span class="review-author">${reviewer ? reviewer.full_name : 'Foydalanuvchi'}</span>
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
