import React, { useState, useEffect } from 'react';
import { BookOpen, X, Search, ShieldCheck, ExternalLink, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import { api } from '../services/api';

export default function DisasterMemoryModal({ isOpen, onClose, defaultDistrict = '' }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(defaultDistrict);
  const [hazardFilter, setHazardFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.memory.search(searchQuery, hazardFilter)
      .then(data => {
        setRecords(data);
        if (data && data.length > 0) {
          setSelectedRecord(data[0]);
        }
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [isOpen, searchQuery, hazardFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 page-fade-in text-left font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden text-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 bg-[#071B33] text-white flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-400/30 text-purple-300">
              <BookOpen className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
                Forensic Disaster Repository
              </span>
              <h2 className="text-base font-extrabold font-display">
                Historical Disaster Memory & Lessons Learned Engine
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

        {/* Search & Filter Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between text-xs">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by event, district (e.g. Silchar, Wayanad, Bhuj)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 text-navy-950"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-navy-950 focus:outline-none"
            >
              <option value="">All Disaster Types</option>
              <option value="Flood">Floods</option>
              <option value="Landslide">Landslides</option>
              <option value="Earthquake">Earthquakes</option>
              <option value="Cyclone">Cyclones</option>
            </select>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-grow overflow-hidden text-xs">
          
          {/* Left Column: Event List (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto p-4 space-y-2.5 max-h-[60vh] bg-slate-50/50">
            <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-slate-400 block pb-1">
              Recorded Catastrophes ({records.length})
            </span>

            {loading ? (
              <div className="text-center py-8 text-slate-400">Loading memory archives...</div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-slate-400 italic">No historical events matching query.</div>
            ) : (
              records.map((rec) => {
                const isSelected = selectedRecord?.id === rec.id;
                return (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecord(rec)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-purple-600 shadow-md ring-1 ring-purple-600/30'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {rec.incident_year}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {rec.disaster_type}
                      </span>
                    </div>
                    <strong className="text-navy-950 block mt-1.5 font-bold text-xs leading-snug">
                      {rec.event_name}
                    </strong>
                    <div className="text-[10px] text-slate-500 mt-1 font-medium">
                      📍 {rec.district}, {rec.state}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Deep Forensic Details (7 cols) */}
          <div className="md:col-span-7 overflow-y-auto p-5 space-y-5 max-h-[60vh]">
            {selectedRecord ? (
              <div className="space-y-5 page-fade-in">
                {/* Event Title Header */}
                <div className="border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2 text-[10px] text-purple-700 font-extrabold uppercase tracking-wider mb-1">
                    <span>{selectedRecord.disaster_type} Incident</span>
                    <span>•</span>
                    <span>Year {selectedRecord.incident_year}</span>
                    <span>•</span>
                    <span>{selectedRecord.district}, {selectedRecord.state}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-navy-950 font-display">
                    {selectedRecord.event_name}
                  </h3>
                </div>

                {/* 1. Root Failure Modes */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> What Failed in Past Response (Failure Modes)
                  </span>
                  <div className="space-y-1.5">
                    {selectedRecord.failure_modes?.map((mode, i) => (
                      <div key={i} className="p-2.5 bg-red-50/60 border border-red-200 rounded-xl text-red-950 font-medium text-[11px] leading-relaxed">
                        • {mode}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Lessons Learned */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" /> Strategic Lessons Learned
                  </span>
                  <div className="space-y-1.5">
                    {selectedRecord.lessons_learned?.map((lesson, i) => (
                      <div key={i} className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl text-amber-950 font-medium text-[11px] leading-relaxed">
                        • {lesson}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Actionable Protocols */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Mandatory Mitigation Protocols for District
                  </span>
                  <div className="space-y-1.5">
                    {selectedRecord.actionable_protocols?.map((protocol, i) => (
                      <div key={i} className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-emerald-950 font-semibold text-[11px] leading-relaxed">
                        ✓ {protocol}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Source Verification Badge */}
                {selectedRecord.source_report && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-[10.5px]">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Official Reference Document</span>
                      <strong className="text-navy-950">{selectedRecord.source_report}</strong>
                    </div>
                    {selectedRecord.source_url && (
                      <a
                        href={selectedRecord.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 font-extrabold flex items-center gap-1 hover:underline ml-2 flex-shrink-0"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">Select an event from the left list to inspect memory.</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-[10px] text-slate-400 font-medium">
            Forensic analysis cross-referenced against ASDMA, NDMA & GSI records
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-navy-950 text-white rounded-xl text-xs font-bold hover:bg-navy-900 transition-colors shadow-sm"
          >
            Close Memory Explorer
          </button>
        </div>
      </div>
    </div>
  );
}
