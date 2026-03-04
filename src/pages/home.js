// ===== Home Page =====
import Store from '../data/store.js';

export function renderHome(container) {
    const workers = Store.getByField('users', 'role', 'worker').filter(w => !w.blocked);

    container.innerHTML = `
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>
            Ishchi va mijoz o'rtasida<br>
            <span class="highlight">xavfsiz bitim</span>
          </h1>
          <p>
            Pul escrow hisobida saqlanadi va ish bajarilgandan keyin o'tkaziladi.
            IshGarant — ishonchli kafolat platformasi.
          </p>
          <div class="hero-buttons">
            <a href="#/register" class="btn btn-success btn-lg">🔨 Ishchi topish</a>
            <a href="#/create-deal" class="btn btn-lg" style="background:rgba(255,255,255,0.15);color:white;backdrop-filter:blur(8px);">📋 Buyurtma joylashtirish</a>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="steps-section">
      <div class="container">
        <h2 class="text-center mb-3">Qanday ishlaydi?</h2>
        <p class="text-center text-muted mb-8" style="max-width:560px;margin-left:auto;margin-right:auto;">
          Uch oddiy qadamda xavfsiz bitim tuzish
        </p>
        <div class="grid grid-3">
          <div class="step-card">
            <div class="step-number step-number-1">1</div>
            <h3>Shartnoma tuziladi</h3>
            <p>Mijoz ish tavsifi, summasi, muddati va qabul mezonlarini kiritadi. Ishchi shartlarni ko'rib chiqadi.</p>
          </div>
          <div class="step-card">
            <div class="step-number step-number-2">2</div>
            <h3>Pul bloklanadi</h3>
            <p>Mijoz to'lovni amalga oshiradi. Pul escrow hisobida xavfsiz bloklanadi — hech kim oliy bo'lmaydi.</p>
          </div>
          <div class="step-card">
            <div class="step-number step-number-3">3</div>
            <h3>Ish tugagach to'lov</h3>
            <p>Ish bajarilgach, mijoz tasdiqlaydi va pul ishchiga o'tkaziladi. Nizoda admin hal qiladi.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Social Mission -->
    <section class="mission-section">
      <div class="container">
        <h2 class="text-center mb-3">Ijtimoiy missiya</h2>
        <p class="text-center text-muted mb-8" style="max-width:560px;margin-left:auto;margin-right:auto;">
          IshGarant — bu faqat platforma emas, bu ishonch madaniyatini yaratish
        </p>
        <div class="grid grid-3">
          <div class="mission-card">
            <div class="mission-icon">🛡️</div>
            <h4>Firibgarlikni kamaytirish</h4>
            <p class="text-sm text-muted mt-2">Pul oldindan to'lanmaydi va ishchi aldanmaydi. Escrow tizimi ikkala tomonni himoya qiladi.</p>
          </div>
          <div class="mission-card">
            <div class="mission-icon">💼</div>
            <h4>Bandlikni qo'llab-quvvatlash</h4>
            <p class="text-sm text-muted mt-2">Professional ishchilar uchun yangi buyurtmalar topish oson. Reytinglar sifatni ko'rsatadi.</p>
          </div>
          <div class="mission-card">
            <div class="mission-icon">🤝</div>
            <h4>Ishonch madaniyati</h4>
            <p class="text-sm text-muted mt-2">Raqamli shartnomalar og'zaki kelishuvlar o'rnini bosadi. Har bir bitim rasmiylashtiriladi.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Available Workers -->
    ${workers.length > 0 ? `
    <section class="section" style="background:var(--white);">
      <div class="container">
        <h2 class="text-center mb-3">Mavjud ustalar</h2>
        <p class="text-center text-muted mb-8">Tajribali va tekshirilgan professional ishchilar</p>
        <div class="grid grid-3">
          ${workers.map(w => {
        const profile = Store.getOneByField('workerProfiles', 'user_id', w.id);
        return `
              <a href="#/worker/${w.id}" class="card" style="text-decoration:none;color:inherit;">
                <div class="flex gap-4" style="align-items:center;">
                  <div class="profile-avatar" style="width:64px;height:64px;font-size:1.5rem;border-radius:var(--radius-lg);">
                    ${w.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 style="font-size:var(--fs-base);margin-bottom:2px;">${w.full_name}</h4>
                    <p class="text-sm text-muted">${profile ? profile.location : ''}</p>
                    <div class="flex gap-3 mt-1" style="align-items:center;">
                      <span style="color:var(--yellow-500);">★</span>
                      <span class="text-sm font-semibold">${w.rating}</span>
                      <span class="text-xs text-muted">• ${w.completed_deals} ish</span>
                    </div>
                  </div>
                </div>
                ${profile && profile.specialties ? `
                  <div class="flex gap-2 mt-3" style="flex-wrap:wrap;">
                    ${profile.specialties.map(s => `<span class="badge badge-blue">${s}</span>`).join('')}
                  </div>
                ` : ''}
              </a>
            `;
    }).join('')}
        </div>
      </div>
    </section>
    ` : ''}

    <!-- CTA -->
    <section class="section" style="background:linear-gradient(135deg, var(--blue-900), #0F2557);color:white;text-align:center;">
      <div class="container">
        <h2 style="color:white;margin-bottom:var(--sp-4);">Hoziroq boshlang!</h2>
        <p style="color:rgba(255,255,255,0.8);max-width:480px;margin:0 auto var(--sp-6);">
          Ro'yxatdan o'ting va birinchi xavfsiz bitimingizni tuzing
        </p>
        <a href="#/register" class="btn btn-success btn-lg">Ro'yxatdan o'tish</a>
      </div>
    </section>
  `;
}
