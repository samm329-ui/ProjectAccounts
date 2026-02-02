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
import { addPayment } from '@/lib/api';

interface Payment {
    paymentId: string;
    projectId: string;
    clientId: string;
    date: string;
    amount: number;
    type: string;
    mode: string;
    recordedBy: string;
}

interface ClientPaymentsProps {
    clientId: string;
    payments: Payment[];
    onPaymentAdded: () => void; // Callback to refresh data
}

export function ClientPayments({ clientId, payments, onPaymentAdded }: ClientPaymentsProps) {
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
            await addPayment({
                projectId: 'website-freelance', // Hardcoded for now
                clientId,
                date,
                amount: Number(amount),
                type,
                mode,
                recordedBy: 'admin'
            });
            setIsDialogOpen(false);
            onPaymentAdded();
            // Reset form
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
        } catch (error) {
            console.error("Failed to add payment", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalPaid = filteredPayments.filter(p => p.type === 'Credit').reduce((sum, p) => sum + p.amount, 0);

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
                                <Label htmlFor="type" className="text-right">Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger className="col-span-3 bg-white/5 border-white/10">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0B0710] border-white/10 text-white">
                                        <SelectItem value="Credit">Credit (Received)</SelectItem>
                                        <SelectItem value="Debit">Debit (Refund/Adj)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="mode" className="text-right">Mode</Label>
                                <Select value={mode} onValueChange={setMode}>
                                    <SelectTrigger className="col-span-3 bg-white/5 border-white/10">
                                        <SelectValue placeholder="Select mode" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0B0710] border-white/10 text-white">
                                        <SelectItem value="Online">Online / UPI</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting} className="border-white/10 hover:bg-white/5 hover:text-white">Cancel</Button>
                            <Button onClick={handleAddPayment} disabled={isSubmitting || !amount} className="btn-primary">
                                {isSubmitting ? 'Recording...' : 'Record Payment'}
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
                                <TableHead className="text-muted-foreground font-medium text-xs">Date</TableHead>
                                <TableHead className="text-muted-foreground font-medium text-xs">Amount</TableHead>
                                <TableHead className="text-muted-foreground font-medium text-xs">Type</TableHead>
                                <TableHead className="text-muted-foreground font-medium text-xs">Mode</TableHead>
                                <TableHead className="text-muted-foreground font-medium text-xs">By</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                                        No payments recorded yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                                    <TableRow key={p.paymentId} className="hover:bg-white/5 border-white/5 transition-colors">
                                        <TableCell className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-medium text-white text-sm">₹{p.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`text-[10px] px-2 h-5 border ${p.type === 'Credit' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                {p.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            {p.mode === 'Cash' ? <Banknote size={12} /> : <CreditCard size={12} />}
                                            {p.mode}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-[10px] uppercase">{p.recordedBy}</TableCell>
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
