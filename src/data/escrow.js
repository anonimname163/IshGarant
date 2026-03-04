// ===== Escrow Business Logic =====
import Store from './store.js';

const COMMISSION_PERCENT = 3;
const WITHDRAWAL_FEE_PERCENT = 7;
const MIN_WITHDRAWAL = 100000;

export function createDeal(data) {
    const deal = Store.create('deals', {
        client_id: data.client_id,
        worker_id: data.worker_id,
        title: data.title,
        description: data.description,
        amount: data.amount,
        deadline: data.deadline,
        acceptance_criteria: data.acceptance_criteria,
        additional_conditions: data.additional_conditions || '',
        status: 'created',
        escrow_status: 'pending'
    });

    return deal;
}

export function fundDeal(dealId, clientId) {
    const deal = Store.getById('deals', dealId);
    if (!deal) return { success: false, error: 'Bitim topilmadi' };
    if (deal.status !== 'created') return { success: false, error: 'Bitim allaqachon to\'langan' };
    if (deal.client_id !== clientId) return { success: false, error: 'Ruxsat yo\'q' };

    const client = Store.getById('users', clientId);
    const commissionAmount = Math.round(deal.amount * COMMISSION_PERCENT / 100);
    const totalBlocked = deal.amount + commissionAmount;

    if (client.balance < totalBlocked) {
        return { success: false, error: 'Hisobda mablag\' yetarli emas' };
    }

    // Deduct from client balance
    Store.update('users', clientId, { balance: client.balance - totalBlocked });

    // Create escrow record
    Store.create('escrows', {
        deal_id: dealId,
        amount: deal.amount,
        commission_percent: COMMISSION_PERCENT,
        withdrawal_fee_percent: WITHDRAWAL_FEE_PERCENT,
        commission_amount: commissionAmount,
        total_blocked: totalBlocked,
        blocked_amount: totalBlocked,
        released_amount: 0,
        status: 'blocked'
    });

    // Update deal status
    Store.update('deals', dealId, {
        status: 'funded',
        escrow_status: 'blocked'
    });

    return { success: true, commissionAmount, totalBlocked };
}

export function acceptDeal(dealId, workerId) {
    const deal = Store.getById('deals', dealId);
    if (!deal) return { success: false, error: 'Bitim topilmadi' };
    if (deal.worker_id !== workerId) return { success: false, error: 'Ruxsat yo\'q' };
    if (deal.status !== 'funded') return { success: false, error: 'Bitim hali to\'lanmagan' };

    Store.update('deals', dealId, { status: 'in_progress' });
    return { success: true };
}

export function completeDeal(dealId, clientId) {
    const deal = Store.getById('deals', dealId);
    if (!deal) return { success: false, error: 'Bitim topilmadi' };
    if (deal.client_id !== clientId) return { success: false, error: 'Ruxsat yo\'q' };
    if (deal.status !== 'in_progress') return { success: false, error: 'Bitim hali bajarilmayapti' };

    const escrow = Store.getOneByField('escrows', 'deal_id', dealId);
    if (!escrow) return { success: false, error: 'Escrow topilmadi' };

    // Release funds to worker
    const worker = Store.getById('users', deal.worker_id);
    Store.update('users', deal.worker_id, {
        balance: (worker.balance || 0) + deal.amount,
        completed_deals: (worker.completed_deals || 0) + 1
    });

    // Update client completed deals
    const client = Store.getById('users', clientId);
    Store.update('users', clientId, {
        completed_deals: (client.completed_deals || 0) + 1
    });

    // Update escrow
    Store.update('escrows', escrow.id, {
        released_amount: deal.amount,
        blocked_amount: 0,
        status: 'released'
    });

    // Update deal
    Store.update('deals', dealId, {
        status: 'completed',
        escrow_status: 'released'
    });

    return { success: true, releasedAmount: deal.amount };
}

export function openDispute(dealId, openedBy, reason, evidenceDesc) {
    const deal = Store.getById('deals', dealId);
    if (!deal) return { success: false, error: 'Bitim topilmadi' };
    if (!['funded', 'in_progress'].includes(deal.status)) {
        return { success: false, error: 'Bu bitim uchun da\'vo ochib bo\'lmaydi' };
    }

    const dispute = Store.create('disputes', {
        deal_id: dealId,
        opened_by: openedBy,
        reason: reason,
        evidence_description: evidenceDesc || '',
        admin_decision: null,
        resolution_type: null,
        status: 'open'
    });

    Store.update('deals', dealId, {
        status: 'disputed',
        escrow_status: 'blocked'
    });

    return { success: true, dispute };
}

