import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, Clock, Download, Landmark, Users, ClipboardList, CheckSquare, Square, CheckCircle2, Loader2, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { getDistrictData } from '../data/mockData';
import SourceBadge from '../components/SourceBadge';

export default function ActionPlan({ selectedDistrictId, selectedDisasterType = "Flood", simulationMode }) {
  // Find current selected district dynamically based on hazard
  const activeDistrict = getDistrictData(selectedDistrictId, selectedDisasterType);

  // Checklist completion states
  const [checkedImmediate, setCheckedImmediate] = useState({});
  const [checkedMidTerm, setCheckedMidTerm] = useState({});
  const [checkedSimActions, setCheckedSimActions] = useState({
    sim1: false,
    sim2: false,
    sim3: false,
    sim4: false
  });
  const [activeTab, setActiveTab] = useState('immediate');
  
  // PDF download simulation states
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Reset checkboxes when district changes
  useEffect(() => {
    setCheckedImmediate({});
    setCheckedMidTerm({});
    setDownloadSuccess(false);
    setCheckedSimActions({
      sim1: false,
      sim2: false,
      sim3: false,
      sim4: false
    });
  }, [selectedDistrictId]);

  const handleToggleImmediate = (id) => {
    setCheckedImmediate(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleToggleMidTerm = (id) => {
    setCheckedMidTerm(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Calculations for progress meters
  const immediateTasks = activeDistrict.actionPlan?.immediate || [];
  const midTermTasks = activeDistrict.actionPlan?.midTerm || [];

  const completedImmediateCount = Object.values(checkedImmediate).filter(Boolean).length;
  const completedMidTermCount = Object.values(checkedMidTerm).filter(Boolean).length;

  const immediatePercent = immediateTasks.length ? Math.round((completedImmediateCount / immediateTasks.length) * 100) : 0;
  const midTermPercent = midTermTasks.length ? Math.round((completedMidTermCount / midTermTasks.length) * 100) : 0;

  // Simulate PDF compilation
  const handleDownloadReport = () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 4000);
    }, 1500);
  };

  const hasTasks = immediateTasks.length > 0 || midTermTasks.length > 0;

  return (
    <div className="bg-[#F2F6FA] min-h-screen py-10 px-4 sm:px-6 lg:px-8 page-fade-in text-left font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Emergency Directives
            </div>
            <h1 className="text-3xl font-extrabold text-navy-900 font-display flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-brand-green-600 fill-brand-green-500/10" />
              AI Disaster Preparedness Action Plan
            </h1>
            <p className="text-slate-500 text-sm font-semibold">
              Formulated check-lists and agency protocols optimized for <strong>{activeDistrict.name} District</strong>.
            </p>
          </div>

          {hasTasks && (
            <button
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="w-full md:w-auto px-5 py-3 bg-[#071B33] hover:bg-navy-950 text-white font-bold rounded text-xs shadow hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Compiling Policy...
                </>
              ) : (
                <>
                  <Download className="h-4.5 w-4.5" />
                  Export PDF Action Plan
                </>
              )}
            </button>
          )}
        </div>

        {/* Download success banner */}
        {downloadSuccess && (
          <div className="bg-brand-green-50 border border-brand-green-200 text-brand-green-800 rounded-xl p-4 flex items-start gap-3 page-fade-in">
            <CheckCircle2 className="h-5 w-5 text-brand-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-navy-900">Action Plan Successfully Compiled!</h4>
              <p className="text-slate-600 font-medium">
                `RESILIENCE_AI_${activeDistrict.name}_Preparedness_Policy.pdf` has been prepared. This framework compiles specific verified agency timelines.
              </p>
            </div>
          </div>
        )}

        {/* Active Simulation Actions Section */}
        {simulationMode === 'severe' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-4 page-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-650 animate-ping" />
              <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="h-4.5 w-4.5" />
                AI Stress Test Recommendations (Severe {selectedDisasterType} Scenario)
              </h3>
            </div>
            <p className="text-xs text-slate-600 font-semibold">
              The AI simulation engine has generated immediate preparedness directives to mitigate vulnerabilities identified in the <strong>{activeDistrict.name}</strong> stress test.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'sim1', label: 'Pre-position rescue and response teams near high-risk zones.', description: 'SDRF squads and emergency vehicles dispatched to vulnerable sectors.' },
                { id: 'sim2', label: 'Move emergency supplies closer to vulnerable communities.', description: 'Dry rations, drinking water, medicine, and critical response gear transferred to block storage.' },
                { id: 'sim3', label: 'Prepare alternate evacuation routes.', description: 'Safe detours mapped out using high-elevation PWD roadways.' },
                { id: 'sim4', label: 'Increase temporary shelter capacity.', description: 'Pre-identify community halls, and set up auxiliary cooling or sheltering tents.' }
              ].map((task) => {
                const checked = checkedSimActions[task.id];
                return (
                  <div 
                    key={task.id} 
                    onClick={() => {
                      setCheckedSimActions(prev => ({ ...prev, [task.id]: !prev[task.id] }));
                    }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start gap-3 bg-white hover:shadow-sm ${
                      checked 
                        ? 'border-brand-green-300 bg-brand-green-50/10' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <button type="button" className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-navy-900">
                      {checked ? (
                        <CheckSquare className="h-5 w-5 text-brand-green-600" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                    <div className="space-y-1">
                      <span className={`text-xs font-bold block ${checked ? 'line-through text-slate-400' : 'text-navy-900'}`}>
                        {task.label}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold text-left">
                        {task.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Interactive Task Checklist */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              
              {/* Tab Selector */}
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('immediate')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                      activeTab === 'immediate'
                        ? 'border-brand-orange-600 text-brand-orange-600'
                        : 'border-transparent text-slate-500 hover:text-navy-900'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    Pre-Disaster Phase (0-24 Hours)
                  </button>
                  <button
                    onClick={() => setActiveTab('midterm')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                      activeTab === 'midterm'
                        ? 'border-brand-orange-600 text-brand-orange-600'
                        : 'border-transparent text-slate-500 hover:text-navy-900'
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    Mitigation Phase (1-6 Months)
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              {hasTasks ? (
                <div className="space-y-4">
                  {activeTab === 'immediate' ? (
                    immediateTasks.map((task) => {
                      const checked = checkedImmediate[task.id];
                      return (
                        <div 
                          key={task.id}
                          onClick={() => handleToggleImmediate(task.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                            checked 
                              ? 'bg-slate-50/50 border-slate-200' 
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <button type="button" className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-[#071B33]">
                            {checked ? (
                              <CheckSquare className="h-5 w-5 text-[#071B33]" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                          
                          <div className="space-y-1">
                            <p className={`text-xs font-bold text-left leading-relaxed ${checked ? 'line-through text-slate-400' : 'text-navy-900'}`}>
                              {task.task}
                            </p>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono font-bold">
                              <Landmark className="h-3 w-3" />
                              <span>Agency: {task.agency}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    midTermTasks.map((task) => {
                      const checked = checkedMidTerm[task.id];
                      return (
                        <div 
                          key={task.id}
                          onClick={() => handleToggleMidTerm(task.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                            checked 
                              ? 'bg-slate-50/50 border-slate-200' 
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <button type="button" className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-[#071B33]">
                            {checked ? (
                              <CheckSquare className="h-5 w-5 text-[#071B33]" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                          
                          <div className="space-y-1">
                            <p className={`text-xs font-bold text-left leading-relaxed ${checked ? 'line-through text-slate-400' : 'text-navy-900'}`}>
                              {task.task}
                            </p>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono font-bold">
                              <Landmark className="h-3 w-3" />
                              <span>Agency: {task.agency}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 font-semibold italic text-xs space-y-1">
                  <AlertCircle className="h-8 w-8 text-slate-300 mx-auto" />
                  <p>Data Not Available</p>
                  <p className="text-[10px] text-slate-400 font-medium not-italic">No action checklists mapped for this hazard profile</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Progress Summary & Sources */}
          <div className="space-y-6">
            
            {/* Checklist Progress summary */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Directive Completion
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between text-slate-500">
                    <span>Pre-Disaster Checklist:</span>
                    <span className="font-bold text-navy-900">{immediatePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full">
                    <div 
                      className="bg-brand-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${immediatePercent}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between text-slate-500">
                    <span>Mitigation Checklist:</span>
                    <span className="font-bold text-navy-900">{midTermPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full">
                    <div 
                      className="bg-brand-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${midTermPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Report Extraction Badge */}
            {activeDistrict.sourceKey ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-xs font-mono">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>AI REPORT METADATA</span>
                </div>
                <SourceBadge sourceKey={activeDistrict.sourceKey} />
              </div>
            ) : null}

          </div>
        </div>

      </div>
    </div>
  );
}
