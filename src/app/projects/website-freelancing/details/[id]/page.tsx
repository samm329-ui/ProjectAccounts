'use client';

import { useFinanceStore } from '@/lib/useFinanceStore';
import { useParams } from 'next/navigation';
import { ArrowLeft, Shield, DollarSign, TrendingUp, Lock } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ProjectDetailsPage() {
    const params = useParams();
    const { clients, clientFinances } = useFinanceStore();
    // Handle potential array or string param
    const clientId = Array.isArray(params.id) ? params.id[0] : params.id;

    // Find client and finance data
    const client = clients.find(c => c.clientId === clientId);
    const finance = clientId ? clientFinances.get(clientId) : undefined;

    if (!clientId) return <div className="min-h-screen bg-[#0B0710] p-8 text-white">Loading...</div>;

    if (!client || !finance) {
        return (
            <div className="min-h-screen bg-[#0B0710] p-8 text-white flex flex-col items-center justify-center">
                <h1 className="text-xl font-bold mb-4">Project Not Found</h1>
                <Link href="/projects/website-freelancing/dashboard" className="text-[#6E6AF6] hover:underline">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-[#0B0710] text-white p-4 pb-20 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <Link href="/projects/website-freelancing/dashboard" className="inline-flex items-center gap-2 text-[#9AA0B4] hover:text-white transition-colors mb-6 text-sm font-medium">
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </Link>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{client.clientName}</h1>
                            <Badge className={`${client.status === 'Delivered' ? 'bg-[#7C6CFF]/10 text-[#7C6CFF] border-[#7C6CFF]/20' : 'bg-[#3FE0C5]/10 text-[#3FE0C5] border-[#3FE0C5]/20'} px-3 py-1 text-xs uppercase tracking-wider`}>
                                {client.status || 'Active'}
                            </Badge>
                        </div>
                        <p className="text-[#6B6F85] text-sm md:text-base">Project Details and Financial Overview</p>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid gap-4 md:gap-6 md:grid-cols-3">
                    {/* Total Value */}
                    <Card className="bg-gradient-to-br from-[#1A1B2E] to-[#0F1020] border-white/[0.06] backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-[#9AA0B4] uppercase tracking-wider">Total Charged</CardTitle>
                            <Lock size={16} className="text-[#6E6AF6]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">₹{finance.totalValue.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    {/* Received */}
                    <Card className="bg-gradient-to-br from-[#1A1B2E] to-[#0F1020] border-white/[0.06] backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-[#9AA0B4] uppercase tracking-wider">Received</CardTitle>
                            <DollarSign size={16} className="text-[#3FE0C5]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#3FE0C5]">₹{finance.totalPaid.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    {/* Pending */}
                    <Card className="bg-gradient-to-br from-[#1A1B2E] to-[#0F1020] border-white/[0.06] backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-[#9AA0B4] uppercase tracking-wider">Pending</CardTitle>
                            <TrendingUp size={16} className="text-[#F2B36D]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#F2B36D]">₹{finance.pending.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Details (Placeholder or Future Expansion) */}
                <div className="pt-8 border-t border-white/[0.05]">
                    <h3 className="text-sm font-bold text-[#9AA0B4] uppercase tracking-wider mb-4">Project Information</h3>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-[#6B6F85] mb-1">Project ID</p>
                                <p className="text-sm font-medium text-white">{client.clientId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#6B6F85] mb-1">Contact</p>
                                <p className="text-sm font-medium text-white">{client.contact || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