export function resolveDispute(disputeId, resolutionType, adminNotes) {
    const dispute = Store.getById('disputes', disputeId);
    if (!dispute) return { success: false, error: 'Da\'vo topilmadi' };
    if (dispute.status !== 'open') return { success: false, error: 'Da\'vo allaqachon hal qilingan' };

    const deal = Store.getById('deals', dispute.deal_id);
    const escrow = Store.getOneByField('escrows', 'deal_id', dispute.deal_id);

    if (!deal || !escrow) return { success: false, error: 'Bitim yoki escrow topilmadi' };

    const worker = Store.getById('users', deal.worker_id);
    const client = Store.getById('users', deal.client_id);

    let workerPayout = 0;
    let clientRefund = 0;
    let escrowStatus = '';

    switch (resolutionType) {
        case 'worker_full':
            workerPayout = deal.amount;
            clientRefund = 0;
            escrowStatus = 'released';
            break;
        case 'client_refund':
            workerPayout = 0;
            clientRefund = escrow.total_blocked;
            escrowStatus = 'refunded';
            break;
        case 'split':
            workerPayout = Math.round(deal.amount / 2);
            clientRefund = Math.round(escrow.total_blocked / 2);
            escrowStatus = 'split';
            break;
        default:
            return { success: false, error: 'Noto\'g\'ri qaror turi' };
    }

    // Update balances
    if (workerPayout > 0) {
        Store.update('users', deal.worker_id, {
            balance: (worker.balance || 0) + workerPayout
        });
    }
    if (clientRefund > 0) {
        Store.update('users', deal.client_id, {
            balance: (client.balance || 0) + clientRefund
        });
    }

    // Update escrow
    Store.update('escrows', escrow.id, {
        released_amount: workerPayout,
        blocked_amount: 0,
        status: escrowStatus
    });

    // Update dispute
    Store.update('disputes', disputeId, {
        admin_decision: adminNotes || resolutionType,
        resolution_type: resolutionType,
        status: 'resolved'
    });

    // Update deal
    Store.update('deals', deal.id, {
        status: 'resolved',
        escrow_status: escrowStatus
    });

    return { success: true, workerPayout, clientRefund };
}

export function requestWithdrawal(workerId, amount) {
    const worker = Store.getById('users', workerId);
    if (!worker) return { success: false, error: 'Foydalanuvchi topilmadi' };
    if (worker.role !== 'worker') return { success: false, error: 'Faqat ishchilar pul yechishi mumkin' };
    if (amount < MIN_WITHDRAWAL) {
        return { success: false, error: `Minimal yechish summasi: ${MIN_WITHDRAWAL.toLocaleString()} so'm` };
    }
    if (worker.balance < amount) {
        return { success: false, error: 'Hisobda mablag\' yetarli emas' };
    }

    const fee = Math.round(amount * WITHDRAWAL_FEE_PERCENT / 100);
    const netAmount = amount - fee;

    // Deduct from balance
    Store.update('users', workerId, {
        balance: worker.balance - amount
    });

    // Create withdrawal record
    const withdrawal = Store.create('withdrawals', {
        worker_id: workerId,
        amount: amount,
        fee: fee,
        net_amount: netAmount,
        status: 'completed',
        transaction_id: 'TXN-' + Date.now()
    });

    return { success: true, withdrawal, fee, netAmount };
}

export function getDealWithDetails(dealId) {
    const deal = Store.getById('deals', dealId);
    if (!deal) return null;

    const client = Store.getById('users', deal.client_id);
    const worker = deal.worker_id ? Store.getById('users', deal.worker_id) : null;
    const escrow = Store.getOneByField('escrows', 'deal_id', dealId);
    const dispute = Store.getOneByField('disputes', 'deal_id', dealId);
    const reviews = Store.getByField('reviews', 'deal_id', dealId);

    return { deal, client, worker, escrow, dispute, reviews };
}

export { COMMISSION_PERCENT, WITHDRAWAL_FEE_PERCENT, MIN_WITHDRAWAL };
