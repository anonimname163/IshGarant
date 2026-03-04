// ===== About Page =====

export function renderAbout(container) {
    container.innerHTML = `
    <div class="page-header">
      <div class="container">
        <h1>Biz haqimizda</h1>
        <p>IshGarant — O'zbekistonda qurilish va uy xizmatlari uchun xavfsiz escrow platforma</p>
      </div>
    </div>

    <div class="container section">
      <!-- Problem -->
      <div class="card mb-8" style="border-left:4px solid var(--red-500);">
        <div class="card-icon card-icon-red">⚠️</div>
        <h3 class="mb-3">Muammo</h3>
        <p class="text-muted mb-4">
          O'zbekistonda qurilish va uy xizmatlari sohasida ko'pchilik bitimlar og'zaki kelishuvlarga asoslanadi.
          Bu esa jiddiy muammolarga olib keladi:
        </p>
        <div class="grid grid-2 gap-4">
          <div class="card-flat">
            <h4 class="text-danger mb-2">Mijoz qo'rquvi:</h4>
            <p class="text-sm text-muted">"Men to'layman, lekin ishchi ishni bajarmaydi yoki sifatsiz bajaradi."</p>
          </div>
          <div class="card-flat">
            <h4 class="text-danger mb-2">Ishchi qo'rquvi:</h4>
            <p class="text-sm text-muted">"Men ishni bajaraman, lekin mijoz to'lamaydi yoki kam to'laydi."</p>
          </div>
        </div>
        <div class="mt-6">
          <p class="text-muted">
            <strong>Natija:</strong> Ishonchsizlik, nizolar, firibgarlik va yashirin iqtisodiyot.
            Hozirda O'zbekistonda oddiy va tushunarli escrow mexanizmi, arbitraj tizimi yoki
            ishonchli raqamli kafolatchisi yo'q.
          </p>
        </div>
      </div>

      <!-- Solution -->
      <div class="card mb-8" style="border-left:4px solid var(--green-600);">
        <div class="card-icon card-icon-green">✅</div>
        <h3 class="mb-3">Yechim — IshGarant</h3>
        <p class="text-muted mb-4">
          IshGarant raqamli kafolatchisi sifatida ishlaydi:
        </p>
        <div class="grid grid-2 gap-4">
          <div class="flex gap-3" style="align-items:flex-start;">
            <span style="font-size:1.5rem;">📝</span>
            <div>
              <h4 class="text-sm font-semibold">Shartnomalarni rasmiylashtirish</h4>
              <p class="text-xs text-muted mt-1">Har bir bitim aniq shartlar bilan rasmiylashtiriladi</p>
            </div>
          </div>
          <div class="flex gap-3" style="align-items:flex-start;">
            <span style="font-size:1.5rem;">🔒</span>
            <div>
              <h4 class="text-sm font-semibold">Mablag'larni bloklash</h4>
              <p class="text-xs text-muted mt-1">Pul escrow hisobida vaqtincha bloklanadi</p>
            </div>
          </div>
          <div class="flex gap-3" style="align-items:flex-start;">
            <span style="font-size:1.5rem;">💸</span>
            <div>
              <h4 class="text-sm font-semibold">Shartli to'lov</h4>
              <p class="text-xs text-muted mt-1">To'lov faqat shartlar bajarilganda amalga oshiriladi</p>
            </div>
          </div>
          <div class="flex gap-3" style="align-items:flex-start;">
            <span style="font-size:1.5rem;">⚖️</span>
            <div>
              <h4 class="text-sm font-semibold">Nizolarni hal qilish</h4>
              <p class="text-xs text-muted mt-1">Nizolarda admin tomon oldida hal qiladi</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Mission -->
      <div class="card" style="border-left:4px solid var(--blue-700);">
        <div class="card-icon card-icon-blue">🎯</div>
        <h3 class="mb-3">Missiyamiz</h3>
        <p class="text-muted mb-4">
          O'zbekistondagi mehnat bozori uchun xavfsiz tranzaktsiya standartini yaratish.
        </p>
        <div class="grid grid-3 gap-4">
          <div class="text-center">
            <div style="font-size:2.5rem;margin-bottom:var(--sp-2);">🏗️</div>
            <p class="text-sm font-semibold">Qurilish sohasi</p>
            <p class="text-xs text-muted mt-1">Oddiy ishlardan yirik loyihalargacha</p>
          </div>
          <div class="text-center">
            <div style="font-size:2.5rem;margin-bottom:var(--sp-2);">🔧</div>
            <p class="text-sm font-semibold">Uy xizmatlari</p>
            <p class="text-xs text-muted mt-1">Santexnika, elektrika, ta'mirlash</p>
          </div>
          <div class="text-center">
            <div style="font-size:2.5rem;margin-bottom:var(--sp-2);">🌐</div>
            <p class="text-sm font-semibold">Kengayish</p>
            <p class="text-xs text-muted mt-1">Boshqa sohalarga kengayish rejalari</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
