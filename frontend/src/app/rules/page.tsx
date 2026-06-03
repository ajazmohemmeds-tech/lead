'use client';

import { useEffect, useState } from 'react';
import { api, ScoringRule, ScoringRuleCreate } from '../../services/api';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Flame,
  ArrowUpRight,
  User,
  Activity
} from 'lucide-react';

export default function RulesManager() {
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New Rule Form State
  const [newRule, setNewRule] = useState<ScoringRuleCreate>({
    name: '',
    rule_type: 'demographic',
    field: 'job_role',
    operator: 'equals',
    value: '',
    points: 10,
    is_active: true
  });

  // State to track rules currently being edited or saved
  const [savingRuleId, setSavingRuleId] = useState<number | null>(null);
  const [editingPoints, setEditingPoints] = useState<{ [id: number]: number }>({});
  const [creatingRule, setCreatingRule] = useState(false);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await api.getRules();
      setRules(data);
      // Initialize edit point states
      const pointsMap: { [id: number]: number } = {};
      data.forEach(r => {
        pointsMap[r.id] = r.points;
      });
      setEditingPoints(pointsMap);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch rules list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleActive = async (rule: ScoringRule) => {
    try {
      setSavingRuleId(rule.id);
      await api.updateRule(rule.id, { is_active: !rule.is_active });
      // Update local state
      setRules(prev =>
        prev.map(r => (r.id === rule.id ? { ...r, is_active: !r.is_active } : r))
      );
    } catch (err: any) {
      alert('Failed to update rule status: ' + err.message);
    } finally {
      setSavingRuleId(null);
    }
  };

  const handlePointsChange = (ruleId: number, val: string) => {
    const num = parseInt(val);
    if (!isNaN(num)) {
      setEditingPoints(prev => ({ ...prev, [ruleId]: num }));
    } else if (val === '' || val === '-') {
      // Allow temp typing
      setEditingPoints(prev => ({ ...prev, [ruleId]: val as any }));
    }
  };

  const handleSavePoints = async (ruleId: number) => {
    const points = editingPoints[ruleId];
    if (points === undefined || isNaN(points)) return;
    try {
      setSavingRuleId(ruleId);
      await api.updateRule(ruleId, { points });
      // Refresh to make sure everything matches
      await fetchRules();
    } catch (err: any) {
      alert('Failed to save rule points: ' + err.message);
    } finally {
      setSavingRuleId(null);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this scoring rule? It will recalculate all existing leads.')) return;
    try {
      await api.deleteRule(ruleId);
      fetchRules();
    } catch (err: any) {
      alert('Failed to delete rule: ' + err.message);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name.trim() || !newRule.value.trim()) {
      alert('Please fill out all rule fields.');
      return;
    }

    try {
      setCreatingRule(true);
      await api.createRule(newRule);
      // Reset form
      setNewRule({
        name: '',
        rule_type: 'demographic',
        field: 'job_role',
        operator: 'equals',
        value: '',
        points: 10,
        is_active: true
      });
      // Refresh
      fetchRules();
    } catch (err: any) {
      alert('Failed to create rule: ' + err.message);
    } finally {
      setCreatingRule(false);
    }
  };

  // Group rules
  const demographicRules = rules.filter(r => r.rule_type === 'demographic');
  const behavioralRules = rules.filter(r => r.rule_type === 'behavioral');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          Rules Configurator
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Adjust demographic scoring criteria and behavioral event weights. Changes trigger database-wide score recalculations.
        </p>
      </div>

      {/* Database Alert Banner */}
      <div className="flex gap-3 bg-indigo-500/5 border border-indigo-500/25 p-4 rounded-xl text-xs text-zinc-300">
        <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0" />
        <div>
          <span className="font-semibold text-white">Dynamic Recalculation Alert</span>
          <p className="mt-1 text-zinc-400">
            Whenever a scoring rule is saved, added, or deleted, the background database scoring engine immediately re-evaluates all historical activities and profiles for every lead in the directory.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Rules Lists Section - 8 cols */}
        <div className="space-y-8 lg:col-span-8">
          {/* Demographic Rules List */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              Demographic Profile Rules
            </h3>
            
            {loading && rules.length === 0 ? (
              <div className="h-24 flex items-center justify-center text-xs text-zinc-500">Loading rules telemetry...</div>
            ) : demographicRules.length === 0 ? (
              <p className="text-zinc-500 text-xs italic py-2">No demographic rules configured.</p>
            ) : (
              <div className="space-y-3.5">
                {demographicRules.map(rule => (
                  <RuleRow 
                    key={rule.id}
                    rule={rule}
                    points={editingPoints[rule.id]}
                    saving={savingRuleId === rule.id}
                    onPointsChange={(val) => handlePointsChange(rule.id, val)}
                    onSavePoints={() => handleSavePoints(rule.id)}
                    onToggleActive={() => handleToggleActive(rule)}
                    onDelete={() => handleDeleteRule(rule.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Behavioral Rules List */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
              Behavioral Event Rules
            </h3>
            
            {loading && rules.length === 0 ? (
              <div className="h-24 flex items-center justify-center text-xs text-zinc-500">Loading rules telemetry...</div>
            ) : behavioralRules.length === 0 ? (
              <p className="text-zinc-500 text-xs italic py-2">No behavioral rules configured.</p>
            ) : (
              <div className="space-y-3.5">
                {behavioralRules.map(rule => (
                  <RuleRow 
                    key={rule.id}
                    rule={rule}
                    points={editingPoints[rule.id]}
                    saving={savingRuleId === rule.id}
                    onPointsChange={(val) => handlePointsChange(rule.id, val)}
                    onSavePoints={() => handleSavePoints(rule.id)}
                    onToggleActive={() => handleToggleActive(rule)}
                    onDelete={() => handleDeleteRule(rule.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Rule Panel - 4 cols */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/25 p-6 lg:col-span-4 sticky top-24">
          <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            Add Scoring Rule
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Create a custom rule constraint for qualification.</p>

          <form onSubmit={handleCreateRule} className="mt-6 space-y-4 text-xs">
            {/* Rule Name */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-semibold block">Rule Label</label>
              <input
                type="text"
                placeholder="e.g. Email Domain: Corporate Account"
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-250 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            {/* Rule Type */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-semibold block">Rule Classification</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewRule(prev => ({ ...prev, rule_type: 'demographic', field: 'job_role' }))}
                  className={`py-2 rounded-lg font-bold border transition-colors ${
                    newRule.rule_type === 'demographic'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Demographic
                </button>
                <button
                  type="button"
                  onClick={() => setNewRule(prev => ({ ...prev, rule_type: 'behavioral', field: 'event_type' }))}
                  className={`py-2 rounded-lg font-bold border transition-colors ${
                    newRule.rule_type === 'behavioral'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Behavioral
                </button>
              </div>
            </div>

            {/* Field selection */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-semibold block">Evaluate Attribute</label>
              <select
                value={newRule.field}
                onChange={(e) => setNewRule(prev => ({ ...prev, field: e.target.value }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500/50"
              >
                {newRule.rule_type === 'demographic' ? (
                  <>
                    <option value="job_role">Job Title / Role</option>
                    <option value="company_size">Company Size (Employees)</option>
                    <option value="email">Email Address</option>
                    <option value="industry">Industry</option>
                  </>
                ) : (
                  <>
                    <option value="event_type">Event Action Type (page_visit, form_submission, email_open, etc.)</option>
                    <option value="event_details">Event Label Description (pricing, whitepaper, demo)</option>
                  </>
                )}
              </select>
            </div>

            {/* Operator & Value */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">Comparison</label>
                <select
                  value={newRule.operator}
                  onChange={(e) => setNewRule(prev => ({ ...prev, operator: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="equals">Equals</option>
                  <option value="contains">Contains (comma-sep)</option>
                  <option value="greater_than">Greater than</option>
                  <option value="less_than">Less than</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">Match Value</label>
                <input
                  type="text"
                  placeholder="e.g. ceo, 100, /pricing"
                  value={newRule.value}
                  onChange={(e) => setNewRule(prev => ({ ...prev, value: e.target.value }))}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-250 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            {/* Score points */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-semibold block">Award Points (Negative allowed)</label>
              <input
                type="number"
                value={newRule.points}
                onChange={(e) => setNewRule(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-250 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={creatingRule}
              className="w-full bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" />
              {creatingRule ? 'Creating rule...' : 'Save & Active Rule'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Inner Component for individual rule row
interface RuleRowProps {
  rule: ScoringRule;
  points: number;
  saving: boolean;
  onPointsChange: (val: string) => void;
  onSavePoints: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

function RuleRow({
  rule,
  points,
  saving,
  onPointsChange,
  onSavePoints,
  onToggleActive,
  onDelete
}: RuleRowProps) {
  const pointsUnsaved = points !== rule.points;
  const isPositive = rule.points >= 0;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border ${
      rule.is_active ? 'border-zinc-800 bg-zinc-950/20' : 'border-zinc-900 bg-zinc-950/5 opacity-60'
    } transition-all`}>
      {/* Rule Definition Detail */}
      <div className="space-y-1 sm:max-w-[65%]">
        <h4 className={`font-bold text-xs ${rule.is_active ? 'text-zinc-150' : 'text-zinc-500'}`}>{rule.name}</h4>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
          <span>IF {rule.field}</span>
          <span className="text-zinc-650">{rule.operator}</span>
          <span className="text-zinc-400">"{rule.value}"</span>
        </div>
      </div>

      {/* Editor & Controls */}
      <div className="flex items-center gap-4 mt-3 sm:mt-0 justify-end">
        {/* Points input */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={points !== undefined ? points : ''}
            onChange={(e) => onPointsChange(e.target.value)}
            disabled={!rule.is_active || saving}
            className="w-14 bg-zinc-950 border border-zinc-800 disabled:opacity-50 text-center py-1 rounded text-xs text-white font-bold"
          />
          {pointsUnsaved && rule.is_active && (
            <button
              onClick={onSavePoints}
              disabled={saving}
              className="p-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Toggle Switch */}
        <button
          onClick={onToggleActive}
          disabled={saving}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          {rule.is_active ? (
            <ToggleRight className="w-7 h-7 text-indigo-500" />
          ) : (
            <ToggleLeft className="w-7 h-7 text-zinc-700" />
          )}
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          disabled={saving}
          className="p-1 rounded text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
