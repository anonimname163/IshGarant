// ===== Auth Page (Login & Register) =====
import { login, register } from '../data/auth.js';
import { renderNavbar } from '../components/navbar.js';
import { showToast } from '../components/notifications.js';
import { navigate } from '../router.js';

export function renderLogin(container) {
    container.innerHTML = `
    <div class="section">
      <div class="container-sm">
        <div class="card" style="padding:var(--sp-8);">
          <div class="text-center mb-6">
            <h2>Kirish</h2>
            <p class="text-muted mt-2">Akkauntingizga kiring</p>
          </div>
          <form id="login-form">
            <div class="form-group">
              <label class="form-label">Telefon raqam</label>
              <input type="tel" class="form-input" id="login-phone" placeholder="+998 90 123 45 67" required>
            </div>
            <div class="form-group">
              <label class="form-label">Parol</label>
              <input type="password" class="form-input" id="login-password" placeholder="Parolingiz" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg">Kirish</button>
          </form>
          <div class="text-center mt-6">
            <p class="text-sm text-muted">
              Akkauntingiz yo'qmi? <a href="#/register">Ro'yxatdan o'ting</a>
            </p>
          </div>
          <div class="mt-6" style="padding:var(--sp-4);background:var(--blue-50);border-radius:var(--radius-lg);">
          </div>
        </div>
      </div>
    </div>
  `;

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('login-phone').value.trim();
        const password = document.getElementById('login-password').value;

        const result = login(phone, password);
        if (result.success) {
            showToast('Muvaffaqiyatli kirdingiz!', 'success');
            renderNavbar();
            if (result.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } else {
            showToast(result.error, 'error');
        }
    });
}

export function renderRegister(container) {
    container.innerHTML = `
    <div class="section">
      <div class="container-sm">
        <div class="card" style="padding:var(--sp-8);">
          <div class="text-center mb-6">
            <h2>Ro'yxatdan o'tish</h2>
            <p class="text-muted mt-2">Yangi akkaunt yarating</p>
          </div>
          <form id="register-form">
            <div class="form-group">
              <label class="form-label">Rolingiz</label>
              <div class="grid grid-2 gap-3">
                <label class="card-flat flex-center gap-3" style="cursor:pointer;padding:var(--sp-4);" id="role-worker-label">
                  <input type="radio" name="role" value="worker" id="role-worker" required>
                  <div class="text-center">
                    <div style="font-size:1.5rem;">🔨</div>
                    <span class="text-sm font-semibold">Ishchi</span>
                  </div>
                </label>
                <label class="card-flat flex-center gap-3" style="cursor:pointer;padding:var(--sp-4);" id="role-client-label">
                  <input type="radio" name="role" value="client" id="role-client">
                  <div class="text-center">
                    <div style="font-size:1.5rem;">👤</div>
                    <span class="text-sm font-semibold">Mijoz</span>
                  </div>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">To'liq ism</label>
              <input type="text" class="form-input" id="reg-name" placeholder="Ismingiz" required>
            </div>

            <div class="form-group">
              <label class="form-label">Telefon raqam</label>
              <input type="tel" class="form-input" id="reg-phone" placeholder="+998 90 123 45 67" required>
            </div>

            <div class="form-group">
              <label class="form-label">Parol</label>
              <input type="password" class="form-input" id="reg-password" placeholder="Kamida 6 ta belgi" required minlength="6">
            </div>

            <!-- Worker-specific fields -->
            <div id="worker-fields" class="hidden">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Yosh</label>
                  <input type="number" class="form-input" id="reg-age" placeholder="Yoshingiz" min="18" max="70">
                </div>
                <div class="form-group">
                  <label class="form-label">Joylashuv</label>
                  <input type="text" class="form-input" id="reg-location" placeholder="Shahar">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Bio / O'zingiz haqingizda</label>
                <textarea class="form-textarea" id="reg-bio" placeholder="Tajribangiz, ko'nikmalaringiz haqida yozing..."></textarea>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg mt-4">Ro'yxatdan o'tish</button>
          </form>

          <div class="text-center mt-6">
            <p class="text-sm text-muted">
              Akkauntingiz bormi? <a href="#/login">Kirish</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

    // Toggle worker fields
    const workerRadio = document.getElementById('role-worker');
    const clientRadio = document.getElementById('role-client');
    const workerFields = document.getElementById('worker-fields');

    function updateRoleSelection() {
        const workerLabel = document.getElementById('role-worker-label');
        const clientLabel = document.getElementById('role-client-label');
        workerLabel.style.borderColor = workerRadio.checked ? 'var(--blue-500)' : 'var(--gray-200)';
        clientLabel.style.borderColor = clientRadio.checked ? 'var(--blue-500)' : 'var(--gray-200)';
    }

    workerRadio.addEventListener('change', () => {
        workerFields.classList.remove('hidden');
        updateRoleSelection();
    });

    clientRadio.addEventListener('change', () => {
        workerFields.classList.add('hidden');
        updateRoleSelection();
    });

    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const role = document.querySelector('input[name="role"]:checked')?.value;
        if (!role) {
            showToast('Iltimos, rolingizni tanlang', 'warning');
            return;
        }

        const data = {
            role,
            full_name: document.getElementById('reg-name').value.trim(),
            phone: document.getElementById('reg-phone').value.trim(),
            password: document.getElementById('reg-password').value,
        };

        if (role === 'worker') {
            data.age = document.getElementById('reg-age').value;
            data.location = document.getElementById('reg-location').value.trim();
            data.bio = document.getElementById('reg-bio').value.trim();
        }

        const result = register(data);
        if (result.success) {
            showToast('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', 'success');
            renderNavbar();
            navigate('/dashboard');
        } else {
            showToast(result.error, 'error');
        }
    });
}
