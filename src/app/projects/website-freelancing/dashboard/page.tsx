'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  Wallet,
  Activity,
  ArrowUp,
  Clock,
  ArrowRight,
  Monitor,
  Bell,
  Lock,
  Edit2,
  ChevronRight
} from 'lucide-react';
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

  // Format for Bar Chart (Mocking stacked data for demo matching reference)
  const barChartData = [
    { name: 'Food Hub', Advance: 4000, Mid: 2400, Final: 2400 },
    { name: 'Suresh Hotel', Advance: 3000, Mid: 1398, Final: 2210 },
    { name: '₹ Final', Advance: 2000, Mid: 9800, Final: 2290 },
    { name: 'Dr Mehta', Advance: 2780, Mid: 3908, Final: 2000 },
    { name: 'May 27', Advance: 1890, Mid: 4800, Final: 2181 },
  ];

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
        {/* Card 1: Revenue */}
        <div className="panel flex flex-col justify-between h-[140px] relative overflow-hidden group hover:border-[#7A5BFF]/50 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Lock size={60} />
          </div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-[#7A5BFF]/20 text-[#7A5BFF]">
              <Lock size={18} />
            </div>
            <span className="text-3xl font-bold tracking-tight">₹1,35,000</span>
          </div>
          <div>
            <p className="text-muted text-sm font-medium">Total Revenue</p>
            <p className="text-[#23D07A] text-sm font-bold flex items-center gap-1 mt-1">
              +₹65,000 <ArrowUp size={12} strokeWidth={4} />
            </p>
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="panel flex flex-col justify-between h-[140px] relative overflow-hidden hover:border-[#ffb86b]/50 transition-colors">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-[#FFB86B]/20 text-[#FFB86B]">
              <Clock size={18} />
            </div>
            <span className="text-3xl font-bold tracking-tight">₹{summary.totalPending.toLocaleString()}</span>
          </div>
          <p className="text-muted text-sm font-medium">Pending</p>
        </div>

        {/* Card 3: Status */}
        <div className="panel flex flex-col justify-between h-[140px] relative overflow-hidden hover:border-[#7A5BFF]/50 transition-colors">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-[#7A5BFF]/20 text-[#7A5BFF]">
              <Monitor size={18} />
            </div>
            <span className="text-3xl font-bold tracking-tight">₹{summary.totalReceived.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-muted text-sm font-medium">Status:</p>
            <span className="text-[#7A5BFF] text-sm font-medium">Online</span>
          </div>
        </div>

        {/* Card 4: Cash Stats */}
        <div className="panel flex flex-row items-center justify-between h-[140px] pr-6 relative overflow-hidden hover:border-[#4FD1FF]/50 transition-colors">
          <div className="h-24 w-24 relative">
            {/* Simulated Pie Chart */}
            <div className="absolute inset-0 rounded-full border-8 border-[#4FD1FF]/30 border-t-[#4FD1FF] rotate-45"></div>
          </div>
          <div className="text-right z-10">
            <span className="text-3xl font-bold tracking-tight block">₹950,000</span>
            <p className="text-muted text-sm mb-1">Cash</p>
            <div className="flex items-center justify-end gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#23D07A]"></span>
              <span className="text-[#23D07A]">Cash ₹0,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Line Chart */}
        <div className="panel min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Payments Overview</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10"><Edit2 size={12} className="text-muted" /></Button>
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
                <Bar dataKey="Advance" stackId="a" fill="#7A5BFF" radius={[0, 0, 4, 4]} fillOpacity={0.8} />
                <Bar dataKey="Mid" stackId="a" fill="#4FD1FF" fillOpacity={0.8} />
                <Bar dataKey="Final" stackId="a" fill="#23D07A" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              </BarChart>
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
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="w-2 h-2 rounded-full bg-[#23D07A]"></span> Cash
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
