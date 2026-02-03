'use client';

import { useParams } from 'next/navigation';
import { useFinanceStore } from '@/lib/useFinanceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Wallet, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectDashboard() {
    const params = useParams();
    const clientId = params.id as string;

    const {
        clients,
        payments,
        clientFinances,
        loading
    } = useFinanceStore();

    const client = clients.find(c => c.clientId === clientId);
    const finance = clientFinances.get(clientId);

    if (loading) {
        return (
            <div className="p-8 space-y-6">
                <Skeleton className="h-12 w-64 bg-white/5" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-32 bg-white/5" />
                    <Skeleton className="h-32 bg-white/5" />
                    <Skeleton className="h-32 bg-white/5" />
                </div>
                <Skeleton className="h-64 bg-white/5" />
            </div>
        );
    }

    if (!client || !finance) {
        return (
            <div className="p-8 flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Client Not Found</h2>
                    <p className="text-muted-foreground mb-4">The requested project does not exist.</p>
                    <Link href="/projects/website-freelancing/dashboard" className="text-[#7A5BFF] hover:underline">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Filter payments for this client only
    const clientPayments = payments.filter(p => p.clientId === clientId);

    const paymentHistory = clientPayments.map(p => ({
        date: new Date(p.date).toLocaleDateString(),
        amount: p.amount
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const pieData = [
        { name: 'Paid', value: finance.totalPaid, color: '#23D07A' },
        { name: 'Pending', value: finance.pending, color: '#FFB86B' }
    ];

    return (
        <div className="p-8 space-y-6 min-h-screen bg-gradient-to-br from-[#0B0710] via-[#0B0710] to-[#1a0f2e]">
            <header className="flex items-center justify-between">
                <Link href="/projects/website-freelancing/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{client.clientName}</h1>
                    <p className="text-sm text-muted-foreground">{client.businessType || 'Website'}</p>
                </div>
                <div className="w-32"></div>
            </header>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-[#7A5BFF]/10 to-[#7A5BFF]/5 border-[#7A5BFF]/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-[#7A5BFF]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{finance.totalValue.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#23D07A]/10 to-[#23D07A]/5 border-[#23D07A]/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
                        <Wallet className="h-4 w-4 text-[#23D07A]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{finance.totalPaid.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#4FD1FF]/10 to-[#4FD1FF]/5 border-[#4FD1FF]/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Profit Margin</CardTitle>
                        <TrendingUp className="h-4 w-4 text-[#4FD1FF]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{finance.profit.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-black/20 border-white/10">
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={paymentHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                                <YAxis stroke="rgba(255,255,255,0.5)" />
                                <Tooltip contentStyle={{ backgroundColor: '#0B0710', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                                <Line type="monotone" dataKey="amount" stroke="#4FD1FF" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 border-white/10">
                    <CardHeader>
                        <CardTitle>Payment Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0B0710', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
