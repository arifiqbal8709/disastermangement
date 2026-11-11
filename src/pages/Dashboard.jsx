import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ShieldAlert, AlertTriangle, AlertCircle, Map, Home, Anchor, Siren, ArrowRight, ShieldCheck, HeartPulse, Clock, Landmark, Info, FileText, Compass, Activity, CheckCircle2, ChevronRight, X, Cpu } from 'lucide-react';
import { getDistrictData } from '../data/mockData';
import SourceBadge from '../components/SourceBadge';
import { getIngestedDataset } from '../dataSources/dataIngestion';
import { api } from '../services/api';
import ScenarioSimulatorModal from '../components/ScenarioSimulatorModal';
import DisasterMemoryModal from '../components/DisasterMemoryModal';
import RiskIntelligenceCard from '../components/RiskIntelligenceCard';
import { Waves, BookOpen, Sparkles } from 'lucide-react';

const getMetricIcon = (name) => {
  switch (name) {
    case 'Warning System':
      return <Siren className="h-5 w-5 text-blue-600" />;
    case 'Shelter Capacity':
      return <Home className="h-5 w-5 text-green-600" />;
    case 'Evacuation Routes':
      return <Compass className="h-5 w-5 text-indigo-600" />;
    case 'Medical Resources':
      return <HeartPulse className="h-5 w-5 text-red-600" />;
    default:
      return <Info className="h-5 w-5 text-slate-400" />;
  }
};

