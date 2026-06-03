'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, Lead, LeadDetail, BehavioralEvent } from '../../services/api';
import {
  Search,
  Filter,
  ArrowUpDown,
  Building,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  X,
  Plus,
  Flame,
  Sparkles,
  Shield,
  Activity,
  Trash2,
  CheckCircle,
  FileText
} from 'lucide-react';

function LeadsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSelectedId = searchParams.get('selectedId');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');

  // Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer State
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(
    initialSelectedId ? parseInt(initialSelectedId) : null
  );
  const [leadDetail, setLeadDetail] = useState<LeadDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Quick event simulation in drawer state
  const [simEventType, setSimEventType] = useState('page_visit');
  const [simEventDetails, setSimEventDetails] = useState('');
  const [loggingEvent, setLoggingEvent] = useState(false);

  // Load Leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await api.getLeads({
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setLeads(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch leads. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly to avoid excessive API requests
    const delayDebounce = setTimeout(() => {
      fetchLeads();
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  // Load lead detail when ID is selected
  useEffect(() => {
    if (selectedLeadId !== null) {
      const fetchDetail = async () => {
        try {
          setLoadingDetail(true);
          const data = await api.getLead(selectedLeadId);
          setLeadDetail(data);
        } catch (err) {
          console.error(err);
          setSelectedLeadId(null);
        } finally {
          setLoadingDetail(false);
        }
      };
      fetchDetail();
    } else {
      setLeadDetail(null);
    }
  }, [selectedLeadId]);

  // Handle status update inside drawer
  const handleStatusChange = async (newStatus: string) => {
    if (!leadDetail) return;
    try {
      const updated = await api.updateLead(leadDetail.id, { status: newStatus });
      setLeadDetail(prev => prev ? { ...prev, status: updated.status } : null);
      // Refresh lead list
      fetchLeads();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Handle lead deletion
  const handleDeleteLead = async (leadId: number) => {
    if (!confirm('Are you sure you want to delete this lead? This will erase all history.')) return;
    try {
      await api.deleteLead(leadId);
      if (selectedLeadId === leadId) setSelectedLeadId(null);
      fetchLeads();
    } catch (err: any) {
      alert('Deletion failed: ' + err.message);
    }
  };

  // Handle logging a quick simulated event in drawer
  const handleLogEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadDetail || !simEventDetails.trim()) return;
    
    try {
      setLoggingEvent(true);
      await api.logLeadEvent(leadDetail.id, {
        event_type: simEventType,
        event_details: simEventDetails
      });
      // Clear input
      setSimEventDetails('');
      // Reload lead details (will update score, category, timeline)
      const data = await api.getLead(leadDetail.id);
      setLeadDetail(data);
      // Refresh lead list
      fetchLeads();
    } catch (err: any) {
      alert('Event log failed: ' + err.message);
    } finally {
      setLoggingEvent(false);
    }
  };

  const closeDrawer = () => {
    setSelectedLeadId(null);
    setLeadDetail(null);
    // Clear search param
    if (initialSelectedId) {
      router.push('/leads');
    }
  };

  return (
    <div className="space-y-6 relative min-h-[70vh]">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          Leads Directory
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Search, filter, and drill down into customer interactions, demographic properties, and qualification details.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-zinc-900/30 p-4 rounded-xl border border-zinc-800">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search name, email, company, title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-150 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-2 relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-indigo-500/50 appearance-none transition-colors"
          >
            <option value="">All Categories</option>
            <option value="Hot">🔥 Hot</option>
            <option value="Warm">⚡ Warm</option>
            <option value="Cold">❄️ Cold</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-2 relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-indigo-500/50 appearance-none transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Unqualified">Unqualified</option>
          </select>
        </div>

        {/* Sort Field */}
        <div className="md:col-span-2 relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-indigo-500/50 appearance-none transition-colors"
          >
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="company">Sort by Company</option>
            <option value="created_at">Sort by Date</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="md:col-span-2 relative">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-indigo-500/50 appearance-none transition-colors"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Grid of Leads */}
      {loading && leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <p className="text-zinc-500 text-xs font-medium">Scanning directory...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl">
          <p className="text-zinc-500 text-sm">No leads match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead) => {
            const isHot = lead.category === 'Hot';
            const isWarm = lead.category === 'Warm';
            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className={`cursor-pointer group flex flex-col justify-between p-5 rounded-xl border ${
                  selectedLeadId === lead.id 
                    ? 'border-indigo-500 bg-indigo-950/10 shadow-lg shadow-indigo-500/5' 
                    : 'border-zinc-800 bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-zinc-700/80'
                } transition-all duration-200 hover:-translate-y-0.5`}
              >
                <div className="space-y-4">
                  {/* Title Block */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {lead.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]">{lead.job_role}</span>
                      </div>
                    </div>

                    {/* Score Indicator Badge */}
                    <div className={`px-2.5 py-1.5 rounded-lg border font-bold text-sm text-center min-w-[40px] flex flex-col justify-center ${
                      isHot 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : isWarm 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : 'bg-zinc-800 text-zinc-400 border-zinc-800'
                    }`}>
                      <span className="text-[8px] text-zinc-500 font-semibold uppercase tracking-wider leading-none">score</span>
                      <span className="mt-0.5 leading-none">{lead.score}</span>
                    </div>
                  </div>

                  {/* Company & Industry */}
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-zinc-850 pt-3">
                    <div className="space-y-0.5">
                      <span className="text-zinc-500 block text-[9px] uppercase tracking-wider font-semibold">Company</span>
                      <span className="text-zinc-300 font-medium truncate block flex items-center gap-1">
                        <Building className="w-3 h-3 text-zinc-500" />
                        {lead.company}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-zinc-500 block text-[9px] uppercase tracking-wider font-semibold">Industry</span>
                      <span className="text-zinc-300 font-medium truncate block">{lead.industry}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Badges */}
                <div className="mt-5 flex items-center justify-between border-t border-zinc-850 pt-3 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-semibold ${
                      isHot 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse-ring' 
                        : isWarm 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {lead.category.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-350 border border-zinc-700">
                      {lead.status}
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLead(lead.id);
                    }}
                    className="p-1 rounded text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Side Slide-Over Drawer */}
      {selectedLeadId !== null && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay background */}
          <div 
            onClick={closeDrawer}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          ></div>
          
          {/* Drawer content panel */}
          <div className="relative w-full max-w-lg bg-zinc-900 border-l border-zinc-800 h-full shadow-2xl flex flex-col justify-between z-10 animate-slideIn">
            {/* Drawer Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md sticky top-0">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Lead Profile & History</span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {loadingDetail ? 'Loading details...' : leadDetail?.name}
                </h2>
              </div>
              <button 
                onClick={closeDrawer}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white border border-zinc-750 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetail && !leadDetail ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                  <p className="text-zinc-500 text-xs">Fetching prospect timeline...</p>
                </div>
              ) : leadDetail ? (
                <>
                  {/* Visual Scoring Banner */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    leadDetail.category === 'Hot'
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : leadDetail.category === 'Warm'
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : 'bg-zinc-800/10 border-zinc-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        leadDetail.category === 'Hot'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : leadDetail.category === 'Warm'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {leadDetail.category === 'Hot' ? <Flame className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Category Status</span>
                        <h4 className={`text-sm font-bold ${
                          leadDetail.category === 'Hot'
                            ? 'text-emerald-400'
                            : leadDetail.category === 'Warm'
                              ? 'text-amber-400'
                              : 'text-zinc-400'
                        }`}>
                          {leadDetail.category} Lead
                        </h4>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Score</span>
                      <div className="text-2xl font-black text-white">{leadDetail.score}</div>
                    </div>
                  </div>

                  {/* Core Attributes */}
                  <div className="space-y-3 bg-zinc-950/30 p-4 rounded-xl border border-zinc-850">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Contact & Company Info</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs mt-3">
                      <div>
                        <span className="text-zinc-500 block">Email Address</span>
                        <a href={`mailto:${leadDetail.email}`} className="text-indigo-400 hover:underline flex items-center gap-1 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-zinc-500" />
                          {leadDetail.email}
                        </a>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Phone</span>
                        <span className="text-zinc-300 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-zinc-500" />
                          {leadDetail.phone || 'Not provided'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Company Name</span>
                        <span className="text-zinc-300 flex items-center gap-1 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-zinc-500" />
                          {leadDetail.company}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Company Size</span>
                        <span className="text-zinc-300 mt-0.5 block">{leadDetail.company_size} Employees</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Job Role</span>
                        <span className="text-zinc-300 mt-0.5 block">{leadDetail.job_role}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Created At</span>
                        <span className="text-zinc-300 mt-0.5 block flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          {new Date(leadDetail.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Pipeline Editor */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Sales Pipeline Status</label>
                    <select
                      value={leadDetail.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 appearance-none transition-colors"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Unqualified">Unqualified</option>
                    </select>
                  </div>

                  {/* Log Action Simulator */}
                  <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/30 space-y-3">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5 text-indigo-400" />
                      Simulate Action for Lead
                    </h3>
                    <form onSubmit={handleLogEvent} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={simEventType}
                          onChange={(e) => setSimEventType(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-350"
                        >
                          <option value="page_visit">Page Visit</option>
                          <option value="form_submission">Form Submit</option>
                          <option value="resource_download">Resource Download</option>
                          <option value="email_open">Email Open</option>
                        </select>
                        <input
                          type="text"
                          placeholder="e.g., /pricing, Request Demo"
                          value={simEventDetails}
                          onChange={(e) => setSimEventDetails(e.target.value)}
                          required
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loggingEvent}
                        className="w-full bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-xs py-2 rounded-lg transition-colors"
                      >
                        {loggingEvent ? 'Saving interaction...' : 'Trigger Interaction'}
                      </button>
                    </form>
                  </div>

                  {/* Scoring Timeline */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      Behavioral Timeline
                    </h3>
                    
                    {leadDetail.events.length === 0 ? (
                      <p className="text-zinc-500 text-xs italic py-4">No behavioral interactions recorded yet.</p>
                    ) : (
                      <div className="relative border-l border-zinc-800 ml-2.5 pl-4 space-y-4">
                        {leadDetail.events.map((event) => {
                          const isPos = event.score_delta > 0;
                          const isNeg = event.score_delta < 0;
                          return (
                            <div key={event.id} className="relative text-xs">
                              {/* Timeline bullet */}
                              <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${
                                isPos ? 'bg-emerald-500' : isNeg ? 'bg-rose-500' : 'bg-zinc-600'
                              } border border-zinc-900`}></span>
                              
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <span className="font-semibold text-white block capitalize">{event.event_type.replace('_', ' ')}</span>
                                  <span className="text-zinc-400 text-[11px] block mt-0.5">{event.event_details}</span>
                                </div>
                                <div className="text-right">
                                  <span className={`font-bold ${isPos ? 'text-emerald-400' : isNeg ? 'text-rose-400' : 'text-zinc-500'}`}>
                                    {isPos ? `+${event.score_delta}` : event.score_delta} pts
                                  </span>
                                  <span className="text-zinc-650 text-[9px] block mt-0.5">
                                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
            
            {/* Drawer Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/40 flex justify-between items-center text-[10px] text-zinc-500">
              <span>System ID: #{leadDetail?.id}</span>
              <span>Updated: {leadDetail ? new Date(leadDetail.updated_at).toLocaleTimeString() : ''}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Leads() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
        <p className="text-zinc-400 text-sm font-medium animate-pulse">Initializing leads database...</p>
      </div>
    }>
      <LeadsContent />
    </Suspense>
  );
}
