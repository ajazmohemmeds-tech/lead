'use client';

import { useEffect, useState } from 'react';
import { api, Lead, LeadDetail, BehavioralEvent } from '../../services/api';
import {
  UserPlus,
  Flame,
  Sparkles,
  Shield,
  Activity,
  Briefcase,
  Building,
  Globe,
  Mail,
  Zap,
  CheckCircle,
  MousePointerClick,
  Download,
  MailCheck,
  PhoneCall
} from 'lucide-react';

export default function Simulator() {
  const [leadsList, setLeadsList] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<number | string>('');
  const [activeLead, setActiveLead] = useState<LeadDetail | null>(null);
  const [loadingActive, setLoadingActive] = useState(false);

  // Form State for new lead
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    job_role: 'VP of Technology',
    company_size: 150,
    industry: 'Technology',
    phone: ''
  });
  const [creatingLead, setCreatingLead] = useState(false);
  const [scoringNotification, setScoringNotification] = useState<{ text: string; points: number } | null>(null);

  // Load leads for dropdown selection
  const fetchDropdownLeads = async () => {
    try {
      const data = await api.getLeads({ sort_by: 'name', sort_order: 'asc' });
      setLeadsList(data);
    } catch (err) {
      console.error('Failed to load dropdown leads list', err);
    }
  };

  useEffect(() => {
    fetchDropdownLeads();
  }, []);

  // Fetch active lead detail
  const fetchActiveLeadDetail = async (id: number) => {
    try {
      setLoadingActive(true);
      const data = await api.getLead(id);
      setActiveLead(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load selected lead details.');
    } finally {
      setLoadingActive(false);
    }
  };

  useEffect(() => {
    if (selectedLeadId) {
      fetchActiveLeadDetail(Number(selectedLeadId));
    } else {
      setActiveLead(null);
    }
  }, [selectedLeadId]);

  // Form submission
  const handleCreateLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.company.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      setCreatingLead(true);
      const lead = await api.createLead(formData);
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        company: '',
        job_role: 'Software Developer',
        company_size: 50,
        industry: 'Software',
        phone: ''
      });

      // Refetch dropdown list
      await fetchDropdownLeads();
      // Select the newly created lead
      setSelectedLeadId(lead.id);
    } catch (err: any) {
      alert('Failed to create lead: ' + err.message);
    } finally {
      setCreatingLead(false);
    }
  };

  // Simulate behavioral event
  const triggerSimulationEvent = async (type: string, details: string, pointsVal: number) => {
    if (!activeLead) return;
    try {
      await api.logLeadEvent(activeLead.id, {
        event_type: type,
        event_details: details
      });

      // Trigger temporary floating points notification
      setScoringNotification({ text: details, points: pointsVal });
      setTimeout(() => setScoringNotification(null), 3000);

      // Reload lead details and update dropdown leads
      const data = await api.getLead(activeLead.id);
      setActiveLead(data);
      fetchDropdownLeads();
    } catch (err: any) {
      alert('Failed to log event: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          Behavioral Simulator Playground
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Simulate customer behaviors (page clicks, form submissions, whitepapers) and watch qualification scores calculate live.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Create Lead Form - 5 cols */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-6 lg:col-span-5 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              Register New Lead
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Submit demo lead details to test the system.</p>
          </div>

          <form onSubmit={handleCreateLeadSubmit} className="space-y-4 text-xs">
            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold block">Full Name *</label>
                <input
                  type="text"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-250 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold block">Email Address *</label>
                <input
                  type="email"
                  placeholder="jsmith@corporate.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-250 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            {/* Company & Industry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold block">Company Name *</label>
                <input
                  type="text"
                  placeholder="Acme Corporation"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-250 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold block">Industry *</label>
                <input
                  type="text"
                  placeholder="Technology, Finance, etc."
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-250 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            {/* Job Title & Company Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold block">Job Title / Role</label>
                <input
                  type="text"
                  placeholder="VP of Engineering"
                  value={formData.job_role}
                  onChange={(e) => setFormData(prev => ({ ...prev, job_role: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-250 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold block">Company Size (Employees)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.company_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_size: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-250 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold block">Phone Number (Optional)</label>
              <input
                type="text"
                placeholder="+1 (555) 019-2834"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-250 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={creatingLead}
              className="w-full bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              {creatingLead ? 'Creating Lead...' : 'Create & Track Lead'}
            </button>
          </form>
        </div>

        {/* Right Column: Interaction Playground - 7 cols */}
        <div className="space-y-6 lg:col-span-7">
          {/* Lead Selector Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Select Prospect to Test</span>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-350 focus:outline-none focus:border-indigo-500/50 min-w-[200px]"
            >
              <option value="">-- Choose Existing Lead --</option>
              {leadsList.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} ({lead.company} - {lead.score} pts)
                </option>
              ))}
            </select>
          </div>

          {/* Active Lead Testing Panel */}
          {loadingActive ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
              <p className="text-zinc-500 text-xs">Loading prospect simulation environment...</p>
            </div>
          ) : activeLead ? (
            <div className="space-y-6">
              {/* Floating Point Notification (Alert style) */}
              {scoringNotification && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-lg text-xs text-emerald-400 animate-pulse">
                  <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Simulated activity logged! <span className="font-semibold text-white">"{scoringNotification.text}"</span> updated the score by <span className="font-bold">+{scoringNotification.points} points</span>.
                  </span>
                </div>
              )}

              {/* Lead Scoring Banner */}
              <div className={`p-6 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all relative overflow-hidden ${
                activeLead.category === 'Hot'
                  ? 'bg-emerald-500/5 border-emerald-500/20 glow-emerald'
                  : activeLead.category === 'Warm'
                    ? 'bg-amber-500/5 border-amber-500/20 glow-amber'
                    : 'bg-zinc-900/20 border-zinc-800'
              }`}>
                {/* Profile info summary */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Simulation Target
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">{activeLead.name}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                      {activeLead.job_role}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-zinc-500" />
                      {activeLead.company}
                    </span>
                  </div>
                </div>

                {/* Qualification Dial */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Dynamic Category</span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                      activeLead.category === 'Hot'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : activeLead.category === 'Warm'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {activeLead.category.toUpperCase()}
                    </span>
                  </div>

                  <div className={`w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center font-extrabold transition-all ${
                    activeLead.category === 'Hot'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/20'
                      : activeLead.category === 'Warm'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/20'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                  }`}>
                    <span className="text-[8px] text-zinc-500 leading-none">SCORE</span>
                    <span className="text-xl mt-0.5 leading-none">{activeLead.score}</span>
                  </div>
                </div>
              </div>

              {/* Behavior Simulation Controls */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Simulate Prospect Behavior</h3>
                <p className="text-xs text-zinc-500">Click any interaction panel below to trigger real-time actions on the website.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* Action 1: Clicks Pricing */}
                  <button
                    onClick={() => triggerSimulationEvent('page_visit', 'Visited /pricing page', 15)}
                    className="flex items-start gap-3 p-4 rounded-xl border border-zinc-850 bg-zinc-950/20 hover:bg-zinc-900/30 hover:border-zinc-750 transition-all text-left group"
                  >
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                      <MousePointerClick className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Visit Pricing Page</h4>
                      <p className="text-[10px] text-zinc-500 mt-1">High purchase intent indicator (+15 pts)</p>
                    </div>
                  </button>

                  {/* Action 2: Clicks Demo Page */}
                  <button
                    onClick={() => triggerSimulationEvent('page_visit', 'Visited /demo page', 20)}
                    className="flex items-start gap-3 p-4 rounded-xl border border-zinc-850 bg-zinc-950/20 hover:bg-zinc-900/30 hover:border-zinc-750 transition-all text-left group"
                  >
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                      <MousePointerClick className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Visit Demo Page</h4>
                      <p className="text-[10px] text-zinc-500 mt-1">Investigating product setup (+20 pts)</p>
                    </div>
                  </button>

                  {/* Action 3: Download Case Study */}
                  <button
                    onClick={() => triggerSimulationEvent('resource_download', "Downloaded 'Enterprise Case Study'", 20)}
                    className="flex items-start gap-3 p-4 rounded-xl border border-zinc-850 bg-zinc-950/20 hover:bg-zinc-900/30 hover:border-zinc-750 transition-all text-left group"
                  >
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Download Case Study</h4>
                      <p className="text-[10px] text-zinc-500 mt-1">Validating product capability (+20 pts)</p>
                    </div>
                  </button>

                  {/* Action 4: Download Whitepaper */}
                  <button
                    onClick={() => triggerSimulationEvent('resource_download', "Downloaded 'Product Whitepaper'", 15)}
                    className="flex items-start gap-3 p-4 rounded-xl border border-zinc-850 bg-zinc-950/20 hover:bg-zinc-900/30 hover:border-zinc-750 transition-all text-left group"
                  >
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Download Whitepaper</h4>
                      <p className="text-[10px] text-zinc-500 mt-1">Learning architecture & tech (+15 pts)</p>
                    </div>
                  </button>

                  {/* Action 5: Request Demo Callback */}
                  <button
                    onClick={() => triggerSimulationEvent('form_submission', 'Submitted Contact Sales callback form', 35)}
                    className="flex items-start gap-3 p-4 rounded-xl border border-zinc-850 bg-zinc-950/20 hover:bg-zinc-900/30 hover:border-zinc-750 transition-all text-left group sm:col-span-2"
                  >
                    <div className="p-2 rounded-lg bg-zinc-800 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-300 transition-colors">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Request Sales Callback</h4>
                      <p className="text-[10px] text-zinc-500 mt-1">Direct request to connect. High score value (+35 pts)</p>
                    </div>
                  </button>

                  {/* Action 6: Email Open */}
                  <button
                    onClick={() => triggerSimulationEvent('email_open', 'Opened outreach campaign email #1', 5)}
                    className="flex items-start gap-3 p-4 rounded-xl border border-zinc-850 bg-zinc-950/20 hover:bg-zinc-900/30 hover:border-zinc-750 transition-all text-left group"
                  >
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                      <MailCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Open Campaign Email</h4>
                      <p className="text-[10px] text-zinc-500 mt-1">Engagement check (+5 pts)</p>
                    </div>
                  </button>

                  {/* Action 7: Newsletter Signup */}
                  <button
                    onClick={() => triggerSimulationEvent('form_submission', 'Submitted Newsletter signup form', 5)}
                    className="flex items-start gap-3 p-4 rounded-xl border border-zinc-850 bg-zinc-950/20 hover:bg-zinc-900/30 hover:border-zinc-750 transition-all text-left group"
                  >
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                      <MailCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Newsletter Signup</h4>
                      <p className="text-[10px] text-zinc-500 mt-1">Standard interest (+5 pts)</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Timeline feed for simulated lead */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                  Prospect Activity Logs ({activeLead.events.length})
                </h3>
                
                {activeLead.events.length === 0 ? (
                  <p className="text-zinc-500 text-xs italic py-4">No behavioral interactions recorded yet. Click buttons above to trigger.</p>
                ) : (
                  <div className="relative border-l border-zinc-800 ml-2.5 pl-4 space-y-4 max-h-[220px] overflow-y-auto pr-2 text-xs">
                    {activeLead.events.map((event) => (
                      <div key={event.id} className="relative">
                        {/* timeline bullet */}
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border border-zinc-900 shadow-md"></span>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-semibold text-white block capitalize">{event.event_type.replace('_', ' ')}</span>
                            <span className="text-zinc-400 text-[11px] block mt-0.5">{event.event_details}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-400">+{event.score_delta} pts</span>
                            <span className="text-zinc-650 text-[9px] block mt-0.5">
                              {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20 p-20 flex flex-col items-center justify-center text-center">
              <Zap className="w-12 h-12 text-zinc-700 animate-pulse mb-4" />
              <h3 className="font-bold text-zinc-300">Playground Simulation Locked</h3>
              <p className="text-zinc-500 text-xs mt-1 max-w-xs">
                To test the scoring engine, create a new lead on the left, or choose an existing lead from the dropdown at the top.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
