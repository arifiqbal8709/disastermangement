import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-900 mt-auto text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Brand block */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 p-1.5 rounded text-white flex items-center justify-center">
                <Shield className="h-5 w-5 text-brand-orange-500" />
              </div>
              <span className="font-display font-bold text-white text-base tracking-wider">
                RESILIENCE AI
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              An AI-powered Disaster Memory & Preparedness Intelligence System designed to extract mitigation insights from past disasters and format district-specific action policies. Developed for Smart India Hackathon 2026.
            </p>
          </div>
        </div>

        <div className="border-t border-navy-900 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} National Disaster Management Intelligence Framework.
          </div>
          <div className="flex gap-4 mt-2 md:mt-0 font-bold">
            <span>Privacy Policy</span>
            <span>Security Directives</span>
            <span className="text-brand-orange-500">Designed for SIH 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
