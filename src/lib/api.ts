'use server';

import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import mockData from './mock-data.json';

// Config
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
];

const SHEETS = {
    SUMMARY: 'Summary',
    CLIENTS: 'Clients',
    PAYMENTS: 'Payments',
    LEDGER: 'TeamLedger',
    LOGS: 'Logs'
};

// --- Connection Helper ---
async function getDoc() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
        return null;
    }

    try {
        const jwt = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Fix newlines if escaped
            scopes: SCOPES,
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt);
        await doc.loadInfo();
        return doc;
    } catch (error) {
        console.error("Google Sheet Connection Error:", error);
        return null;
    }
}

// --- API ACTIONS ---

export async function getSummary() {
    const doc = await getDoc();
    if (!doc) {
        console.warn("Using Mock Summary (No Creds)");
        await new Promise(r => setTimeout(r, 500));
        return mockData.summary;
    }
    return mockData.summary;
}

export async function getClients() {
    const doc = await getDoc();
    if (!doc) return mockData.clients;

    try {
        const sheet = doc.sheetsByTitle[SHEETS.CLIENTS];
        if (!sheet) return [];

        const rows = await sheet.getRows();
        return rows.map(row => ({
            clientId: row.get('clientId'),
            clientName: row.get('clientName'),
            contact: row.get('contact'),
            businessType: row.get('businessType'),
            startDate: row.get('startDate'),
            assignedMember: row.get('assignedMember'),
            status: row.get('status'),
            costs: {
                serviceCost: Number(row.get('serviceCost') || 0),
                domainCharged: Number(row.get('domainCharged') || 0),
                actualDomainCost: Number(row.get('actualDomainCost') || 0),
                extraFeatures: Number(row.get('extraFeatures') || 0),
                extraProductionCharges: Number(row.get('extraProductionCharges') || 0),
            },
            financials: {
                totalValue: Number(row.get('totalValue') || 0),
                paid: Number(row.get('paid') || 0),
                pending: Number(row.get('pending') || 0),
                profit: Number(row.get('profit') || 0),
            }
        }));
    } catch (error) {
        console.error("Error fetching clients:", error);
        return [];
    }
}

export async function getPayments() {
    const doc = await getDoc();
    if (!doc) return mockData.payments;

    try {
        const sheet = doc.sheetsByTitle[SHEETS.PAYMENTS];
        if (!sheet) return [];
        const rows = await sheet.getRows();
        return rows.map(row => ({
            paymentId: row.get('paymentId'),
            projectId: row.get('projectId'),
            clientId: row.get('clientId'),
            date: row.get('date'),
            amount: Number(row.get('amount') || 0),
            type: row.get('type'),
            mode: row.get('mode'),
            recordedBy: row.get('recordedBy')
        }));
    } catch (e) { console.error(e); return []; }
}

export async function getLogs() {
    const doc = await getDoc();
    if (!doc) return mockData.logs;

    try {
        const sheet = doc.sheetsByTitle[SHEETS.LOGS];
        if (!sheet) return [];
        const rows = await sheet.getRows();
        return rows.map(row => ({
            logId: row.get('logId'),
            timestamp: row.get('timestamp'),
            actor: row.get('actor'),
            action: row.get('action'),
            details: safeJsonParse(row.get('details'))
        }));
    } catch (e) { console.error(e); return []; }
}

function safeJsonParse(str: string) {
    try { return JSON.parse(str); } catch { return str; }
}

export async function getTeamLedger(memberId: string) {
    const doc = await getDoc();
    if (!doc) return mockData.teamLedger;

    try {
        const sheet = doc.sheetsByTitle[SHEETS.LEDGER];
        if (!sheet) return [];
        const rows = await sheet.getRows();
        return rows.map(row => ({
            entryId: row.get('entryId'),
            memberId: row.get('memberId'),
            clientId: row.get('clientId'),
            date: row.get('date'),
            amount: Number(row.get('amount') || 0),
            type: row.get('type'),
            reason: row.get('reason'),
            by: row.get('by')
        }));
    } catch (e) { console.error(e); return []; }
}

