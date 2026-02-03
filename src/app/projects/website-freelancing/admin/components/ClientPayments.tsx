"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, CreditCard, Banknote, Calendar } from 'lucide-react';
import { useFinanceStore } from '@/lib/useFinanceStore';
import { FinanceResult, Payment } from '@/lib/finance'; // Import Payment from canonical source

/**
 * LAYER 1: UI COMPONENT
 * Pure display of payment history and add payment form
 */
interface ClientPaymentsProps {
    clientId: string;
    finance: FinanceResult | null | undefined; // Receive calculated finance
}

export function ClientPayments({ clientId, finance }: ClientPaymentsProps) {
    // Get store methods
    const { payments, addPayment: storeAddPayment } = useFinanceStore();

    // Filter payments for display (NOT CALCULATION)
    // Correct type is used from store
    const filteredPayments = payments.filter(p => p.clientId === clientId);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState('Credit');
    const [mode, setMode] = useState('Online');

    const handleAddPayment = async () => {
        setIsSubmitting(true);
        try {
            await storeAddPayment({
                projectId: 'website-freelance',
                clientId,
                date,
                amount: Number(amount),
                type,
                mode,
                recordedBy: 'admin'
            });
            setIsDialogOpen(false);

            // Reset form
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
        } catch (error) {
            console.error("Failed to add payment", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // USE CALCULATED VALUE FROM STORE
    const totalPaid = finance?.totalPaid || 0;

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#23D07A]/10 border border-[#23D07A]/20 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-[#23D07A] mb-1">Total Paid</h3>
                    <div className="text-2xl font-bold text-white">₹{totalPaid.toLocaleString()}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Payment</h3>
                    <div className="text-2xl font-bold text-foreground">
                        {filteredPayments.length > 0
                            ? new Date(filteredPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date).toLocaleDateString()
                            : 'N/A'}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-2">
                <h3 className="text-base font-semibold">Transaction History</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="btn-primary h-8 text-xs">
                            <Plus className="mr-2 h-3 w-3" /> Add Payment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0B0710] border-white/10 text-foreground sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Record Client Payment</DialogTitle>
                            <DialogDescription>
                                Add a new payment entry for this client.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="col-span-3"
                                    placeholder="0"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Credit">Credit (Income)</SelectItem>
                                        <SelectItem value="Debit">Debit (Refund)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="mode" className="text-right">Mode</Label>
                                <Select value={mode} onValueChange={setMode}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Online">Online</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Cheque">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddPayment} disabled={isSubmitting}>
                                {isSubmitting ? 'Adding...' : 'Add Payment'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="flex-1 bg-white/5 border-white/10 overflow-hidden flex flex-col min-h-0">
                <CardContent className="p-0 flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="bg-white/5 sticky top-0 z-10">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="w-[100px]">Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Mode</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No payments recorded yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPayments
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map((payment) => (
                                        <TableRow key={payment.paymentId} className="border-white/5 hover:bg-white/5">
                                            <TableCell className="font-medium text-zinc-300">
                                                {new Date(payment.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={
                                                        payment.type === 'Credit'
                                                            ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                                    }
                                                >
                                                    {payment.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-zinc-400">{payment.mode || 'Online'}</TableCell>
                                            <TableCell className={`text-right font-bold ${payment.type === 'Credit' ? 'text-emerald-500' : 'text-red-500'
                                                }`}>
                                                {payment.type === 'Credit' ? '+' : '-'} ₹{payment.amount.toLocaleString()}
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
