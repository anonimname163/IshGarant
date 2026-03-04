// ===== Footer Component =====

export function renderFooter() {
    const footer = document.getElementById('footer-content');
    footer.className = 'footer';
    footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">Ish<span>Garant</span></div>
          <p class="text-sm" style="max-width:320px;">
            O'zbekistonda qurilish va uy xizmatlari uchun xavfsiz escrow platforma. Ishchi va mijoz o'rtasida ishonchli bitimlar.
          </p>
        </div>
        <div>
          <h4>Sahifalar</h4>
          <ul class="footer-links">
            <li><a href="#/">Bosh sahifa</a></li>
            <li><a href="#/about">Biz haqimizda</a></li>
            <li><a href="#/login">Kirish</a></li>
            <li><a href="#/register">Ro'yxatdan o'tish</a></li>
          </ul>
        </div>
        <div>
          <h4>Aloqa</h4>
          <ul class="footer-links">
            <li>📞 +998 90 123 45 67</li>
            <li>📧 info@ishgarant.uz</li>
            <li>📍 Toshkent, O'zbekiston</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 IshGarant. Barcha huquqlar himoyalangan.</p>
      </div>
    </div>
  `;
}