export async function addPayment(payment: any) {
    const doc = await getDoc();
    if (!doc) {
        console.log("Mock Add Payment:", payment);
        return { success: true };
    }

    try {
        const sheet = doc.sheetsByTitle[SHEETS.PAYMENTS];
        await sheet.addRow({
            paymentId: `pay_${Date.now()}`,
            projectId: payment.projectId,
            clientId: payment.clientId,
            date: payment.date,
            amount: payment.amount,
            type: payment.type,
            mode: payment.mode,
            recordedBy: payment.recordedBy
        });
        return { success: true };
    } catch (e) {
        console.error("Add Payment Failed:", e);
        return { success: false };
    }
}

export async function addTeamLedgerEntry(entry: any) {
    const doc = await getDoc();
    if (!doc) return { success: true };

    try {
        const sheet = doc.sheetsByTitle[SHEETS.LEDGER];
        await sheet.addRow({
            entryId: `ledger_${Date.now()}`,
            memberId: entry.memberId,
            clientId: entry.clientId,
            date: entry.date,
            amount: entry.amount,
            type: entry.type,
            reason: entry.reason,
            by: entry.by
        });
        return { success: true };
    } catch (e) {
        console.error("Add Ledger Failed:", e);
        return { success: false };
    }
}

export async function addClient(client: any) {
    const doc = await getDoc();
    if (!doc) {
        console.log("Mock Add Client:", client);
        return { success: true };
    }

    try {
        const sheet = doc.sheetsByTitle[SHEETS.CLIENTS];
        await sheet.addRow({
            clientId: `client_${Date.now()}`,
            clientName: client.clientName,
            contact: client.contact,
            businessType: client.businessType,
            startDate: client.startDate,
            assignedMember: client.assignedMember,
            status: 'Active',
            serviceCost: client.costs.serviceCost,
            domainCharged: client.costs.domainCharged,
            actualDomainCost: client.costs.actualDomainCost,
            extraFeatures: client.costs.extraFeatures,
            extraProductionCharges: client.costs.extraProductionCharges,
            totalValue: client.financials.totalValue,
            paid: 0,
            pending: client.financials.totalValue,
            profit: client.financials.profit
        });
        return { success: true };
    } catch (e) {
        console.error("Add Client Failed:", e);
        return { success: false };
    }
}

export async function seedDatabase() {
    const doc = await getDoc();
    if (!doc) return { success: false, message: "Not connected to Google Sheets" };

    try {
        // Clear and Seed Clients
        const clientsSheet = doc.sheetsByTitle[SHEETS.CLIENTS];
        const currentClients = await clientsSheet.getRows();
        if (currentClients.length === 0) {
            for (const client of mockData.clients) {
                await clientsSheet.addRow({
                    clientId: client.clientId,
                    clientName: client.clientName,
                    contact: client.contact,
                    businessType: client.businessType,
                    startDate: client.startDate,
                    assignedMember: client.assignedMember,
                    status: client.status,
                    serviceCost: client.costs.serviceCost,
                    domainCharged: client.costs.domainCharged,
                    actualDomainCost: client.costs.actualDomainCost,
                    extraFeatures: client.costs.extraFeatures,
                    extraProductionCharges: client.costs.extraProductionCharges,
                    totalValue: client.financials.totalValue,
                    paid: client.financials.paid,
                    pending: client.financials.pending,
                    profit: client.financials.profit
                });
            }
        }

        // Seed Payments
        const paymentsSheet = doc.sheetsByTitle[SHEETS.PAYMENTS];
        const currentPayments = await paymentsSheet.getRows();
        if (currentPayments.length === 0) {
            for (const p of mockData.payments) {
                await paymentsSheet.addRow({
                    paymentId: p.paymentId,
                    projectId: p.projectId,
                    clientId: p.clientId,
                    date: p.date,
                    amount: p.amount,
                    type: p.type,
                    mode: p.mode,
                    recordedBy: p.recordedBy
                });
            }
        }

        // Seed Ledger
        const ledgerSheet = doc.sheetsByTitle[SHEETS.LEDGER];
        const currentLedger = await ledgerSheet.getRows();
        if (currentLedger.length === 0) {
            for (const p of mockData.teamLedger) {
                await ledgerSheet.addRow({
                    entryId: p.entryId,
                    memberId: p.memberId,
                    clientId: p.clientId,
                    date: p.date,
                    amount: p.amount,
                    type: p.type,
                    reason: p.reason,
                    by: p.by
                });
            }
        }

        return { success: true, message: "Database seeded successfully" };
    } catch (e) {
        console.error("Seeding Failed:", e);
        return { success: false, message: "Failed to seed database" };
    }
}
