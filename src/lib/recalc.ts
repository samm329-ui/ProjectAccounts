/**
 * CANONICAL RECALCULATION SERVICE
 * 
 * This service is the SINGLE SOURCE OF TRUTH for all derived calculations.
 * All derived fields (totalValue, paid, pending, profit) MUST be updated
 * through this service only.
 * 
 * Key Principles:
 * - Payments and TeamLedger are immutable transaction logs
 * - Derived fields are calculated from transaction logs
 * - All updates use locking to prevent race conditions
 * - All operations are logged for audit trail
 */

import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

const SHEETS = {
    CLIENTS: 'Clients',
    PAYMENTS: 'Payments',
    TEAM_LEDGER: 'TeamLedger',
    LOGS: 'Logs',
    LOCKS: 'Locks'
};

// Column indices (0-based) in Clients sheet
const CLIENT_COLS = {
    CLIENT_ID: 0,        // A
    SERVICE_COST: 7,     // H
    DOMAIN_CHARGED: 8,   // I
    ACTUAL_DOMAIN: 9,    // J
    EXTRA_FEATURES: 10,  // K
    EXTRA_PROD: 11,      // L
    TOTAL_VALUE: 12,     // M
    PAID: 13,            // N
    PENDING: 14,         // O
    PROFIT: 15,          // P
    LAST_MODIFIED_AT: 16,// Q
    LAST_MODIFIED_BY: 17,// R
    VERSION: 18,         // S
    CHANGE_SUMMARY: 19   // T
};

// Column indices in Payments sheet
const PAYMENT_COLS = {
    CLIENT_ID: 2,        // C
    AMOUNT: 4            // E
};

interface RecalcResult {
    success: boolean;
    clientsUpdated: number;
    timestamp: string;
    errors?: string[];
    timeTaken?: number;
}

interface LockInfo {
    status: 'LOCKED' | 'UNLOCKED';
    timestamp: string;
    actor: string;
}

/**
 * Main recalculation function - recalculates ALL clients
 */
