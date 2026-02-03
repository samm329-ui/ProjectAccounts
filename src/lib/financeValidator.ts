/**
 * FINANCE VALIDATION MODULE
 * 
 * Validates financial calculations for consistency and flags issues.
 * Runs silently after each calculation.
 */

import { FinanceResult } from './finance';

export interface ValidationIssue {
    severity: 'warning' | 'error';
    field: string;
    message: string;
    value: number;
}

export interface ValidationResult {
    isValid: boolean;
    issues: ValidationIssue[];
}

/**
 * Validate finance calculation results
 */
export function validateFinance(finance: FinanceResult): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Check for negative pending (overpayment)
    if (finance.pending < 0) {
        issues.push({
            severity: 'warning',
            field: 'pending',
            message: 'Client has overpaid (pending is negative)',
            value: finance.pending
        });
    }

    // Check for negative wallet (team overdraft)
    if (finance.teamWallet < 0) {
        issues.push({
            severity: 'warning',
            field: 'teamWallet',
            message: 'Team wallet is in overdraft',
            value: finance.teamWallet
        });
    }

    // Verify revenue matches totalPaid
    if (Math.abs(finance.totalRevenue - finance.totalPaid) > 0.01) {
        issues.push({
            severity: 'error',
            field: 'totalRevenue',
            message: 'Revenue does not match totalPaid (calculation error)',
            value: finance.totalRevenue
        });
    }

    // Check for invalid progress percent
    if (finance.progressPercent < 0 || finance.progressPercent > 100) {
        issues.push({
            severity: 'error',
            field: 'progressPercent',
            message: 'Progress percent out of valid range (0-100)',
            value: finance.progressPercent
        });
    }

    // Check for negative total value (invalid pricing)
    if (finance.totalValue < 0) {
        issues.push({
            severity: 'error',
            field: 'totalValue',
            message: 'Total project value is negative (invalid pricing)',
            value: finance.totalValue
        });
    }

    return {
        isValid: issues.filter(i => i.severity === 'error').length === 0,
        issues
    };
}

/**
 * Log validation issues to console (silent monitoring)
 */
export function logValidationIssues(clientId: string, validation: ValidationResult): void {
    if (!validation.isValid || validation.issues.length > 0) {
        console.group(`🔍 Finance Validation [${clientId}]`);

        validation.issues.forEach(issue => {
            const emoji = issue.severity === 'error' ? '❌' : '⚠️';
            console.log(`${emoji} [${issue.field}] ${issue.message} (value: ${issue.value})`);
        });

        console.groupEnd();
    }
}
