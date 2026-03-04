// ===== Auth Module =====
import Store from './store.js';

const SESSION_KEY = 'ishgarant_session';

export function login(phone, password) {
    const user = Store.getAll('users').find(
        u => u.phone === phone && u.password === password
    );
    if (!user) return { success: false, error: 'Telefon raqam yoki parol noto\'g\'ri' };
    if (user.blocked) return { success: false, error: 'Sizning akkauntingiz bloklangan' };

    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, role: user.role }));
    return { success: true, user };
}

export function register(data) {
    const existing = Store.getOneByField('users', 'phone', data.phone);
    if (existing) return { success: false, error: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' };

    const user = Store.create('users', {
        role: data.role,
        full_name: data.full_name,
        phone: data.phone,
        password: data.password,
        rating: 0,
        completed_deals: 0,
        balance: data.role === 'client' ? 10000000 : 0, // Clients get simulated balance
        blocked: false
    });

    // Create profile
    if (data.role === 'worker') {
        Store.create('workerProfiles', {
            user_id: user.id,
            age: data.age || null,
            location: data.location || '',
            bio: data.bio || '',
            specialties: [],
            portfolio_images: [],
            verification_status: 'pending'
        });
    } else if (data.role === 'client') {
        Store.create('clientProfiles', {
            user_id: user.id,
            payment_discipline_score: 100
        });
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, role: user.role }));
    return { success: true, user };
}

export function logout() {
    localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    const { userId } = JSON.parse(session);
    return Store.getById('users', userId);
}

export function isLoggedIn() {
    return !!getCurrentUser();
}

export function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

export function isWorker() {
    const user = getCurrentUser();
    return user && user.role === 'worker';
}

export function isClient() {
    const user = getCurrentUser();
    return user && user.role === 'client';
}
