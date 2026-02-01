'use client';

import PasscodeProtect from '@/components/PasscodeProtect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, ArrowLeft, Bell, Settings, MoreVertical, Edit, Trash2, ChevronDown, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getClients, getPayments, getLogs } from '@/lib/api';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

const AdminPanel = () => {
    const [clients, setClients] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [costs, setCosts] = useState<any>({});
    
    useEffect(() => {
        async function fetchData() {
            try {
                const [clientsData, logsData] = await Promise.all([
                    getClients(),
                    getLogs(),
                ]);
                setClients(clientsData);
                setLogs(logsData.sort((a:any, b:any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                if (clientsData.length > 0) {
                    setSelectedClientId(clientsData[0].clientId);
                    setCosts(clientsData[0].costs);
                }
            } catch (error) {
                console.error("Failed to fetch admin data", error)
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const selectedClient = clients.find(c => c.clientId === selectedClientId);

    useEffect(() => {
        if (selectedClient) {
            setCosts(selectedClient.costs);
        }
    }, [selectedClient]);

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCosts((prev: any) => ({ ...prev, [name]: Number(value) || 0 }));
    }

    if (loading) {
        return <div className="space-y-6">
            <Skeleton className="h-16 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <Skeleton className="h-[600px] md:col-span-3" />
                <Skeleton className="h-[600px] md:col-span-5" />
                <Skeleton className="h-[600px] md:col-span-4" />
            </div>
        </div>;
    }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/phases/0" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
            Back to Phase 0
          </Link>
        </div>
        <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">Website Freelancing</h1>
            <p className="text-sm text-muted-foreground">Full control over clients, pricing, payments & team</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Switch id="admin-mode" defaultChecked/>
                <Label htmlFor="admin-mode" className="text-sm">Admin Mode: ON</Label>
            </div>
            <Button variant="ghost" size="icon"><Settings size={18}/></Button>
            <Button variant="ghost" size="icon"><Bell size={18}/></Button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column - Clients */}
        <div className="lg:col-span-3">
            <Card className="bg-white/[.04] border-white/[.06] h-full flex flex-col">
                <CardHeader>
                    <CardTitle>Clients</CardTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search clients..." className="pl-10 bg-black/20 border-white/10" />
                    </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                    <ul className="space-y-1">
                       {clients.map(client => (
                         <li key={client.clientId} 
                            onClick={() => setSelectedClientId(client.clientId)}
                            className={`p-3 rounded-md cursor-pointer transition-colors ${selectedClientId === client.clientId ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{client.clientName}</p>
                                    <p className="text-sm text-muted-foreground">{client.contact}</p>
                                </div>
                                <Badge variant={client.status === 'Active' ? 'default' : 'secondary'} className={`text-xs ${client.status === 'Active' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>{client.status}</Badge>
                            </div>
                         </li>
                       ))}
                    </ul>
                </CardContent>
                <div className="p-4 mt-auto">
                    <Button className="w-full bg-gradient-to-r from-[#6B5DF9] to-[#5CE7F4] text-white">
                        <Plus className="mr-2 h-4 w-4"/>
                        Create Client
                    </Button>
                </div>
            </Card>
        </div>
        
        {/* Center Column - Client Control */}
        <div className="lg:col-span-5">
            {selectedClient ? (
                 <Card className="bg-white/[.04] border-white/[.06] h-full">
                    <CardHeader className="flex flex-row justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2">{selectedClient.clientName} <Badge variant="outline" className="text-green-300 border-green-300/50 text-xs">Active</Badge></CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{selectedClient.contact}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">Client <ChevronDown size={16}/></Button>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="pricing">
                            <TabsList className="grid w-full grid-cols-4 bg-black/20">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="pricing">Pricing & Costs</TabsTrigger>
                                <TabsTrigger value="payments">Client Payments</TabsTrigger>
                                <TabsTrigger value="team">Team Money</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview" className="mt-6">
                                <p className="text-muted-foreground">Overview content for {selectedClient.clientName}.</p>
                            </TabsContent>
                            <TabsContent value="pricing" className="mt-6">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        {(Object.keys(costs || {}) as (keyof typeof costs)[]).map((key) => (
                                             <div key={key} className="space-y-2">
                                                <Label htmlFor={key.toString()} className="text-sm capitalize text-muted-foreground">{key.toString().replace(/([A-Z])/g, ' $1').trim()}</Label>
                                                <div className="relative">
                                                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                                     <Input id={key.toString()} name={key.toString()} type="number" value={costs[key]} onChange={handleCostChange} className="bg-black/20 border-white/10 pl-7"/>
                                                </div>
                                             </div>
                                        ))}
                                        <div className="flex gap-4 pt-4">
                                            <Button className="w-full bg-gradient-to-r from-[#6B5DF9] to-[#5CE7F4] text-white">Save Changes</Button>
                                            <Button variant="outline" className="w-full">Reset</Button>
                                        </div>
                                    </div>
                                    <div className="space-y-3 rounded-lg bg-black/20 p-4 border border-white/10">
                                        <div className="flex justify-between items-center"><span className="text-muted-foreground">Total Value</span> <span className="font-semibold text-foreground">₹{selectedClient.financials.totalValue.toLocaleString()}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-muted-foreground">Paid</span> <span className="font-semibold text-green-400">₹{selectedClient.financials.paid.toLocaleString()}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-muted-foreground">Pending</span> <span className="font-semibold text-amber-400">₹{selectedClient.financials.pending.toLocaleString()}</span></div>
                                        <div className="w-full h-px bg-white/10 my-2"></div>
                                        <div className="flex justify-between items-center"><span className="text-muted-foreground">Profit</span> <span className="font-bold text-foreground">₹{selectedClient.financials.profit.toLocaleString()}</span></div>
                                        <Button variant="ghost" size="sm" className="w-full mt-4 text-muted-foreground"><Edit size={14} className="mr-2"/>Edit Client Info</Button>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="payments" className="mt-6">
                                <p className="text-muted-foreground">Payment records for {selectedClient.clientName}.</p>
                            </TabsContent>
                            <TabsContent value="team" className="mt-6">
                                <p className="text-muted-foreground">Team ledger for {selectedClient.clientName}.</p>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                 </Card>
            ) : (
                <Card className="bg-white/[.04] border-white/[.06] h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Select a client to manage details.</p>
                </Card>
            )}
        </div>

        {/* Right Column - Oversight */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="bg-white/[.04] border-white/[.06]">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                     <ul className="space-y-4">
                       {logs.slice(0, 3).map(log => (
                         <li key={log.logId} className="flex items-start gap-3 text-sm">
                             <span className="h-2 w-2 rounded-full bg-primary mt-1.5"></span>
                             <div>
                                <p className="text-foreground">{log.action}</p>
                                {log.details.from && <p className="text-muted-foreground">from ₹{log.details.from.toLocaleString()} to ₹{log.details.to.toLocaleString()}</p>}
                                {log.details.amount && <p className="text-muted-foreground">of ₹{log.details.amount.toLocaleString()} ({log.details.mode})</p>}
                                <p className="text-xs text-muted-foreground/50 mt-1">{log.actor} • {formatTimeAgo(log.timestamp)}</p>
                             </div>
                         </li>
                       ))}
                    </ul>
                     <Button variant="link" className="text-primary p-0 h-auto mt-4">View All →</Button>
                </CardContent>
            </Card>
            <Card className="bg-white/[.04] border-white/[.06]">
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center"><span className="text-muted-foreground">Total Value</span> <span className="font-semibold text-foreground text-lg">₹{clients.reduce((acc, c) => acc + c.financials.totalValue, 0).toLocaleString()}</span></div>
                        <div className="flex justify-between items-center"><span className="text-muted-foreground">Total Profit</span> <span className="font-semibold text-foreground text-lg">₹{clients.reduce((acc, c) => acc + c.financials.profit, 0).toLocaleString()}</span></div>
                         <div className="flex justify-between items-center">
                             <span className="text-muted-foreground">Risk Low</span> 
                             <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-green-400/50 text-green-400 text-xs">Healthy</Badge>
                                <Lock size={14} className="text-muted-foreground"/>
                             </div>
                        </div>
                    </div>
                     <Button variant="link" className="text-primary p-0 h-auto mt-4">VIEW All Logs →</Button>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
};

export default function AdminPage() {
    return (
        <PasscodeProtect
            storageKey="admin-passcode-auth"
            passcode="ADMIN2024"
            title="Admin Access Required"
            description="Please enter the administrator passcode to manage project settings."
        >
            <AdminPanel/>
        </PasscodeProtect>
    )
}
