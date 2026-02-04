/**
 * LAYER 2: STATE MANAGEMENT
 * 
 * Centralized state management for the entire finance system.
 * This is the ONLY place that holds data and triggers recalculation.
 * 
 * STRICT RULES:
 * - NO calculations (delegate to finance engine)
 * - NO partial updates (always full refetch)
 * - NO direct API calls from components (use store methods)
 */

// lib/useFinanceStore.ts

// No direct imports from ./api for data fetching
import { useState, useEffect, useCallback } from 'react';
import { calculateFinance, calculateGlobalFinance, Client, Payment, LedgerEntry, FinanceResult } from './finance';
import { validateFinance, logValidationIssues } from './financeValidator';


// ============================================================================
// TYPES
// ============================================================================

export interface GlobalFinanceResult {
    totalRevenue: number;
    projectedRevenue: number;
    totalPending: number;
    totalCash: number;
}

export interface Log {
    logId: string;
    timestamp: string;
    actor: string;
    action: string;
    details: string;
}

export interface FinanceStoreState {
    // Raw Data (Layer 6 → Layer 5 → Layer 2)
    clients: Client[];
    payments: Payment[];
    teamLedger: LedgerEntry[];
    logs: Log[];

    // Computed Data (Layer 3 → Layer 2)
    globalFinance: GlobalFinanceResult;
    clientFinances: Map<string, FinanceResult>;

    // UI State
    loading: boolean;
    error: Error | null;
    isRefreshing: boolean; // Backround refresh
}

// ============================================================================
// FINANCE STORE HOOK
// ============================================================================

let globalStore: FinanceStoreState | null = null;
let setGlobalStore: ((state: FinanceStoreState) => void) | null = null;

