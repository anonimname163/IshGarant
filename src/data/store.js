// ===== IshGarant Data Store =====
// localStorage-based CRUD for all models

const STORE_PREFIX = 'ishgarant_';

function getCollection(name) {
    const raw = localStorage.getItem(STORE_PREFIX + name);
    return raw ? JSON.parse(raw) : [];
}

function setCollection(name, data) {
    localStorage.setItem(STORE_PREFIX + name, JSON.stringify(data));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Generic CRUD
export const Store = {
    getAll(collection) {
        return getCollection(collection);
    },

    getById(collection, id) {
        return getCollection(collection).find(item => item.id === id) || null;
    },

    getByField(collection, field, value) {
        return getCollection(collection).filter(item => item[field] === value);
    },

    getOneByField(collection, field, value) {
        return getCollection(collection).find(item => item[field] === value) || null;
    },

    create(collection, data) {
        const items = getCollection(collection);
        const item = {
            id: generateId(),
            ...data,
            created_at: new Date().toISOString()
        };
        items.push(item);
        setCollection(collection, items);
        return item;
    },

    update(collection, id, updates) {
        const items = getCollection(collection);
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return null;
        items[index] = { ...items[index], ...updates, updated_at: new Date().toISOString() };
        setCollection(collection, items);
        return items[index];
    },

    delete(collection, id) {
        const items = getCollection(collection);
        const filtered = items.filter(item => item.id !== id);
        setCollection(collection, filtered);
        return filtered.length < items.length;
    },

    count(collection) {
        return getCollection(collection).length;
    }
};

// Seed data initialization
export function initSeedData() {
    if (localStorage.getItem(STORE_PREFIX + 'initialized')) return;

    // Admin user
    Store.create('users', {
        id: 'admin_001',
        role: 'admin',
        full_name: 'Admin IshGarant',
        phone: '+998901234567',
        password: 'admin123',
        rating: 5,
        completed_deals: 0,
        balance: 0,
        blocked: false
    });

    // Workers
    const worker1 = Store.create('users', {
        id: 'worker_001',
        role: 'worker',
        full_name: 'Akbar Karimov',
        phone: '+998901111111',
        password: 'worker123',
        rating: 4.8,
        completed_deals: 23,
        balance: 2500000,
        blocked: false
    });

    const worker2 = Store.create('users', {
        id: 'worker_002',
        role: 'worker',
        full_name: 'Jasur Toshmatov',
        phone: '+998902222222',
        password: 'worker123',
        rating: 4.5,
        completed_deals: 15,
        balance: 1800000,
        blocked: false
    });

    // Clients
    const client1 = Store.create('users', {
        id: 'client_001',
        role: 'client',
        full_name: 'Dilshod Rahimov',
        phone: '+998903333333',
        password: 'client123',
        rating: 4.9,
        completed_deals: 5,
        balance: 15000000,
        blocked: false
    });

    const client2 = Store.create('users', {
        id: 'client_002',
        role: 'client',
        full_name: 'Nodira Umarova',
        phone: '+998904444444',
        password: 'client123',
        rating: 4.7,
        completed_deals: 3,
        balance: 8000000,
        blocked: false
    });

    // Worker profiles
    Store.create('workerProfiles', {
        user_id: worker1.id,
        age: 34,
        location: 'Toshkent',
        bio: 'Tajribali qurilish ustasi. 10 yildan ortiq tajriba. Sifatli va tez ishlash kafolatlanadi. Kvartira ta\'mirlash, gipsokarton, santexnika ishlari.',
        specialties: ['Qurilish', 'Santexnika', 'Gipsokarton'],
        portfolio_images: [],
        verification_status: 'verified'
    });

    Store.create('workerProfiles', {
        user_id: worker2.id,
        age: 28,
        location: 'Samarqand',
        bio: 'Elektrik va konditsioner ustasi. Barcha turdagi elektrik ishlari. Split sistemalar o\'rnatish va ta\'mirlash.',
        specialties: ['Elektrika', 'Konditsioner', 'Isitish tizimlari'],
        portfolio_images: [],
        verification_status: 'verified'
    });

    // Client profiles
    Store.create('clientProfiles', {
        user_id: client1.id,
        payment_discipline_score: 98
    });

    Store.create('clientProfiles', {
        user_id: client2.id,
        payment_discipline_score: 95
    });

    // Sample deal
    const deal = Store.create('deals', {
        client_id: client1.id,
        worker_id: worker1.id,
        title: 'Kvartira ta\'mirlash — oshxona',
        description: 'Oshxonani to\'liq ta\'mirlash: devorlarni tekislash, bo\'yoq, plitka yotqizish, santexnika almashtirish.',
        amount: 5000000,
        deadline: '2026-04-15',
        acceptance_criteria: 'Barcha ishlar sifatli bajarilgan. Plitka tekis yotqizilgan. Santexnika ishlayapti.',
        additional_conditions: 'Materiallar mijoz tomonidan ta\'minlanadi.',
        status: 'in_progress',
        escrow_status: 'blocked'
    });

    // Escrow for sample deal
    Store.create('escrows', {
        deal_id: deal.id,
        amount: 5000000,
        commission_percent: 3,
        withdrawal_fee_percent: 7,
        commission_amount: 150000,
        total_blocked: 5150000,
        blocked_amount: 5150000,
        released_amount: 0,
        status: 'blocked'
    });

    // Sample reviews
    Store.create('reviews', {
        deal_id: deal.id,
        from_user_id: client1.id,
        to_user_id: worker1.id,
        rating: 5,
        text: 'Juda yaxshi usta. Ishni o\'z vaqtida va sifatli bajardi. Tavsiya qilaman!',
    });

    Store.create('reviews', {
        deal_id: deal.id,
        from_user_id: worker1.id,
        to_user_id: client1.id,
        rating: 5,
        text: 'Yaxshi mijoz. To\'lovni o\'z vaqtida amalga oshirdi.',
    });

    localStorage.setItem(STORE_PREFIX + 'initialized', 'true');
}

export function resetStore() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
}

export default Store;
