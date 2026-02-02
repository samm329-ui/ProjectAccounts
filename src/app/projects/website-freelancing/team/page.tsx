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
import { getTeamLedger, getClients } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Search, Plus, ArrowUpRight, ArrowDownLeft, Wallet, Bell, Settings } from 'lucide-react';
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
    const [loading, setLoading] = useState(true);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

    // Form state
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [type, setType] = useState('spent');

    useEffect(() => {
        async function fetchData() {
            try {
                const [ledgerData, clientsData] = await Promise.all([
                    getTeamLedger('member_1'),
                    getClients(),
                ]);
                setLedger(ledgerData);
                setClients(clientsData);
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
        <div className="space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Column - Projects */}
                <div className="lg:col-span-3 h-[calc(100vh-140px)] min-h-[600px]">
                    <div className="panel h-full flex flex-col p-4 bg-gradient-to-b from-white/[0.03] to-transparent">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-4">My Projects</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search projects..." className="pl-10 bg-black/30 border-white/10 text-sm h-10 rounded-lg focus-visible:ring-[#4FD1FF]/50" />
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {clients.map(client => (
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
                <div className="lg:col-span-6 h-[calc(100vh-140px)] min-h-[600px]">
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
                                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
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
                                        <div className="grid grid-cols-2 gap-4">
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

                                        <Button className="w-full btn-primary mt-4">
                                            {type === 'spent' ? 'Log Expense' : 'Request Funds'}
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
                <div className="lg:col-span-3 h-[calc(100vh-140px)] flex flex-col gap-6">
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
                            <div className="flex gap-3 items-start">
                                <div className="w-2 h-2 rounded-full bg-[#4FD1FF] mt-1.5 shrink-0"></div>
                                <div>
                                    <p className="text-xs text-white">New payment received from Admin</p>
                                    <p className="text-[10px] text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-2 h-2 rounded-full bg-[#FFB86B] mt-1.5 shrink-0"></div>
                                <div>
                                    <p className="text-xs text-white">Expense 'hosting' exceeded limit warning</p>
                                    <p className="text-[10px] text-muted-foreground">1 day ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
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
