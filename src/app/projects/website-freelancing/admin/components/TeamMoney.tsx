"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { useFinanceStore } from '@/lib/useFinanceStore';
import { FinanceResult, LedgerEntry } from '@/lib/finance'; // Import LedgerEntry from canonical source

/**
 * LAYER 1: UI COMPONENT
 * Pure display of team wallet and expenses
 */
interface TeamMoneyProps {
    clientId: string;
    finance: FinanceResult | null | undefined; // Receive calculated finance
}

export function TeamMoney({ clientId, finance }: TeamMoneyProps) {
    // Get store methods
    const { teamLedger, addTeamLedgerEntry: storeAddEntry } = useFinanceStore();

    // Filter ledger for display (NOT CALCULATION)
    // Correct type is used from store
    const filteredLedger = teamLedger.filter(entry => entry.clientId === clientId);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [transactionType, setTransactionType] = useState('given'); // 'given' or 'spent' or 'investment'
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [memberId, setMemberId] = useState('member_1'); // Default to member_1 for now
    const [reason, setReason] = useState('');

    const handleAddEntry = async () => {
        setIsSubmitting(true);
        try {
            await storeAddEntry({
                memberId,
                clientId,
                date,
                amount: Number(amount),
                type: transactionType,
                reason,
                by: 'admin'
            });
            setIsDialogOpen(false);

            // Reset
            setAmount('');
            setReason('');
            setDate(new Date().toISOString().split('T')[0]);
            setTransactionType('given');
        } catch (error) {
            console.error("Failed to add ledger entry", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // USE CALCULATED VALUES FROM STORE
    const totalGiven = finance?.teamGiven || 0;
    const totalSpent = finance?.teamSpent || 0;
    const balance = finance?.teamWallet || 0;
    const totalInvestment = finance?.teamInvestment || 0;

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-zinc-300">Transaction History</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 h-8 text-xs">
                            <Plus className="mr-2 h-3 w-3" /> New Transaction
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0B0E14] border-zinc-800 text-white sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Team Wallet Transaction</DialogTitle>
                            <DialogDescription className="text-zinc-500">
                                Record money given to or spent by a team member.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right text-zinc-400">Type</Label>
                                <Select value={transactionType} onValueChange={setTransactionType}>
                                    <SelectTrigger className="col-span-3 bg-zinc-900 border-zinc-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0B0E14] border-zinc-800 text-white">
                                        <SelectItem value="given">Give Money (Credit)</SelectItem>
                                        <SelectItem value="spent">Record Expense (Debit)</SelectItem>
                                        <SelectItem value="investment">Team Investment (Admin Debt)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right text-zinc-400">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="col-span-3 bg-zinc-900 border-zinc-800"
                                    placeholder="0"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right text-zinc-400">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="col-span-3 bg-zinc-900 border-zinc-800"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="reason" className="text-right text-zinc-400">Reason</Label>
                                <Input
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="col-span-3 bg-zinc-900 border-zinc-800"
                                    placeholder="e.g. Server Cost, Advance..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</Button>
                            <Button onClick={handleAddEntry} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {isSubmitting ? 'Recording...' : 'Record Transaction'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Wallet className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-medium text-indigo-300">Current Balance</h3>
                    </div>
                    <div className="text-2xl font-bold text-white">₹{balance.toLocaleString()}</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-medium text-emerald-300">Total Given</h3>
                    </div>
                    <div className="text-2xl font-bold text-white">₹{totalGiven.toLocaleString()}</div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowUpRight className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-medium text-amber-300">Total Spent</h3>
                    </div>
                    <div className="text-2xl font-bold text-white">₹{totalSpent.toLocaleString()}</div>
                </div>
            </div>

            <Card className="flex-1 bg-zinc-900/30 border-zinc-800 overflow-hidden flex flex-col min-h-0">
                <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar">
                    <Table>
                        <TableHeader className="bg-zinc-900/80 sticky top-0 z-10 backdrop-blur-sm">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="w-[100px] text-zinc-400">Date</TableHead>
                                <TableHead className="text-zinc-400">Type</TableHead>
                                <TableHead className="text-zinc-400">Reason</TableHead>
                                <TableHead className="text-right text-zinc-400">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLedger.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                                        No team transactions recorded.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLedger
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map((entry) => (
                                        <TableRow key={entry.entryId} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                            <TableCell className="font-medium text-zinc-300">
                                                {new Date(entry.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={
                                                        entry.type === 'given'
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                            : entry.type === 'spent'
                                                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                                : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                                                    }
                                                >
                                                    {entry.type === 'given' ? 'Given (Credit)' : entry.type === 'spent' ? 'Spent (Debit)' : 'Investment'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-zinc-400">{entry.reason || '-'}</TableCell>
                                            <TableCell className={`text-right font-bold ${entry.type === 'given' ? 'text-emerald-400' : 'text-amber-400'
                                                }`}>
                                                {entry.type === 'given' ? '+' : '-'} ₹{entry.amount.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
