import React, { useState } from 'react';
import { Shield, Menu, X, Landmark } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'analyze', label: 'Analyze' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'map', label: 'Disaster Map' },
    { id: 'admin', label: 'Admin Portal' },
    { id: 'about', label: 'About' },
  ];

  return (
    <nav className="bg-[#061A2F] border-b border-slate-800 sticky top-0 z-50 shadow-sm text-left h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo and Brand Name */}
          <div className="flex items-center cursor-pointer" onClick={() => { setActivePage('landing'); setIsOpen(false); }}>
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="bg-[#0A2540] p-2 rounded-lg text-white shadow-sm flex items-center justify-center border border-slate-700">
                <Shield className="h-6.5 w-6.5 text-[#2563EB] fill-[#2563EB]/10" />
              </div>
              <div className="flex flex-col col-span-1">
                <span className="font-display font-black text-white text-lg tracking-wider leading-none">
                  RESILIENCE AI
                </span>
                <span className="text-[9px] text-slate-400 font-bold tracking-wider mt-1.5 uppercase">
                  AI Disaster Memory & Preparedness Intelligence System
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex space-x-8 items-center h-full">
            {navItems.map((item) => {
              const isActive = activePage === item.id || (item.id === 'analyze' && activePage === 'actionplan');
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-xs font-bold transition-all duration-200 h-16 tracking-wider uppercase ${
                    isActive
                      ? 'border-[#2563EB] text-white font-extrabold'
                      : 'border-transparent text-slate-300 hover:text-white hover:border-slate-500'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="flex items-center gap-2 pl-4 border-l border-slate-800 text-slate-400 text-[10px] font-mono font-bold">
              <Landmark className="h-4.5 w-4.5 text-slate-300" />
              <span>COMMAND SYSTEM</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#061A2F] page-fade-in absolute top-20 left-0 w-full shadow-lg" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const isActive = activePage === item.id || (item.id === 'analyze' && activePage === 'actionplan');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded text-xs font-bold tracking-wider uppercase ${
                    isActive
                      ? 'bg-[#0A2540] text-white font-extrabold border-l-4 border-[#2563EB]'
                      : 'text-slate-300 hover:bg-[#0A2540] hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
