'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, Lock, Clock, Monitor, ChevronRight, Users, ChevronDown, ArrowRight, Eye, Pencil, Trash2, AlertCircle, CheckCircle2, XCircle, Bell, TrendingUp, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts';
import { getSummary, getPayments, getClients } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryData, paymentsData, clientsData] = await Promise.all([
          getSummary(),
          getPayments(),
          getClients()
        ]);
        setSummary(summaryData);
        setPayments(paymentsData);
        // Filter formatting for table
        setClients(clientsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Format payments for Line Chart
  const lineChartData = payments.slice(0, 10).map(p => ({
    date: new Date(p.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
    amount: p.amount,
    type: p.type
  })).reverse();

  // Format for Bar Chart
  const barChartData = clients.map(c => ({
    name: c.clientName,
    Paid: c.financials.paid,
    Pending: c.financials.pending
  }));

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <Skeleton className="h-20 w-full bg-white/5" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 bg-white/5 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 w-full bg-white/5 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-foreground p-6 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/phases/0" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-2 text-sm">
            <ArrowRight className="rotate-180" size={14} />
            Back to Phase 0
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg font-headline">
              Website Freelancing <span className="text-muted-foreground font-light opacity-70">Dashboard</span>
            </h1>
          </div>
          <p className="text-muted text-sm mt-1">Overview of project finances and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 backdrop-blur-md shadow-lg">
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
            <span className="text-sm font-medium">View Only</span>
            <ChevronRight size={14} className="rotate-90 text-muted-foreground" />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10 border border-white/10 w-10 h-10">
            <Bell size={18} />
          </Button>
        </div>
      </header>

      {/* Metric Cards Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Revenue */}
        <Card className="bg-gradient-to-br from-[#7A5BFF]/10 to-[#7A5BFF]/5 border-[#7A5BFF]/20 hover:shadow-[0_0_30px_rgba(122,91,255,0.3)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <Lock className="h-4 w-4 text-[#7A5BFF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{summary?.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Projected Revenue - Pending</p>
          </CardContent>
        </Card>

        {/* Card 2: Projected Revenue */}
        <Card className="bg-gradient-to-br from-[#FFB86B]/10 to-[#FFB86B]/5 border-[#FFB86B]/20 hover:shadow-[0_0_30px_rgba(255,184,107,0.3)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projected Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#FFB86B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{summary?.projectedRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All Projects Total Value</p>
          </CardContent>
        </Card>

        {/* Card 3: Pending */}
        <Card className="bg-gradient-to-br from-[#4FD1FF]/10 to-[#4FD1FF]/5 border-[#4FD1FF]/20 hover:shadow-[0_0_30px_rgba(79,209,255,0.3)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Lock className="h-4 w-4 text-[#4FD1FF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{summary?.totalPending?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Yet to receive</p>
          </CardContent>
        </Card>

        {/* Card 4: Cash Payments */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#23D07A] to-[#4FD1FF] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
          <Card className="relative bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cash Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-[#23D07A]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#23D07A] to-[#4FD1FF] bg-clip-text text-transparent">
                ₹{summary?.totalCash?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Cash received from clients</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Line Chart */}
        <div className="panel min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Payments Overview</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <defs>
                  <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7A5BFF" />
                    <stop offset="100%" stopColor="#4FD1FF" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#BFC4D6', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#BFC4D6', fontSize: 12 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0710', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="url(#lineColor)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0B0710', stroke: '#4FD1FF', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#4FD1FF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="w-2 h-2 rounded-full bg-[#7A5BFF]"></span> Advance
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="w-2 h-2 rounded-full bg-[#4FD1FF]"></span> Mid
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="w-2 h-2 rounded-full bg-[#23D07A]"></span> Final
            </div>
          </div>
        </div>

        {/* Stacked Bar Chart */}
        <div className="panel min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Payment Breakdown</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#BFC4D6', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#BFC4D6', fontSize: 12 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#0B0710', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <Bar dataKey="Paid" stackId="a" fill="#23D07A" radius={[0, 0, 4, 4]} fillOpacity={0.8} />
                <Bar dataKey="Pending" stackId="a" fill="#FFB86B" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="w-2 h-2 rounded-full bg-[#23D07A]"></span> Paid
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="w-2 h-2 rounded-full bg-[#FFB86B]"></span> Pending
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white">Projects</h3>
        <div className="panel overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="py-4 px-6 font-medium text-muted">Client</th>
                <th className="py-4 px-6 font-medium text-muted">Total Charged</th>
                <th className="py-4 px-6 font-medium text-muted">Received</th>
                <th className="py-4 px-6 font-medium text-muted">Pending</th>
                <th className="py-4 px-6 font-medium text-muted">Status</th>
                <th className="py-4 px-6 font-medium text-muted">Projects</th>
                <th className="py-4 px-6 font-medium text-muted text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.map((client) => (
                <tr key={client.clientId} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${client.status === 'Delivered' ? 'bg-[#7A5BFF]' : 'bg-[#23D07A]'}`}></span>
                      <span className="font-medium text-white text-base">{client.clientName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium">₹{client.financials.totalValue.toLocaleString()}</td>
                  <td className="py-4 px-6 font-medium">₹{client.financials.paid.toLocaleString()}</td>
                  <td className="py-4 px-6 font-medium text-white/70">₹{client.financials.pending.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <span className={`chip ${client.status === 'Delivered' ? 'chip-delivered' : 'chip-active'}`}>
                      {client.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-4 px-6"></td>
                  <td className="py-4 px-6 text-right">
                    <Button variant="outline" size="sm" className="h-8 rounded-lg border-white/10 text-muted hover:text-white bg-transparent hover:bg-white/5">
                      View
                      <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
