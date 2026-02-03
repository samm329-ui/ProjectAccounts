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

import { useState, useEffect, useCallback } from 'react';
import {
    getClients,
    getPayments,
    getLogs,
    getTeamLedger,
    addClient as apiAddClient,
    addPayment as apiAddPayment,
    addTeamLedgerEntry as apiAddTeamLedgerEntry,
    updateClientPricing as apiUpdateClientPricing,
    updateClientStatus as apiUpdateClientStatus,
    deleteClient as apiDeleteClient,
    addLog as apiAddLog
} from './api';
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
                getClients(),
                getPayments(),
                getTeamLedger('all'),
                getLogs()
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
    // MUTATION WRAPPERS (ENFORCE: API → REFETCH → RECALC)
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
        optimisticLog(`Created Client ${clientData.clientName}`);
        await apiAddClient(clientData);
        await loadData();
    }, [loadData]);

    const addPayment = useCallback(async (paymentData: any) => {
        // Optimistic
        optimisticLog(`Added Payment ₹${paymentData.amount}`);
        await apiAddPayment(paymentData);
        await loadData();
    }, [loadData]);

    const addTeamLedgerEntry = useCallback(async (ledgerData: any) => {
        // Optimistic
        optimisticLog(`Added Ledger Entry ₹${ledgerData.amount} (${ledgerData.type})`);
        await apiAddTeamLedgerEntry(ledgerData);
        await loadData();
    }, [loadData]);

    const updateClientPricing = useCallback(async (clientId: string, costs: any) => {
        // OPTIMISTIC UPDATE
        setState(prev => {
            const updatedClients = prev.clients.map(c =>
                c.clientId === clientId ? { ...c, costs: { ...c.costs, ...costs } } : c
            );
            return { ...prev, clients: updatedClients };
        });
        optimisticLog('Updated Pricing');

        await apiUpdateClientPricing(clientId, costs);
        await loadData();
    }, [loadData]);

    const updateClientDetails = useCallback(async (clientId: string, details: any) => {
        // OPTIMISTIC UPDATE
        setState(prev => {
            const updatedClients = prev.clients.map(c =>
                c.clientId === clientId ? { ...c, ...details } : c
            );
            return { ...prev, clients: updatedClients };
        });
        optimisticLog(`Updated Client Details`);

        await import('./api').then(mod => mod.updateClient(clientId, details));
        await loadData();
    }, [loadData]);

    const updateClientStatus = useCallback(async (clientId: string, status: string) => {
        // OPTIMISTIC UPDATE
        setState(prev => {
            const updatedClients = prev.clients.map(c =>
                c.clientId === clientId ? { ...c, status } : c
            );
            return { ...prev, clients: updatedClients };
        });
        optimisticLog(`Updated Status to ${status}`);

        await apiUpdateClientStatus(clientId, status);
        await loadData();
    }, [loadData]);

    const deleteClient = useCallback(async (clientId: string) => {
        optimisticLog('Deleted Client');
        await apiDeleteClient(clientId, false);
        await loadData();
    }, [loadData]);

    const addLog = useCallback(async (logData: any) => {
        optimisticLog(logData.action, logData.actor);
        await apiAddLog(logData);
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
