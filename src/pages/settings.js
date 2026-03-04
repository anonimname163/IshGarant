// ===== Settings / Edit Profile Page =====
import Store from '../data/store.js';
import { getCurrentUser } from '../data/auth.js';
import { showToast } from '../components/notifications.js';
import { navigate } from '../router.js';
import { renderNavbar } from '../components/navbar.js';

export function renderSettings(container) {
    const user = getCurrentUser();
    
    if (!user) {
        navigate('/login');
        return;
    }

    const isWorker = user.role === 'worker';
    
    // Get profile if worker
    let profile = null;
    if (isWorker) {
        profile = Store.getOneByField('workerProfiles', 'user_id', user.id);
        if (!profile) {
            // Create default profile if somehow missing
            profile = Store.create('workerProfiles', {
                user_id: user.id,
                age: 0,
                location: '',
                bio: '',
                specialties: [],
                portfolio_images: [],
                verification_status: 'pending'
            });
        }
    }

    container.innerHTML = `
        <div class="page-header">
            <div class="container">
                <p class="text-muted mb-2"><a href="#/dashboard">← Dashboard</a></p>
                <h1>Sozlamalar ⚙️</h1>
                <p class="text-muted">Profilingizni tahrirlash</p>
            </div>
        </div>

        <div class="container section">
            <div class="grid grid-2 gap-6">
                <!-- Basic Info -->
                <div class="card">
                    <h3 class="mb-4">Asosiy ma'lumotlar</h3>
                    <div class="form-group">
                        <label class="form-label">F.I.SH</label>
                        <input type="text" id="edit-fullname" class="form-input" value="${user.full_name}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Telefon (Tahrirlab bo'lmaydi)</label>
                        <input type="text" class="form-input" value="${user.phone}" disabled>
                    </div>
                    
                    ${isWorker ? `
                        <div class="form-group mt-4">
                            <label class="form-label">Yosh</label>
                            <input type="number" id="edit-age" class="form-input" value="${profile.age || ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Manzil (Shahar/Viloyat)</label>
                            <input type="text" id="edit-location" class="form-input" value="${profile.location || ''}">
                        </div>
                    ` : ''}

                    <button class="btn btn-primary mt-4" id="save-basic-btn">Saqlash</button>
                </div>

                <!-- Worker Specific Info -->
                ${isWorker ? `
                <div class="card">
                    <h3 class="mb-4">Kasbiy ma'lumotlar</h3>
                    <div class="form-group">
                        <label class="form-label">Mutaxassisliklar (vergul bilan ajrating)</label>
                        <input type="text" id="edit-specialties" class="form-input" value="${(profile.specialties || []).join(', ')}" placeholder="Masalan: Santexnika, Elektrika, Bo'yoqchi">
                        <div class="form-hint">Mijozlar sizni shu so'zlar orqali qidiradi</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">O'zingiz haqingizda (Bio)</label>
                        <textarea id="edit-bio" class="form-textarea" placeholder="Tajribangiz va ishlash tarzingiz haqida yozing...">${profile.bio || ''}</textarea>
                    </div>
                    
                    <button class="btn btn-success mt-4" id="save-worker-btn">Yangilash</button>
                </div>
                ` : `
                <div class="card">
                    <h3 class="mb-4">Xavfsizlik</h3>
                    <p class="text-muted text-sm mb-4">Parolni o'zgartirish hozircha faol emas. (MVP versiyasi)</p>
                    <button class="btn btn-outline" disabled>Parolni o'zgartirish</button>
                </div>
                `}
            </div>
        </div>
    `;

    // Bind basic save
    const saveBasicBtn = document.getElementById('save-basic-btn');
    if (saveBasicBtn) {
        saveBasicBtn.addEventListener('click', () => {
            const newName = document.getElementById('edit-fullname').value.trim();
            if (!newName) {
                showToast('Ismni kiriting', 'warning');
                return;
            }

            Store.update('users', user.id, { full_name: newName });
            
            // If worker, also save age/location from this block
            if (isWorker) {
                const age = parseInt(document.getElementById('edit-age').value) || 0;
                const location = document.getElementById('edit-location').value.trim();
                Store.update('workerProfiles', profile.id, { age, location });
            }

            // Sync user data in local variable and re-render navbar for name change
            const updatedUser = Store.getById('users', user.id);
            localStorage.setItem('ishgarant_currentUser', JSON.stringify(updatedUser)); // Auth helper fallback sync
            
            showToast('Asosiy ma\'lumotlar saqlandi', 'success');
            renderNavbar(); // update name in navbar
        });
    }

    // Bind worker save
    const saveWorkerBtn = document.getElementById('save-worker-btn');
    if (saveWorkerBtn) {
        saveWorkerBtn.addEventListener('click', () => {
            const specialtiesRaw = document.getElementById('edit-specialties').value;
            const bio = document.getElementById('edit-bio').value.trim();
            
            const specialties = specialtiesRaw.split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            Store.update('workerProfiles', profile.id, { specialties, bio });
            
            showToast('Kasbiy ma\'lumotlar yangilandi', 'success');
        });
    }
}
