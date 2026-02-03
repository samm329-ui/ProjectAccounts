'use client';

import PasscodeProtect from '@/components/PasscodeProtect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getTeamLedger, getClients, addTeamLedgerEntry } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Search, Plus, ArrowUpRight, ArrowDownLeft, Wallet, Bell, Settings, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

function formatTimeAgo(timestamp: string) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / 60000);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
}

const TeamContent = () => {
    const [ledger, setLedger] = useState<any[]>([]);

    const [clients, setClients] = useState<any[]>([]);
    const [filteredClients, setFilteredClients] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [type, setType] = useState('spent'); // 'spent', 'request', 'deposit'
    const [activeMobileTab, setActiveMobileTab] = useState('ADD ENTRY / EXPENSE');

    useEffect(() => {
        async function fetchData() {
            try {
                const [ledgerData, clientsData] = await Promise.all([
                    getTeamLedger('member_1'),
                    getClients(),
                ]);
                setLedger(ledgerData);
                setClients(clientsData);
                setFilteredClients(clientsData);
                if (clientsData.length > 0) {
                    setSelectedClientId(clientsData[0].clientId);
                }
            } catch (error) {
                console.error("Failed to fetch team data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredClients(clients);
        } else {
            setFilteredClients(clients.filter(c => c.clientName.toLowerCase().includes(searchQuery.toLowerCase())));
        }
    }, [searchQuery, clients]);

    const handleLogExpense = async (submitType: string) => {
        if (!selectedClientId) return;
        setIsSubmitting(true);
        try {
            const result = await addTeamLedgerEntry({
                memberId: 'member_1',
                clientId: selectedClientId,
                date: new Date().toISOString(),
                amount: Number(amount) || 0,
                type: submitType, // 'spent', 'request', 'deposit'
                reason: reason,
                by: 'Team Member'
            });

            if (result.success) {
                // Refresh data
                const newLedger = await getTeamLedger('member_1');
                setLedger(newLedger);
                setAmount('');
                setReason('');
                alert(submitType === 'request' ? 'Request sent successfully' : 'Entry added successfully');
            } else {
                alert('Failed to add entry');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedClient = clients.find(c => c.clientId === selectedClientId);
    const projectLedger = ledger.filter(l => l.clientId === selectedClientId);

    const totalGiven = projectLedger.filter(e => e.type === 'given').reduce((sum, e) => sum + e.amount, 0);
    const totalSpent = projectLedger.filter(e => e.type === 'spent').reduce((sum, e) => sum + e.amount, 0);
    const balance = totalGiven - totalSpent;

    if (loading) {
        return <div className="space-y-6">
            <Skeleton className="h-16 w-full bg-white/5" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <Skeleton className="h-[600px] md:col-span-3 bg-white/5" />
                <Skeleton className="h-[600px] md:col-span-6 bg-white/5" />
                <Skeleton className="h-[600px] md:col-span-3 bg-white/5" />
            </div>
        </div>;
    }

    return (
        <div className="w-full min-h-screen bg-[#0E0C12] text-[#EAEAF0] flex flex-col font-sans relative overflow-hidden">
            {/* Mobile-only background effects (strictly < 480px) */}
            <div className="fixed inset-0 pointer-events-none md:hidden overflow-hidden bg-[#0B0B12] z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_20%_20%,rgba(124,108,255,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(63,224,197,0.04),transparent_40%)]" />
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%\' height=\'100%\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden md:flex flex-col p-6 space-y-6 relative z-10 w-full">
                {/* Header */}
                <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                    <div className="flex items-center gap-4">
                        <Link href="/phases/0" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft size={16} />
                            Back to Phase 0
                        </Link>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">Website Freelancing</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">Team Panel</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4FD1FF]/10 border border-[#4FD1FF]/30 shadow-[0_0_10px_rgba(79,209,255,0.2)]">
                            <div className="w-2 h-2 rounded-full bg-[#4FD1FF] shadow-[0_0_5px_#4FD1FF]"></div>
                            <span className="text-xs font-semibold text-[#4FD1FF]">Team View</span>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white"><Settings size={18} /></Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white"><Bell size={18} /></Button>
                    </div>
                </header>

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 items-start">

                    {/* Left Column - Projects */}
                    <div className="w-full lg:col-span-3 h-auto lg:h-[calc(100vh-140px)] min-h-[400px] lg:min-h-[600px]">
                        <div className="panel h-full flex flex-col p-4 bg-gradient-to-b from-white/[0.03] to-transparent">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-4">My Projects</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search projects..."
                                            className="pl-10 bg-black/30 border-white/10 text-sm h-10 rounded-lg focus-visible:ring-[#4FD1FF]/50"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {filteredClients.map(client => (
                                    <div key={client.clientId}
                                        onClick={() => setSelectedClientId(client.clientId)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedClientId === client.clientId ? 'bg-white/[0.08] border-white/10 shadow-lg' : 'bg-transparent border-transparent hover:bg-white/[0.03]'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${client.status === 'Active' ? 'bg-[#4FD1FF] shadow-[0_0_5px_#4FD1FF]' : 'bg-purple-400'}`}></span>
                                                <p className="font-semibold text-sm">{client.clientName}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground pl-4">Member</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Center Column - Ledger & Actions */}
                    <div className="w-full lg:col-span-6 h-auto lg:h-[calc(100vh-140px)] min-h-[400px] lg:min-h-[600px]">
                        {selectedClient ? (
                            <div className="panel h-full flex flex-col p-6 relative overflow-hidden">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedClient.clientName}</h2>
                                        <p className="text-sm text-muted-foreground">Team Ledger & Expenses</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Balance Available</p>
                                        <p className={`text-xl font-bold ${balance >= 0 ? 'text-[#4FD1FF]' : 'text-red-400'}`}>₹{balance.toLocaleString()}</p>
                                    </div>
                                </div>

                                <Tabs defaultValue="ledger" className="flex-grow flex flex-col">
                                    <TabsList className="w-full bg-black/30 border border-white/5 p-1 rounded-xl grid grid-cols-2 mb-6">
                                        <TabsTrigger value="ledger" className="rounded-lg text-xs data-[state=active]:bg-[#4FD1FF] data-[state=active]:text-white">Project Ledger</TabsTrigger>
                                        <TabsTrigger value="request" className="rounded-lg text-xs">Add Entry / Expense</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="ledger" className="mt-0 flex-grow relative bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                                        <div className="absolute inset-0 overflow-x-auto overflow-y-auto custom-scrollbar">
                                            <Table>
                                                <TableHeader className="bg-white/5 sticky top-0 z-10 backdrop-blur-sm">
                                                    <TableRow className="hover:bg-transparent border-white/10">
                                                        <TableHead className="text-muted-foreground w-[100px] text-xs font-medium">Date</TableHead>
                                                        <TableHead className="text-muted-foreground text-xs font-medium">Type</TableHead>
                                                        <TableHead className="text-muted-foreground text-xs font-medium">Reason</TableHead>
                                                        <TableHead className="text-muted-foreground text-right text-xs font-medium">Amount</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {projectLedger.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                                                                No transactions recorded.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        projectLedger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                                                            <TableRow key={entry.entryId} className="hover:bg-white/5 border-white/5 transition-colors">
                                                                <TableCell className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline" className={`text-[10px] px-2 h-5 border ${entry.type === 'given' ? 'bg-[#4FD1FF]/10 text-[#4FD1FF] border-[#4FD1FF]/20' : 'bg-[#FFB86B]/10 text-[#FFB86B] border-[#FFB86B]/20'}`}>
                                                                        {entry.type === 'given' ? <ArrowDownLeft size={10} className="mr-1 inline" /> : <ArrowUpRight size={10} className="mr-1 inline" />}
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
                                    </TabsContent>

                                    <TabsContent value="request" className="mt-0 flex-grow">
                                        <div className="space-y-6 pt-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Type</Label>
                                                    <Select value={type} onValueChange={setType}>
                                                        <SelectTrigger className="bg-black/20 border-white/10">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#0B0710] border-white/10 text-white">
                                                            <SelectItem value="spent">Expense (Spent)</SelectItem>
                                                            <SelectItem value="given">Request Money</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Amount</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                                        <Input type="number" placeholder="0.00" className="pl-8 bg-black/20 border-white/10" value={amount} onChange={e => setAmount(e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Reason / Description</Label>
                                                <Input placeholder="e.g. Server hosting fee, Domain renewal..." className="bg-black/20 border-white/10" value={reason} onChange={e => setReason(e.target.value)} />
                                            </div>

                                            <Button className="w-full btn-primary mt-4" onClick={() => handleLogExpense(type)} disabled={isSubmitting || !amount}>
                                                {isSubmitting ? 'Processing...' : (type === 'spent' ? 'Log Expense' : 'Request Funds')}
                                            </Button>
                                            <p className="text-xs text-muted-foreground text-center">
                                                Requires Admin Approval for large amounts.
                                            </p>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        ) : (
                            <div className="panel h-full flex items-center justify-center">
                                <p className="text-muted-foreground">Select a project to view ledger.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Personal Stats */}
                    <div className="w-full lg:col-span-3 h-auto lg:h-[calc(100vh-140px)] flex flex-col gap-4 lg:gap-6">
                        <div className="panel p-6">
                            <h3 className="text-sm font-medium text-muted-foreground mb-4">My Wallet (Total)</h3>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-[#4FD1FF]/20 flex items-center justify-center text-[#4FD1FF]">
                                    <Wallet size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">₹{(ledger.filter(l => l.type === 'given').reduce((acc, curr) => acc + curr.amount, 0) - ledger.filter(l => l.type === 'spent').reduce((acc, curr) => acc + curr.amount, 0)).toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Current Balance</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Received</span>
                                    <span className="text-[#4FD1FF]">₹{ledger.filter(l => l.type === 'given').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Spent</span>
                                    <span className="text-[#FFB86B]">₹{ledger.filter(l => l.type === 'spent').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="panel flex-grow p-6">
                            <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Notifications</h3>
                            <div className="space-y-4">
                                {ledger.slice(0, 4).map((entry, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className={`w-2 h-2 rounded-full ${entry.type === 'given' ? 'bg-[#4FD1FF]' : 'bg-[#FFB86B]'} mt-1.5 shrink-0`}></div>
                                        <div>
                                            <p className="text-xs text-white">
                                                {entry.type === 'given' ? `Received ₹${entry.amount} for ${entry.reason}` : `Spent ₹${entry.amount} on ${entry.reason}`}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">{formatTimeAgo(entry.date)}</p>
                                        </div>
                                    </div>
                                ))}
                                {ledger.length === 0 && <p className="text-xs text-muted-foreground">No recent notifications.</p>}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* MOBILE VIEW (strictly < 480px) */}
            <div className="flex md:hidden flex-col h-full w-full relative z-10 overflow-y-auto custom-scrollbar pb-24">
                {/* Mobile Header */}
                <div className="px-6 pt-8 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <Link href="/phases/0" className="flex items-center gap-2 text-[#9AA0B4] text-sm">
                            <ArrowLeft size={18} />
                            <span>Phase 0</span>
                        </Link>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] shadow-[0_0_8px_#6366F1]" />
                            <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider">Team View</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Website Freelancing</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-medium text-[#6B6F85]">/ Admin</span>
                            <span className="text-xs text-[#6B6F85] opacity-50 font-bold uppercase tracking-widest mt-1">Team Panel</span>
                        </div>
                    </div>
                </div>

                {/* Mobile Search & Select Project */}
                <div className="px-6 mb-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6F85]" />
                        <Input
                            placeholder="Search projects by name..."
                            className="bg-white/[0.03] border-white/[0.08] rounded-2xl pl-11 h-12 text-sm text-white placeholder:text-[#6B6F85] focus-visible:ring-[#7C6CFF]/30"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {!selectedClient || searchQuery ? (
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B6F85] px-1">Active Projects</h3>
                            <div className="space-y-2">
                                {filteredClients.map((client) => (
                                    <div
                                        key={client.clientId}
                                        onClick={() => {
                                            setSelectedClientId(client.clientId);
                                            setSearchQuery('');
                                        }}
                                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] active:bg-white/[0.08] transition-colors flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#7C6CFF]/10 flex items-center justify-center text-[#7C6CFF] group-hover:scale-110 transition-transform">
                                                <TrendingUp size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white leading-tight">{client.clientName}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${client.status === 'active' ? 'bg-[#3FE0C5] shadow-[0_0_6px_#3FE0C5]' : 'bg-[#FFB86B]'}`} />
                                                    <p className="text-[10px] text-[#6B6F85] font-medium uppercase tracking-wider">{client.status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredClients.length === 0 && (
                                    <div className="py-8 text-center">
                                        <p className="text-xs text-[#6B6F85]">No projects found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                {selectedClient ? (
                    <div className="px-6 space-y-6">
                        {/* Team Member Summary Card */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1A1B2E] to-[#0F1020] border border-white/[0.06] shadow-xl">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h2 className="text-xl font-bold text-white">{selectedClient.clientName}</h2>
                                        <div className="w-4 h-4 rounded-full bg-[#7C6CFF]/20 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-[#7C6CFF]" />
                                        </div>
                                    </div>
                                    <p className="text-[#6B6F85] text-xs font-bold uppercase tracking-tight mt-0.5">Team Ledger & Expenses</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-8 bg-black/20 border border-white/[0.08] rounded-xl text-[10px] font-bold text-white/80 px-3 flex items-center gap-1.5">
                                        Active
                                    </div>
                                    <Button variant="outline" size="sm" className="h-8 bg-black/20 border-white/[0.08] rounded-xl text-[10px] font-bold text-[#6B6F85] uppercase tracking-wider px-2 aspect-square">
                                        <Plus size={14} />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Internal Tabs */}
                        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/[0.01]">
                            {['PROJECT LEDGER', 'ADD ENTRY / EXPENSE'].map((tab) => {
                                const isActive = activeMobileTab === tab;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveMobileTab(tab)}
                                        className={`flex-1 py-3.5 rounded-[14px] text-[10px] font-black tracking-widest transition-all ${isActive ? 'bg-[#1A1B2E] text-white shadow-lg border border-white/[0.04]' : 'text-[#6B6F85]'}`}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-6">
                            {activeMobileTab === 'ADD ENTRY / EXPENSE' ? (
                                <>
                                    {/* Add Entry Form */}
                                    <div className="space-y-5">
                                        <div className="space-y-5">
                                            <div>
                                                <Label className="text-[10px] text-[#6B6F85] font-black uppercase tracking-widest mb-3 block px-1">TYPE</Label>
                                                <Select value={type} onValueChange={setType}>
                                                    <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white h-12 rounded-xl text-sm font-bold focus:bg-white/[0.05]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#0B0710] border-white/10 text-white">
                                                        <SelectItem value="spent">Expense (Spent)</SelectItem>
                                                        <SelectItem value="request">Request Money</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label className="text-[10px] text-[#6B6F85] font-black uppercase tracking-widest mb-3 block px-1">AMOUNT</Label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6F85] text-sm font-medium">₹</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        className="bg-white/[0.03] border-white/[0.08] text-white pl-10 h-12 rounded-xl text-sm font-bold focus:bg-white/[0.05]"
                                                        value={amount}
                                                        onChange={e => setAmount(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="text-[10px] text-[#6B6F85] font-black uppercase tracking-widest mb-3 block px-1">REASON / DESCRIPTION</Label>
                                                <Input
                                                    placeholder="e.g. Server hosting fee, Domain renewal..."
                                                    className="bg-white/[0.03] border-white/[0.08] text-white h-12 rounded-xl text-sm font-bold focus:bg-white/[0.05]"
                                                    value={reason}
                                                    onChange={e => setReason(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Button
                                                className="w-full rounded-2xl h-14 bg-gradient-to-r from-[#7C6CFF] to-[#6366F1] shadow-[0_8px_20px_-6px_#7C6CFF] text-white font-black text-xs tracking-widest uppercase transition-all"
                                                onClick={() => handleLogExpense(type)}
                                                disabled={isSubmitting || !amount}
                                            >
                                                {isSubmitting ? 'PROCESSING...' : (type === 'spent' ? 'LOG EXPENSE' : 'REQUEST FUNDS')}
                                            </Button>
                                            <p className="text-[10px] text-[#6B6F85] text-center font-bold tracking-tight opacity-60">
                                                Requires Admin Approval for large amounts.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Financial Summary Card (Mobile stacked) */}
                                    <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[#1A1B2E] to-[#0F1020] border border-white/[0.06] shadow-2xl space-y-6">
                                        <div className="flex justify-between items-center pb-5 border-b border-white/[0.04]">
                                            <span className="text-[#6B6F85] text-[10px] font-black uppercase tracking-wider">TOTAL VALUE</span>
                                            <span className="text-3xl font-black text-white">₹1,100</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[#6B6F85] text-xs font-medium">Received</span>
                                                <span className="text-white text-sm font-bold">₹1,300</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[#6B6F85] text-xs font-medium">Spent</span>
                                                <span className="text-white text-sm font-bold">₹200</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-5 border-t border-white/[0.04]">
                                                <span className="text-[#3FE0C5] text-[10px] font-black uppercase tracking-[0.1em]">NET PROFIT</span>
                                                <span className="text-2xl font-black text-[#3FE0C5] drop-shadow-[0_0_10px_rgba(63,224,197,0.3)]">₹4,052</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-6 pt-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B6F85] px-1">PROJECT LEDGER</h3>
                                    <div className="space-y-4 pb-20">
                                        {ledger.map((entry, i) => (
                                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shadow-[0_0_6px_currentColor] ${entry.type === 'given' ? 'text-[#3FE0C5] bg-[#3FE0C5]' : 'text-[#F2B36D] bg-[#F2B36D]'}`} />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <p className="text-xs text-white/90 font-bold tracking-tight">
                                                            {entry.type === 'given' ? `Received ₹${entry.amount} for ${entry.reason}` : `Spent ₹${entry.amount} on ${entry.reason}`}
                                                        </p>
                                                        <span className="text-xs font-bold text-white">₹{entry.amount.toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-[10px] text-[#6B6F85] font-bold uppercase tracking-wider">{formatTimeAgo(entry.date)}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {ledger.length === 0 && (
                                            <div className="text-center py-10 text-[#6B6F85] text-xs">No entries found.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#6B6F85] opacity-50 gap-4">
                        <Wallet size={48} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Select Project</span>
                    </div>
                )}

                {/* Mobile Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-[#0B0B12]/80 backdrop-blur-3xl border-t border-white/[0.05]" />
                    <div className="relative flex items-center justify-around h-20 px-4 pb-safe">
                        <div className="flex flex-col items-center gap-1 group">
                            <div className="p-2 rounded-full text-[#6B6F85]">
                                <Settings size={22} />
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 group">
                            <div className="p-2 rounded-full text-[#6B6F85]">
                                <Search size={22} />
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 group relative">
                            <div className="p-2 rounded-full text-[#7C6CFF] drop-shadow-[0_0_8px_rgba(124,108,255,0.4)]">
                                <Wallet size={24} />
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 group relative">
                            <div className="p-2 rounded-full text-[#6B6F85]">
                                <Bell size={22} />
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F2B36D] border-2 border-[#0B0B12]" />
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 group">
                            <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-xs font-bold text-[#6B6F85]">
                                JD
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </div >
    );
};

export default function TeamPage() {
    return (
        <PasscodeProtect
            storageKey="team-passcode-auth"
            passcode="TEAM2024"
            title="Team Access Only"
            description="Please enter the team passcode to access the project ledger."
        >
            <TeamContent />
        </PasscodeProtect>
    )
}
