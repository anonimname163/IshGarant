// ===== Formatting Utilities =====

export function formatCurrency(amount) {
    if (amount == null || isNaN(amount)) return '0 so\'m';
    return Number(amount).toLocaleString('uz-UZ') + ' so\'m';
}

export function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

export function formatDateTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return formatDate(dateStr) + ' ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}

export function dealStatusLabel(status) {
    const map = {
        'created': 'Yaratilgan',
        'funded': 'To\'langan',
        'in_progress': 'Bajarilmoqda',
        'completed': 'Yakunlangan',
        'disputed': 'Da\'vogar',
        'resolved': 'Hal qilingan',
        'cancelled': 'Bekor qilingan'
    };
    return map[status] || status;
}

export function dealStatusBadge(status) {
    const map = {
        'created': 'badge-gray',
        'funded': 'badge-blue',
        'in_progress': 'badge-yellow',
        'completed': 'badge-green',
        'disputed': 'badge-red',
        'resolved': 'badge-green',
        'cancelled': 'badge-gray'
    };
    return map[status] || 'badge-gray';
}

export function escrowStatusLabel(status) {
    const map = {
        'pending': 'Kutilmoqda',
        'blocked': 'Bloklangan',
        'released': 'Chiqarilgan',
        'refunded': 'Qaytarilgan',
        'split': 'Taqsimlangan'
    };
    return map[status] || status;
}

export function escrowStatusBadge(status) {
    const map = {
        'pending': 'badge-gray',
        'blocked': 'badge-yellow',
        'released': 'badge-green',
        'refunded': 'badge-red',
        'split': 'badge-blue'
    };
    return map[status] || 'badge-gray';
}

export function renderStars(rating, max = 5) {
    const full = Math.round(rating || 0);
    let html = '<div class="stars">';
    for (let i = 1; i <= max; i++) {
        html += i <= full ? '<span>★</span>' : '<span class="empty">★</span>';
    }
    html += '</div>';
    return html;
}

export function disputeResolutionLabel(type) {
    const map = {
        'worker_full': 'Ishchiga to\'liq to\'lov',
        'client_refund': 'Mijozga to\'liq qaytarish',
        'split': '50/50 taqsimlash'
    };
    return map[type] || type;
}

export function userRoleLabel(role) {
    const map = {
        'worker': 'Ishchi',
        'client': 'Mijoz',
        'admin': 'Admin'
    };
    return map[role] || role;
}

export function truncateText(text, maxLength = 100) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
