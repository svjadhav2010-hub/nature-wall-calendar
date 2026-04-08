"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Save, Calendar as CalIcon, Sparkles, Snowflake, Wind, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types & Configurations ---
type DateRange = { start: string; end: string; note: string; };
type MonthData = { monthNote: string; ranges: DateRange[]; };

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Enhanced themes with specific interaction colors
const THEMES = [
  { id: 'forest', name: 'Cedar Grove', gradient: 'from-[#1b4332] via-[#2d6a4f] to-[#b7e4c7]', activeBg: 'bg-[#2d6a4f]', rangeBg: 'bg-[#d8f3dc]', textActive: 'text-emerald-900', icon: Wind },
  { id: 'ocean', name: 'Deep Tide', gradient: 'from-[#03045e] via-[#0077b6] to-[#caf0f8]', activeBg: 'bg-[#1a6985]', rangeBg: 'bg-[#caf0f8]', textActive: 'text-cyan-900', icon: Droplets },
  { id: 'terracotta', name: 'Desert Clay', gradient: 'from-[#431407] via-[#c1440e] to-[#fde8da]', activeBg: 'bg-[#c1440e]', rangeBg: 'bg-[#fde8da]', textActive: 'text-orange-900', icon: Sparkles },
  { id: 'slate', name: 'Midnight Peak', gradient: 'from-[#0f172a] via-[#334155] to-[#e2e8f0]', activeBg: 'bg-[#475569]', rangeBg: 'bg-[#e2e8f0]', textActive: 'text-slate-900', icon: Snowflake },
];

const HOLIDAYS: Record<string, { name: string; color: string }> = {
  "01-01": { name: "New Year's Day", color: "bg-rose-400" },
  "02-14": { name: "Valentine's Day", color: "bg-pink-400" },
  "03-17": { name: "St. Patrick's Day", color: "bg-emerald-500" },
  "07-04": { name: "Independence Day", color: "bg-blue-500" },
  "10-31": { name: "Halloween", color: "bg-orange-500" },
  "12-25": { name: "Christmas", color: "bg-red-500" },
  "12-31": { name: "New Year's Eve", color: "bg-purple-500" },
};

