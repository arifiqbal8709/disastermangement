import React from 'react';
import { Landmark, Calendar, Link2, WifiOff } from 'lucide-react';
import { officialSourcesConfig } from '../dataSources/officialSources';

export default function SourceBadge({ sourceKey, isLive = false }) {
  const config = officialSourcesConfig[sourceKey];
  if (!config) return null;

  return (
    <div className="bg-slate-100/80 border border-slate-200/65 rounded-lg p-2.5 space-y-1.5 text-[10px] text-slate-500 font-semibold max-w-sm text-left">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-1 font-bold text-navy-900">
          <Landmark className="h-3.5 w-3.5 text-navy-700" />
          <span>Source: {config.sourceName}</span>
        </div>
        <a 
          href={config.sourceURL} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 text-[9px] font-bold"
        >
          <Link2 className="h-2.5 w-2.5" />
          Verify Source
        </a>
      </div>
      
      <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9px] text-slate-400">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>Published: {config.publishedDate}</span>
        </div>
        <div>
          <span>Retrieved: {config.retrievedDate}</span>
        </div>
      </div>
      
      <div className="border-t border-slate-200/50 pt-1.5 flex items-center gap-1 text-[9px] font-bold text-brand-orange-700">
        <WifiOff className="h-3 w-3 text-brand-orange-600" />
        <span>
          {isLive 
            ? "Live data source not connected" 
            : "Official source connected — manual/latest dataset import required"
          }
        </span>
      </div>
    </div>
  );
}
