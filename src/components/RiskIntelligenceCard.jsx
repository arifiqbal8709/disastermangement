import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldAlert, AlertTriangle, ArrowRight, BookOpen, Layers, CheckCircle2, RotateCw } from 'lucide-react';
import { api } from '../services/api';

export default function RiskIntelligenceCard({ districtId, hazardType = 'Flood', onOpenMemory }) {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssessment = () => {
    if (!districtId) return;
    setLoading(true);
    setError(null);
    api.intelligence.assessRisk(districtId, hazardType)
      .then(data => setAssessment(data))
      .catch(err => setError(err.message || 'Failed to compute risk intelligence.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssessment();
  }, [districtId, hazardType]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-pulse text-left">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-10 bg-slate-100 rounded-xl" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-left space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-xs uppercase tracking-wider text-slate-400">AI Risk Intelligence</span>
          <button type="button" onClick={fetchAssessment} className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1">
            <RotateCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs">
          {error || 'Unable to load real-time intelligence for this district.'}
        </div>
      </div>
    );
  }

  const isExtreme = assessment.riskTier === 'Extreme';
  const isHigh = assessment.riskTier === 'High';
  const isModerate = assessment.riskTier === 'Moderate';

  const badgeColor = isExtreme ? 'bg-red-600 text-white' : isHigh ? 'bg-orange-500 text-white' : isModerate ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left font-sans page-fade-in">
      
      {/* Header bar */}
      <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-[#071B33] to-[#0A2540] text-white flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-300">
            <Sparkles className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
              Gemini AI Compound Analytics
            </span>
            <h3 className="text-sm font-extrabold font-display">
              AI Multi-Hazard Risk Intelligence — {assessment.districtName}
            </h3>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${badgeColor}`}>
          {assessment.riskTier} Risk
        </span>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5 text-xs">
        
        {/* Score & Sub-scores meter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 pr-0 md:pr-3">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Composite Risk Score
            </span>
            <div className="text-3xl font-black font-display text-navy-950">
              {assessment.compositeScore}
              <span className="text-sm font-bold text-slate-400"> / 100</span>
            </div>
            <span className="text-[9.5px] font-bold text-slate-500 block mt-0.5">
              Multi-indicator index
            </span>
          </div>

          <div className="md:col-span-8 space-y-2">
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-0.5">
                <span>Hydrological Vulnerability</span>
                <span className="text-blue-700 font-extrabold">{assessment.subScores.hydrologicalVulnerability}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${assessment.subScores.hydrologicalVulnerability}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-0.5">
                <span>Structural & Plinth Vulnerability</span>
                <span className="text-amber-700 font-extrabold">{assessment.subScores.structuralVulnerability}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: `${assessment.subScores.structuralVulnerability}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-0.5">
                <span>Evacuation Route Exposure</span>
                <span className="text-rose-700 font-extrabold">{assessment.subScores.evacuationVulnerability}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-600 h-full rounded-full" style={{ width: `${assessment.subScores.evacuationVulnerability}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Key Findings */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Evidence-Based AI Risk Observations
          </span>
          <div className="space-y-1">
            {assessment.keyFindings.map((finding, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-150 rounded-lg text-slate-700 text-[11px] leading-relaxed">
                <ShieldAlert className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{finding}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Directives */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Prioritized Operational Directives
          </span>
          <div className="space-y-1.5">
            {assessment.mitigationDirectives.map((dir, idx) => (
              <div key={idx} className="p-3 bg-white border border-slate-200 hover:border-blue-300 rounded-xl space-y-1 shadow-sm transition-all">
                <div className="flex justify-between items-center text-[10px] font-black">
                  <span className="text-rose-700 uppercase tracking-wider">{dir.priority}</span>
                  <span className="text-slate-400 font-semibold">{dir.department}</span>
                </div>
                <p className="text-slate-800 font-bold text-[11px] leading-normal">
                  {dir.action}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA for Disaster Memory */}
        {onOpenMemory && (
          <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-xs">
            <span className="text-[10px] text-slate-400 font-medium">
              Cross-checked against historical disaster archives
            </span>
            <button
              type="button"
              onClick={onOpenMemory}
              className="text-purple-600 hover:text-purple-800 font-extrabold flex items-center gap-1.5 hover:underline text-[11px]"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Explore Disaster Memory & Lessons</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

