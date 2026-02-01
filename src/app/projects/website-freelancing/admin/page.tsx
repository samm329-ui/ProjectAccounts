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
import { Search, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getClients, getPayments, getLogs } from '@/lib/api';

const AdminContent = () => {
    const [clients, setClients] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [clientsData, paymentsData, logsData] = await Promise.all([
                    getClients(),
                    getPayments(),
                    getLogs(),
                ]);
                setClients(clientsData);
                setPayments(paymentsData);
                setLogs(logsData);
            } catch (error) {
                console.error("Failed to fetch admin data", error)
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
        <Badge variant="outline" className="border-primary text-primary">Full Access</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/[.04] border-white/[.06]">
                <CardHeader>
                    <CardTitle>Clients</CardTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search clients..." className="pl-10 bg-black/20" />
                    </div>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                       {clients.map(client => (
                         <li key={client.clientId} className="flex justify-between items-center p-3 rounded-md hover:bg-white/5">
                             <div>
                                 <p className="font-medium">{client.clientName}</p>
                                 <p className="text-sm text-muted-foreground">{client.contact}</p>
                             </div>
                             <Badge variant={client.status === 'Active' ? 'default' : 'secondary'} className={client.status === 'Active' ? 'bg-green-500/80' : ''}>{client.status}</Badge>
                         </li>
                       ))}
                    </ul>
                     <Button className="w-full mt-4 bg-gradient-to-r from-[#6B5DF9] to-[#5CE7F4] text-white">
                        <Plus className="mr-2 h-4 w-4"/>
                        Create Client
                    </Button>
                </CardContent>
            </Card>
        </div>
        
        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/[.04] border-white/[.06]">
                <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10">
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Mode</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.slice(0, 5).map(p => (
                               <TableRow key={p.paymentId} className="border-white/10">
                                   <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                                   <TableCell>₹{p.amount.toLocaleString()}</TableCell>
                                   <TableCell>
                                       <Badge variant={p.type === 'Credit' ? 'default' : 'destructive'} className={p.type === 'Credit' ? 'bg-green-500/80' : ''}>
                                           {p.type}
                                        </Badge>
                                    </TableCell>
                                   <TableCell>{p.mode}</TableCell>
                               </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card className="bg-white/[.04] border-white/[.06]">
                <CardHeader><CardTitle>Activity Logs</CardTitle></CardHeader>
                <CardContent>
                     <ul className="space-y-3 max-h-60 overflow-y-auto">
                       {logs.map(log => (
                         <li key={log.logId} className="flex items-start gap-3 text-sm">
                             <span className="font-mono text-muted-foreground text-xs pt-1">{log.time}</span>
                             <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">{log.role}</Badge>
                                <p className="text-foreground">{log.action}: <span className="text-muted-foreground">{log.details}</span></p>
                             </div>
                         </li>
                       ))}
                    </ul>
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
            <AdminContent/>
        </PasscodeProtect>
    )
}
