"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Save, Calendar as CalIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types & Constants ---
type DateRange = {
  start: string;
  end: string;
  note: string;
};

type MonthData = {
  monthNote: string;
  ranges: DateRange[];
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const THEMES = [
  { id: 'forest', bg: 'bg-[#2d6a4f]', gradient: 'from-[#1b4332] via-[#2d6a4f] to-[#b7e4c7]' },
  { id: 'ocean', bg: 'bg-[#1a6985]', gradient: 'from-[#03045e] via-[#0077b6] to-[#caf0f8]' },
  { id: 'terracotta', bg: 'bg-[#c1440e]', gradient: 'from-[#431407] via-[#c1440e] to-[#fde8da]' },
  { id: 'slate', bg: 'bg-[#475569]', gradient: 'from-[#0f172a] via-[#334155] to-[#e2e8f0]' },
];

export default function WallCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [theme, setTheme] = useState('forest');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);
  const [data, setData] = useState<Record<string, MonthData>>({});
  const [showSaveStatus, setShowSaveStatus] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const storageKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem('wallcal_v2');
    if (saved) setData(JSON.parse(saved));
  }, []);

  const updateData = (newData: Record<string, MonthData>) => {
    setData(newData);
    localStorage.setItem('wallcal_v2', JSON.stringify(newData));
  };

  // --- Helpers ---
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  
  const formatDateStr = (y: number, m: number, d: number) => 
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const currentMonthData = useMemo(() => 
    data[storageKey] || { monthNote: '', ranges: [] }, 
  [data, storageKey]);

  // --- Actions ---
  const handleNavigate = (dir: number) => {
    setViewDate(new Date(year, month + dir, 1));
    setStartDate(null);
    setEndDate(null);
    setIsSelectingEnd(false);
  };

  const onDayClick = (ds: string) => {
    if (!isSelectingEnd) {
      setStartDate(ds);
      setEndDate(null);
      setIsSelectingEnd(true);
    } else {
      if (startDate && ds < startDate) {
        setEndDate(startDate);
        setStartDate(ds);
      } else if (ds === startDate) {
        setStartDate(null);
        setEndDate(null);
        setIsSelectingEnd(false);
      } else {
        setEndDate(ds);
        // Auto-save range
        const newRanges = [...currentMonthData.ranges];
        if (!newRanges.find(r => r.start === startDate && r.end === ds)) {
          newRanges.push({ start: startDate!, end: ds, note: '' });
          updateData({ ...data, [storageKey]: { ...currentMonthData, ranges: newRanges } });
        }
      }
      setIsSelectingEnd(false);
    }
  };

  const handleNoteChange = (val: string, isMonthly: boolean) => {
    const newData = { ...data };
    if (isMonthly) {
      newData[storageKey] = { ...currentMonthData, monthNote: val };
    } else if (startDate && endDate) {
      const ranges = currentMonthData.ranges.map(r => 
        (r.start === startDate && r.end === endDate) ? { ...r, note: val } : r
      );
      newData[storageKey] = { ...currentMonthData, ranges };
      setShowSaveStatus(true);
      setTimeout(() => setShowSaveStatus(false), 2000);
    }
    updateData(newData);
  };

  const selectedRangeNote = currentMonthData.ranges.find(
    r => r.start === startDate && r.end === endDate
  )?.note || '';

  return (
    <div className={`min-h-screen bg-[#f0ebe0] p-4 md:p-8 font-sans text-[#1a1a1a] theme-${theme}`}>
      <div className="max-w-5xl mx-auto">
        
        {/* Binding Rings */}
        <div className="flex justify-evenly px-16 -mb-3 relative z-10">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-[#d4c8b8] to-[#a89880] border-[2.5px] border-[#9e8f7e] shadow-md" />
          ))}
        </div>

        <div className="bg-[#faf8f3] rounded-lg shadow-2xl overflow-hidden border border-[#e0d8cc]">
          
          {/* Hero Section */}
          <div className={`relative h-48 md:h-60 overflow-hidden bg-gradient-to-br transition-colors duration-500 ${THEMES.find(t => t.id === theme)?.gradient}`}>
            <svg className="absolute bottom-0 w-full h-full opacity-20" viewBox="0 0 1100 240" preserveAspectRatio="none">
              <polygon points="0,240 150,60 280,160 400,30 550,140 700,20 820,100 950,50 1100,120 1100,240" fill="white"/>
            </svg>
            <div className="absolute bottom-4 left-6 text-white/80 text-[10px] tracking-widest uppercase">Wall Calendar • Nature Series</div>
            
            {/* Theme Dots */}
            <div className="absolute top-4 right-6 flex gap-2">
              {THEMES.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 ${t.bg} ${theme === t.id ? 'border-white scale-110' : 'border-white/40'}`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12">
            
            {/* Left: Calendar Grid */}
            <div className="md:col-span-8 p-6 border-r border-[#e0d8cc]">
              <div className="flex justify-between items-baseline mb-8">
                <h2 className="text-4xl font-serif">
                  {MONTHS[month]} <em className="text-[#2d6a4f] not-italic opacity-70">{year}</em>
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleNavigate(-1)} className="p-2 rounded-full border border-[#e0d8cc] hover:bg-[#d8f3dc] transition-colors"><ChevronLeft size={18}/></button>
                  <button onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))} className="px-4 py-1 text-xs rounded-full border border-[#e0d8cc] hover:bg-[#d8f3dc]">Today</button>
                  <button onClick={() => handleNavigate(1)} className="p-2 rounded-full border border-[#e0d8cc] hover:bg-[#d8f3dc] transition-colors"><ChevronRight size={18}/></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                  <div key={d} className={`text-center text-[10px] font-bold uppercase tracking-widest py-2 ${i === 0 || i === 6 ? 'text-[#2d6a4f]' : 'text-[#6b6458]'}`}>{d}</div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div 
                  key={storageKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
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

                    return (
                      <button
                        key={ds}
                        onClick={() => onDayClick(ds)}
                        className={`
                          relative aspect-square flex flex-col items-center pt-2 rounded-md transition-all
                          ${isStart || isEnd ? 'bg-[#2d6a4f] text-white z-10 scale-105' : ''}
                          ${inRange ? 'bg-[#d8f3dc] rounded-none' : ''}
                          ${!isStart && !isEnd && !inRange ? 'hover:bg-[#d8f3dc]' : ''}
                        `}
                      >
                        <span className={`text-sm ${isToday && !isStart && !isEnd ? 'text-[#e9c46a] font-bold' : ''}`}>{day}</span>
                        {isToday && <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#e9c46a]" />}
                        {hasNote && !isStart && !isEnd && <div className="w-1 h-1 rounded-full bg-[#2d6a4f]/40 mt-1" />}
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {startDate && (
                <div className="mt-6 flex items-center gap-3 bg-[#d8f3dc] border border-[#95d5b2] px-4 py-2 rounded-md text-xs font-medium text-[#2d6a4f]">
                  <CalIcon size={14} />
                  <span>{startDate} {endDate ? `→ ${endDate}` : '→ Pick end date...'}</span>
                  <button onClick={() => { setStartDate(null); setEndDate(null); setIsSelectingEnd(false); }} className="ml-auto hover:text-black"><X size={14}/></button>
                </div>
              )}
            </div>

            {/* Right: Sidebar Notes */}
            <div className="md:col-span-4 p-6 flex flex-col gap-8 bg-[#faf8f3]">
              <section>
                <div className="flex items-center gap-2 mb-4 text-[#1a1a1a] font-serif">
                  <span className="text-lg">Monthly Notes</span>
                  <div className="flex-1 h-px bg-[#e0d8cc]" />
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 flex flex-col pointer-events-none">
                    {[...Array(8)].map((_, i) => <div key={i} className="flex-1 border-bottom border-[#e0d8cc] min-h-[28px] border-b" />)}
                  </div>
                  <textarea 
                    value={currentMonthData.monthNote}
                    onChange={(e) => handleNoteChange(e.target.value, true)}
                    placeholder="Jot down thoughts..."
                    className="relative z-10 w-full bg-transparent border-none outline-none resize-none font-light text-sm leading-[28px] h-[224px] py-0"
                  />
                </div>
              </section>

              <section className={`pt-6 border-t border-[#e0d8cc] transition-opacity duration-300 ${(!startDate || !endDate) ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#6b6458]">Range Note</span>
                  {showSaveStatus && <span className="text-[10px] text-[#2d6a4f] flex items-center gap-1"><Save size={10}/> Saved</span>}
                </div>
                <textarea 
                  value={selectedRangeNote}
                  onChange={(e) => handleNoteChange(e.target.value, false)}
                  placeholder="Notes for selected range..."
                  className="w-full p-3 text-xs bg-[#f0ebe0] border border-[#e0d8cc] rounded outline-none focus:border-[#95d5b2] min-h-[100px]"
                />
              </section>
            </div>
          </div>

          {/* Legend Footer */}
          <div className="bg-[#f0ebe0] px-6 py-3 border-t border-[#e0d8cc] flex justify-between items-center text-[10px] text-[#6b6458]">
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#2d6a4f]" /> Start/End</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#d8f3dc] border border-[#95d5b2]" /> Range</div>
            </div>
            <div>{isSelectingEnd ? "Select end date" : "Select a date to begin"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}