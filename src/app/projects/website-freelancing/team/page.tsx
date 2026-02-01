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

const TeamContent = () => {
    const [ledger, setLedger] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [ledgerData, clientsData] = await Promise.all([
                    getTeamLedger('member_1'),
                    getClients(),
                ]);
                setLedger(ledgerData);
                setClients(clientsData);
            } catch (error) {
                console.error("Failed to fetch team data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">Team Ledger</h1>
             <Badge variant="outline" className="border-accent text-accent">Team Access</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Card className="bg-white/[.04] border-white/[.06]">
                    <CardHeader>
                        <CardTitle>Add Ledger Entry</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Label htmlFor="project-select">Project/Client</Label>
                           <Select>
                               <SelectTrigger id="project-select" className="bg-black/20">
                                   <SelectValue placeholder="Select a project" />
                               </SelectTrigger>
                               <SelectContent>
                                   {clients.map(c => (
                                       <SelectItem key={c.clientId} value={c.clientId}>{c.clientName}</SelectItem>
                                   ))}
                               </SelectContent>
                           </Select>
                        </div>
                         <div className="space-y-2">
                           <Label htmlFor="amount">Amount</Label>
                           <Input id="amount" type="number" placeholder="e.g., 500" className="bg-black/20"/>
                        </div>
                         <div className="space-y-2">
                           <Label htmlFor="type">Type</Label>
                            <Select>
                               <SelectTrigger id="type" className="bg-black/20">
                                   <SelectValue placeholder="Given or Spent" />
                               </SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="given">Given by Admin</SelectItem>
                                   <SelectItem value="spent">Spent on Project</SelectItem>
                               </SelectContent>
                           </Select>
                        </div>
                         <div className="space-y-2">
                           <Label htmlFor="reason">Reason</Label>
                           <Input id="reason" placeholder="e.g., Domain renewal" className="bg-black/20"/>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-[#6B5DF9] to-[#5CE7F4] text-white">Add Entry</Button>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card className="bg-white/[.04] border-white/[.06]">
                     <CardHeader>
                        <CardTitle>Your Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10">
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Reason</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {ledger.map(entry => (
                                <TableRow key={entry.entryId} className="border-white/10">
                                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                    <TableCell className={entry.type === 'given' ? 'text-green-400' : 'text-red-400'}>
                                        {entry.type === 'given' ? '+' : '-'}₹{entry.amount.toLocaleString()}
                                    </TableCell>
                                     <TableCell>
                                         <Badge variant="outline" className={entry.type === 'given' ? 'text-green-400 border-green-400/50' : 'text-red-400 border-red-400/50'}>
                                             {entry.type}
                                         </Badge>
                                     </TableCell>
                                    <TableCell>{entry.reason}</TableCell>
                                </TableRow>
                           ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
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
