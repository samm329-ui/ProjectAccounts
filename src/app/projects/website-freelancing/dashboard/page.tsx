'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, Lock, Clock, Monitor, ChevronRight, Users, ChevronDown, ArrowRight, Eye, Pencil, Trash2, AlertCircle, CheckCircle2, XCircle, Bell, TrendingUp, DollarSign, Shield } from 'lucide-react';
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
import { useFinanceStore } from '@/lib/useFinanceStore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * LAYER 1: UI LAYER (PURE DISPLAY)
 * 
 * STRICT RULES:
 * ❌ NO calculations
 * ❌ NO data fetching
 * ❌ NO local state for finance data
 * ✅ ONLY display what store provides
 */

export default function DashboardPage() {
  // === LAYER 2: GET DATA FROM STORE ===
  const {
    clients,
    payments,
    globalFinance,
    clientFinances,
    loading
  } = useFinanceStore();

  // === PREPARE VIEW DATA (FORMATTING ONLY, NO CALCULATION) ===

  // Format payments for Line Chart - last 10, reversed for chronological order
  const lineChartData = payments.slice(0, 10).map(p => ({
    date: new Date(p.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
    amount: p.amount,
    type: p.type
  })).reverse();

  // Format for Bar Chart - use pre-calculated finance data
  const barChartData = clients.map(client => {
    const finance = clientFinances.get(client.clientId);
    return {
      name: client.clientName,
      Paid: finance?.totalPaid || 0,
      Pending: finance?.pending || 0
    };
  });

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
    <div className="min-h-screen text-foreground relative overflow-x-hidden">
      {/* Mobile-only background effects (strictly < 480px equivalent via hidden md:block or similar, but using max-w-xs check isn't easy in pure Tailwind without custom breakpoints, so using mobile-only classes) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#0B0B12]">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_20%_20%,rgba(124,108,255,0.1),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(63,224,197,0.05),transparent_40%)]" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%\' height=\'100%\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      </div>

      <div className="relative z-10 p-4 pb-24 md:p-8 md:space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-0">
          <div className="flex flex-col">
            <Link href="/phases/0" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-4 md:mb-2 text-sm md:text-sm">
              <ArrowRight className="rotate-180" size={14} />
              <span className="font-medium tracking-tight">Back to Phase 0</span>
            </Link>
            <div className="flex items-center justify-between md:justify-start gap-3">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg font-headline leading-none">
                  Website Freelancing
                </h1>
                <p className="text-2xl md:text-5xl font-bold text-muted-foreground/40 md:hidden">Dashboard</p>
                <div className="hidden md:inline-flex md:items-center md:gap-3">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg font-headline">
                    <span className="text-muted-foreground font-light opacity-70 ml-2">Dashboard</span>
                  </h1>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full bg-white/5 md:hidden border border-white/10 w-10 h-10">
                <Bell size={18} className="text-white" />
              </Button>
            </div>
            <p className="text-[#6B6F85] text-sm mt-2 md:mt-1 font-medium">Overview of project finances and performance.</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
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
        <div className="grid grid-cols-2 gap-3 md:grid md:gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6 md:mt-0">
          {/* Card 1: Total Revenue */}
          <Card className="bg-gradient-to-br from-[#1A1B2E] to-[#0F1020] border-white/[0.06] backdrop-blur-xl shadow-lg md:from-[#7A5BFF]/10 md:to-[#7A5BFF]/5 md:border-[#7A5BFF]/20 overflow-hidden active:scale-95 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:pb-2">
              <CardTitle className="text-[12px] md:text-sm font-medium text-[#9AA0B4] uppercase tracking-wider md:capitalize md:tracking-normal">Total Revenue</CardTitle>
              <Lock className="h-3 w-3 md:h-4 md:w-4 text-[#7B6CFF]" />
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold text-white">₹{globalFinance.totalRevenue.toLocaleString()}</div>
              <p className="text-[10px] md:text-xs text-[#6B6F85] mt-1">Total Amount Received</p>
            </CardContent>
          </Card>

          {/* Card 2: Projected Revenue */}
          <Card className="bg-gradient-to-br from-[#1A1B2E] to-[#0F1020] border-white/[0.06] backdrop-blur-xl shadow-lg md:from-[#FFB86B]/10 md:to-[#FFB86B]/5 md:border-[#FFB86B]/20 overflow-hidden active:scale-95 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:pb-2">
              <CardTitle className="text-[12px] md:text-sm font-medium text-[#9AA0B4] uppercase tracking-wider md:capitalize md:tracking-normal">Projected Revenue</CardTitle>
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-[#F2B36D]" />
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold text-white">₹{globalFinance.projectedRevenue.toLocaleString()}</div>
              <p className="text-[10px] md:text-xs text-[#6B6F85] mt-1">Total Contract Value</p>
            </CardContent>
          </Card>

          {/* Card 3: Pending */}
          <Card className="bg-gradient-to-br from-[#1A1B2E] to-[#0F1020] border-white/[0.06] backdrop-blur-xl shadow-lg md:from-[#4FD1FF]/10 md:to-[#4FD1FF]/5 md:border-[#4FD1FF]/20 overflow-hidden active:scale-95 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:pb-2">
              <CardTitle className="text-[12px] md:text-sm font-medium text-[#9AA0B4] uppercase tracking-wider md:capitalize md:tracking-normal">Pending</CardTitle>
              <Lock className="h-3 w-3 md:h-4 md:w-4 text-[#4FD1FF]" />
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold text-white">₹{globalFinance.totalPending.toLocaleString()}</div>
              <p className="text-[10px] md:text-xs text-[#6B6F85] mt-1">Yet to receive</p>
            </CardContent>
          </Card>

          {/* Card 4: Cash Payments */}
          <Card className="bg-gradient-to-br from-[#1A1B2E] to-[#0F1020] border-white/[0.06] backdrop-blur-xl shadow-lg md:from-[#23D07A]/10 md:to-[#23D07A]/5 md:border-[#23D07A]/20 overflow-hidden active:scale-95 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:pb-2">
              <CardTitle className="text-[12px] md:text-sm font-medium text-[#9AA0B4] uppercase tracking-wider md:capitalize md:tracking-normal">Cash Payments</CardTitle>
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-[#23D07A]" />
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold text-white">₹{globalFinance.totalCash.toLocaleString()}</div>
              <p className="text-[10px] md:text-xs text-[#6B6F85] mt-1">Cash received from clients</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="space-y-4 md:space-y-0 md:grid md:gap-6 md:grid-cols-2 mt-8 md:mt-0">
          {/* Line Chart */}
          <div className="bg-gradient-to-br from-[#1A1B2E] to-[#0F1020] border border-white/[0.06] p-5 rounded-2xl shadow-xl md:panel md:min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base md:text-lg font-semibold text-white">Payments Overview</h3>
            </div>
            <div className="h-[200px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7C6CFF" />
                      <stop offset="100%" stopColor="#3FE0C5" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B6F85', fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B6F85', fontSize: 10 }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A1B2E', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="url(#lineColor)"
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 6, fill: '#7C6CFF', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4 justify-center">
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-[#9AA0B4]">
                <span className="w-2 h-2 rounded-full bg-[#7C6CFF]"></span> Advance
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-[#9AA0B4]">
                <span className="w-2 h-2 rounded-full bg-[#4FD1FF]"></span> Mid
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-[#9AA0B4]">
                <span className="w-2 h-2 rounded-full bg-[#3FE0C5]"></span> Final
              </div>
            </div>
          </div>

          {/* Stacked Bar Chart */}
          <div className="bg-gradient-to-br from-[#1A1B2E] to-[#0F1020] border border-white/[0.06] p-5 rounded-2xl shadow-xl md:panel md:min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base md:text-lg font-semibold text-white">Payment Breakdown</h3>
            </div>
            <div className="h-[200px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} barSize={40} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B6F85', fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B6F85', fontSize: 10 }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#1A1B2E', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <Bar dataKey="Paid" stackId="a" fill="#3FE0C5" radius={[0, 0, 8, 8]} fillOpacity={1} />
                  <Bar dataKey="Pending" stackId="a" fill="#F2B36D" radius={[8, 8, 0, 0]} fillOpacity={1} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4 justify-center">
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-[#9AA0B4]">
                <span className="w-2 h-2 rounded-full bg-[#3FE0C5]"></span> Paid
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-[#9AA0B4]">
                <span className="w-2 h-2 rounded-full bg-[#F2B36D]"></span> Pending
              </div>
            </div>
          </div>
        </div>

        {/* Projects Table - Card Style for Mobile */}
        <div className="space-y-4 pb-12 mt-8 md:mt-0">
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Projects</h3>

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {clients.map((client) => (
              <div key={client.clientId} className="bg-gradient-to-br from-[#1A1B2E] to-[#0F1020] border border-white/[0.06] rounded-2xl p-4 shadow-lg active:scale-[0.98] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${client.status === 'Delivered' ? 'bg-[#7C6CFF]' : 'bg-[#3FE0C5]'}`}></span>
                    <span className="font-bold text-white text-base">{client.clientName}</span>
                  </div>
                  <Badge className={`${client.status === 'Delivered' ? 'bg-[#7C6CFF]/10 text-[#7C6CFF] border-[#7C6CFF]/20' : 'bg-[#3FE0C5]/10 text-[#3FE0C5] border-[#3FE0C5]/20'} rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-tight`}>
                    {client.status || 'Active'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-white/[0.03] pt-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#6B6F85] font-medium uppercase tracking-wider">Charged</p>
                    <p className="text-sm font-bold text-white">₹{client.financials.totalValue.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#6B6F85] font-medium uppercase tracking-wider">Received</p>
                    <p className="text-sm font-bold text-[#3FE0C5]">₹{client.financials.paid.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] text-[#6B6F85] font-medium uppercase tracking-wider">Pending</p>
                    <p className="text-sm font-bold text-white/90">₹{client.financials.pending.toLocaleString()}</p>
                  </div>
                </div>

                <Link href="/projects/website-freelancing/admin" className="mt-4 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[#9AA0B4] text-xs font-bold w-full uppercase tracking-widest">
                  View Project Details
                  <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block md:panel md:overflow-hidden md:p-0">
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
                    <td className="py-4 px-6 font-medium text-green-400">₹{client.financials.paid.toLocaleString()}</td>
                    <td className="py-4 px-6 font-medium text-white/70">₹{client.financials.pending.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded text-xs border ${client.status === 'Delivered' ? 'border-[#7A5BFF]/30 text-[#7A5BFF] bg-[#7A5BFF]/10' : 'border-[#23D07A]/30 text-[#23D07A] bg-[#23D07A]/10'}`}>
                        {client.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6"></td>
                    <td className="py-4 px-6 text-right">
                      <Link href="/projects/website-freelancing/admin">
                        <Button variant="outline" size="sm" className="h-8 rounded-lg border-white/10 text-muted hover:text-white bg-transparent hover:bg-white/5">
                          View
                          <ChevronRight size={14} className="ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
        <div className="absolute inset-0 bg-[#0F1020]/80 backdrop-blur-2xl border-t border-white/[0.08]" />
        <div className="relative flex items-center justify-around h-16 px-6">
          <Link href="#" className="flex flex-col items-center gap-1 group">
            <div className="p-1 rounded-full group-active:scale-95 transition-all">
              <Monitor size={22} className="text-[#7C6CFF] drop-shadow-[0_0_8px_rgba(124,108,255,0.5)]" />
            </div>
          </Link>
          <Link href="#" className="flex flex-col items-center gap-1 group">
            <div className="p-1 rounded-full group-active:scale-95 transition-all">
              <Users size={22} className="text-[#9AA0B4]" />
            </div>
          </Link>
          <Link href="#" className="flex flex-col items-center gap-1 group relative">
            <div className="p-1 rounded-full group-active:scale-95 transition-all">
              <Bell size={22} className="text-[#9AA0B4]" />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 border border-[#0F1020]" />
            </div>
          </Link>
          <Link href="#" className="flex flex-col items-center gap-1 group">
            <div className="p-1 rounded-full group-active:scale-95 transition-all">
              <Shield size={22} className="text-[#9AA0B4]" />
            </div>
          </Link>
          <Link href="#" className="flex flex-col items-center gap-1 group">
            <div className="p-1 rounded-full group-active:scale-95 transition-all">
              <div className="w-6 h-6 rounded-full bg-[#1A1B2E] border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#9AA0B4]">JD</div>
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}
