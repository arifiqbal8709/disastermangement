import React, { useState, useEffect } from 'react';
import { Brain, FileText, UploadCloud, CheckCircle2, AlertTriangle, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { districts } from '../data/mockData';
import { api } from '../services/api';

export default function DistrictAnalysis({ 
  selectedDistrictId, 
  setSelectedDistrictId, 
  selectedDisasterType, 
  setSelectedDisasterType, 
  setActivePage 
}) {
  // State-to-District mapping database
  const stateDistricts = {
    "Assam": [
      "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", 
      "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", 
      "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", 
      "Kamrup Metropolitan", "Karbi Anglong", "Kokrajhar", "Lakhimpur", 
      "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", 
      "South Salmara", "Tinsukia", "Udalguri", "West Karbi Anglong"
    ],
    "Kerala": ["Wayanad"],
    "Uttarakhand": ["Chamoli"],
    "Tamil Nadu": ["Cuddalore"],
    "Odisha": ["Kendrapara"],
    "Gujarat": ["Bhuj"],
    "Jharkhand": ["Bokaro"]
  };

  // Local selector states
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrictName, setSelectedDistrictName] = useState("");
  const [localDisasterType, setLocalDisasterType] = useState(selectedDisasterType || "Flood");
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    if (selectedDisasterType) {
      setLocalDisasterType(selectedDisasterType);
    }
  }, [selectedDisasterType]);

  // Loading animation states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const loaderMessages = [
    "Analyzing historical disaster data...",
    "Detecting recurring failures...",
    "Checking preparedness resources...",
    "Generating district preparedness score..."
  ];

  // Initialize dropdown selections based on global selectedDistrictId prop
  useEffect(() => {
    const currentDistrict = districts.find(d => d.id === selectedDistrictId) || districts[0];
    setSelectedState(currentDistrict.state);
    setSelectedDistrictName(currentDistrict.name);
    setLocalDisasterType(selectedDisasterType || currentDistrict.primaryHazard);
  }, [selectedDistrictId]);

  // When state changes, update district name to the first district in that state
  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    const available = stateDistricts[stateName] || [];
    if (available.length > 0) {
      setSelectedDistrictName(available[0]);
    } else {
      setSelectedDistrictName("");
    }
  };

  // Handle PDF report upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
    } else {
      alert("Invalid file type. Please upload a PDF report.");
    }
  };

  const removeUploadedFile = (e) => {
    e.stopPropagation();
    setUploadedFile(null);
  };

  // Real backend analysis trigger
  const handleStartAnalysis = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setAnalysisStep(0);

    const targetId = selectedDistrictName.toLowerCase().replace(/\s+/g, '_') || "wayanad";

    try {
      if (uploadedFile) {
        setAnalysisStep(0); // Uploading & Validating PDF
        const formData = new FormData();
        formData.append('reportFile', uploadedFile);
        formData.append('district', selectedDistrictName);
        formData.append('state', selectedState);
        formData.append('hazard', localDisasterType);
        formData.append('docTitle', uploadedFile.name);

        setAnalysisStep(1); // Extracting Text & Telemetry
        const result = await api.reports.uploadAndAnalyze(formData);
        
        setAnalysisStep(2); // Historical Comparison
        setAnalysisStep(3); // Synthesizing Findings

        // Cache last real AI analysis for the dashboard to render dynamically
        if (result && result.aiResult) {
          localStorage.setItem('resilience_latest_ai_analysis', JSON.stringify({
            ...result.aiResult,
            districtName: selectedDistrictName,
            reportName: uploadedFile.name,
            timestamp: new Date().toISOString()
          }));
        }
      } else {
        // Live query to backend district intelligence API
        await api.districts.getById(targetId).catch(() => null);
        // Brief transition through processing steps
        await new Promise(r => setTimeout(r, 600));
        setAnalysisStep(1);
        await new Promise(r => setTimeout(r, 600));
        setAnalysisStep(2);
        await new Promise(r => setTimeout(r, 600));
        setAnalysisStep(3);
      }

      // Propagate selected parameters to global application state
      setSelectedDistrictId(targetId);
      setSelectedDisasterType(localDisasterType);

      setIsAnalyzing(false);
      setActivePage('dashboard');
    } catch (err) {
      console.error('Analysis error:', err);
      setIsAnalyzing(false);
      alert(`AI Document Analysis notice: ${err.message}. Navigating to verified baseline telemetry.`);
      setSelectedDistrictId(targetId);
      setSelectedDisasterType(localDisasterType);
      setActivePage('dashboard');
    }
  };

  return (
    <div className="bg-[#F2F6FA] min-h-screen py-10 px-4 sm:px-6 lg:px-8 page-fade-in text-left">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-brand-blue-50 border border-brand-blue-200 px-3 py-1 rounded-full text-brand-blue-600 text-xs font-semibold uppercase tracking-wider">
            <Brain className="h-4 w-4 text-brand-orange-500 fill-brand-orange-500/10" />
            AI Preparedness Planner
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 font-display">
            District Analysis & Memory Audit
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Input district specifications to cross-reference historical disaster failures and generate immediate mitigation indicators.
          </p>
        </div>

        {/* Input Form Card */}
        {!isAnalyzing ? (
          <form onSubmit={handleStartAnalysis} className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* State Dropdown */}
              <div className="space-y-2">
                <label htmlFor="state-select" className="block text-xs font-bold text-navy-900 uppercase tracking-wider">
                  State
                </label>
                <select
                  id="state-select"
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 text-navy-900 text-sm rounded-lg focus:ring-brand-blue-500 focus:border-brand-blue-500 p-3 font-semibold"
                >
                  <option value="" disabled>Select State</option>
                  {Object.keys(stateDistricts).map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* District Dropdown */}
              <div className="space-y-2">
                <label htmlFor="district-select" className="block text-xs font-bold text-navy-900 uppercase tracking-wider">
                  District
                </label>
                <select
                  id="district-select"
                  value={selectedDistrictName}
                  onChange={(e) => setSelectedDistrictName(e.target.value)}
                  required
                  disabled={!selectedState}
                  className="w-full bg-slate-50 border border-slate-300 text-navy-900 text-sm rounded-lg focus:ring-brand-blue-500 focus:border-brand-blue-500 p-3 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>Select District</option>
                  {(stateDistricts[selectedState] || []).map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              
              {/* Disaster Type Select */}
              <div className="space-y-2">
                <label htmlFor="disaster-select" className="block text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Disaster Type
                </label>
                <select
                  id="disaster-select"
                  value={localDisasterType}
                  onChange={(e) => setLocalDisasterType(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 text-navy-900 text-sm rounded-lg focus:ring-brand-blue-500 focus:border-brand-blue-500 p-3 font-semibold"
                >
                  <option value="Flood">Flood</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Heatwave">Heatwave</option>
                </select>
              </div>

            </div>

            {/* Optional Input: PDF Upload Past Report */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider">
                Upload Past Disaster Report (Optional)
              </label>
              
              <input
                type="file"
                id="report-upload"
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
              
              <label 
                htmlFor="report-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-5 hover:bg-slate-50 hover:border-brand-blue-400 cursor-pointer transition-all duration-200"
              >
                {uploadedFile ? (
                  <div className="flex items-center gap-3 text-sm font-semibold text-brand-green-700 bg-brand-green-50/50 px-4 py-2 border border-brand-green-200 rounded-lg">
                    <FileText className="h-5 w-5" />
                    <span>{uploadedFile.name}</span>
                    <button 
                      type="button" 
                      onClick={removeUploadedFile}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                      title="Remove report"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <UploadCloud className="h-8 w-8 text-slate-400 mx-auto" />
                    <span className="text-xs font-bold text-navy-700 block">Drag & drop or click to choose report</span>
                    <span className="text-[10px] text-slate-400 font-medium">Accepts PDF files only</span>
                  </div>
                )}
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-base tracking-wider uppercase"
              >
                <Brain className="h-5 w-5 text-brand-orange-500 fill-brand-orange-500/20" />
                RUN AI ANALYSIS
              </button>
            </div>

          </form>
        ) : (
          /* Loading Animation overlay card */
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 shadow-md space-y-6 page-fade-in max-w-xl mx-auto">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider text-center flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 bg-brand-orange-500 rounded-full animate-ping" />
              Initializing AI Audit
            </h3>

            <div className="space-y-4">
              {loaderMessages.map((msg, idx) => {
                const isPending = analysisStep < idx;
                const isActive = analysisStep === idx;
                const isDone = analysisStep > idx;

                return (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-brand-green-600 flex-shrink-0 mt-0.5" />
                    ) : isActive ? (
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-4 h-4 border-2 border-brand-blue-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-200 bg-white flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`${isDone ? 'text-slate-500 line-through' : isActive ? 'text-navy-900 font-bold' : 'text-slate-400 font-medium'}`}>
                      {msg}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Simulated progress percentage */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500 font-bold">
                <span>Progressing analysis...</span>
                <span>{Math.round(((analysisStep + 1) / loaderMessages.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-brand-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((analysisStep + 1) / loaderMessages.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