export async function recalculateAll(actor: string = 'system'): Promise<RecalcResult> {
    const startTime = Date.now();
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

    let lockAcquired = false;

    try {
        // 1. Acquire lock (prevents concurrent recalcs)
        await acquireLock(sheets, spreadsheetId, actor);
        lockAcquired = true;

        // 2. Read all necessary data
        // Updated range to include new columns up to T
        const [clientsData, paymentsData] = await Promise.all([
            sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${SHEETS.CLIENTS}!A2:T`
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${SHEETS.PAYMENTS}!A2:H`
            })
        ]);

        const clientRows = clientsData.data.values || [];
        const paymentRows = paymentsData.data.values || [];

        if (clientRows.length === 0) {
            throw new Error('No client data found');
        }

        // 3. Build payment aggregation map
        const paymentsByClient = new Map<string, number>();
        paymentRows.forEach(row => {
            const clientId = row[PAYMENT_COLS.CLIENT_ID];
            const amount = Number(row[PAYMENT_COLS.AMOUNT]) || 0;

            if (clientId && amount > 0) {
                paymentsByClient.set(
                    clientId,
                    (paymentsByClient.get(clientId) || 0) + amount
                );
            }
        });

        // 4. Recalculate derived fields for each client
        const updates: any[][] = [];
        let count = 0;

        clientRows.forEach(row => {
            const clientId = row[CLIENT_COLS.CLIENT_ID];
            if (!clientId) {
                // Return empty values for all calculated columns (M through P)
                // Note: We only update M:P in this batch recalc, other cols are preserved/ignored
                updates.push(['', '', '', '']);
                return;
            }

            // Extract cost fields
            const serviceCost = Number(row[CLIENT_COLS.SERVICE_COST]) || 0;
            const domainCharged = Number(row[CLIENT_COLS.DOMAIN_CHARGED]) || 0;
            const actualDomainCost = Number(row[CLIENT_COLS.ACTUAL_DOMAIN]) || 0;
            const extraFeatures = Number(row[CLIENT_COLS.EXTRA_FEATURES]) || 0;
            const extraProductionCharges = Number(row[CLIENT_COLS.EXTRA_PROD]) || 0;

            // CANONICAL FORMULAS (matching FORMULAS_DOCUMENTATION.txt)
            const totalValue = serviceCost + domainCharged + extraFeatures + extraProductionCharges;
            const paid = paymentsByClient.get(clientId) || 0;
            const pending = totalValue - paid;

            // Profit formula: Total Value - Actual Domain Cost
            // (simpler, realistic formula as per latest requirements)
            const profit = totalValue - actualDomainCost;

            updates.push([totalValue, paid, pending, profit]);
            count++;
        });

        // 5. Write ALL updates in ONE atomic batch operation
        const endRow = clientRows.length + 1;
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${SHEETS.CLIENTS}!M2:P${endRow}`,
            valueInputOption: 'RAW',
            requestBody: { values: updates }
        });

        // 6. Log the recalc operation
        await appendLog(sheets, spreadsheetId, {
            actor,
            action: 'recalc_all',
            details: JSON.stringify({
                clientsUpdated: count,
                paymentCount: paymentRows.length,
                timeTaken: Date.now() - startTime
            })
        });

        // 7. Release lock
        await releaseLock(sheets, spreadsheetId);
        lockAcquired = false;

        const timeTaken = Date.now() - startTime;
        console.log(`✅ Recalc complete: ${count} clients updated in ${timeTaken}ms`);

        return {
            success: true,
            clientsUpdated: count,
            timestamp: new Date().toISOString(),
            timeTaken
        };

    } catch (error: any) {
        console.error('❌ Recalc failed:', error);

        // Always release lock on error
        if (lockAcquired) {
            try {
                await releaseLock(sheets, spreadsheetId);
            } catch (unlockError) {
                console.error('Failed to release lock:', unlockError);
            }
        }

        return {
            success: false,
            clientsUpdated: 0,
            timestamp: new Date().toISOString(),
            errors: [error.message],
            timeTaken: Date.now() - startTime
        };
    }
}

/**
 * Acquire distributed lock to prevent concurrent recalc operations
 */
async function acquireLock(sheets: any, spreadsheetId: string, actor: string): Promise<void> {
    const LOCK_TIMEOUT_MS = 300000; // 5 minutes

    // Check current lock status
    const lockData = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEETS.LOCKS}!A2:C2`
    });

    const existingLock = lockData.data.values?.[0];

    if (existingLock && existingLock[0] === 'LOCKED') {
        const lockTime = new Date(existingLock[1]).getTime();
        const age = Date.now() - lockTime;

        if (age < LOCK_TIMEOUT_MS) {
            throw new Error(
                `Recalc already running (locked by ${existingLock[2]}, ${Math.round(age / 1000)}s ago)`
            );
        }

        console.warn(`⚠️ Stale lock detected (${Math.round(age / 1000)}s old), overriding...`);
    }

    // Acquire lock
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEETS.LOCKS}!A2:C2`,
        valueInputOption: 'RAW',
        requestBody: {
            values: [['LOCKED', new Date().toISOString(), actor]]
        }
    });

    console.log(`🔒 Lock acquired by ${actor}`);
}

/**
 * Release the recalc lock
 */
async function releaseLock(sheets: any, spreadsheetId: string): Promise<void> {
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEETS.LOCKS}!A2:C2`,
        valueInputOption: 'RAW',
        requestBody: {
            values: [['UNLOCKED', new Date().toISOString(), '']]
        }
    });

    console.log('🔓 Lock released');
}

/**
 * Append an entry to the Logs sheet
 */
async function appendLog(sheets: any, spreadsheetId: string, log: {
    actor: string;
    action: string;
    details: string;
}): Promise<void> {
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SHEETS.LOGS}!A:E`,
        valueInputOption: 'RAW',
        requestBody: {
            values: [[
                uuidv4(),
                new Date().toISOString(),
                log.actor,
                log.action,
                log.details
            ]]
        }
    });
}

/**
 * Get authenticated Google Sheets client
 */
async function getAuth() {
    // Support both service account file and JSON string in env
    const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE;
    const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (keyFile) {
        return new google.auth.GoogleAuth({
            keyFile,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
    } else if (keyJson) {
        return new google.auth.GoogleAuth({
            credentials: JSON.parse(keyJson),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
    } else {
        throw new Error('No Google service account credentials found in environment');
    }
}

/**
 * Recalculate a single client (useful for targeted updates)
 */
export async function recalculateClient(clientId: string, actor: string = 'system'): Promise<RecalcResult> {
    // For now, just run full recalc
    // TODO: Optimize for single-client updates if performance becomes an issue
    return recalculateAll(actor);
}
