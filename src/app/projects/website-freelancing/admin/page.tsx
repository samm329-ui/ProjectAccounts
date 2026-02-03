"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Search, Plus, Filter, MoreVertical, Edit, Trash2,
    ArrowRight, CheckCircle2, Clock, CreditCard,
    TrendingUp, Users, Settings, Bell, ChevronDown,
    ArrowLeft, Calendar, DollarSign, Briefcase, Activity,
    Shield, Target, Lock, Edit2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useFinanceStore } from '@/lib/useFinanceStore';
import { calculateFinance } from '@/lib/finance';
import PasscodeProtect from '@/components/PasscodeProtect';
import { ClientPayments } from './components/ClientPayments';
import { TeamMoney } from './components/TeamMoney';

/**
 * UTILITY: Format Time Ago
 */
const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now.getTime() - then.getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'just now';
};

/**
 * PIE CHART COMPONENT
 */
const SimplePieChart = ({ items }: { items: { label: string; value: number; color: string }[] }) => {
    const total = items.reduce((acc, item) => acc + item.value, 0);
    let currentAngle = 0;

    if (total === 0) return <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center text-[10px] text-[#9A9AA6]">NO DATA</div>;

    return (
        <div className="relative w-36 h-36">
            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full drop-shadow-[0_0_15px_rgba(110,106,246,0.2)]">
                {items.map((item, i) => {
                    const percentage = item.value / total;
                    const angle = percentage * 360;
                    if (angle === 0) return null;

                    const largeArcFlag = percentage > 0.5 ? 1 : 0;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;

                    const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                    const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                    const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                    const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                    currentAngle += angle;
                    return (
                        <path
                            key={i}
                            d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                            fill={item.color}
                        />
                    );
                })}
                <circle cx="50" cy="50" r="38" fill="#14121E" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-[10px] text-[#9A9AA6] uppercase tracking-[0.2em] mb-1">Received</span>
                <span className="text-xl font-black text-white">{Math.round((items[0].value / total) * 100)}%</span>
            </div>
        </div>
    );
};

const AdminPanelContent = () => {
    const { toast } = useToast();

    // Data from Store
    const {
        clients,
        payments,
        teamLedger,
        logs,
        clientFinances,
        loading,
        addClient: storeAddClient,
        updateClientPricing: storeUpdatePricing,
        updateClientDetails: storeUpdateDetails,
        updateClientStatus: storeUpdateStatus,
        deleteClient: storeDeleteClient,
        addLog: storeAddLog
    } = useFinanceStore();

    // UI State
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("pricing");
    const [adminMode, setAdminMode] = useState(true);

    // Dialog States
    const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
    const [isEditClientOpen, setIsEditClientOpen] = useState(false);

    // Form States
    const [newClient, setNewClient] = useState({
        clientName: '',
        contact: '',
        businessType: '',
        serviceCost: '',
        domainCharged: '0',
    });

    const [editClientForm, setEditClientForm] = useState({
        clientName: '',
        contact: '',
        businessType: ''
    });

    const [pricingForm, setPricingForm] = useState({
        serviceCost: 0,
        domainCharged: 0,
        actualDomainCost: 0,
        extraFeatures: 0,
        extraProductionCharges: 0,
        contact: ''
    });

    // Mobile Search State
    const [searchQuery, setSearchQuery] = useState("");

    const filteredClients = clients.filter(c =>
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.businessType?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const calculateNetProfit = (id: string) => {
        const stats = clientFinances.get(id) || { totalReceived: 0, totalExpenses: 0 };
        return stats.totalReceived - stats.totalExpenses;
    };

    const [isPricingDirty, setIsPricingDirty] = useState(false);
    const [isSavingPricing, setIsSavingPricing] = useState(false);

    // Derived selected client
    const selectedClient = clients.find(c => c.clientId === selectedClientId);

    // Lifecycle: Select first client
    useEffect(() => {
        if (clients.length > 0 && !selectedClientId) {
            setSelectedClientId(clients[0].clientId);
        }
    }, [clients, selectedClientId]);

    // Lifecycle: Sync forms on client change
    useEffect(() => {
        if (selectedClient) {
            setPricingForm({
                serviceCost: Number(selectedClient.costs?.serviceCost || 0),
                domainCharged: Number(selectedClient.costs?.domainCharged || 0),
                actualDomainCost: Number(selectedClient.costs?.actualDomainCost || 0),
                extraFeatures: Number(selectedClient.costs?.extraFeatures || 0),
                extraProductionCharges: Number(selectedClient.costs?.extraProductionCharges || 0),
                contact: selectedClient.contact || ''
            });
            setEditClientForm({
                clientName: selectedClient.clientName || '',
                contact: selectedClient.contact || '',
                businessType: selectedClient.businessType || ''
            });
            setIsPricingDirty(false);
        }
    }, [selectedClient]);

    // HANDLERS
    const handleCreateClient = async () => {
        try {
            const sc = Number(newClient.serviceCost) || 0;
            const dc = Number(newClient.domainCharged) || 0;
            await storeAddClient({
                clientName: newClient.clientName,
                contact: newClient.contact,
                businessType: newClient.businessType,
                startDate: new Date().toISOString(),
                assignedMember: 'unassigned',
                costs: { serviceCost: sc, domainCharged: dc, actualDomainCost: 0, extraFeatures: 0, extraProductionCharges: 0 },
                financials: { totalValue: sc + dc, profit: sc + dc }
            });
            setIsCreateClientOpen(false);
            setNewClient({ clientName: '', contact: '', businessType: '', serviceCost: '', domainCharged: '0' });
            toast({ title: "Client Created", description: "Successfully added new project." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to create client.", variant: "destructive" });
        }
    };

    const handleEditClientSubmit = async () => {
        if (!selectedClient) return;
        try {
            await storeUpdateDetails(selectedClient.clientId, editClientForm);
            setIsEditClientOpen(false);
            toast({ title: "Client Updated", description: "General details saved successfully." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update details.", variant: "destructive" });
        }
    };

    const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPricingForm(prev => ({
            ...prev,
            [name]: name === 'contact' ? value : Number(value)
        }));
        setIsPricingDirty(true);
    };

    const handleSavePricing = async () => {
        if (!selectedClient) return;
        setIsSavingPricing(true);
        try {
            // Update Pricing
            await storeUpdatePricing(selectedClient.clientId, {
                serviceCost: pricingForm.serviceCost,
                domainCharged: pricingForm.domainCharged,
                actualDomainCost: pricingForm.actualDomainCost,
                extraFeatures: pricingForm.extraFeatures,
                extraProductionCharges: pricingForm.extraProductionCharges,
            });

            // Update Contact if changed
            if (pricingForm.contact !== selectedClient.contact) {
                await storeUpdateDetails(selectedClient.clientId, { contact: pricingForm.contact });
            }

            toast({ title: "Pricing Saved", description: "Financial details updated successfully." });
            setIsPricingDirty(false);
        } catch (error) {
            toast({ title: "Save Failed", description: "There was an error updating data.", variant: "destructive" });
        } finally {
            setIsSavingPricing(false);
        }
    };

    const handleResetPricing = () => {
        if (selectedClient) {
            setPricingForm({
                serviceCost: Number(selectedClient.costs?.serviceCost || 0),
                domainCharged: Number(selectedClient.costs?.domainCharged || 0),
                actualDomainCost: Number(selectedClient.costs?.actualDomainCost || 0),
                extraFeatures: Number(selectedClient.costs?.extraFeatures || 0),
                extraProductionCharges: Number(selectedClient.costs?.extraProductionCharges || 0),
                contact: selectedClient.contact || ''
            });
            setIsPricingDirty(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!selectedClient) return;
        try {
            await storeUpdateStatus(selectedClient.clientId, newStatus);
            toast({ title: "Status Updated", description: `Project is now ${newStatus}.` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
        }
    };

    // Derived Finance Logic
    const storedFinance = selectedClient ? clientFinances.get(selectedClient.clientId) : null;
    const finance = storedFinance || {
        totalValue: 0, totalPaid: 0, pending: 0, profit: 0,
        totalRevenue: 0, teamGiven: 0, teamSpent: 0, teamInvestment: 0,
        teamWallet: 0, progressPercent: 0
    };
    const { totalValue, totalPaid, pending, profit } = finance;

    const recentLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

    if (loading) return <div className="h-screen w-full bg-[#0E0C12] flex items-center justify-center"><Activity className="animate-spin text-[#6E6AF6]" /></div>;

    return (
        <div className="h-screen w-full bg-[#0E0C12] text-[#EAEAF0] flex flex-col overflow-hidden font-sans relative">
            {/* Mobile-only background effects (strictly < 480px) */}
            <div className="fixed inset-0 pointer-events-none md:hidden overflow-hidden bg-[#0B0B12] z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_20%_20%,rgba(124,108,255,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(63,224,197,0.04),transparent_40%)]" />
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%\' height=\'100%\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden md:flex flex-col h-full w-full relative z-10">
                {/* Header */}
                <header className="shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-4 md:px-6 py-4 border-b border-white/[0.06] bg-[#0E0C12]">
                    <div className="flex flex-col">
                        <Link href="/phases/0" className="flex items-center gap-1.5 text-xs text-[#9A9AA6] hover:text-[#EAEAF0] mb-1">
                            <ArrowLeft size={12} /> Phase 0
                        </Link>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-white">Website Freelancing</h1>
                            <span className="text-xl font-light text-[#9A9AA6]">/ Admin</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${adminMode ? 'bg-[#6E6AF6]/10 border-[#6E6AF6]/30' : 'bg-white/5 border-white/10'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${adminMode ? 'bg-[#6E6AF6]' : 'bg-zinc-500'}`} />
                            <span className="text-xs font-semibold">Admin Mode</span>
                        </div>
                        <Button variant="ghost" size="icon" className="text-[#9A9AA6] hover:text-white"><Bell size={18} /></Button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6 p-4 md:p-6 overflow-hidden">

                    {/* LEFT: Clients List */}
                    <div className="w-full lg:col-span-3 flex flex-col bg-[#14121E]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden h-auto lg:h-full order-1 lg:order-none">
                        <div className="p-4 border-b border-white/[0.05]">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9A9AA6]" />
                                <Input placeholder="Search projects..." className="bg-white/[0.03] border-white/[0.05] rounded-xl pl-9 h-9 text-xs" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {clients.map(c => (
                                <button
                                    key={c.clientId}
                                    onClick={() => setSelectedClientId(c.clientId)}
                                    className={`w-full text-left p-3 rounded-xl transition-all ${selectedClientId === c.clientId ? 'bg-white/5 border-l-2 border-[#6E6AF6]' : 'hover:bg-white/[0.02] border-l-2 border-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-sm font-semibold ${selectedClientId === c.clientId ? 'text-white' : 'text-[#9A9AA6]'}`}>{c.clientName}</span>
                                        <Badge variant="outline" className="text-[9px] h-4 py-0 px-1.5 bg-white/5 border-white/10">{c.status}</Badge>
                                    </div>
                                    <p className="text-[10px] text-[#9A9AA6] truncate">{c.contact || 'No contact info'}</p>
                                </button>
                            ))}
                        </div>
                        <div className="p-4 bg-gradient-to-t from-[#0E0C12] to-transparent">
                            <Dialog open={isCreateClientOpen} onOpenChange={setIsCreateClientOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full bg-[#6E6AF6] hover:shadow-[0_0_15px_-3px_#6E6AF6] text-white border-none rounded-xl h-10 text-xs font-bold">
                                        <Plus size={14} className="mr-2" /> CREATE NEW CLIENT
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#14121E] border-white/10 text-white">
                                    <DialogHeader><DialogTitle>New Workspace</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="grid gap-2"><Label>Client / Project Name</Label><Input className="bg-white/5 border-white/10" value={newClient.clientName} onChange={e => setNewClient({ ...newClient, clientName: e.target.value })} /></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2"><Label>Service Cost</Label><Input type="number" className="bg-white/5 border-white/10" value={newClient.serviceCost} onChange={e => setNewClient({ ...newClient, serviceCost: e.target.value })} /></div>
                                            <div className="grid gap-2"><Label>Domain Charged</Label><Input type="number" className="bg-white/5 border-white/10" value={newClient.domainCharged} onChange={e => setNewClient({ ...newClient, domainCharged: e.target.value })} /></div>
                                        </div>
                                        <div className="grid gap-2"><Label>Contact Details</Label><Input className="bg-white/5 border-white/10" value={newClient.contact} onChange={e => setNewClient({ ...newClient, contact: e.target.value })} /></div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="ghost" onClick={() => setIsCreateClientOpen(false)}>Cancel</Button>
                                        <Button onClick={handleCreateClient} className="bg-[#6E6AF6]">Create Project</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* CENTER: Work Area */}
                    <div className="w-full lg:col-span-6 flex flex-col bg-[#14121E]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden relative order-2 lg:order-none">
                        {selectedClient ? (
                            <>
                                <div className="shrink-0 p-6 pb-0 border-b border-white/[0.03]">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-2xl font-bold text-white tracking-tight">{selectedClient.clientName}</h2>
                                                <CheckCircle2 size={16} className="text-[#6E6AF6]" />
                                            </div>
                                            <p className="text-[#9A9AA6] text-sm">{selectedClient.businessType} · {selectedClient.contact || 'No contact provided'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Select value={selectedClient.status} onValueChange={handleStatusUpdate}>
                                                <SelectTrigger className="w-[120px] bg-white/[0.02] border-white/10 text-white rounded-xl h-9 text-xs">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#14121E] border-white/10 text-white">
                                                    <SelectItem value="Active">Active</SelectItem>
                                                    <SelectItem value="Done">Done</SelectItem>
                                                    <SelectItem value="Hold">Hold</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="bg-white/[0.02] border-white/10 text-[#9A9AA6] rounded-xl text-xs h-9">
                                                        <Edit2 size={12} className="mr-2" /> EDIT INFO
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-[#14121E] border-white/10 text-white">
                                                    <DialogHeader><DialogTitle>Edit Details</DialogTitle></DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="grid gap-2"><Label>Project Name</Label><Input className="bg-white/5 border-white/10" value={editClientForm.clientName} onChange={e => setEditClientForm({ ...editClientForm, clientName: e.target.value })} /></div>
                                                        <div className="grid gap-2"><Label>Contact Info</Label><Input className="bg-white/5 border-white/10" value={editClientForm.contact} onChange={e => setEditClientForm({ ...editClientForm, contact: e.target.value })} /></div>
                                                        <div className="grid gap-2"><Label>Business Brand</Label><Input className="bg-white/5 border-white/10" value={editClientForm.businessType} onChange={e => setEditClientForm({ ...editClientForm, businessType: e.target.value })} /></div>
                                                    </div>
                                                    <DialogFooter><Button onClick={handleEditClientSubmit} className="bg-[#6E6AF6]">Save Changes</Button></DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </div>

                                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                                    <div className="shrink-0 px-4 md:px-6 border-b border-white/[0.03]">
                                        <TabsList className="bg-transparent w-full overflow-x-auto flex justify-start h-auto p-0 gap-4 md:gap-6">
                                            {['Overview', 'Pricing', 'Payments', 'Team'].map((tab) => (
                                                <TabsTrigger
                                                    key={tab}
                                                    value={tab.toLowerCase()}
                                                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#6E6AF6] data-[state=active]:text-white data-[state=active]:bg-transparent shadow-none text-[#9A9AA6] rounded-none px-1 py-4 text-xs font-bold uppercase tracking-widest transition-all"
                                                >
                                                    {tab === 'Pricing' ? 'Pricing & Costs' : tab === 'Payments' ? 'Payments' : tab === 'Team' ? 'Team Money' : tab}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-40">
                                        <TabsContent value="pricing" className="mt-0 space-y-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <Label className="text-[10px] text-[#9A9AA6] uppercase tracking-[0.1em] mb-2 block">Service Cost</Label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-2.5 text-[#9A9AA6] text-sm">₹</span>
                                                                <Input name="serviceCost" type="number" value={pricingForm.serviceCost} onChange={handlePricingChange} className="bg-white/[0.02] border-white/10 text-white pl-8 h-10 rounded-xl" />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div>
                                                                <Label className="text-[10px] text-[#9A9AA6] uppercase tracking-[0.1em] mb-2 block">Domain Charged</Label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-2.5 text-[#9A9AA6] text-sm">₹</span>
                                                                    <Input name="domainCharged" type="number" value={pricingForm.domainCharged} onChange={handlePricingChange} className="bg-white/[0.02] border-white/10 text-white pl-8 h-10 rounded-xl" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Label className="text-[10px] text-[#9A9AA6] uppercase tracking-[0.1em] mb-2 block">Actual Cost</Label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-2.5 text-[#9A9AA6] text-sm">₹</span>
                                                                    <Input name="actualDomainCost" type="number" value={pricingForm.actualDomainCost} onChange={handlePricingChange} className="bg-white/[0.02] border-white/10 text-white pl-8 h-10 rounded-xl" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label className="text-[10px] text-[#9A9AA6] uppercase tracking-[0.1em] mb-2 block">Extra Features</Label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-2.5 text-[#9A9AA6] text-sm">₹</span>
                                                                <Input name="extraFeatures" type="number" value={pricingForm.extraFeatures} onChange={handlePricingChange} className="bg-white/[0.02] border-white/10 text-white pl-8 h-10 rounded-xl" />
                                                            </div>
                                                        </div>
                                                        <div className="pt-2">
                                                            <Label className="text-[10px] text-[#9A9AA6] uppercase tracking-[0.1em] mb-2 block">Contact Details</Label>
                                                            <Input name="contact" value={pricingForm.contact} onChange={handlePricingChange} className="bg-white/[0.02] border-white/10 text-white h-10 rounded-xl" />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                                        <Button onClick={handleSavePricing} disabled={isSavingPricing || !isPricingDirty} className={`flex-1 ${isPricingDirty ? 'bg-[#6E6AF6] text-white shadow-[0_5px_15px_-5px_#6E6AF6]' : 'bg-white/5 text-zinc-600'} rounded-2xl h-11 font-black`}>
                                                            {isSavingPricing ? 'SAVING...' : 'SAVE CHANGES'}
                                                        </Button>
                                                        <Button onClick={handleResetPricing} variant="ghost" className="flex-1 text-[#9A9AA6] hover:bg-white/5 rounded-2xl h-11 opacity-50">RESET</Button>
                                                    </div>
                                                </div>

                                                <div className="bg-[#6E6AF6]/5 border border-[#6E6AF6]/10 rounded-3xl p-8 space-y-8 h-fit">
                                                    <div className="flex justify-between items-center pb-6 border-b border-white/[0.05]">
                                                        <span className="text-[#9A9AA6] text-[10px] font-bold uppercase tracking-widest">Total Value</span>
                                                        <span className="text-3xl font-black text-white">₹{totalValue.toLocaleString()}</span>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-[#9A9AA6]">Received</span>
                                                            <span className="text-white font-bold">₹{totalPaid.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-[#9A9AA6]">Remaining</span>
                                                            <span className="text-white font-bold">₹{pending.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-6 border-t border-white/[0.05]">
                                                            <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest">Net Profit</span>
                                                            <span className="text-2xl font-black text-emerald-400">₹{profit.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="overview" className="mt-0">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-[#1E1C24]/50 border border-white/[0.05] rounded-3xl p-10 flex flex-col items-center justify-center">
                                                    <h3 className="text-[#9A9AA6] text-[10px] font-black uppercase tracking-[0.2em] mb-8">Payment Velocity</h3>
                                                    <SimplePieChart items={[
                                                        { label: 'Paid', value: totalPaid, color: '#6E6AF6' },
                                                        { label: 'Pending', value: pending, color: '#1E1B2E' }
                                                    ]} />
                                                    <div className="flex justify-center gap-10 mt-10 w-full opacity-60">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-white uppercase"><div className="w-2 h-2 rounded-full bg-[#6E6AF6]" /> PAID</div>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#9A9AA6] uppercase"><div className="w-2 h-2 rounded-full bg-[#24212D]" /> PENDING</div>
                                                    </div>
                                                </div>

                                                <div className="bg-[#1E1C24]/30 border border-white/[0.05] rounded-3xl p-8 space-y-10">
                                                    <h3 className="text-[#9A9AA6] text-[10px] font-black uppercase tracking-[0.2em]">Efficiency KPIs</h3>
                                                    <div className="space-y-8">
                                                        <div>
                                                            <div className="flex justify-between text-xs font-bold mb-3 uppercase tracking-wider">
                                                                <span className="text-[#EAEAF0]">Realization Rate</span>
                                                                <span className="text-[#6E6AF6]">{Math.round((totalPaid / (totalValue || 1)) * 100)}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-[#6E6AF6] shadow-[0_0_10px_rgba(110,106,246,0.5)]" style={{ width: `${(totalPaid / (totalValue || 1)) * 100}%` }} />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between text-xs font-bold mb-3 uppercase tracking-wider">
                                                                <span className="text-[#EAEAF0]">Profit Margin</span>
                                                                <span className="text-emerald-400">{Math.round((profit / (totalValue || 1)) * 100)}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-emerald-500" style={{ width: `${(profit / (totalValue || 1)) * 100}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="payments" className="m-0"><ClientPayments clientId={selectedClient.clientId} finance={finance} /></TabsContent>
                                        <TabsContent value="team" className="m-0"><TeamMoney clientId={selectedClient.clientId} finance={finance} /></TabsContent>
                                    </div>
                                </Tabs>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-[#9A9AA6] opacity-30 gap-4">
                                <Activity size={48} />
                                <span className="text-xs font-bold uppercase tracking-[0.2em]">Select Workspace</span>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Stats & Logs */}
                    <div className="w-full lg:col-span-3 flex flex-col gap-4 md:gap-6 order-3 lg:order-none">
                        <div className="flex-1 bg-[#14121E]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 overflow-hidden flex flex-col">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9A9AA6] mb-6">Execution Logs</h2>
                            <div className="flex-1 overflow-y-auto space-y-5 relative custom-scrollbar">
                                <div className="absolute left-[5px] top-2 bottom-0 w-[1px] bg-gradient-to-b from-white/10 to-transparent" />
                                {recentLogs.map((log, i) => (
                                    <div key={i} className="relative pl-6">
                                        <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[#1E1C24] border border-[#FFB86B]" />
                                        <p className="text-xs text-white leading-tight mb-1 font-medium">{log.action.replace(/_/g, ' ')}</p>
                                        <p className="text-[9px] text-[#9A9AA6] uppercase tracking-tighter">{log.actor} · {formatTimeAgo(log.timestamp)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-6 border-t border-white/[0.05] mt-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] text-[#9A9AA6] font-bold uppercase">Total Volume</span>
                                    <span className="text-sm font-black text-white">₹{totalValue.toLocaleString()}</span>
                                </div>
                                <Button variant="outline" className="w-full text-[10px] font-bold h-9 border-white/10 hover:bg-white/5 tracking-widest uppercase">
                                    VIEW AUDIT TRAIL <ArrowRight size={12} className="ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* MOBILE VIEW (strictly < 480px via hidden md:block equivalent) */}
            <div className="flex md:hidden flex-col h-full w-full relative z-10 overflow-y-auto custom-scrollbar pb-24">
                {/* Mobile Header */}
                <div className="px-6 pt-8 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <Link href="/phases/0" className="flex items-center gap-2 text-[#9AA0B4] text-sm">
                            <ArrowLeft size={18} />
                            <span>Phase 0</span>
                        </Link>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#7C6CFF] shadow-[0_0_8px_#7C6CFF]" />
                            <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider">Admin Mode</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Website Freelancing</h1>
                        <span className="text-xl font-medium text-[#6B6F85]">/ Admin</span>
                    </div>
                </div>

                {/* Mobile Search & Add Client */}
                <div className="px-6 mb-6 space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6F85]" />
                            <Input
                                placeholder="Search client..."
                                className="bg-white/[0.03] border-white/[0.08] rounded-2xl pl-11 h-12 text-sm text-white placeholder:text-[#6B6F85] focus-visible:ring-[#7C6CFF]/30"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            className="h-12 w-12 rounded-2xl bg-[#7C6CFF] hover:bg-[#6c5ddb] text-white p-0 flex items-center justify-center shrink-0"
                            onClick={() => {
                                setIsCreateClientOpen(true);
                                setSelectedClientId(null);
                            }}
                        >
                            <Plus size={20} />
                        </Button>
                    </div>

                    {/* Mobile Client List (when no client selected or searching) */}
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
                                            <div className="w-10 h-10 rounded-xl bg-[#7C6CFF]/10 flex items-center justify-center text-[#7C6CFF]">
                                                <Shield size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white leading-tight">{client.clientName}</p>
                                                <p className="text-[10px] text-[#6B6F85] font-medium uppercase tracking-wider mt-0.5">{client.status}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-white">₹{calculateNetProfit(client.clientId).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                {selectedClient ? (
                    <div className="px-6 space-y-6">
                        {/* Client Summary Card */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1A1B2E] to-[#0F1020] border border-white/[0.06] shadow-xl">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h2 className="text-xl font-bold text-white">{selectedClient?.clientName}</h2>
                                        <Shield size={16} className="text-[#3FE0C5]" />
                                    </div>
                                    <p className="text-[#6B6F85] text-xs mt-0.5">-{selectedClient?.contact || '8967422848'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Select value={selectedClient?.status} onValueChange={handleStatusUpdate}>
                                        <SelectTrigger className="h-8 bg-black/20 border-white/[0.08] rounded-xl text-[10px] font-bold text-white/80 px-3 min-w-[80px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#14121E] border-white/10 text-white">
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Done">Done</SelectItem>
                                            <SelectItem value="Hold">Hold</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 bg-black/20 border-white/[0.08] rounded-xl text-[10px] font-bold text-[#6B6F85] uppercase tracking-wider px-3"
                                        onClick={() => setIsEditClientOpen(true)}
                                    >
                                        <Edit2 size={12} className="mr-1.5" /> EDIT INFO
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex overflow-x-auto gap-6 border-b border-white/[0.06] pb-1 no-scrollbar">
                            {['OVERVIEW', 'PRICING & COSTS', 'PAYMENTS', 'TEAM MONEY'].map((tab) => {
                                const isActive = (tab === 'PRICING & COSTS' && activeTab === 'pricing') || (tab.toLowerCase() === activeTab);
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab === 'PRICING & COSTS' ? 'pricing' : tab.toLowerCase())}
                                        className={`whitespace-nowrap text-[10px] font-black tracking-[0.15em] pb-3 px-1 transition-all relative ${isActive ? 'text-white' : 'text-[#6B6F85]'}`}
                                    >
                                        {tab}
                                        {isActive && (
                                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7C6CFF] shadow-[0_0_8px_#7C6CFF]" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {activeTab === 'pricing' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-5">
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-[10px] text-[#6B6F85] font-black uppercase tracking-widest mb-2.5 block px-1">SERVICE COST</Label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6F85] text-sm font-medium">₹</span>
                                                    <Input
                                                        name="serviceCost"
                                                        type="number"
                                                        value={pricingForm.serviceCost}
                                                        onChange={handlePricingChange}
                                                        className="bg-white/[0.03] border-white/[0.08] text-white pl-10 h-12 rounded-xl text-sm font-bold focus:bg-white/[0.05]"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="text-[10px] text-[#6B6F85] font-black uppercase tracking-widest mb-2.5 block px-1">DOMAIN CHARGED</Label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6F85] text-sm font-medium">₹</span>
                                                        <Input
                                                            name="domainCharged"
                                                            type="number"
                                                            value={pricingForm.domainCharged}
                                                            onChange={handlePricingChange}
                                                            className="bg-white/[0.03] border-white/[0.08] text-white pl-10 h-12 rounded-xl text-sm font-bold focus:bg-white/[0.05]"
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6F85] text-sm font-medium">₹</span>
                                                        <Input
                                                            name="actualDomainCost"
                                                            type="number"
                                                            value={pricingForm.actualDomainCost}
                                                            onChange={handlePricingChange}
                                                            className="bg-white/[0.03] border-white/[0.08] text-white pl-10 h-12 rounded-xl text-sm font-bold focus:bg-white/[0.05]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="text-[10px] text-[#6B6F85] font-black uppercase tracking-widest mb-2.5 block px-1">EXTRA FEATURES</Label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6F85] text-sm font-medium">₹</span>
                                                    <Input
                                                        name="extraFeatures"
                                                        type="number"
                                                        value={pricingForm.extraFeatures}
                                                        onChange={handlePricingChange}
                                                        className="bg-white/[0.03] border-white/[0.08] text-white pl-10 h-12 rounded-xl text-sm font-bold focus:bg-white/[0.05]"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="text-[10px] text-[#6B6F85] font-black uppercase tracking-widest mb-2.5 block px-1">CONTACT DETAILS</Label>
                                                <Input
                                                    name="contact"
                                                    value={pricingForm.contact}
                                                    onChange={handlePricingChange}
                                                    className="bg-white/[0.03] border-white/[0.08] text-white h-12 rounded-xl text-sm font-bold focus:bg-white/[0.05]"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-2">
                                            <Button
                                                onClick={handleSavePricing}
                                                disabled={isSavingPricing || !isPricingDirty}
                                                className={`flex-1 rounded-2xl h-14 font-black text-xs tracking-widest uppercase transition-all ${isPricingDirty ? 'bg-gradient-to-r from-[#7C6CFF] to-[#6366F1] text-white shadow-[0_8px_20px_-6px_#7C6CFF]' : 'bg-white/5 text-[#6B6F85]'}`}
                                            >
                                                {isSavingPricing ? 'SAVING...' : 'SAVE CHANGES'}
                                            </Button>
                                            <Button
                                                onClick={handleResetPricing}
                                                variant="ghost"
                                                className="px-6 text-[#6B6F85] font-black text-xs tracking-widest uppercase h-14"
                                            >
                                                RESET
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Financial Summary Card */}
                                    <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1A1B2E] to-[#0F1020] border border-white/[0.06] shadow-2xl space-y-6">
                                        <div className="flex justify-between items-center pb-5 border-b border-white/[0.04]">
                                            <span className="text-[#6B6F85] text-[10px] font-black uppercase tracking-wider">TOTAL VALUE</span>
                                            <span className="text-3xl font-black text-white">₹{totalValue.toLocaleString()}</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[#6B6F85] text-xs font-medium">Received</span>
                                                <span className="text-white text-sm font-bold">₹{totalPaid.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[#6B6F85] text-xs font-medium">Remaining</span>
                                                <span className="text-white text-sm font-bold">₹{pending.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-5 border-t border-white/[0.04]">
                                                <span className="text-[#3FE0C5] text-[10px] font-black uppercase tracking-[0.1em]">NET PROFIT</span>
                                                <span className="text-2xl font-black text-[#3FE0C5] drop-shadow-[0_0_10px_rgba(63,224,197,0.3)]">₹{profit.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Logs Section */}
                                <div className="space-y-6 pt-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B6F85] px-1">EXECUTION LOGS</h3>
                                    <div className="space-y-4">
                                        {recentLogs.map((log, i) => (
                                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#F2B36D] mt-1.5 shadow-[0_0_6px_#F2B36D]" />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="text-sm text-white/90 font-bold uppercase tracking-tight">{log.action.replace(/_/g, ' ')}</p>
                                                        <span className="text-sm font-bold text-white">₹{totalValue.toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-[10px] text-[#6B6F85] font-bold uppercase tracking-wider">{log.actor} · {formatTimeAgo(log.timestamp)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="ghost" className="w-full text-[10px] font-black tracking-[0.2em] h-12 text-[#6B6F85] border border-white/[0.04] rounded-xl hover:bg-white/5 uppercase">
                                        VIEW AUDIT TRAIL <ArrowRight size={14} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="p-6 rounded-3xl bg-[#14121E]/50 border border-white/[0.05] flex flex-col items-center justify-center gap-6">
                                    <SimplePieChart items={[
                                        { label: 'Received', value: finance.totalReceived || 0, color: '#6E6AF6' },
                                        { label: 'Pending', value: (finance.projectValue || 0) - (finance.totalReceived || 0), color: '#2C2B35' }
                                    ]} />
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <div className="p-4 rounded-2xl bg-black/20 border border-white/[0.05] text-center">
                                            <p className="text-[10px] text-[#9A9AA6] uppercase tracking-widest mb-1">Total Value</p>
                                            <p className="text-lg font-black text-white">₹{finance.projectValue?.toLocaleString() || 0}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-black/20 border border-white/[0.05] text-center">
                                            <p className="text-[10px] text-[#9A9AA6] uppercase tracking-widest mb-1">Net Profit</p>
                                            <p className="text-lg font-black text-[#3FE0C5]">₹{(finance.netProfit || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div className="space-y-6">
                                <ClientPayments clientId={selectedClient.clientId} finance={finance} />
                            </div>
                        )}

                        {activeTab === 'team money' && (
                            <div className="space-y-6">
                                <TeamMoney clientId={selectedClient.clientId} finance={finance} />
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#6B6F85] opacity-50 gap-4">
                        <Activity size={48} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Select Project</span>
                    </div>
                )}

                {/* Mobile Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-[#0B0B12]/80 backdrop-blur-3xl border-t border-white/[0.05]" />
                    <div className="relative flex items-center justify-around h-20 px-4 pb-safe">
                        <div className="flex flex-col items-center gap-1 group relative">
                            <div className="p-2 rounded-full transition-all text-[#7C6CFF] drop-shadow-[0_0_8px_rgba(124,108,255,0.4)]">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 group">
                            <div className="p-2 rounded-full text-[#6B6F85]">
                                <Activity size={24} />
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 group relative">
                            <div className="p-2 rounded-full text-[#6B6F85]">
                                <Bell size={24} />
                                <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#F2B36D] border-2 border-[#0B0B12]" />
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 group">
                            <div className="p-2 rounded-full text-[#6B6F85]">
                                <Shield size={24} />
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
            <AdminPanelContent />
        </PasscodeProtect>
    );
}
