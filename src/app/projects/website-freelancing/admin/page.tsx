'use client';

import PasscodeProtect from '@/components/PasscodeProtect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, ArrowLeft, Bell, Settings, ChevronDown, Lock, CheckCircle2, ShieldCheck, ArrowRight, Edit, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getClients, getPayments, getLogs, getTeamLedger, addClient, updateClientCosts, updateClient, addLog } from '@/lib/api';
import { ClientPayments } from './components/ClientPayments';
import { TeamMoney } from './components/TeamMoney';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateClientStatus, deleteClient } from '@/lib/api';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

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
    const [payments, setPayments] = useState<any[]>([]);
    const [teamLedger, setTeamLedger] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [costs, setCosts] = useState<any>({});

    // Create Client State
    const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
    const [newClient, setNewClient] = useState({
        clientName: '',
        contact: '',
        businessType: '',
        serviceCost: '',
        domainCharged: '0',
    });
    const [isSubmittingClient, setIsSubmittingClient] = useState(false);

    // Edit Client State
    const [isEditClientOpen, setIsEditClientOpen] = useState(false);
    const [editClientData, setEditClientData] = useState({
        clientName: '',
        contact: '',
        businessType: ''
    });

    // Logs Dialog State
    const [isLogsOpen, setIsLogsOpen] = useState(false);

    // Delete State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [clientsData, logsData, paymentsData, ledgerData] = await Promise.all([
                getClients(),
                getLogs(),
                getPayments(),
                getTeamLedger('all'),
            ]);
            setClients(clientsData);
            setLogs(logsData.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            setPayments(paymentsData);
            setTeamLedger(ledgerData);
            if (clientsData.length > 0 && !selectedClientId) {
                // Only default select if nothing selected
                setSelectedClientId(clientsData[0].clientId);
                setCosts(clientsData[0].costs);
            }
        } catch (error) {
            console.error("Failed to fetch admin data", error)
        } finally {
            setLoading(false);
        }
    }

    const selectedClient = clients.find(c => c.clientId === selectedClientId);

    useEffect(() => {
        if (selectedClient) {
            setCosts(selectedClient.costs);
        }
    }, [selectedClient, clients]); // Update when clients refresh too

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCosts((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleCostBlur = async () => {
        // Auto-save when user leaves a cost field
        if (selectedClientId) {
            await handleSaveCosts();
        }
    };

    const handleSaveCosts = async () => {
        if (!selectedClientId) return;

        // Convert to numbers
        const serviceCost = Number(costs.serviceCost) || 0;
        const domainCharged = Number(costs.domainCharged) || 0;
        const actualDomainCost = Number(costs.actualDomainCost) || 0;
        const extraFeatures = Number(costs.extraFeatures) || 0;
        const extraProductionCharges = Number(costs.extraProductionCharges) || 0;

        // User formulas:
        // Total Value = Service + Domain Charged + Extra Features + Extra Production
        // Total Profit = Total Value + (Domain Charged - Actual Domain Cost)
        const totalValue = serviceCost + domainCharged + extraFeatures + extraProductionCharges;
        const profit = totalValue + (domainCharged - actualDomainCost);

        const numericCosts = {
            serviceCost,
            domainCharged,
            actualDomainCost,
            extraFeatures,
            extraProductionCharges
        };

        const result = await updateClientCosts(selectedClientId, numericCosts);
        if (result.success) {
            await addLog({
                actor: 'Admin',
                action: 'Updated Costs',
                details: { client: selectedClient?.clientName, totalValue, profit }
            });
            await refreshData();
        } else {
            alert('Failed to update costs');
        }
    };

    const refreshData = async () => {
        // Reloads payments/ledger for child components
        const [paymentsData, ledgerData, clientsData] = await Promise.all([
            getPayments(),
            getTeamLedger('all'),
            getClients(), // Also reload clients to get updated totals/list
        ]);
        setPayments(paymentsData);
        setTeamLedger(ledgerData);
        setClients(clientsData);
    };

    const handleCreateClient = async () => {
        setIsSubmittingClient(true);
        try {
            const serviceCost = Number(newClient.serviceCost) || 0;
            const domainCharged = Number(newClient.domainCharged) || 0;
            const totalValue = serviceCost + domainCharged;

            await addClient({
                clientName: newClient.clientName,
                contact: newClient.contact,
                businessType: newClient.businessType,
                startDate: new Date().toISOString().split('T')[0],
                assignedMember: 'member_1', // Default
                costs: {
                    serviceCost,
                    domainCharged,
                    actualDomainCost: 0,
                    extraFeatures: 0,
                    extraProductionCharges: 0
                },
                financials: {
                    totalValue,
                    profit: totalValue
                }
            });
            setIsCreateClientOpen(false);
            setNewClient({ clientName: '', contact: '', businessType: '', serviceCost: '', domainCharged: '0' });
            loadData(); // Full reload to show new client
        } catch (error) {
            console.error("Failed to create client", error);
        } finally {
            setIsSubmittingClient(false);
        }
    };

    const handleOpenEditClient = () => {
        if (selectedClient) {
            setEditClientData({
                clientName: selectedClient.clientName,
                contact: selectedClient.contact,
                businessType: selectedClient.businessType
            });
            setIsEditClientOpen(true);
        }
    };

    const handleUpdateClient = async () => {
        if (!selectedClientId) return;
        setIsSubmittingClient(true);
        try {
            await updateClient(selectedClientId, editClientData);
            await addLog({
                actor: 'Admin',
                action: 'Updated Client Details',
                details: { client: editClientData.clientName }
            });
            setIsEditClientOpen(false);
            loadData();
        } catch (error) {
            console.error("Failed to update client", error);
        } finally {
            setIsSubmittingClient(false);
        }
    };

    const updateStatus = async (status: string) => {
        if (!selectedClientId) return;
        try {
            const success = await updateClientStatus(selectedClientId, status);
            if (success) {
                await addLog({
                    actor: 'Admin',
                    action: 'Updated Client Status',
                    details: { client: selectedClient?.clientName, status }
                });
                alert('Status updated successfully');
                loadData();
            }
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleDeleteClient = async () => {
        if (!selectedClientId) return;
        try {
            // Check 'hardDelete' from a state or default to false (Soft delete)
            const result = await deleteClient(selectedClientId, false);
            if (result.success) {
                await addLog({
                    actor: 'Admin',
                    action: 'Deleted Client',
                    details: { client: selectedClient?.clientName }
                });
                setIsDeleteOpen(false);
                setSelectedClientId(null);
                loadData();
            }
        } catch (error) {
            console.error("Failed to delete client", error);
        }
    };

    if (loading) {
        return <div className="space-y-6">
            <Skeleton className="h-16 w-full bg-white/5" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <Skeleton className="h-[600px] md:col-span-3 bg-white/5" />
                <Skeleton className="h-[600px] md:col-span-5 bg-white/5" />
                <Skeleton className="h-[600px] md:col-span-4 bg-white/5" />
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
                    <div className="flex items-center justify-center gap-2">
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Website Freelancing</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">Admin Panel</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7A5BFF]/10 border border-[#7A5BFF]/30 shadow-[0_0_10px_rgba(122,91,255,0.2)]">
                        <div className="w-2 h-2 rounded-full bg-[#7A5BFF] shadow-[0_0_5px_#7A5BFF]"></div>
                        <Label htmlFor="admin-mode" className="text-xs font-semibold text-[#7A5BFF]">Admin Mode: ON</Label>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white"><Settings size={18} /></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white"><Bell size={18} /></Button>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Column - Clients */}
                <div className="lg:col-span-3 h-[calc(100vh-140px)] min-h-[600px]">
                    <div className="panel h-full flex flex-col p-4 bg-gradient-to-b from-white/[0.03] to-transparent">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-4">Clients</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search clients..." className="pl-10 bg-black/30 border-white/10 text-sm h-10 rounded-lg focus-visible:ring-[#7A5BFF]/50" />
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {clients.map(client => (
                                <div key={client.clientId}
                                    onClick={() => setSelectedClientId(client.clientId)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedClientId === client.clientId ? 'bg-white/[0.08] border-white/10 shadow-lg' : 'bg-transparent border-transparent hover:bg-white/[0.03]'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${client.status === 'Active' ? 'bg-[#23D07A] shadow-[0_0_5px_#23D07A]' : (client.status === 'Delivered' ? 'bg-[#7A5BFF]' : 'bg-gray-400')}`}></span>
                                            <p className="font-semibold text-sm">{client.clientName}</p>
                                        </div>
                                        {client.status === 'Active' && <Badge className="bg-[#23D07A]/10 text-[#23D07A] border border-[#23D07A]/20 text-[10px] px-2 py-0 h-5">Active</Badge>}
                                        {client.status === 'Delivered' && <Badge variant="secondary" className="bg-[#7A5BFF]/10 text-[#7A5BFF] border border-[#7A5BFF]/20 text-[10px] px-2 py-0 h-5">Delivered</Badge>}
                                        {client.status === 'Inactive' && <Badge variant="outline" className="text-[10px] px-2 py-0 h-5">Inactive</Badge>}
                                    </div>
                                    <p className="text-xs text-muted-foreground pl-4">{client.contact}</p>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 mt-auto space-y-2">
                            <Dialog open={isCreateClientOpen} onOpenChange={setIsCreateClientOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full btn-primary">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Client
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#0B0710] border-white/10 text-foreground sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Add New Client</DialogTitle>
                                        <DialogDescription>
                                            Enter details for the new website client.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right">Name</Label>
                                            <Input
                                                id="name"
                                                value={newClient.clientName}
                                                onChange={e => setNewClient({ ...newClient, clientName: e.target.value })}
                                                className="col-span-3 bg-white/5 border-white/10"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="contact" className="text-right">Contact</Label>
                                            <Input
                                                id="contact"
                                                value={newClient.contact}
                                                onChange={e => setNewClient({ ...newClient, contact: e.target.value })}
                                                className="col-span-3 bg-white/5 border-white/10"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="type" className="text-right">Type</Label>
                                            <Input
                                                id="type"
                                                placeholder="e.g. Portfolio"
                                                value={newClient.businessType}
                                                onChange={e => setNewClient({ ...newClient, businessType: e.target.value })}
                                                className="col-span-3 bg-white/5 border-white/10"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="cost" className="text-right">Service Cost</Label>
                                            <Input
                                                id="cost"
                                                type="number"
                                                value={newClient.serviceCost}
                                                onChange={e => setNewClient({ ...newClient, serviceCost: e.target.value })}
                                                className="col-span-3 bg-white/5 border-white/10"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsCreateClientOpen(false)} className="border-white/10 hover:bg-white/5 hover:text-white">Cancel</Button>
                                        <Button onClick={handleCreateClient} disabled={isSubmittingClient || !newClient.clientName} className="btn-primary">
                                            {isSubmittingClient ? 'Creating...' : 'Create Client'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {clients.length === 0 && (
                                <Button variant="outline" onClick={async () => {
                                    if (confirm("Upload test data to Google Sheet?")) {
                                        await import('@/lib/api').then(m => m.seedDatabase());
                                        window.location.reload();
                                    }
                                }} className="w-full border-dashed border-white/20 text-muted-foreground hover:text-white hover:bg-white/5">
                                    Upload Test Data
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Center Column - Client Control */}
                <div className="lg:col-span-5 h-[calc(100vh-140px)] min-h-[600px]">
                    {selectedClient ? (
                        <div className="panel h-full flex flex-col p-6 relative overflow-hidden">
                            {/* Background Glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#7A5BFF]/5 blur-3xl pointer-events-none"></div>

                            <div className="flex flex-row justify-between items-start mb-8 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-2xl font-bold tracking-tight">{selectedClient.clientName}</h2>
                                        {selectedClient.status === 'Active' && <CheckCircle2 size={18} className="text-[#23D07A]" fill="rgba(35, 208, 122, 0.1)" />}
                                        {selectedClient.status === 'Delivered' && <ShieldCheck size={18} className="text-[#7A5BFF]" />}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{selectedClient.contact}</p>

                                    {/* Status Toggles */}
                                    <div className="flex gap-2 mt-3">
                                        <Button variant="ghost" size="sm" onClick={() => updateStatus('Active')} className={`h-6 text-[10px] px-2 rounded-md border ${selectedClient.status === 'Active' ? 'bg-[#23D07A]/20 text-[#23D07A] border-[#23D07A]/30' : 'border-white/10 text-muted-foreground hover:bg-white/5'}`}>Active</Button>
                                        <Button variant="ghost" size="sm" onClick={() => updateStatus('Inactive')} className={`h-6 text-[10px] px-2 rounded-md border ${selectedClient.status === 'Inactive' ? 'bg-white/20 text-white border-white/30' : 'border-white/10 text-muted-foreground hover:bg-white/5'}`}>Inactive</Button>
                                        <Button variant="ghost" size="sm" onClick={() => updateStatus('Delivered')} className={`h-6 text-[10px] px-2 rounded-md border ${selectedClient.status === 'Delivered' ? 'bg-[#7A5BFF]/20 text-[#7A5BFF] border-[#7A5BFF]/30' : 'border-white/10 text-muted-foreground hover:bg-white/5'}`}>Delivered</Button>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleOpenEditClient} className="rounded-full h-8 px-4 border-white/10 bg-white/5 hover:bg-white/10 text-xs">
                                        <Edit className="w-3 h-3 mr-2" /> Client
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setIsDeleteOpen(true)} className="rounded-full h-8 w-8 hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>

                            <Tabs defaultValue="pricing" className="flex-grow flex flex-col">
                                <TabsList className="w-full bg-black/30 border border-white/5 p-1 rounded-xl grid grid-cols-4 mb-6">
                                    <TabsTrigger value="overview" className="rounded-lg text-xs">Overview</TabsTrigger>
                                    <TabsTrigger value="pricing" className="rounded-lg text-xs data-[state=active]:bg-[#7A5BFF] data-[state=active]:text-white">Pricing & Costs</TabsTrigger>
                                    <TabsTrigger value="payments" className="rounded-lg text-xs">Client Payments</TabsTrigger>
                                    <TabsTrigger value="team" className="rounded-lg text-xs">Team Money</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="mt-0 flex-grow">
                                    <div className="flex items-center justify-center h-full text-muted-foreground">Overview content placeholder</div>
                                </TabsContent>

                                <TabsContent value="pricing" className="mt-0 flex-grow">
                                    <div className="grid grid-cols-12 gap-6 h-full">
                                        <div className="col-span-7 space-y-5">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground ml-1">Service Cost</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                                    <Input name="serviceCost" type="number" value={costs.serviceCost} onChange={handleCostChange} className="bg-black/20 border-white/10 pl-8 h-10 font-medium" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground ml-1">Domain Charged</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                                    <Input name="domainCharged" type="number" value={costs.domainCharged} onChange={handleCostChange} className="bg-black/20 border-white/10 pl-8 h-10 font-medium" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground ml-1">Actual Domain Cost</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                                    <Input name="actualDomainCost" type="number" value={costs.actualDomainCost} onChange={handleCostChange} className="bg-black/20 border-white/10 pl-8 h-10 font-medium" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground ml-1">Extra Features</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                                    <Input name="extraFeatures" type="number" value={costs.extraFeatures} onChange={handleCostChange} className="bg-black/20 border-white/10 pl-8 h-10 font-medium" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground ml-1">Extra Production Charges</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                                    <Input name="extraProductionCharges" type="number" value={costs.extraProductionCharges} onChange={handleCostChange} className="bg-black/20 border-white/10 pl-8 h-10 font-medium" />
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <Button onClick={handleSaveCosts} className="flex-1 btn-primary text-sm">Save Changes</Button>
                                                <Button variant="outline" className="flex-1 bg-white/5 border-white/10 text-muted hover:text-white h-[44px] rounded-xl text-sm">Reset</Button>
                                            </div>
                                        </div>

                                        <div className="col-span-5">
                                            <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-4">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Total Value</span>
                                                    <span className="font-bold text-white">₹{selectedClient.financials.totalValue.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Paid</span>
                                                    <span className="font-bold text-[#4FD1FF]">₹{selectedClient.financials.paid.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Pending</span>
                                                    <span className="font-bold text-[#FFB86B]">₹{selectedClient.financials.pending.toLocaleString()}</span>
                                                </div>
                                                <div className="w-full h-px bg-white/10 my-2"></div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Profit</span>
                                                    <span className="font-bold text-[#23D07A] text-lg">₹{selectedClient.financials.profit.toLocaleString()}</span>
                                                </div>

                                                <Button variant="ghost" size="sm" onClick={handleOpenEditClient} className="w-full mt-2 text-xs text-muted-foreground hover:text-white flex items-center justify-center gap-1">
                                                    <Edit2 size={12} /> Edit Client info
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="payments" className="mt-0 flex-grow">
                                    <ClientPayments
                                        clientId={selectedClient.clientId}
                                        payments={payments}
                                        onPaymentAdded={refreshData}
                                    />
                                </TabsContent>

                                <TabsContent value="team" className="mt-0 flex-grow">
                                    <TeamMoney
                                        clientId={selectedClient.clientId}
                                        teamLedger={teamLedger}
                                        onEntryAdded={refreshData}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    ) : (
                        <div className="panel h-full flex items-center justify-center">
                            <p className="text-muted-foreground">Select a client to manage details.</p>
                        </div>
                    )}
                </div>

                {/* Right Column - Oversight */}
                <div className="lg:col-span-4 h-[calc(100vh-140px)] flex flex-col gap-6">
                    <div className="panel flex-grow flex flex-col relative overflow-hidden">
                        <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
                        <ul className="space-y-6 relative z-10">
                            {logs.slice(0, 4).map((log, i) => (
                                <li key={log.logId} className="flex gap-4">
                                    <div className="mt-1.5 min-w-[8px]">
                                        <div className="w-2 h-2 rounded-full bg-[#FFB86B] shadow-[0_0_6px_#FFB86B]"></div>
                                        {i !== logs.slice(0, 4).length - 1 && <div className="w-px h-full bg-white/5 mx-auto mt-2"></div>}
                                    </div>
                                    <div className="pb-2">
                                        <p className="text-sm font-medium text-white mb-0.5">{log.action}</p>
                                        <p className="text-xs text-muted-foreground mb-1">{log.details.from ? `Changed from ₹${log.details.from} to ₹${log.details.to}` : (log.details.amount ? `₹${log.details.amount} (${log.details.mode})` : '')}</p>
                                        <p className="text-[10px] text-muted-foreground/50">{log.actor} • {formatTimeAgo(log.timestamp)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <Button variant="link" onClick={() => setIsLogsOpen(true)} className="text-[#7A5BFF] hover:text-[#4FD1FF] p-0 h-auto mt-auto self-start text-xs flex items-center gap-1">
                            View All <ArrowRight size={12} />
                        </Button>
                    </div>

                    <div className="panel p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldCheck size={80} />
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-sm">Total Value</span>
                                <span className="font-bold text-white text-lg">₹{clients.reduce((acc, c) => acc + c.financials.totalValue, 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-sm">Total Profit</span>
                                <span className="font-bold text-white text-lg">₹{clients.reduce((acc, c) => acc + c.financials.profit, 0).toLocaleString()}</span>
                            </div>
                            <div className="w-full h-px bg-white/5"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-sm">Risk Low</span>
                                <div className="w-8 h-8 rounded-full bg-[#23D07A]/10 flex items-center justify-center border border-[#23D07A]/20 text-[#23D07A]">
                                    <Lock size={14} />
                                </div>
                            </div>
                        </div>
                        <Button variant="link" onClick={() => setIsLogsOpen(true)} className="text-[#7A5BFF] hover:text-[#4FD1FF] p-0 h-auto mt-6 text-xs flex items-center gap-1">
                            View All Logs <ArrowRight size={12} />
                        </Button>
                    </div>
                </div>

                {/* Edit Client Dialog */}
                <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
                    <DialogContent className="bg-[#0B0710] border-white/10 text-foreground sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Client</DialogTitle>
                            <DialogDescription>Update client details.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">Name</Label>
                                <Input id="edit-name" value={editClientData.clientName} onChange={e => setEditClientData({ ...editClientData, clientName: e.target.value })} className="col-span-3 bg-white/5 border-white/10" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-contact" className="text-right">Contact</Label>
                                <Input id="edit-contact" value={editClientData.contact} onChange={e => setEditClientData({ ...editClientData, contact: e.target.value })} className="col-span-3 bg-white/5 border-white/10" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-type" className="text-right">Type</Label>
                                <Input id="edit-type" value={editClientData.businessType} onChange={e => setEditClientData({ ...editClientData, businessType: e.target.value })} className="col-span-3 bg-white/5 border-white/10" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditClientOpen(false)} className="border-white/10 hover:bg-white/5 hover:text-white">Cancel</Button>
                            <Button onClick={handleUpdateClient} disabled={isSubmittingClient} className="btn-primary">
                                {isSubmittingClient ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Logs Dialog */}
                <Dialog open={isLogsOpen} onOpenChange={setIsLogsOpen}>
                    <DialogContent className="bg-[#0B0710] border-white/10 text-foreground sm:max-w-[600px] h-[80vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Activity Logs</DialogTitle>
                        </DialogHeader>
                        <div className="flex-grow overflow-y-auto custom-scrollbar p-2">
                            <ul className="space-y-4">
                                {logs.map((log) => (
                                    <li key={log.logId} className="flex gap-4 border-b border-white/5 pb-2">
                                        <div className="mt-1.5 min-w-[8px]">
                                            <div className="w-2 h-2 rounded-full bg-[#FFB86B]"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white mb-0.5">{log.action}</p>
                                            <p className="text-xs text-muted-foreground mb-1">
                                                {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/50">{log.actor} • {new Date(log.timestamp).toLocaleString()}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent className="bg-[#0B0710] border-red-500/20 text-foreground sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-500"><AlertTriangle size={18} /> Delete Client</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <strong>{selectedClient?.clientName}</strong>?
                                This will archive the client and they will no longer appear in the active list.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="border-white/10 hover:bg-white/5 hover:text-white">Cancel</Button>
                            <Button onClick={handleDeleteClient} className="bg-red-500 hover:bg-red-600 text-white border-none">
                                Delete Client
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

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
            <AdminPanel />
        </PasscodeProtect>
    )
}
