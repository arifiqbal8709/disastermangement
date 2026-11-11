import React, { useState } from 'react';
import { Activity, X, Droplets, Waves, AlertTriangle, ShieldAlert, Users, Home, Anchor, Sparkles, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { api } from '../services/api';

export default function ScenarioSimulatorModal({ isOpen, onClose, districtId, districtName, onApplyToMap }) {
  const [rainfallSurgePct, setRainfallSurgePct] = useState(50);
  const [damDischargeCumec, setDamDischargeCumec] = useState(1200);
  const [embankmentBreach, setEmbankmentBreach] = useState(false);
  const [durationHours, setDurationHours] = useState(24);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleRunSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.simulator.run({
        districtId: districtId || 'dhemaji',
        disasterType: 'Flood',
        rainfallSurgePct,
        damDischargeCumec,
        embankmentBreach,
        durationHours
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Simulation failed to compute.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRainfallSurgePct(50);
    setDamDischargeCumec(1200);
    setEmbankmentBreach(false);
    setDurationHours(24);
    setResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 page-fade-in text-left font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden text-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#071B33] to-[#0A2540] text-white flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-300">
              <Activity className="h-5 w-5 text-brand-orange-500 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
                Hydrological Prediction Sandbox
              </span>
              <h2 className="text-base font-extrabold font-display">
                What-If Disaster Scenario Simulator — {districtName || 'District'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow text-xs">
          
          {/* Simulation Parameter Controls */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-extrabold text-[11px] uppercase tracking-wider text-navy-950 flex items-center gap-1.5">
                <Waves className="h-4 w-4 text-blue-600" /> Scenario Stress Parameters
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[10px] text-slate-400 hover:text-navy-900 font-bold flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Parameter 1: Rainfall Surge */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-slate-600">Monsoon Rainfall Surge:</span>
                  <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-black">
                    +{rainfallSurgePct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="10"
                  value={rainfallSurgePct}
                  onChange={(e) => setRainfallSurgePct(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <span className="text-[9px] text-slate-400 block">Baseline: Average seasonal monsoon precipitation.</span>
              </div>

              {/* Parameter 2: Reservoir Dam Spillway Release */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-slate-600">Dam Spillway Release:</span>
                  <span className="text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded font-black">
                    {damDischargeCumec} cumec
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="200"
                  value={damDischargeCumec}
                  onChange={(e) => setDamDischargeCumec(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="text-[9px] text-slate-400 block">Hydel reservoir emergency release volume.</span>
              </div>

              {/* Parameter 3: Embankment Breach Toggle */}
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div className="space-y-0.5">
                  <span className="font-extrabold text-[11px] text-navy-950 block">Dyke / Embankment Breach</span>
                  <span className="text-[9px] text-slate-400 block">Simulate earthen dyke structural failure</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmbankmentBreach(!embankmentBreach)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    embankmentBreach 
                      ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-300' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {embankmentBreach ? 'BREACHED' : 'INTACT'}
                </button>
              </div>

              {/* Parameter 4: Duration */}
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div className="space-y-0.5">
                  <span className="font-extrabold text-[11px] text-navy-950 block">Precipitation Duration</span>
                  <span className="text-[9px] text-slate-400 block">Continuous storm event window</span>
                </div>
                <div className="flex gap-1">
                  {[12, 24, 48].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setDurationHours(h)}
                      className={`px-2.5 py-1 rounded text-[10px] font-extrabold transition-all ${
                        durationHours === h 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Run Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 transition-all shadow-md hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Computing Hydrology...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Execute AI Simulation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-xs">
              {error}
            </div>
          )}

          {/* Simulation Output Cards */}
          {result && (
            <div className="space-y-5 page-fade-in">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-navy-950 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-brand-orange-500" /> Projected Impact Analysis
                </span>
                <span className="text-[9.5px] font-mono text-slate-400 font-bold">
                  Generated at {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* 4 Stat Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                  <span className="text-[9px] text-blue-700 uppercase font-extrabold block">Flood Water Depth</span>
                  <div className="text-xl font-black text-blue-950 font-display">
                    {result.impacts.projectedFloodDepthMeters} <span className="text-xs font-bold">meters</span>
                  </div>
                  <span className="text-[8.5px] text-blue-600 font-semibold block">Max inundation depth</span>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-[9px] text-amber-700 uppercase font-extrabold block">Submerged Area</span>
                  <div className="text-xl font-black text-amber-950 font-display">
                    {result.impacts.projectedAreaSubmergedSqkm} <span className="text-xs font-bold">sq km</span>
                  </div>
                  <span className="text-[8.5px] text-amber-600 font-semibold block">Inundated terrain</span>
                </div>

                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <span className="text-[9px] text-rose-700 uppercase font-extrabold block">Population At Risk</span>
                  <div className="text-xl font-black text-rose-950 font-display">
                    {result.impacts.estimatedPopulationAtRisk.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[8.5px] text-rose-600 font-semibold block">Immediate exposure zone</span>
                </div>

                <div className={`p-3.5 border rounded-xl space-y-1 ${
                  result.impacts.isShelterDeficit ? 'bg-red-50 border-red-300 text-red-950' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}>
                  <span className="text-[9px] uppercase font-extrabold block">Shelter Demand</span>
                  <div className="text-xl font-black font-display">
                    {result.impacts.shelterDemandPct}%
                  </div>
                  <span className="text-[8.5px] font-bold block">
                    {result.impacts.isShelterDeficit ? '⚠️ DEFICIT DETECTED' : 'Adequate Capacity'}
                  </span>
                </div>
              </div>

              {/* Operational Logistics Deployment Breakdown */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Mandatory Logistics & Search Teams Deployment (NDMA Norms)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-xs font-mono font-black text-brand-orange-500 block text-lg">
                      {result.logistics.requiredNdrfTeams}
                    </span>
                    <span className="text-[9px] text-slate-300 font-bold uppercase">NDRF Squads</span>
                  </div>
                  <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-xs font-mono font-black text-blue-400 block text-lg">
                      {result.logistics.requiredRescueBoats}
                    </span>
                    <span className="text-[9px] text-slate-300 font-bold uppercase">Rescue Boats</span>
                  </div>
                  <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-xs font-mono font-black text-emerald-400 block text-lg">
                      {result.logistics.requiredReliefKits.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-slate-300 font-bold uppercase">Ration Packs</span>
                  </div>
                  <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-xs font-mono font-black text-cyan-400 block text-lg">
                      {result.logistics.drinkingWaterTankers}
                    </span>
                    <span className="text-[9px] text-slate-300 font-bold uppercase">Water Tankers</span>
                  </div>
                </div>
              </div>

              {/* Gemini AI Synthesis Directive */}
              <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-blue-900 font-extrabold text-[11px] uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>Gemini AI Tactical Preparedness Directive</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium text-[11.5px]">
                  {result.aiSimulationSummary}
                </p>
              </div>

              {/* Critical Infrastructure Risks */}
              {result.infrastructureRisks && result.infrastructureRisks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                    Infrastructure Vulnerability Alerts
                  </span>
                  <div className="space-y-1">
                    {result.infrastructureRisks.map((risk, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[10.5px]">
                        <AlertTriangle className="h-3.5 w-3.5 text-brand-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="font-semibold">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <div className="text-[10px] text-slate-400 font-medium">
            Hydrological stress testing model • Verified ASDMA / NDMA formulas
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            {result && onApplyToMap && (
              <button
                type="button"
                onClick={() => {
                  onApplyToMap(result);
                  onClose();
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Project on Disaster Map</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
