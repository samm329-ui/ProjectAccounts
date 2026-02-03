'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { updateClientPricing } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, History } from 'lucide-react';

interface ClientCosts {
    serviceCost: number;
    domainCharged: number;
    actualDomainCost: number;
    extraFeatures: number;
    extraProductionCharges: number;
}

interface EditClientModalProps {
    client: {
        clientId: string;
        clientName: string;
        costs: ClientCosts;
        version?: number; // Optimistic concurrency
    };
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditClientModal({ client, isOpen, onClose, onSuccess }: EditClientModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conflictData, setConflictData] = useState<ClientCosts | null>(null);

    const [formData, setFormData] = useState<ClientCosts>({
        serviceCost: 0,
        domainCharged: 0,
        actualDomainCost: 0,
        extraFeatures: 0,
        extraProductionCharges: 0
    });

    const [preview, setPreview] = useState({
        totalValue: 0,
        profit: 0,
        domainProfit: 0
    });

    // Initialize form when client changes
    useEffect(() => {
        if (client) {
            setFormData({
                serviceCost: client.costs.serviceCost,
                domainCharged: client.costs.domainCharged,
                actualDomainCost: client.costs.actualDomainCost,
                extraFeatures: client.costs.extraFeatures,
                extraProductionCharges: client.costs.extraProductionCharges
            });
            setError(null);
            setConflictData(null);
        }
    }, [client, isOpen]);

    // Live Preview Calculation
    useEffect(() => {
        const serviceCost = Number(formData.serviceCost) || 0;
        const domainCharged = Number(formData.domainCharged) || 0;
        const actualDomainCost = Number(formData.actualDomainCost) || 0;
        const extraFeatures = Number(formData.extraFeatures) || 0;
        const extraProductionCharges = Number(formData.extraProductionCharges) || 0;

        const totalValue = serviceCost + domainCharged + extraFeatures + extraProductionCharges;
        const domainProfit = domainCharged - actualDomainCost;
        const profit = totalValue + domainProfit;

        setPreview({ totalValue, profit, domainProfit });
    }, [formData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Allow empty string for better UX while typing, but convert to number for storage
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? 0 : parseFloat(value)
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        const payload = {
            clientId: client.clientId,
            ...formData,
            lastKnownVersion: client.version || 0,
            editorId: 'Admin', // In real app, get from auth context
        };

        const result = await updateClientPricing(client.clientId, payload);

        setLoading(false);

        if (result.success) {
            toast({
                title: "Pricing Updated",
                description: `Client ${client.clientName} updated successfully.`,
                className: "bg-green-900 border-green-800 text-white"
            });
            onSuccess();
            onClose();
        } else {
            if (result.status === 409 && result.currentData) {
                setConflictData(result.currentData);
                setError("Data conflict! This record was modified by another user.");
            } else {
                setError(result.message || "Failed to update client");
            }
        }
    };

    const handleConfictResolve = () => {
        if (conflictData) {
            setFormData({
                serviceCost: conflictData.serviceCost,
                domainCharged: conflictData.domainCharged,
                actualDomainCost: conflictData.actualDomainCost,
                extraFeatures: conflictData.extraFeatures,
                extraProductionCharges: conflictData.extraProductionCharges
            });
            setConflictData(null);
            setError(null);
            // In a real app we'd update the version here too
            toast({ title: "Data Refreshed", description: "Updated form with latest server values." });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl bg-[#0b0b0f] border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        Edit Pricing: <span className="text-purple-400">{client?.clientName}</span>
                    </DialogTitle>
                    <DialogDescription>
                        Update project costs and pricing. All changes are logged.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900/50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription className="flex flex-col gap-2">
                            <span>{error}</span>
                            {conflictData && (
                                <Button size="sm" variant="outline" onClick={handleConfictResolve} className="w-fit mt-2">
                                    Refresh with Latest Data
                                </Button>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                    {/* Input Columns */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="serviceCost">Service Cost</Label>
                                <Input
                                    id="serviceCost"
                                    name="serviceCost"
                                    type="number"
                                    value={formData.serviceCost || ''}
                                    onChange={handleChange}
                                    className="bg-black/40 border-zinc-700 focus:border-purple-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="domainCharged">Domain Charged</Label>
                                <Input
                                    id="domainCharged"
                                    name="domainCharged"
                                    type="number"
                                    value={formData.domainCharged || ''}
                                    onChange={handleChange}
                                    className="bg-black/40 border-zinc-700 focus:border-purple-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="actualDomainCost">Actual Domain Cost</Label>
                                <Input
                                    id="actualDomainCost"
                                    name="actualDomainCost"
                                    type="number"
                                    value={formData.actualDomainCost || ''}
                                    onChange={handleChange}
                                    className="bg-black/40 border-zinc-700 focus:border-purple-500"
                                />
                                {preview.domainProfit < 0 && (
                                    <p className="text-xs text-yellow-500 flex items-center gap-1">
                                        <AlertTriangle size={12} /> Loss on domain: {preview.domainProfit}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="extraFeatures">Extra Features</Label>
                                <Input
                                    id="extraFeatures"
                                    name="extraFeatures"
                                    type="number"
                                    value={formData.extraFeatures || ''}
                                    onChange={handleChange}
                                    className="bg-black/40 border-zinc-700 focus:border-purple-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="extraProductionCharges">Extra Production</Label>
                                <Input
                                    id="extraProductionCharges"
                                    name="extraProductionCharges"
                                    type="number"
                                    value={formData.extraProductionCharges || ''}
                                    onChange={handleChange}
                                    className="bg-black/40 border-zinc-700 focus:border-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview Column */}
                    <div className="md:col-span-1">
                        <Card className="bg-zinc-900/50 border-zinc-800 h-full">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                                    Projected Financials
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <p className="text-xs text-zinc-500 mb-1">Total Value</p>
                                    <p className="text-2xl font-bold text-white">₹{preview.totalValue.toLocaleString()}</p>
                                    <p className="text-[10px] text-zinc-600">Sum of all charges</p>
                                </div>
                                <div className="p-3 rounded bg-black/40 border border-zinc-800">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs text-zinc-400">Domain Profit</p>
                                        <span className={`text-xs font-mono ${preview.domainProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {preview.domainProfit >= 0 ? '+' : ''}{preview.domainProfit}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-zinc-400">Total Profit</p>
                                        <span className="text-sm font-bold text-green-400">₹{preview.profit.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-zinc-800">
                                    <div className="flex items-start gap-2 text-xs text-zinc-500">
                                        <History size={14} className="mt-0.5" />
                                        <p>
                                            Updates will be logged as version {(client?.version || 0) + 1}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading} className="border-zinc-700 hover:bg-zinc-800">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
