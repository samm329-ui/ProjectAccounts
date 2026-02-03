/**
 * CANONICAL FINANCE CALCULATION ENGINE
 * 
 * Single source of truth for ALL financial calculations.
 * Used by Dashboard, Admin Panel, and Team Panel.
 * 
 * CRITICAL RULES:
 * 1. Debits are normalized to negative amounts
 * 2. totalPaid = SUM(all payment amounts)
 * 3. Revenue = totalPaid (actual money flow)
 * 4. Pending = totalValue - totalPaid
 */

export interface Client {
    clientId: string;
    clientName: string;
    status: string;
    contact?: string;
    businessType?: string;
    startDate?: string;
    costs: {
        serviceCost: number;
        domainCharged: number;
        actualDomainCost: number;
        extraFeatures: number;
        extraProductionCharges: number;
    };
    financials?: any; // Legacy, not used in calculations
}

export interface Payment {
    paymentId: string;
    clientId: string;
    amount: number;
    type: string; // 'Credit', 'Debit', 'Refund', etc.
    mode?: string;
    date: string;
}

export interface LedgerEntry {
    entryId: string;
    memberId: string;
    clientId?: string;
    amount: number;
    type: string; // 'given', 'spent', 'investment'
    date: string;
    reason: string;
}

export interface FinanceResult {
    totalValue: number;
    totalPaid: number;
    pending: number;
    totalRevenue: number;
    profit: number;
    teamGiven: number;
    teamSpent: number;
    teamInvestment: number;
    teamWallet: number;
    progressPercent: number;
}

/**
 * Normalize payment amount based on type.
 * Debits and Refunds become negative.
 */
function normalizePaymentAmount(payment: Payment): number {
    const type = String(payment.type || '').toLowerCase().trim();
    const absAmount = Math.abs(Number(payment.amount) || 0);

    if (type === 'debit' || type === 'refund') {
        return -absAmount;
    }

    return absAmount;
}

/**
 * CANONICAL FINANCE CALCULATION
 * 
 * @param client - The client record
 * @param payments - All payment records for this client
 * @param teamLedger - All team ledger entries for this client
 * @returns Complete finance breakdown
 */
export function calculateFinance({
    client,
    payments = [],
    teamLedger = []
}: {
    client: Client;
    payments: Payment[];
    teamLedger: LedgerEntry[];
}): FinanceResult {

    // ===== TOTAL VALUE (Project Contract Value) =====
    // Never changes based on payments
    const totalValue =
        Number(client.costs.serviceCost || 0) +
        Number(client.costs.domainCharged || 0) +
        Number(client.costs.extraFeatures || 0) +
        Number(client.costs.extraProductionCharges || 0);

    // ===== TOTAL PAID (Net Money Received) =====
    // Sum of all payments (credits are positive, debits are negative)
    const clientPayments = payments.filter(p => p.clientId === client.clientId);
    const totalPaid = clientPayments.reduce((sum, payment) => {
        return sum + normalizePaymentAmount(payment);
    }, 0);

    // ===== PENDING =====
    const pending = totalValue - totalPaid;

    // ===== TOTAL REVENUE (Dashboard) =====
    // This is the same as totalPaid - represents actual money flow
    const totalRevenue = totalPaid;

    // ===== PROFIT =====
    // Total value minus actual costs
    const actualCosts = Number(client.costs.actualDomainCost || 0);
    const profit = totalValue - actualCosts;

    // ===== TEAM MONEY =====
    const clientLedger = teamLedger.filter(entry => entry.clientId === client.clientId);

    const teamGiven = clientLedger
        .filter(e => String(e.type || '').toLowerCase().trim() === 'given')
        .reduce((sum, e) => sum + Math.abs(Number(e.amount) || 0), 0);

    const teamSpent = clientLedger
        .filter(e => String(e.type || '').toLowerCase().trim() === 'spent')
        .reduce((sum, e) => sum + Math.abs(Number(e.amount) || 0), 0);

    const teamInvestment = clientLedger
        .filter(e => String(e.type || '').toLowerCase().trim() === 'investment')
        .reduce((sum, e) => sum + Math.abs(Number(e.amount) || 0), 0);

    const teamWallet = teamGiven - teamSpent;

    // ===== PROGRESS PERCENT =====
    const progressPercent = totalValue > 0
        ? Math.min(100, Math.max(0, Math.round((totalPaid / totalValue) * 100)))
        : 0;

    return {
        totalValue,
        totalPaid,
        pending,
        totalRevenue,
        profit,
        teamGiven,
        teamSpent,
        teamInvestment,
        teamWallet,
        progressPercent
    };
}

/**
 * Calculate global summary across ALL clients
 */
export function calculateGlobalFinance({
    clients,
    payments
}: {
    clients: Client[];
    payments: Payment[];
}): {
    totalRevenue: number;
    projectedRevenue: number;
    totalPending: number;
    totalCash: number;
} {
    let totalRevenue = 0;
    let projectedRevenue = 0;
    let totalPending = 0;

    clients.forEach(client => {
        const finance = calculateFinance({ client, payments, teamLedger: [] });
        totalRevenue += finance.totalRevenue;
        projectedRevenue += finance.totalValue;
        totalPending += finance.pending;
    });

    // Calculate cash payments (normalize amounts)
    const totalCash = payments
        .filter(p => {
            const mode = String(p.mode || '').toLowerCase();
            return mode === 'cash';
        })
        .reduce((sum, p) => sum + normalizePaymentAmount(p), 0);

    return {
        totalRevenue,
        projectedRevenue,
        totalPending,
        totalCash
    };
}