export function useFinanceStore() {
    const [state, setState] = useState<FinanceStoreState>(() => {
        if (globalStore) return globalStore;

        return {
            clients: [],
            payments: [],
            teamLedger: [],
            logs: [],
            globalFinance: {
                totalRevenue: 0,
                projectedRevenue: 0,
                totalPending: 0,
                totalCash: 0
            },
            clientFinances: new Map(),
            loading: true,
            error: null,
            isRefreshing: false
        };
    });

    // Sync with global store
    useEffect(() => {
        globalStore = state;
    }, [state]);

    if (!setGlobalStore) {
        setGlobalStore = setState;
    }

    // ========================================================================
    // CORE FUNCTION: LOAD DATA
    // ========================================================================

    const loadData = useCallback(async (isInitial = false) => {
        try {
            if (isInitial) {
                setState(prev => ({ ...prev, loading: true, error: null }));
            } else {
                setState(prev => ({ ...prev, isRefreshing: true, error: null }));
            }

            // === LAYER 5: FETCH RAW DATA ===
            const [clientsData, paymentsData, teamLedgerData, logsData] = await Promise.all([
                fetch('/api/sheets/clients').then(res => res.json()),
                fetch('/api/sheets/payments').then(res => res.json()),
                fetch('/api/sheets/ledger').then(res => res.json()),
                fetch('/api/sheets/logs').then(res => res.json())
            ]);

            // === LAYER 3: CALCULATE FINANCE FOR EACH CLIENT ===
            const clientFinances = new Map<string, FinanceResult>();

            clientsData.forEach((client: Client) => {
                const finance = calculateFinance({
                    client,
                    payments: paymentsData,
                    teamLedger: teamLedgerData
                });

                // === LAYER 4: VALIDATE ===
                const validation = validateFinance(finance);
                if (!validation.isValid) {
                    logValidationIssues(client.clientId, validation);
                }

                clientFinances.set(client.clientId, finance);
            });

            // === LAYER 3: CALCULATE GLOBAL FINANCE ===
            const globalFinance = calculateGlobalFinance({
                clients: clientsData,
                payments: paymentsData
            });

            // === LAYER 2: UPDATE STATE ===
            setState({
                clients: clientsData,
                payments: paymentsData,
                teamLedger: teamLedgerData,
                logs: logsData,
                globalFinance,
                clientFinances,
                loading: false,
                isRefreshing: false,
                error: null
            });

        } catch (error) {
            console.error('Failed to load finance data:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                isRefreshing: false,
                error: error as Error
            }));
        }
    }, []);

    // ========================================================================
    // HELPER: RECALCULATE LOCAL STATE
    // ========================================================================
    const recalcState = (currentState: FinanceStoreState): FinanceStoreState => {
        const { clients, payments, teamLedger, logs } = currentState;

        // Recalculate Client Finances
        const clientFinances = new Map<string, FinanceResult>();
        clients.forEach(client => {
            const finance = calculateFinance({ client, payments, teamLedger });
            clientFinances.set(client.clientId, finance);
        });

        // Recalculate Global Finance
        const globalFinance = calculateGlobalFinance({ clients, payments });

        return {
            ...currentState,
            clientFinances,
            globalFinance
        };
    };

    // ========================================================================
    // MUTATION WRAPPERS (ENFORCE: OPTIMISTIC UPDATE → API → REFETCH)
    // ========================================================================

    // OPTIMISTIC UPDATE HELPER
    const optimisticLog = (action: string, actor: string = 'Admin') => {
        const tempLog: Log = {
            logId: `temp_${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor,
            action,
            details: 'Optimistic update'
        };
        setState(prev => ({ ...prev, logs: [tempLog, ...prev.logs] }));
    };

    const addClient = useCallback(async (clientData: any) => {
        // Optimistic
        const tempClient: Client = {
            clientId: `temp_${Date.now()}`, // Temporary ID until reload
            status: 'Active',
            ...clientData
        };

        setState(prev => recalcState({
            ...prev,
            clients: [tempClient, ...prev.clients],
            logs: [{
                logId: `temp_log_${Date.now()}`,
                timestamp: new Date().toISOString(),
                actor: 'Admin',
                action: `Created Client ${clientData.clientName}`,
                details: 'Optimistic'
            }, ...prev.logs]
        }));

        await fetch('/api/sheets/clients', {
            method: 'POST',
            body: JSON.stringify(clientData)
        });
        await loadData();
    }, [loadData]);

    const addPayment = useCallback(async (paymentData: any) => {
        // Optimistic
        const tempPayment: Payment = {
            paymentId: `temp_${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...paymentData
        };

        setState(prev => recalcState({
            ...prev,
            payments: [tempPayment, ...prev.payments],
            logs: [{
                logId: `temp_log_${Date.now()}`,
                timestamp: new Date().toISOString(),
                actor: 'Admin',
                action: `Added Payment ₹${paymentData.amount}`,
                details: 'Optimistic'
            }, ...prev.logs]
        }));

        await fetch('/api/sheets/payments', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
        await loadData();
    }, [loadData]);

    const addTeamLedgerEntry = useCallback(async (ledgerData: any) => {
        // Optimistic
        const tempLedger: LedgerEntry = {
            entryId: `temp_${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...ledgerData
        };

        setState(prev => recalcState({
            ...prev,
            teamLedger: [tempLedger, ...prev.teamLedger],
            logs: [{
                logId: `temp_log_${Date.now()}`,
                timestamp: new Date().toISOString(),
                actor: 'Admin',
                action: `Added Ledger Entry ₹${ledgerData.amount} (${ledgerData.type})`,
                details: 'Optimistic'
            }, ...prev.logs]
        }));

        await fetch('/api/sheets/add-ledger', {
            method: 'POST',
            body: JSON.stringify(ledgerData)
        });
        await loadData();
    }, [loadData]);

    const updateClientPricing = useCallback(async (clientId: string, costs: any) => {
        // OPTIMISTIC UPDATE
        setState(prev => recalcState({
            ...prev,
            clients: prev.clients.map(c =>
                c.clientId === clientId ? { ...c, costs: { ...c.costs, ...costs } } : c
            ),
            logs: [{
                logId: `temp_log_${Date.now()}`,
                timestamp: new Date().toISOString(),
                actor: 'Admin',
                action: 'Updated Pricing',
                details: 'Optimistic'
            }, ...prev.logs]
        }));

        await fetch('/api/sheets/update-pricing', {
            method: 'POST',
            body: JSON.stringify({ clientId, ...costs })
        });
        await loadData();
    }, [loadData]);

    const updateClientDetails = useCallback(async (clientId: string, details: any) => {
        // OPTIMISTIC UPDATE
        setState(prev => recalcState({
            ...prev,
            clients: prev.clients.map(c =>
                c.clientId === clientId ? { ...c, ...details } : c
            ),
            logs: [{
                logId: `temp_log_${Date.now()}`,
                timestamp: new Date().toISOString(),
                actor: 'Admin',
                action: 'Updated Client Details',
                details: 'Optimistic'
            }, ...prev.logs]
        }));

        await fetch('/api/sheets/update-details', {
            method: 'POST',
            body: JSON.stringify({ clientId, ...details })
        });
        await loadData();
    }, [loadData]);

    const updateClientStatus = useCallback(async (clientId: string, status: string) => {
        // OPTIMISTIC UPDATE
        setState(prev => recalcState({
            ...prev,
            clients: prev.clients.map(c =>
                c.clientId === clientId ? { ...c, status } : c
            ),
            logs: [{
                logId: `temp_log_${Date.now()}`,
                timestamp: new Date().toISOString(),
                actor: 'Admin',
                action: `Updated Status to ${status}`,
                details: 'Optimistic'
            }, ...prev.logs]
        }));

        await fetch('/api/sheets/update-status', {
            method: 'POST',
            body: JSON.stringify({ clientId, status })
        });
        await loadData();
    }, [loadData]);

    const deleteClient = useCallback(async (clientId: string) => {
        // Optimistic
        setState(prev => recalcState({
            ...prev,
            clients: prev.clients.filter(c => c.clientId !== clientId),
            logs: [{
                logId: `temp_log_${Date.now()}`,
                timestamp: new Date().toISOString(),
                actor: 'Admin',
                action: 'Deleted Client',
                details: 'Optimistic'
            }, ...prev.logs]
        }));

        await fetch('/api/sheets/delete', {
            method: 'POST',
            body: JSON.stringify({ clientId, hardDelete: false })
        });
        await loadData();
    }, [loadData]);

    const addLog = useCallback(async (logData: any) => {
        optimisticLog(logData.action, logData.actor);
        // await apiAddLog(logData); // Can implement logs API if needed
        // await loadData(); // No need to full refresh for logs
    }, []);

    // ========================================================================
    // INITIAL LOAD
    // ========================================================================

    useEffect(() => {
        loadData(true);
    }, [loadData]);

    // ========================================================================
    // RETURN API
    // ========================================================================

    return {
        // Raw Data
        clients: state.clients,
        payments: state.payments,
        teamLedger: state.teamLedger,
        logs: state.logs,

        // Computed Data
        globalFinance: state.globalFinance,
        clientFinances: state.clientFinances,

        // Actions
        loadData,
        addClient,
        addPayment,
        addTeamLedgerEntry,
        updateClientPricing,
        updateClientStatus,
        updateClientDetails,
        deleteClient,
        addLog,

        // UI State
        loading: state.loading,
        error: state.error
    };
}

// ============================================================================
// HELPER: GET CLIENT FINANCE
// ============================================================================

export function useClientFinance(clientId: string | null): FinanceResult | null {
    const { clientFinances } = useFinanceStore();

    if (!clientId) return null;
    return clientFinances.get(clientId) || null;
}
