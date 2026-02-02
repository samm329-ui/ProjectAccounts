import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { addTeamLedgerEntry } from '@/lib/api';

interface LedgerEntry {
    entryId: string;
    memberId: string;
    clientId?: string;
    date: string;
    amount: number;
    type: string; // 'given' | 'spent'
    reason: string;
    by: string;
}

interface TeamMoneyProps {
    clientId: string;
    teamLedger: LedgerEntry[];
    onEntryAdded: () => void;
}

export function TeamMoney({ clientId, teamLedger, onEntryAdded }: TeamMoneyProps) {
    const filteredLedger = teamLedger.filter(entry => entry.clientId === clientId);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [memberId, setMemberId] = useState('member_1'); // Default to member_1 for now
    const [reason, setReason] = useState('');

    const handleAddEntry = async () => {
        setIsSubmitting(true);
        try {
            await addTeamLedgerEntry({
                memberId,
                clientId,
                date,
                amount: Number(amount),
                type: 'given', // Admin usually 'gives' money here
                reason,
                by: 'admin'
            });
            setIsDialogOpen(false);
            onEntryAdded();
            // Reset
            setAmount('');
            setReason('');
            setDate(new Date().toISOString().split('T')[0]);
        } catch (error) {
            console.error("Failed to add ledger entry", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalGiven = filteredLedger.filter(e => e.type === 'given').reduce((sum, e) => sum + e.amount, 0);
    const totalSpent = filteredLedger.filter(e => e.type === 'spent').reduce((sum, e) => sum + e.amount, 0);
    const balance = totalGiven - totalSpent;

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#4FD1FF]/10 border border-[#4FD1FF]/20 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-[#4FD1FF] mb-1">Total Given</h3>
                    <div className="text-2xl font-bold text-white">₹{totalGiven.toLocaleString()}</div>
                </div>
                <div className="bg-[#FFB86B]/10 border border-[#FFB86B]/20 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-[#FFB86B] mb-1">Total Spent</h3>
                    <div className="text-2xl font-bold text-white">₹{totalSpent.toLocaleString()}</div>
                </div>
                <div className={`rounded-xl p-4 border ${balance >= 0 ? 'bg-white/5 border-white/10' : 'bg-red-500/10 border-red-500/20'}`}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Balance (Left)</h3>
                    <div className={`text-2xl font-bold ${balance >= 0 ? 'text-foreground' : 'text-red-400'}`}>₹{balance.toLocaleString()}</div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-2">
                <h3 className="text-base font-semibold">Team Ledger</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-white/5 hover:bg-white/10 hover:text-white text-muted-foreground border border-white/10 h-8 text-xs">
                            <Plus className="mr-2 h-3 w-3" /> Give Money
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0B0710] border-white/10 text-foreground sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Give Money to Team</DialogTitle>
                            <DialogDescription>
                                Record an amount given to a team member for this project.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="member" className="text-right">Member</Label>
                                <Select value={memberId} onValueChange={setMemberId}>
                                    <SelectTrigger className="col-span-3 bg-white/5 border-white/10">
                                        <SelectValue placeholder="Select member" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0B0710] border-white/10 text-white">
                                        <SelectItem value="member_1">Member 1</SelectItem>
                                        <SelectItem value="member_2">Member 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="col-span-3 bg-white/5 border-white/10"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="col-span-3 bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="reason" className="text-right">Reason</Label>
                                <Input
                                    id="reason"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    className="col-span-3 bg-white/5 border-white/10"
                                    placeholder="e.g. Advance payment"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting} className="border-white/10 hover:bg-white/5 hover:text-white">Cancel</Button>
                            <Button onClick={handleAddEntry} disabled={isSubmitting || !amount} className="btn-primary">
                                {isSubmitting ? 'Recording...' : 'Confirm'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden flex-grow relative bg-black/20">
                <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                    <Table>
                        <TableHeader className="bg-white/5 sticky top-0 z-10 backdrop-blur-sm">
                            <TableRow className="hover:bg-transparent border-white/10">
                                <TableHead className="text-muted-foreground w-[100px] text-xs font-medium">Date</TableHead>
                                <TableHead className="text-muted-foreground text-xs font-medium">Member</TableHead>
                                <TableHead className="text-muted-foreground text-xs font-medium">Type</TableHead>
                                <TableHead className="text-muted-foreground text-xs font-medium">Reason</TableHead>
                                <TableHead className="text-muted-foreground text-right text-xs font-medium">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLedger.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                                        No ledger entries for this client.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLedger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                                    <TableRow key={entry.entryId} className="hover:bg-white/5 border-white/5 transition-colors">
                                        <TableCell className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-sm text-white">{entry.memberId}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`text-[10px] px-2 h-5 border ${entry.type === 'given' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-[#FFB86B]/10 text-[#FFB86B] border-[#FFB86B]/20'}`}>
                                                {entry.type === 'given' ? <ArrowArrowIcon type="up" /> : <ArrowArrowIcon type="down" />}
                                                {entry.type.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs">{entry.reason}</TableCell>
                                        <TableCell className="text-right font-medium text-sm text-white">₹{entry.amount.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

function ArrowArrowIcon({ type }: { type: 'up' | 'down' }) {
    if (type === 'up') return <ArrowUpRight size={10} className="mr-1 inline" />;
    return <ArrowDownLeft size={10} className="mr-1 inline" />;
}