export default function PremiumWallCalendar() {
  // Prevent Hydration Mismatches
  const [mounted, setMounted] = useState(false);
  
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [theme, setTheme] = useState(THEMES[0]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, MonthData>>({});
  const [showSaveStatus, setShowSaveStatus] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false); // New Feature

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const storageKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  // --- Lifecycles & Persistence ---
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('wallcal_premium');
    if (saved) setData(JSON.parse(saved));
  }, []);

  // Keyboard Navigation (Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowLeft') handleNavigate(-1);
      if (e.key === 'ArrowRight') handleNavigate(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [year, month]);

  const updateData = useCallback((updater: (prev: Record<string, MonthData>) => Record<string, MonthData>) => {
    setData(prev => {
      const next = updater(prev);
      localStorage.setItem('wallcal_premium', JSON.stringify(next));
      return next;
    });
  }, []);

  // --- Derived State ---
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const formatDateStr = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  
  const currentMonthData = useMemo(() => data[storageKey] || { monthNote: '', ranges: [] }, [data, storageKey]);

  // --- Handlers ---
  const handleNavigate = (dir: number) => {
    setViewDate(new Date(year, month + dir, 1));
    setShowMonthSelector(false);
  };

  const handleDayClick = (ds: string) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(ds);
      setEndDate(null);
    } else {
      if (ds < startDate) {
        setEndDate(startDate);
        setStartDate(ds);
      } else {
        setEndDate(ds);
        // Auto-save logic utilizing functional state update to prevent stale closures
        updateData(prev => {
          const current = prev[storageKey] || { monthNote: '', ranges: [] };
          const ranges = [...current.ranges];
          if (!ranges.find(r => r.start === (startDate || ds) && r.end === ds)) {
            ranges.push({ start: startDate!, end: ds, note: '' });
          }
          return { ...prev, [storageKey]: { ...current, ranges } };
        });
      }
    }
  };

  const handleNoteChange = (val: string, isMonthly: boolean) => {
    updateData(prev => {
      const current = prev[storageKey] || { monthNote: '', ranges: [] };
      let newData = { ...current };
      
      if (isMonthly) {
        newData.monthNote = val;
      } else if (startDate && endDate) {
        newData.ranges = current.ranges.map(r => 
          (r.start === startDate && r.end === endDate) ? { ...r, note: val } : r
        );
        setShowSaveStatus(true);
        setTimeout(() => setShowSaveStatus(false), 2000);
      }
      return { ...prev, [storageKey]: newData };
    });
  };

  const selectedRangeNote = currentMonthData.ranges.find(r => r.start === startDate && r.end === endDate)?.note || '';

  if (!mounted) return null; // Prevent hydration errors

  return (
    <div className="min-h-screen bg-[#f4f1ea] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto relative">
        
        {/* Binding Rings */}
        <div className="flex justify-evenly px-16 -mb-3 relative z-10">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-6 h-8 rounded-full bg-gradient-to-b from-gray-300 to-gray-500 border border-gray-600 shadow-md" />
          ))}
        </div>

        <motion.div layout className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          
          {/* Dynamic Hero Section */}
          <div className={`relative h-48 md:h-56 overflow-hidden transition-all duration-700 bg-gradient-to-br ${theme.gradient}`}>
            {/* Ambient Particles overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <pattern id="noise" width="20" height="20" patternUnits="userSpaceOnUse">
                   <circle cx="2" cy="2" r="1" fill="white" />
                   <circle cx="15" cy="10" r="0.5" fill="white" />
                </pattern>
                <rect width="100" height="100" fill="url(#noise)" />
              </svg>
            </div>

            <div className="absolute bottom-4 left-6 text-white/90">
              <p className="text-[10px] tracking-widest uppercase mb-1 flex items-center gap-2">
                <theme.icon size={12} /> Nature Collection
              </p>
              <h1 className="text-2xl font-serif italic">{theme.name}</h1>
            </div>
            
            <div className="absolute top-4 right-6 flex gap-2">
              {THEMES.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setTheme(t)}
                  aria-label={`Switch to ${t.name} theme`}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${t.activeBg} ${theme.id === t.id ? 'border-white scale-125 shadow-lg' : 'border-white/30 hover:border-white/60'}`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 relative">
            
            {/* Left: Calendar Grid */}
            <div className="md:col-span-8 p-6 lg:p-10 border-r border-gray-100 relative">
              
              {/* Header & Quick Month Selector */}
              <div className="flex justify-between items-center mb-8 relative z-20">
                <button 
                  onClick={() => setShowMonthSelector(!showMonthSelector)}
                  className="group flex items-center gap-2 hover:bg-gray-50 px-3 py-1 rounded-lg transition-colors -ml-3"
                >
                  <h2 className="text-4xl font-serif text-slate-800">
                    {MONTHS[month]} <em className={`not-italic opacity-70 ${theme.textActive}`}>{year}</em>
                  </h2>
                </button>

                <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
                  <button onClick={() => handleNavigate(-1)} title="Previous Month (Left Arrow)" className="p-2 hover:bg-white rounded shadow-sm"><ChevronLeft size={18}/></button>
                  <button onClick={() => { setViewDate(new Date()); setShowMonthSelector(false); }} className="px-4 text-xs font-bold uppercase tracking-wider hover:bg-white rounded shadow-sm">Today</button>
                  <button onClick={() => handleNavigate(1)} title="Next Month (Right Arrow)" className="p-2 hover:bg-white rounded shadow-sm"><ChevronRight size={18}/></button>
                </div>
              </div>

              {/* Mini-map Overlay (Pro Feature) */}
              <AnimatePresence>
                {showMonthSelector && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-24 left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 grid grid-cols-3 gap-2 z-30"
                  >
                    {MONTHS.map((m, i) => (
                      <button 
                        key={m} 
                        onClick={() => { setViewDate(new Date(year, i, 1)); setShowMonthSelector(false); }}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${i === month ? theme.activeBg + ' text-white' : 'hover:bg-gray-100'}`}
                      >
                        {m.slice(0,3)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid Header */}
              <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                  <div key={d} className={`text-center text-[10px] font-bold uppercase tracking-widest py-2 ${i === 0 || i === 6 ? theme.textActive : 'text-gray-400'}`}>{d}</div>
                ))}
              </div>

              {/* Calendar Days */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={storageKey}
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.2 }}
                  className="grid grid-cols-7 gap-1"
                >
                  {[...Array(firstDayOfWeek)].map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const ds = formatDateStr(year, month, day);
                    const isToday = ds === formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());
                    const isStart = ds === startDate;
                    const isEnd = ds === endDate;
                    const inRange = startDate && endDate && ds > startDate && ds < endDate;
                    const hasNote = currentMonthData.ranges.some(r => ds >= r.start && ds <= r.end && r.note);
                    const holiday = HOLIDAYS[`${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`];

                    return (
                      <button
                        key={ds}
                        onClick={() => handleDayClick(ds)}
                        className={`
                          relative aspect-square flex flex-col items-center justify-center rounded-lg transition-all
                          ${isStart || isEnd ? `${theme.activeBg} text-white shadow-md font-bold scale-105 z-10` : ''}
                          ${inRange ? `${theme.rangeBg} rounded-none` : ''}
                          ${!isStart && !isEnd && !inRange ? 'hover:bg-gray-100' : ''}
                        `}
                      >
                        <span className={`text-sm ${isToday && !isStart && !isEnd ? theme.textActive + ' font-black underline underline-offset-4' : ''}`}>{day}</span>
                        
                        {/* Indicators */}
                        {holiday && !isStart && !isEnd && <div title={holiday.name} className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${holiday.color}`} />}
                        {hasNote && !isStart && !isEnd && <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${theme.activeBg} opacity-50`} />}
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: Smart Sidebar */}
            <div className="md:col-span-4 bg-[#faf8f3] p-6 lg:p-8 flex flex-col gap-6">
              
              <section className="flex-1">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                  Monthly Focus
                </h3>
                <div className="relative group h-48">
                  <div className="absolute inset-0 pointer-events-none flex flex-col">
                    {[...Array(6)].map((_, i) => <div key={i} className="flex-1 border-b border-gray-200" />)}
                  </div>
                  <textarea 
                    value={currentMonthData.monthNote}
                    onChange={(e) => handleNoteChange(e.target.value, true)}
                    placeholder="Jot down goals for this month..."
                    className="relative z-10 w-full h-full bg-transparent border-none outline-none resize-none font-medium text-sm text-slate-600 leading-[32px] pt-1 focus:ring-0 placeholder:italic"
                  />
                </div>
              </section>

              <section className={`pt-6 border-t border-gray-200 transition-opacity duration-300 ${(!startDate || !endDate) ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Event Details</h3>
                  {showSaveStatus && <span className={`text-[10px] flex items-center gap-1 font-bold ${theme.textActive}`}><Save size={10}/> Saved</span>}
                </div>
                
                {startDate && endDate ? (
                  <div className={`mb-3 text-[10px] font-bold px-3 py-1.5 rounded-md inline-flex items-center gap-2 ${theme.rangeBg} ${theme.textActive}`}>
                    <CalIcon size={12} /> {startDate} → {endDate}
                  </div>
                ) : null}

                <textarea 
                  disabled={!startDate || !endDate}
                  value={selectedRangeNote}
                  onChange={(e) => handleNoteChange(e.target.value, false)}
                  placeholder={startDate && endDate ? "Add details for this trip or event..." : "Select dates on the calendar first..."}
                  className={`w-full p-3 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-opacity-20 min-h-[100px] transition-all resize-none
                    ${theme.id === 'forest' ? 'focus:border-emerald-500 focus:ring-emerald-500' : 
                      theme.id === 'ocean' ? 'focus:border-cyan-500 focus:ring-cyan-500' : 
                      theme.id === 'terracotta' ? 'focus:border-orange-500 focus:ring-orange-500' : 
                      'focus:border-slate-500 focus:ring-slate-500'}
                  `}
                />
              </section>
            </div>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}