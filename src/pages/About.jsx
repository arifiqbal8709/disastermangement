import React from 'react';
import { Landmark, Brain, ShieldAlert, Cpu, Database, CheckSquare, Layers } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-[#F2F6FA] min-h-screen py-10 px-4 sm:px-6 lg:px-8 page-fade-in text-left">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Title */}
        <div className="space-y-2 border-b border-slate-200 pb-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Hackathon Documentation
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 font-display">
            About RESILIENCE AI
          </h1>
          <p className="text-slate-500 text-sm">
            Disaster Memory & Preparedness Intelligence System developed for Smart India Hackathon (SIH) 2026.
          </p>
        </div>

        {/* Section 1: Overview and Purpose */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-navy-900 font-display flex items-center gap-2">
            <Landmark className="h-5.5 w-5.5 text-brand-blue-600" />
            Project Purpose & Concept
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Every year, India faces severe natural calamities ranging from landslides in the Western Ghats to storm surges in the Bay of Bengal and seismic activities in the Himalayas. While disaster responses are executed, the detailed operational lessons from each event (e.g., telemetry warning delays, transmission failures, structural eco-zoning lapses) are often lost in voluminous official reports.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            <strong>RESILIENCE AI</strong> establishes a digital <strong>"Disaster Memory Repository"</strong>. It evaluates critical mitigation parameters from past disasters and cross-references them against a district's active warning infrastructure, communication links, and emergency resource stockpiles to dynamically format specific disaster preparedness checklists and planning policies.
          </p>
        </div>

        {/* Section 2: Core Methodology */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-navy-900 font-display">The Disaster Memory Methodology</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            The framework uses a multi-faceted analysis model to map past disasters to future safety checklists:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-3">
              <div className="bg-brand-blue-50 w-10 h-10 rounded-lg flex items-center justify-center text-brand-blue-600">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-navy-900">1. Telemetry Capture</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Extracts physical indicators (soil moisture, rainfall rates, glacier breach vectors) from prior disaster points to set warning parameters.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-3">
              <div className="bg-brand-orange-50 w-10 h-10 rounded-lg flex items-center justify-center text-brand-orange-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-navy-900">2. Operational Audit</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Analyzes warning transmission latencies, shelter capacity constraints, power grid failures, and road blockages during historical crises.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-3">
              <div className="bg-brand-green-50 w-10 h-10 rounded-lg flex items-center justify-center text-brand-green-600">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-navy-900">3. Policy Synthesis</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Formats tailored district directives detailing technical upgrades (e.g. soil sensors) and community timelines (e.g. pre-positioning drills).
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Technical Architecture */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-navy-900 font-display flex items-center gap-2">
            <Cpu className="h-5.5 w-5.5 text-brand-orange-600" />
            Full-Stack Production Technology Stack
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            RESILIENCE AI has been engineered with a resilient, modular architecture integrating edge frontend interfaces, an Express REST backend, Supabase PostgreSQL, and Google Gemini AI:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 font-semibold pl-4 list-disc">
            <li><strong>Frontend:</strong> React 19, Vite, Tailwind CSS, Leaflet GIS, Recharts, Lucide React</li>
            <li><strong>Backend:</strong> Node.js, Express.js REST API with Helmet security & Rate Limiting</li>
            <li><strong>AI Engine:</strong> Google Gen AI SDK (Gemini 1.5 Flash) with structured JSON extraction</li>
            <li><strong>Document Pipeline:</strong> PDF text extraction, validation, and OCR capability</li>
            <li><strong>Database:</strong> Supabase PostgreSQL (14 Tables, UUID keys, Foreign Keys, RLS)</li>
            <li><strong>Action Directives:</strong> Client-side vector jsPDF compiler for official DDMA action plans</li>
          </ul>
        </div>

        {/* Section 4: SIH Team Alignment */}
        <div className="bg-slate-900 text-white rounded-xl p-6 space-y-4 shadow-md">
          <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-brand-orange-500" />
            Smart India Hackathon 2026 Core Focus
          </h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            This prototype directly aligns with government objectives for creating low-cost, digital, and localized decision-support tools for disaster management. By combining data density with ease of understanding, it bridges the gap between high-level policy frameworks and local taluk/panchayat-level execution.
          </p>
          <div className="border-t border-slate-800 pt-4 flex flex-wrap gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Problem Domain: Disaster Mitigation</span>
            <span>Category: software prototype</span>
            <span>Accredited Portal: Gov-Tech</span>
          </div>
        </div>

      </div>
    </div>
  );
}
