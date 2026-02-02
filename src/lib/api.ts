'use server';

import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import mockData from './mock-data.json';
import { recalculateAll } from './recalc';

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

    try {
        const clientsSheet = doc.sheetsByTitle[SHEETS.CLIENTS];
        const paymentsSheet = doc.sheetsByTitle[SHEETS.PAYMENTS];

        const clientRows = await clientsSheet.getRows();
        const paymentRows = await paymentsSheet.getRows();

        const activeClients = clientRows.filter(r => r.get('status') !== 'Deleted');

        // User formulas:
        // Projected Revenue = All Projects Total Value
        // Pending = Total Value - Total Paid (for each client)
        // Total Revenue = All Projects Total Value - Pending Charges
        // Cash = Client Payments in Cash only

        const projectedRevenue = activeClients.reduce((acc, row) => acc + (Number(row.get('totalValue')) || 0), 0);

        // Calculate total pending across all clients
        const totalPending = activeClients.reduce((acc, row) => {
            const totalValue = Number(row.get('totalValue')) || 0;
            const paid = Number(row.get('paid')) || 0;
            const pending = totalValue - paid;
            return acc + pending;
        }, 0);

        const totalRevenue = projectedRevenue - totalPending;

        // Cash only from payments
        const cashPayments = paymentRows
            .filter(p => p.get('type')?.toLowerCase() === 'cash')
            .reduce((acc, p) => acc + (Number(p.get('amount')) || 0), 0);

        const totalProfit = activeClients.reduce((acc, row) => acc + (Number(row.get('profit')) || 0), 0);

        return {
            totalRevenue,
            projectedRevenue,
            totalPending,
            totalCash: cashPayments,
            totalProfit
        };
    } catch (e) {
        console.error("Get Summary Failed:", e);
        return mockData.summary;
    }
}

export async function getClients() {
    const doc = await getDoc();
    if (!doc) return mockData.clients;

    try {
        const sheet = doc.sheetsByTitle[SHEETS.CLIENTS];
        if (!sheet) return [];

        const rows = await sheet.getRows();
        return rows.filter(r => r.get('status') !== 'Deleted').map(row => ({
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


export async function updateClientCosts(clientId: string, costs: any) {
    const doc = await getDoc();
    if (!doc) {
        console.log("Mock Update Costs:", clientId, costs);
        return { success: true };
    }

    try {
        const sheet = doc.sheetsByTitle[SHEETS.CLIENTS];
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('clientId') === clientId);

        if (row) {
            // User-provided formulas:
            // Total Value = Service + DomainCharged + ExtraFeatures + ExtraProduction
            // Total Profit = Total Value + (Domain Charged - Actual Domain Cost)

            const serviceCost = costs.serviceCost || 0;
            const domainCharged = costs.domainCharged || 0;
            const actualDomainCost = costs.actualDomainCost || 0;
            const extraFeatures = costs.extraFeatures || 0;
            const extraProductionCharges = costs.extraProductionCharges || 0;

            const totalValue = serviceCost + domainCharged + extraFeatures + extraProductionCharges;
            const profit = totalValue + (domainCharged - actualDomainCost);

            row.assign({
                serviceCost,
                domainCharged,
                actualDomainCost,
                extraFeatures,
                extraProductionCharges,
                totalValue,
                profit
            });
            await sheet.saveUpdatedCells();
            return { success: true };
        }
        return { success: false, message: 'Client not found' };
    } catch (e) {
        console.error("Update Costs Failed:", e);
        return { success: false };
    }
}

export async function deleteClient(clientId: string, hardDelete: boolean) {
    const doc = await getDoc();
    if (!doc) {
        console.log("Mock Delete Client:", clientId, hardDelete);
        return { success: true };
    }

    try {
        const sheet = doc.sheetsByTitle[SHEETS.CLIENTS];
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('clientId') === clientId);

        if (row) {
            if (hardDelete) {
                await row.delete();
            } else {
                row.assign({ status: 'Deleted' });
                await row.save();
            }
            return { success: true };
        }
        return { success: false, message: 'Client not found' };
    } catch (e) {
        console.error("Delete Client Failed:", e);
        return { success: false };
    }
}

export async function approveRequest(entryId: string) {
    const doc = await getDoc();
    if (!doc) {
        console.log("Mock Approve Request:", entryId);
        return { success: true };
    }

    try {
        const sheet = doc.sheetsByTitle[SHEETS.LEDGER];
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('entryId') === entryId);

        if (row) {
            row.assign({ type: 'given' });
            await row.save();
            return { success: true };
        }
        return { success: false, message: 'Entry not found' };
    } catch (e) {
        console.error("Approve Request Failed:", e);
        return { success: false };
    }
}

export async function updateClientStatus(clientId: string, status: string) {
    const doc = await getDoc();
    if (!doc) return { success: true };

    try {
        const sheet = doc.sheetsByTitle[SHEETS.CLIENTS];
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('clientId') === clientId);
        if (row) {
            row.assign({ status });
            await row.save();
            return { success: true };
        }
        return { success: false };
    } catch (e) { return { success: false }; }
}

export async function updateClient(clientId: string, clientData: any) {
    const doc = await getDoc();
    if (!doc) {
        console.log("Mock Update Client:", clientId, clientData);
        return { success: true };
    }

    try {
        const sheet = doc.sheetsByTitle[SHEETS.CLIENTS];
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('clientId') === clientId);

        if (row) {
            row.assign({
                clientName: clientData.clientName,
                contact: clientData.contact,
                businessType: clientData.businessType
            });
            await row.save();
            return { success: true };
        }
        return { success: false, message: 'Client not found' };
    } catch (e) {
        console.error("Update Client Failed:", e);
        return { success: false };
    }
}

export async function addLog(logEntry: any) {
    const doc = await getDoc();
    if (!doc) {
        console.log("Mock Log:", logEntry);
        return { success: true };
    }

    try {
        const sheet = doc.sheetsByTitle[SHEETS.LOGS];
        await sheet.addRow({
            logId: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: logEntry.actor || 'Admin',
            action: logEntry.action,
            details: JSON.stringify(logEntry.details)
        });
        return { success: true };
    } catch (e) {
        console.error("Add Log Failed:", e);
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