export default function Dashboard({ selectedDistrictId, selectedDisasterType = "Flood", setActivePage, simulationMode, showSheltersOnMap, setShowSheltersOnMap }) {
  // Query district details dynamically based on selected hazard
  const activeDistrict = getDistrictData(selectedDistrictId, selectedDisasterType);

  const isSimulating = simulationMode !== null;
  
  // Calculate stress-adjusted scores only if baseline data is present
  const hasScore = activeDistrict.preparednessScore !== null && activeDistrict.preparednessScore !== undefined;
  
  const adjustedScore = hasScore && isSimulating
    ? (simulationMode === 'severe' ? Math.max(30, activeDistrict.preparednessScore - 20)
       : simulationMode === 'moderate' ? Math.max(40, activeDistrict.preparednessScore - 10)
       : Math.max(50, activeDistrict.preparednessScore - 5))
    : activeDistrict.preparednessScore;

  const adjustedStatus = hasScore && isSimulating
    ? (simulationMode === 'severe' ? 'HIGH RISK' : 'MODERATE RISK')
    : activeDistrict.preparednessStatus;

  const [time, setTime] = useState(new Date());
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [dynamicShelterCount, setDynamicShelterCount] = useState(null);
  const [dynamicShelterCapacity, setDynamicShelterCapacity] = useState(null);

  const [latestAiAnalysis, setLatestAiAnalysis] = useState(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);

  useEffect(() => {
    setDynamicShelterCount(null);
    setDynamicShelterCapacity(null);

    // 1. Fetch live shelters from backend REST API
    api.resources.getShelters(activeDistrict.name)
      .then(shelters => {
        if (shelters && shelters.length > 0) {
          setDynamicShelterCount(shelters.length);
          const totalCap = shelters.reduce((acc, curr) => {
            const cap = parseInt(curr.capacity);
            return acc + (isNaN(cap) ? 0 : cap);
          }, 0);
          setDynamicShelterCapacity(totalCap);
        }
      })
      .catch(() => {
        // Fallback to local storage
        const record = getIngestedDataset('official_shelters');
        if (record && record.data && record.data.length > 0) {
          const districtShelters = record.data.filter(s => 
            s.district && activeDistrict.name && s.district.toLowerCase() === activeDistrict.name.toLowerCase()
          );
          if (districtShelters.length > 0) {
            setDynamicShelterCount(districtShelters.length);
            const totalCap = districtShelters.reduce((acc, curr) => {
              const cap = parseInt(curr.capacity);
              return acc + (isNaN(cap) ? 0 : cap);
            }, 0);
            setDynamicShelterCapacity(totalCap);
          }
        }
      });

    // 2. Load latest real Gemini AI analysis if generated for this district
    try {
      const rawAi = localStorage.getItem('resilience_latest_ai_analysis');
      if (rawAi) {
        const parsed = JSON.parse(rawAi);
        if (parsed.districtName && activeDistrict.name && parsed.districtName.toLowerCase() === activeDistrict.name.toLowerCase()) {
          setLatestAiAnalysis(parsed);
        } else {
          setLatestAiAnalysis(null);
        }
      }
    } catch (e) {
      setLatestAiAnalysis(null);
    }
  }, [activeDistrict.name]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hazard color theme
  const hazardTheme = {
    Flood: { text: "text-blue-600", bg: "bg-blue-600", border: "border-blue-200", bgLight: "bg-blue-50/50", chartColor: "#2563eb" },
    Cyclone: { text: "text-teal-600", bg: "bg-teal-600", border: "border-teal-200", bgLight: "bg-teal-50/50", chartColor: "#0d9488" },
    Landslide: { text: "text-orange-600", bg: "bg-orange-600", border: "border-orange-200", bgLight: "bg-orange-50/50", chartColor: "#ea580c" },
    Earthquake: { text: "text-red-600", bg: "bg-red-600", border: "border-red-200", bgLight: "bg-red-50/50", chartColor: "#dc2626" },
    Heatwave: { text: "text-amber-600", bg: "bg-amber-600", border: "border-amber-200", bgLight: "bg-amber-50/50", chartColor: "#d97706" }
  };
  const theme = hazardTheme[selectedDisasterType] || hazardTheme.Flood;

  // Convert deficit gaps data for Recharts BarChart
  const chartData = activeDistrict.gaps
    ? activeDistrict.gaps
        .filter(g => g.type === 'deficit')
        .map(g => ({
          name: g.title,
          Required: g.required,
          Available: g.available
        }))
    : [];

  return (
    <div className="bg-[#F2F6FA] min-h-screen py-8 px-4 sm:px-6 lg:px-8 page-fade-in text-left font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Command Center Status Bar */}
        <div className="bg-[#071B33] text-white rounded-xl p-4 shadow border border-navy-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-brand-orange-500 rounded-full animate-ping flex-shrink-0" />
            <div className="space-y-0.5">
              <span className="text-slate-400 font-bold block uppercase tracking-wider">COMMAND NODE ACTIVE</span>
              <span className="text-white font-bold">STATE EMERGENCY OPERATIONS MONITORING PANEL</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-[11px] text-slate-350">
            <div>
              <span className="text-slate-500">OPERATIONAL NODE:</span> SEOC_{activeDistrict.name.toUpperCase()}
            </div>
            <div className="flex items-center gap-1.5 border-l border-slate-800 pl-6">
              <Clock className="h-4 w-4 text-brand-orange-500" />
              <span>{time.toLocaleString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' })} (IST)</span>
            </div>
          </div>
        </div>

        {/* Simulation Alert Banner */}
        {isSimulating && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-red-650 rounded-full animate-ping flex-shrink-0" />
              <div className="text-xs font-semibold text-red-800">
                <span className="font-bold text-red-700 block uppercase tracking-wider">
                  ⚠️ Preparedness Simulation Mode Active ({simulationMode.toUpperCase()} STRESS TEST)
                </span>
                <span className="text-slate-600">
                  {hasScore 
                    ? `Preparedness Score adjusted from ${activeDistrict.preparednessScore}% to ${adjustedScore}% due to simulated shelter shortages and evacuation bottlenecks.`
                    : "No baseline rating available. Stress alerts active in regional simulation layers."
                  }
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-red-100 border border-red-200 px-2 py-0.5 rounded font-mono font-bold text-red-700 uppercase">
              Simulation Only
            </span>
          </div>
        )}

        {/* Top Header Section */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{activeDistrict.state} Admin</span>
              <span className="text-slate-300">|</span>
              <span className={`px-2.5 py-0.5 ${theme.bgLight} ${theme.text} border ${theme.borderClass} text-[10px] font-extrabold rounded-full uppercase tracking-wider`}>
                {selectedDisasterType} Hazard Panel
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-navy-900 font-display">
              {activeDistrict.name} District Intel
            </h1>
            <p className="text-slate-500 text-sm max-w-xl font-medium">
              National Disaster Management Framework interface mapping dynamic hazard assessments and mitigation indicators.
            </p>

            {/* Phase 1 Action Controls */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsSimulatorOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] uppercase tracking-wider"
              >
                <Waves className="h-4 w-4" />
                <span>What-If Simulator</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMemoryOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] uppercase tracking-wider"
              >
                <BookOpen className="h-4 w-4" />
                <span>Disaster Memory</span>
              </button>
            </div>
          </div>

          {/* Preparedness Score Widget */}
          {hasScore ? (
            <div className="flex items-center gap-6 bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-inner w-full lg:w-auto justify-between lg:justify-start">
              <div className="space-y-1 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Preparedness Score</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-navy-900 font-display">{adjustedScore}%</span>
                  <span className="text-slate-400 font-bold text-sm">/ 100</span>
                </div>
                <span className="text-[9px] text-slate-400 block font-bold">
                  Calculated from available verified indicators.
                </span>
                <button
                  onClick={() => setIsMethodologyOpen(true)}
                  className="text-[9px] text-blue-600 hover:underline font-bold block mt-1 uppercase"
                >
                  VIEW SCORE METHODOLOGY
                </button>
              </div>

              <div className="border-l border-slate-200 pl-6 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Status Threat Level</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold rounded-md border ${
                  adjustedStatus === 'HIGH RISK' 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : adjustedStatus === 'MODERATE RISK' 
                    ? 'bg-brand-orange-50 text-brand-orange-700 border-brand-orange-200' 
                    : 'bg-brand-green-50 text-brand-green-700 border-brand-green-200'
                }`}>
                  <ShieldAlert className="h-4 w-4" />
                  {adjustedStatus}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-inner w-full lg:w-auto text-left space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Preparedness Score</span>
              <p className="text-xs font-extrabold text-slate-500 leading-normal max-w-xs">
                Insufficient verified data to calculate preparedness score.
              </p>
              <button
                onClick={() => setIsMethodologyOpen(true)}
                className="text-[9px] text-blue-600 hover:underline font-bold block uppercase"
              >
                VIEW SCORE METHODOLOGY
              </button>
            </div>
          )}
        </div>

        {/* Four Metric Cards Grid (Or "Data Not Available") */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeDistrict.metrics ? (
            activeDistrict.metrics.map((metric, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                  if (metric.name === 'Shelter Capacity') {
                    if (setShowSheltersOnMap) setShowSheltersOnMap(true);
                    if (setActivePage) setActivePage('map');
                  }
                }}
                className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  metric.name === 'Shelter Capacity' 
                    ? 'cursor-pointer hover:border-purple-400 hover:ring-2 hover:ring-purple-100 group' 
                    : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-navy-900">{metric.name}</span>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {getMetricIcon(metric.name)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-extrabold text-navy-900 font-display">{metric.score}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Audit Rating</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        metric.score >= 80 ? 'bg-brand-green-600' : metric.score >= 60 ? 'bg-brand-orange-500' : 'bg-red-600'
                      }`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>

                  {metric.name === 'Shelter Capacity' && (
                    <div className="mt-2 pt-2 border-t border-dashed border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-650">
                      <div className="bg-slate-50 border border-slate-150 p-1.5 rounded text-center">
                        <span className="text-slate-400 block text-[8px] uppercase font-bold">Shelter Count</span>
                        <span className="text-[#071B33] text-xs font-black">
                          {dynamicShelterCount ?? activeDistrict.shelterCount ?? 'N/A'}
                        </span>
                      </div>
                      <div className="bg-slate-50 border border-slate-150 p-1.5 rounded text-center">
                        <span className="text-slate-400 block text-[8px] uppercase font-bold">Total Capacity</span>
                        <span className="text-[#071B33] text-xs font-black truncate max-w-full block">
                          {dynamicShelterCapacity !== null
                            ? dynamicShelterCapacity.toLocaleString('en-IN')
                            : activeDistrict.shelterCapacity
                            ? activeDistrict.shelterCapacity.toLocaleString('en-IN')
                            : 'N/A'}{' '}
                          Pax
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className={`h-4 w-4 ${metric.score >= 80 ? 'text-brand-green-600' : 'text-brand-orange-550'}`} />
                    <span>{metric.status}</span>
                  </div>
                  {metric.name === 'Shelter Capacity' && (
                    <span className="text-purple-600 font-extrabold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[9px] uppercase tracking-wider">
                      View Map <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            ["Warning System", "Shelter Capacity", "Evacuation Routes", "Medical Resources"].map((metricName, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-40">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-navy-900">{metricName}</span>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {getMetricIcon(metricName)}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-extrabold text-sm uppercase tracking-wide block">Data Not Available</span>
                  <span className="text-[9px] text-slate-400 font-semibold italic">No verified database indicators mapped</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 🧠 FEATURE 1: AI MULTI-HAZARD RISK INTELLIGENCE */}
        <RiskIntelligenceCard 
          districtId={activeDistrict.id} 
          hazardType={selectedDisasterType} 
          onOpenMemory={() => setIsMemoryOpen(true)} 
        />

        {/* AI Detected Preparedness Gaps & Resource Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Gaps List Section (2 columns on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div className="space-y-0.5">
                  <h2 className="text-lg font-bold text-navy-900 font-display uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className={`h-5.5 w-5.5 ${theme.text}`} />
                    AI Detected Gaps ({selectedDisasterType})
                  </h2>
                  <p className="text-xs text-slate-400">Critical resources deficits requiring immediate regional planning intervention.</p>
                </div>
                {activeDistrict.gaps && activeDistrict.gaps.length > 0 && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${theme.border} ${theme.bgLight} ${theme.text}`}>
                    {activeDistrict.gaps.length} Gaps Active
                  </span>
                )}
              </div>

              {activeDistrict.gaps && activeDistrict.gaps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeDistrict.gaps.map((gap, idx) => (
                    <div key={gap.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gap {idx + 1}</span>
                          {gap.type === 'deficit' ? (
                            <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 text-[9px] font-bold rounded">Deficit</span>
                          ) : (
                            <span className={`px-2 py-0.5 ${theme.bgLight} ${theme.text} border ${theme.border} text-[9px] font-bold rounded`}>Path Risk</span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-navy-900">{gap.title}</h4>
                      </div>

                      {gap.type === 'deficit' ? (
                        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold">
                          <div className="flex justify-between text-slate-500">
                            <span>Req. Baseline:</span>
                            <span className="font-bold text-navy-900">{gap.required}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Available Stock:</span>
                            <span className="font-bold text-navy-900">{gap.available}</span>
                          </div>
                          <div className={`flex justify-between ${theme.text} ${theme.bgLight} p-1.5 rounded font-bold`}>
                            <span>Gap deficit:</span>
                            <span>{gap.gap} {gap.unit}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-semibold">
                          {gap.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold space-y-1">
                  <Compass className="h-8 w-8 text-slate-300 mx-auto" />
                  <p>Data Not Available</p>
                  <p className="text-[10px] text-slate-400 font-medium italic">No verified gaps mapped in the selected hazard profile</p>
                </div>
              )}
            </div>

            {/* Simple Deficit Chart Comparison */}
            {chartData.length > 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="text-left border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-navy-900 font-display uppercase tracking-wider">Resource Allocation Audit</h3>
                  <p className="text-xs text-slate-400">Comparing active stock inventories against calculated disaster relief thresholds.</p>
                </div>
                <div className="h-64 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }} barGap={6}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                      <YAxis stroke="#94a3b8" tickLine={false} />
                      <Tooltip contentStyle={{ background: '#071B33', color: '#fff', borderRadius: '6px' }} />
                      <Legend />
                      <Bar dataKey="Required" fill="#0f172a" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Available" fill={theme.chartColor} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : null}

            {/* 📋 VERIFIED REPORT AI ANALYSIS PATHWAY */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 text-left">
                <h3 className="text-lg font-bold text-navy-900 font-display uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-5.5 w-5.5 text-blue-600" />
                  Verified Report AI Analysis
                </h3>
                <p className="text-xs text-slate-400">AI extraction pipeline tracing disaster logs step-by-step to recommendations.</p>
              </div>

              {/* Dynamic Live Gemini Analysis Banner */}
              {latestAiAnalysis && (
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-xl space-y-3 shadow-md border border-blue-800">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/30 border border-blue-400/40 rounded-full text-[10px] font-bold tracking-wider uppercase text-blue-200">
                      <Cpu className="h-3.5 w-3.5 text-blue-300" />
                      Live Gemini AI Extraction: {latestAiAnalysis.reportName}
                    </span>
                    <span className="text-[10px] text-blue-300 font-mono">
                      {new Date(latestAiAnalysis.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {latestAiAnalysis.summary}
                  </h4>
                  {latestAiAnalysis.risk_factors && latestAiAnalysis.risk_factors.length > 0 && (
                    <div className="text-xs text-blue-200 space-y-1">
                      <span className="font-bold text-white block text-[11px] uppercase tracking-wider">Identified Risk Factors:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-blue-100">
                        {latestAiAnalysis.risk_factors.map((rf, rIdx) => (
                          <li key={rIdx}>{rf}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {latestAiAnalysis.disclaimer && (
                    <p className="text-[9px] text-blue-300/80 italic border-t border-blue-800/80 pt-2">
                      {latestAiAnalysis.disclaimer}
                    </p>
                  )}
                </div>
              )}

              {activeDistrict.aiFindings && activeDistrict.aiFindings.length > 0 ? (
                <div className="space-y-8 pl-4 relative border-l-2 border-slate-100">
                  {activeDistrict.aiFindings.map((finding, idx) => (
                    <div key={idx} className="space-y-4 relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm flex items-center justify-center" />
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4 flex-wrap">
                          <h4 className="text-sm font-bold text-navy-950 uppercase tracking-wide">
                            {selectedDisasterType} Incident Audit Case {idx + 1}
                          </h4>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-150 text-[9px] font-bold rounded">
                            Extraction Confidence: {finding.confidence}%
                          </span>
                        </div>

                        {/* Visual Workflow Steps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
                            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Official Report</span>
                            <span className="text-navy-900 font-bold">{finding.document}</span>
                          </div>
                          
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
                            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Document Reference</span>
                            <span className="text-navy-900">{finding.reference}</span>
                          </div>
                        </div>

                        <div className="bg-blue-50/20 border border-blue-100 p-3 rounded-lg text-xs leading-relaxed text-slate-700 font-semibold italic">
                          <span className="text-[9px] text-blue-600 font-extrabold block uppercase tracking-wider not-italic mb-1">
                            Detected Report Evidence:
                          </span>
                          "{finding.evidence}"
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold pt-1">
                          <div className="p-3 bg-red-50/30 border border-red-100 rounded-lg space-y-1">
                            <span className="text-[10px] text-red-500 block uppercase tracking-wider">Failure Analysis</span>
                            <span className="text-navy-900 font-bold">{finding.finding}</span>
                          </div>
                          
                          <div className="p-3 bg-orange-50/30 border border-orange-100 rounded-lg space-y-1">
                            <span className="text-[10px] text-orange-600 block uppercase tracking-wider">Preparedness Gap</span>
                            <span className="text-navy-900">{finding.gap}</span>
                          </div>
                          
                          <div className="p-3 bg-green-50/30 border border-green-100 rounded-lg space-y-1">
                            <span className="text-[10px] text-green-600 block uppercase tracking-wider">Recommended Action</span>
                            <span className="text-navy-900 font-bold">{finding.action}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold italic">
                  Insufficient verified documentation available in the local directory to compile AI analysis logs.
                </div>
              )}
            </div>

          </div>

          {/* Right Col: Lessons from past disasters */}
          <div className="space-y-6">
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-navy-900 font-display uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-5 w-5 text-brand-orange-500" />
                  Lessons From Past Disasters
                </h3>
                <p className="text-xs text-slate-400">Historical findings & failures registered in past events.</p>
              </div>

              {activeDistrict.lessons && activeDistrict.lessons.length > 0 ? (
                <div className="space-y-3">
                  {activeDistrict.lessons.map((finding, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-start gap-2.5 text-xs font-semibold text-slate-700 leading-relaxed">
                      <Info className={`h-4.5 w-4.5 ${theme.text} flex-shrink-0 mt-0.5`} />
                      <div>
                        {finding}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic font-semibold text-center py-4">Data Not Available</p>
              )}
            </div>

            {/* Assessment source card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Landmark className="h-4 w-4 text-navy-900" />
                <span>DATA INTEGRITY SOURCE CONTROL</span>
              </div>
              
              <div className="space-y-3">
                {activeDistrict.sourceKey ? (
                  <>
                    <SourceBadge sourceKey={activeDistrict.sourceKey} />
                    <div className="bg-slate-50 border border-slate-200/80 p-3 rounded text-[11px] text-slate-600 font-semibold leading-relaxed">
                      <strong className="text-navy-900 block mb-1">VERIFIED HISTORICAL RECORD:</strong>
                      {activeDistrict.historicalFloodEvents ? (
                        <p className="font-sans italic font-bold text-slate-800">
                          "{activeDistrict.historicalFloodEvents}"
                        </p>
                      ) : (
                        <p className="text-slate-400 italic">No historical event logs in active database index.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-slate-400 font-semibold italic text-xs">
                    No connected data sources for this hazard
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 🛡️ SCORE METHODOLOGY POPUP MODAL */}
      {isMethodologyOpen && (
        <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl relative space-y-4 page-fade-in text-left">
            <button 
              onClick={() => setIsMethodologyOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-navy-950"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Compass className="h-6 w-6 text-blue-600" />
              <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider">
                Preparedness Score Methodology
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              The RESILIENCE AI preparedness score is computed as a straight arithmetic average of verified incident metrics:
            </p>

            <ul className="space-y-2 text-xs font-semibold text-slate-700 pl-4 list-disc">
              <li><strong>Warning System Status</strong>: Gauge telemetry availability and warning sounder networks.</li>
              <li><strong>Shelter Capacity Status</strong>: Availability of high-platform relief shelter facilities.</li>
              <li><strong>Evacuation Routes Status</strong>: Accessibility and elevation of major roadway connectors.</li>
              <li><strong>Medical Resource Audits</strong>: Active bed capacities and mobile disaster health kits.</li>
            </ul>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-[10px] text-yellow-800 leading-relaxed font-semibold">
              <strong>Vulnerability Lock:</strong> Score generation is automatically suspended for districts missing critical DDMP report parameters to prevent simulated mock value skewing.
            </div>

            <button
              onClick={() => setIsMethodologyOpen(false)}
              className="w-full py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded text-xs transition-colors uppercase tracking-wider"
            >
              Close Panel
            </button>
          </div>
        </div>
      )}

      {/* ⚡ FEATURE 4: WHAT-IF DISASTER SCENARIO SIMULATOR MODAL */}
      <ScenarioSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        districtId={activeDistrict.id}
        districtName={activeDistrict.name}
        onApplyToMap={(scenarioResult) => {
          if (setActivePage) setActivePage('map');
        }}
      />

      {/* 🏛️ FEATURE 2: HISTORICAL DISASTER MEMORY EXPLORER MODAL */}
      <DisasterMemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        defaultDistrict={activeDistrict.name}
      />

    </div>
  );
}
