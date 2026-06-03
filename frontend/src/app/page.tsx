'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, DashboardStats } from '../services/api';
import { 
  Users, 
  Flame, 
  Sparkles, 
  Activity, 
  ArrowUpRight, 
  RotateCcw, 
  ChevronRight, 
  TrendingUp,
  Briefcase,
  Building,
  Target
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch dashboard statistics. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await api.seedDatabase();
      await fetchStats();
    } catch (err: any) {
      alert('Seeding failed: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
        <p className="text-zinc-400 text-sm font-medium animate-pulse">Loading dashboard telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto px-4">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
          <Activity className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-100 mb-2">Connection Error</h3>
        <p className="text-zinc-400 text-sm mb-6">{error}</p>
        <div className="flex gap-4">
          <button 
            onClick={fetchStats}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-medium rounded-lg transition-all"
          >
            Retry Connection
          </button>
          <button 
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-sm font-medium rounded-lg transition-all flex items-center gap-2"
          >
            {seeding ? 'Initializing...' : 'Initialize & Seed Database'}
          </button>
        </div>
      </div>
    );
  }

  const hotCount = stats?.category_counts.hot || 0;
  const warmCount = stats?.category_counts.warm || 0;
  const coldCount = stats?.category_counts.cold || 0;
  const totalCount = stats?.total_leads || 0;

  // Percentage calculations
  const hotPct = totalCount > 0 ? (hotCount / totalCount) * 100 : 0;
  const warmPct = totalCount > 0 ? (warmCount / totalCount) * 100 : 0;
  const coldPct = totalCount > 0 ? (coldCount / totalCount) * 100 : 0;

  // Filter out hot leads for the priority queue
  const recentActivity = stats?.recent_activity || [];
  
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Sales Intelligence Dashboard
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time pipeline analytics, lead behavioral profiles, and hot list prioritization.
          </p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white rounded-lg shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
          {seeding ? 'Rebuilding Database...' : 'Re-seed Demo Data'}
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Leads */}
        <div className="relative group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-sm transition-all duration-300 hover:bg-zinc-900/70 hover:border-zinc-700/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Leads</span>
            <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors duration-300">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-white">{totalCount}</span>
            <p className="text-zinc-500 text-xs mt-1">Captured across all campaigns</p>
          </div>
        </div>

        {/* Card 2: Hot Leads */}
        <div className="relative group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-sm transition-all duration-300 hover:bg-zinc-900/70 hover:border-emerald-500/30 glow-emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hot Leads</span>
            <div className="p-2 rounded-lg bg-zinc-800 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-300 animate-pulse-ring transition-colors duration-300">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-emerald-400">{hotCount}</span>
            <p className="text-zinc-500 text-xs mt-1">Ready for direct sales outreach</p>
          </div>
        </div>

        {/* Card 3: Warm Leads */}
        <div className="relative group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-sm transition-all duration-300 hover:bg-zinc-900/70 hover:border-amber-500/30 glow-amber">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Warm Leads</span>
            <div className="p-2 rounded-lg bg-zinc-800 text-amber-400 group-hover:bg-amber-500/10 group-hover:text-amber-300 transition-colors duration-300">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-amber-400">{warmCount}</span>
            <p className="text-zinc-500 text-xs mt-1">Nurturing & email drip active</p>
          </div>
        </div>

        {/* Card 4: Avg Score */}
        <div className="relative group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-sm transition-all duration-300 hover:bg-zinc-900/70 hover:border-indigo-500/30 glow-indigo">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Avg Quality Score</span>
            <div className="p-2 rounded-lg bg-zinc-800 text-indigo-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-300 transition-colors duration-300">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-white">{stats?.average_score || 0}</span>
            <p className="text-zinc-500 text-xs mt-1">Average lead value metric</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown (Donut Chart representation) */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 tracking-tight">Qualification Breakdown</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Distribution of lead categories</p>
          </div>

          <div className="my-6 flex justify-center items-center relative h-36">
            {/* Visual SVG Donut Chart */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="50"
                className="stroke-zinc-800 fill-transparent"
                strokeWidth="10"
              />
              {/* Hot segment */}
              <circle
                cx="64"
                cy="64"
                r="50"
                className="stroke-emerald-500 fill-transparent transition-all duration-500"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - hotPct / 100)}`}
              />
              {/* Warm segment */}
              <circle
                cx="64"
                cy="64"
                r="50"
                className="stroke-amber-500 fill-transparent transition-all duration-500"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - warmPct / 100)}`}
                style={{ transform: `rotate(${hotPct * 3.6}deg)`, transformOrigin: '64px 64px' }}
              />
              {/* Cold segment */}
              <circle
                cx="64"
                cy="64"
                r="50"
                className="stroke-zinc-500 fill-transparent transition-all duration-500"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - coldPct / 100)}`}
                style={{ transform: `rotate(${(hotPct + warmPct) * 3.6}deg)`, transformOrigin: '64px 64px' }}
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-extrabold text-white">{totalCount}</span>
              <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Leads</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Hot Leads</span>
              </div>
              <span className="font-semibold text-white">{hotCount} ({Math.round(hotPct)}%)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Warm Leads</span>
              </div>
              <span className="font-semibold text-white">{warmCount} ({Math.round(warmPct)}%)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-500"></span>
                <span>Cold Leads</span>
              </div>
              <span className="font-semibold text-white">{coldCount} ({Math.round(coldPct)}%)</span>
            </div>
          </div>
        </div>

        {/* Pipeline Stage Distribution */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-6 flex flex-col justify-between lg:col-span-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 tracking-tight">Sales Pipeline Stages</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Leads status tracking</p>
          </div>

          <div className="my-6 space-y-4 flex-1 flex flex-col justify-center">
            {/* New Stage */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-medium">New (Uncontacted)</span>
                <span className="font-bold text-zinc-200">{stats?.status_counts.new || 0}</span>
              </div>
              <div className="w-full bg-zinc-800/50 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${totalCount > 0 ? ((stats?.status_counts.new || 0) / totalCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Contacted Stage */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-medium">In Contact / In Progress</span>
                <span className="font-bold text-zinc-200">{stats?.status_counts.contacted || 0}</span>
              </div>
              <div className="w-full bg-zinc-800/50 rounded-full h-2">
                <div 
                  className="bg-sky-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${totalCount > 0 ? ((stats?.status_counts.contacted || 0) / totalCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Qualified Stage */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-medium">Sales Qualified (SQL)</span>
                <span className="font-bold text-zinc-200">{stats?.status_counts.qualified || 0}</span>
              </div>
              <div className="w-full bg-zinc-800/50 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${totalCount > 0 ? ((stats?.status_counts.qualified || 0) / totalCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Unqualified Stage */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-medium">Unqualified / Dead End</span>
                <span className="font-bold text-zinc-200">{stats?.status_counts.unqualified || 0}</span>
              </div>
              <div className="w-full bg-zinc-800/50 rounded-full h-2">
                <div 
                  className="bg-zinc-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${totalCount > 0 ? ((stats?.status_counts.unqualified || 0) / totalCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800/60 pt-4 flex justify-between items-center text-xs text-zinc-400">
            <span>Conversion Target: <span className="text-emerald-400 font-bold">25% SQL</span></span>
            <span>Current SQL rate: <span className="text-white font-bold">{totalCount > 0 ? Math.round(((stats?.status_counts.qualified || 0) / totalCount) * 100) : 0}%</span></span>
          </div>
        </div>
      </div>

      {/* Bottom Queue & Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales Priority Queue (Hot Leads List) - 7 cols */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-6 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-zinc-250 tracking-tight flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Priority Follow-Up List
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">High quality SQL prospects requiring outreach</p>
              </div>
              <Link 
                href="/leads?category=Hot" 
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5 hover:underline"
              >
                View All Hot
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Simulated API data loaded for priority queue */}
            <div className="mt-6 space-y-4">
              {/* Let's load leads from API: since we can't easily query lead list separately in this dashboard stats schema, we will instruct the user to click Leads Hub, OR we can fetch leads in dashboard to display the top 4 hot leads here. Yes, let's fetch leads using api.getLeads and filter them. Let's do that! */}
              <HotLeadsList />
            </div>
          </div>
        </div>

        {/* Live Activity Ticker - 5 cols */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-6 lg:col-span-5 flex flex-col">
          <div>
            <h3 className="text-sm font-bold text-zinc-250 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
              Recent Prospect Activity
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Real-time website interactions & events</p>
          </div>

          <div className="mt-6 flex-1 overflow-y-auto max-h-[340px] pr-2 space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-zinc-500 text-xs italic text-center py-8">No recent events logged. Try simulated interactions in the Playground.</p>
            ) : (
              recentActivity.map((activity) => {
                const isPositive = activity.score_delta > 0;
                const isNegative = activity.score_delta < 0;
                
                // Format relative time
                const eventTime = new Date(activity.timestamp);
                const timeString = eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={activity.id} className="flex gap-3 text-xs border-b border-zinc-800/30 pb-3 last:border-0 last:pb-0">
                    <div className="mt-0.5">
                      {isPositive ? (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                      ) : isNegative ? (
                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50"></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-zinc-500"></div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-zinc-300">
                        <span className="font-semibold text-white">{activity.lead_name}</span>{' '}
                        {activity.event_details}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                        <span>{timeString}</span>
                        <span>•</span>
                        <span className={`font-semibold ${isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-zinc-400'}`}>
                          {isPositive ? `+${activity.score_delta}` : activity.score_delta} pts
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inner Component to load priority hot leads
function HotLeadsList() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHotLeads = async () => {
      try {
        const data = await api.getLeads({ category: 'Hot', sort_by: 'score', sort_order: 'desc' });
        setLeads(data.slice(0, 4)); // Show top 4
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadHotLeads();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-16 w-full bg-zinc-800/20 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-zinc-800 rounded-lg">
        <p className="text-zinc-500 text-xs">No Hot leads available right now.</p>
        <Link 
          href="/simulator" 
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-2 inline-block hover:underline"
        >
          Go simulate a lead interaction &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <div 
          key={lead.id} 
          className="group/item flex items-center justify-between p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/10 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex flex-col items-center justify-center font-bold text-indigo-400">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none">score</span>
              <span className="text-sm font-extrabold text-white mt-0.5 leading-none">{lead.score}</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover/item:text-indigo-400 transition-colors">{lead.name}</h4>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {lead.job_role}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {lead.company}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              HOT
            </span>
            <Link 
              href={`/leads?selectedId=${lead.id}`}
              className="p-1.5 rounded-lg bg-zinc-850 hover:bg-indigo-650 hover:text-white border border-zinc-800 hover:border-indigo-600 text-zinc-400 transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
