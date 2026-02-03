import "server-only";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const SHEETS = {
    CLIENTS: 'Clients',
    PAYMENTS: 'Payments',
    TEAM_LEDGER: 'TeamLedger',
    LOGS: 'Logs',
    LOCKS: 'Locks'
};

function getAuth() {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!privateKey) {
        throw new Error("Missing GOOGLE_PRIVATE_KEY");
    }

    return new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: privateKey,
        scopes: SCOPES,
    });
}

export async function getSheets() {
    const auth = getAuth();
    return google.sheets({ version: "v4", auth });
}

export const spreadsheetId = process.env.GOOGLE_SHEET_ID;

// --- Helper: Get All Rows ---
async function getValues(range: string) {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return response.data.values || [];
}

// --- Specific Data Fetchers ---

export async function fetchClients() {
    const rows = await getValues(`${SHEETS.CLIENTS}!A2:T`);
    return rows.filter(row => row[6] !== 'Deleted').map(row => ({
        clientId: row[0],
        clientName: row[1],
        contact: row[2],
        businessType: row[3],
        startDate: row[4],
        assignedMember: row[5],
        status: row[6],
        costs: {
            serviceCost: Number(row[7] || 0),
            domainCharged: Number(row[8] || 0),
            actualDomainCost: Number(row[9] || 0),
            extraFeatures: Number(row[10] || 0),
            extraProductionCharges: Number(row[11] || 0),
        },
        financials: {
            totalValue: Number(row[12] || 0),
            paid: Number(row[13] || 0),
            pending: Number(row[14] || 0),
            profit: Number(row[15] || 0),
        },
        lastModifiedAt: row[16],
        lastModifiedBy: row[17],
        version: Number(row[18] || 0),
    }));
}

export async function fetchPayments() {
    const rows = await getValues(`${SHEETS.PAYMENTS}!A2:H`);
    return rows.map(row => ({
        paymentId: row[0],
        projectId: row[1],
        clientId: row[2],
        date: row[3],
        amount: Number(row[4] || 0),
        type: row[5],
        mode: row[6],
        recordedBy: row[7],
    }));
}

export async function fetchTeamLedger() {
    const rows = await getValues(`${SHEETS.TEAM_LEDGER}!A2:H`);
    return rows.map(row => ({
        entryId: row[0],
        memberId: row[1],
        clientId: row[2],
        date: row[3],
        amount: Number(row[4] || 0),
        type: row[5],
        reason: row[6],
        by: row[7],
    }));
}

export async function fetchLogs() {
    const rows = await getValues(`${SHEETS.LOGS}!A2:E`);
    return rows.map(row => ({
        logId: row[0],
        timestamp: row[1],
        actor: row[2],
        action: row[3],
        details: row[4],
    }));
}

// --- Mutations ---

export async function addClientRow(client: any) {
    const sheets = await getSheets();
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SHEETS.CLIENTS}!A:T`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [[
                `client_${Date.now()}`,
                client.clientName,
                client.contact,
                client.businessType,
                client.startDate,
                client.assignedMember,
                'Active',
                client.costs.serviceCost,
                client.costs.domainCharged,
                client.costs.actualDomainCost,
                client.costs.extraFeatures,
                client.costs.extraProductionCharges,
                client.financials.totalValue,
                0,
                client.financials.totalValue,
                client.financials.profit,
                new Date().toISOString(),
                'system',
                1,
                'Initial creation'
            ]],
        },
    });
}

export async function updateClientPricingRow(clientId: string, payload: any) {
    const sheets = await getSheets();
    const rows = await getValues(`${SHEETS.CLIENTS}!A:A`);
    const rowIndex = rows.findIndex(row => row[0] === clientId) + 1;

    if (rowIndex <= 0) throw new Error("Client not found");

    // Total Value = service + domainCharged + extraFeatures + extraProduction
    const totalValue = payload.serviceCost + payload.domainCharged + payload.extraFeatures + payload.extraProductionCharges;
    // Profit = Total Value - actualDomainCost
    const profit = totalValue - payload.actualDomainCost;

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEETS.CLIENTS}!H${rowIndex}:T${rowIndex}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [[
                payload.serviceCost,
                payload.domainCharged,
                payload.actualDomainCost,
                payload.extraFeatures,
                payload.extraProductionCharges,
                totalValue,
                undefined, // Skip Paid (N)
                undefined, // Skip Pending (O)
                profit,
                new Date().toISOString(),
                payload.editorId || 'system',
                (payload.lastKnownVersion || 0) + 1,
                'Pricing updated'
            ]],
        },
    });
}

export async function deleteClientRow(clientId: string, hardDelete: boolean = false) {
    const sheets = await getSheets();
    const rows = await getValues(`${SHEETS.CLIENTS}!A:A`);
    const rowIndex = rows.findIndex(row => row[0] === clientId) + 1;

    if (rowIndex <= 0) throw new Error("Client not found");

    if (hardDelete) {
        // Note: googleapis delete row is a batch update request
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: await getSheetId(SHEETS.CLIENTS),
                            dimension: "ROWS",
                            startIndex: rowIndex - 1,
                            endIndex: rowIndex
                        }
                    }
                }]
            }
        });
    } else {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${SHEETS.CLIENTS}!G${rowIndex}`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [['Deleted']],
            },
        });
    }
}

async function getSheetId(title: string) {
    const sheets = await getSheets();
    const doc = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = doc.data.sheets?.find(s => s.properties?.title === title);
    return sheet?.properties?.sheetId;
}

export async function addPaymentRow(payment: any) {
    const sheets = await getSheets();
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SHEETS.PAYMENTS}!A:H`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [[
                `pay_${Date.now()}`,
                payment.projectId,
                payment.clientId,
                payment.date,
                payment.amount,
                payment.type,
                payment.mode,
                payment.recordedBy
            ]],
        },
    });
}
