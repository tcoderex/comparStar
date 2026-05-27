import React, { useState, useMemo } from 'react';
import { XaddTemplate, ElementItem } from '../types';
import { GitCompare, Trophy, AlertCircle, Search, Check } from 'lucide-react';

interface Props {
  templates: XaddTemplate[];
  elements: ElementItem[];
}

export function TabCompare({ templates, elements }: Props) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState<string>('');
  const [filterCompany, setFilterCompany] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterXadd, setFilterXadd] = useState<string>('');

  // Sync criteria with filterXadd if filterXadd is specifically chosen
  React.useEffect(() => {
    if (filterXadd) {
      setSelectedTemplateId(filterXadd);
    }
  }, [filterXadd]);

  // If no criteria selected but elements are, try to find a relevant criteria set
  React.useEffect(() => {
    if (!selectedTemplateId && selectedElementIds.length > 0) {
      const firstEl = elements.find(el => el.id === selectedElementIds[0]);
      if (firstEl?.templateId) {
        setSelectedTemplateId(firstEl.templateId);
      }
    }
  }, [selectedElementIds, elements, selectedTemplateId]);

  const uniqueSubcategories = useMemo(() => Array.from(new Set(elements.map(el => el.subcategory).filter(Boolean))), [elements]);
  const uniqueCompanies = useMemo(() => Array.from(new Set(elements.map(el => el.company).filter(Boolean))), [elements]);
  const uniqueCategories = useMemo(() => Array.from(new Set(elements.map(el => el.category).filter(Boolean))), [elements]);
  const uniqueXadds = useMemo(() => templates.map(t => ({ id: t.id, name: t.name })), [templates]);

  const filteredElements = useMemo(() => {
    return elements.filter(el => {
      const matchSearch = el.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSubcategory = filterSubcategory ? el.subcategory === filterSubcategory : true;
      const matchComp = filterCompany ? el.company === filterCompany : true;
      const matchCat = filterCategory ? el.category === filterCategory : true;
      const matchXadd = filterXadd ? el.templateId === filterXadd : true;
      return matchSearch && matchSubcategory && matchComp && matchCat && matchXadd;
    });
  }, [elements, searchQuery, filterSubcategory, filterCompany, filterCategory, filterXadd]);

  const toggleElementSelection = (id: string) => {
    if (selectedElementIds.includes(id)) {
      setSelectedElementIds(prev => prev.filter(eId => eId !== id));
    } else {
      setSelectedElementIds(prev => {
        const next = [...prev, id];
        // If we just added the first element, try to set the perspective automatically
        if (next.length === 1) {
          const el = elements.find(e => e.id === id);
          if (el && el.templateId) {
            setSelectedTemplateId(el.templateId);
          }
        }
        return next;
      });
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const compareElements = elements.filter(el => selectedElementIds.includes(el.id));

  const comparisonResults = useMemo(() => {
    if (!selectedTemplate || compareElements.length < 2) return null;

    const criteriaResults: Record<string, { winnerIds: string[], maxScore: number }> = {};
    let overallScores: Record<string, number> = {};

    compareElements.forEach(el => {
      overallScores[el.id] = 0;
    });

    selectedTemplate.criteria.forEach(c => {
      let maxScore = -Infinity;
      let winners: string[] = [];

      compareElements.forEach(el => {
        const score = el.ratings[c] !== undefined ? el.ratings[c] : 0;
        overallScores[el.id] += score;

        if (score > maxScore) {
          maxScore = score;
          winners = [el.id];
        } else if (score === maxScore) {
          winners.push(el.id);
        }
      });

      criteriaResults[c] = { winnerIds: winners, maxScore };
    });

    let overallWinners: string[] = [];
    let maxTotal = -Infinity;
    Object.entries(overallScores).forEach(([id, total]) => {
      if (total > maxTotal) {
        maxTotal = total;
        overallWinners = [id];
      } else if (total === maxTotal) {
        overallWinners.push(id);
      }
    });

    const sortedElements = [...compareElements].sort((a, b) => {
      const scoreA = overallScores[a.id];
      const scoreB = overallScores[b.id];
      return scoreB - scoreA;
    });

    return { criteriaResults, overallScores, overallWinners, maxTotal, sortedElements };
  }, [compareElements, selectedTemplate]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="bg-black/80 border border-[#c5b358] shadow-[0_0_20px_rgba(197,179,88,0.15)] mb-8 flex flex-col items-center">
        <div className="w-full relative">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#c5b358]"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#c5b358]"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#c5b358]"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#c5b358]"></div>
          
          <div className="p-6 border-b border-[#333] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-display font-medium flex items-center justify-center gap-3 text-[#e0e0d1] tracking-[0.2em] mx-auto md:mx-0">
              <span className="text-[#444]">♦</span> <span className="uppercase text-center">Library of Whispers</span> <span className="text-[#444]">♦</span>
            </h2>
            <div className="flex items-center gap-2 justify-center">
              <span className="text-[10px] font-display uppercase text-gray-500 tracking-[0.2em]">Artifacts Selected:</span>
              <span className="px-3 py-1 bg-transparent border border-[#c5b358] text-[#c5b358] text-xs font-display rounded-none min-w-[2rem] text-center">
                {selectedElementIds.length}
              </span>
            </div>
          </div>

          <div className="p-4 bg-black/60 space-y-6">
            <div className="flex flex-col xl:flex-row gap-4">
              <div className="flex-1 relative group min-w-0">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#c5b358] transition-colors" />
                <input
                  type="text"
                  placeholder="SEEK ARTIFACT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-black text-[#e0e0d1] border border-[#444444] focus:border-[#c5b358] focus:outline-none transition-all placeholder-gray-600 font-display tracking-[0.2em] uppercase"
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center bg-black border border-[#444444] p-1 w-full lg:w-auto">
                  <select 
                    value={filterXadd} 
                    onChange={e => setFilterXadd(e.target.value)} 
                    className="bg-transparent text-[11px] px-3 py-2 text-gray-300 font-display uppercase tracking-widest cursor-pointer border-r border-[#333] lg:border-r-0 focus:outline-none focus:border-[#c5b358]"
                  >
                    <option value="" className="bg-black">All Tomes</option>
                    {uniqueXadds.map(t => <option key={t.id} value={t.id} className="bg-black">{t.name}</option>)}
                  </select>
                  <div className="hidden lg:block w-px h-4 bg-[#444] mx-1"></div>
                  <select 
                    value={filterCategory} 
                    onChange={e => setFilterCategory(e.target.value)} 
                    className="bg-transparent text-[11px] px-3 py-2 text-gray-300 font-display uppercase tracking-widest cursor-pointer sm:border-r border-[#333] lg:border-r-0 focus:outline-none focus:border-[#c5b358]"
                  >
                    <option value="" className="bg-black">Any Category</option>
                    {uniqueCategories.map((cat: any) => <option key={cat} value={cat} className="bg-black">{cat}</option>)}
                  </select>
                  <div className="hidden lg:block w-px h-4 bg-[#444] mx-1"></div>
                  <select 
                    value={filterSubcategory} 
                    onChange={e => setFilterSubcategory(e.target.value)} 
                    className="bg-transparent text-[11px] px-3 py-2 text-gray-300 font-display uppercase tracking-widest cursor-pointer border-r border-[#333] lg:border-r-0 focus:outline-none focus:border-[#c5b358]"
                  >
                    <option value="" className="bg-black">Any Sub-cat</option>
                    {uniqueSubcategories.map((cat: any) => <option key={cat} value={cat} className="bg-black">{cat}</option>)}
                  </select>
                  <div className="hidden lg:block w-px h-4 bg-[#444] mx-1"></div>
                  <select 
                    value={filterCompany} 
                    onChange={e => setFilterCompany(e.target.value)} 
                    className="bg-transparent text-[11px] px-3 py-2 text-gray-300 font-display uppercase tracking-widest cursor-pointer focus:outline-none focus:border-[#c5b358]"
                  >
                    <option value="" className="bg-black">Any Faction</option>
                    {uniqueCompanies.map((sub: any) => <option key={sub} value={sub} className="bg-black">{sub}</option>)}
                  </select>
                </div>
                
                <button 
                  onClick={() => {
                    setFilterXadd('');
                    setFilterCategory('');
                    setFilterSubcategory('');
                    setFilterCompany('');
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 text-[10px] font-display uppercase tracking-[0.2em] text-gray-500 hover:text-[#c5b358] transition-colors ml-auto sm:ml-0"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-1 custom-scrollbar">
              {filteredElements.length === 0 ? (
                <div className="col-span-full p-12 text-center text-gray-500 font-display uppercase tracking-[0.2em] bg-black/40 border border-[#333] border-dashed">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>The library is empty. Your search yields nothing.</p>
                </div>
              ) : (
                filteredElements.map(el => {
                  const isSelected = selectedElementIds.includes(el.id);
                  return (
                    <button
                      key={el.id}
                      onClick={() => toggleElementSelection(el.id)}
                      className={`group relative p-4 text-left transition-all border-2 text-sm ${
                        isSelected
                          ? 'bg-black border-[#c5b358] shadow-[0_0_10px_rgba(197,179,88,0.3)]'
                          : 'bg-black/50 border-[#444444] hover:border-gray-500 hover:bg-[#111]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <span className={`font-display text-lg tracking-[0.1em] uppercase ${isSelected ? 'text-[#c5b358]' : 'text-[#e0e0d1]'}`}>
                           {el.name}
                         </span>
                         <div className={`w-5 h-5 flex items-center justify-center transition-all ${isSelected ? 'bg-transparent text-[#c5b358]' : 'text-transparent'}`}>
                           ♦
                         </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {el.templateName && <span className="text-[9px] font-display uppercase text-gray-500 tracking-[0.1em]">[{el.templateName}]</span>}
                        {el.category && <span className="text-[9px] font-display uppercase text-gray-400 bg-[#333] px-1.5 py-0.5 tracking-[0.1em] border border-[#555]">{el.category}</span>}
                        {el.subcategory && <span className="text-[9px] font-display uppercase text-gray-400 bg-[#333] px-1.5 py-0.5 tracking-[0.1em] border border-[#555]">{el.subcategory}</span>}
                        {el.company && <span className="text-[9px] font-display uppercase text-gray-400 bg-[#333] px-1.5 py-0.5 tracking-[0.1em] border border-[#555]">{el.company}</span>}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {!selectedTemplate && selectedElementIds.length >= 2 ? (
            <div className="bg-black/80 border border-[#c5b358] shadow-[0_0_20px_rgba(197,179,88,0.2)] p-8 text-center space-y-4">
               <AlertCircle className="w-10 h-10 text-[#c5b358] mx-auto" />
               <h3 className="text-xl font-display font-medium text-[#e0e0d1] tracking-[0.2em] uppercase">Tome Required</h3>
               <p className="text-sm text-gray-400 max-w-md mx-auto font-display tracking-widest leading-relaxed">To decipher these artifacts, we need a tome of attributes. Select an XADD to use as the framework for this ritual.</p>
               <select 
                 className="mx-auto block px-6 py-3 bg-black border border-[#c5b358] text-[#c5b358] text-sm font-display uppercase tracking-[0.2em] focus:outline-none focus:ring-1 focus:ring-[#c5b358] shadow-[0_0_10px_rgba(197,179,88,0.1)] outline-none"
                 value={selectedTemplateId} 
                 onChange={e => setSelectedTemplateId(e.target.value)}
               >
                 <option value="" className="text-gray-500 bg-black">-- Choose A Tome --</option>
                 {templates.map(t => <option key={t.id} value={t.id} className="text-[#e0e0d1] bg-black">{t.name}</option>)}
               </select>
            </div>
        ) : selectedElementIds.length < 2 ? (
          <div className="p-20 text-center space-y-4 bg-black/40 border border-[#333] border-dashed">
            <div className="w-16 h-16 bg-black border border-[#444444] shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center mx-auto mb-6 transform -rotate-12 group-hover:rotate-0 transition-transform">
               <GitCompare className="w-8 h-8 text-[#c5b358]" />
            </div>
            <h3 className="text-2xl font-display uppercase tracking-[0.2em] text-[#e0e0d1]">Ready to Decipher?</h3>
            <p className="text-gray-500 font-display max-w-sm mx-auto uppercase text-xs tracking-widest leading-relaxed">Select at least <span className="text-[#c5b358] font-bold">Two Artifacts</span> to reveal the hidden truths.</p>
          </div>
        ) : (comparisonResults && selectedTemplate) ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between border-b border-[#333] pb-6 gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-display uppercase text-[#e0e0d1] tracking-[0.2em]">The Revelation</h1>
                  {comparisonResults.overallWinners.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-black text-[#c5b358] text-[10px] sm:text-xs font-display uppercase tracking-[0.2em] border border-[#c5b358] shadow-[0_0_10px_rgba(197,179,88,0.2)]">
                      <Trophy className="w-3.5 h-3.5 sm:w-4 h-4 fill-current" />
                      Champion Declared
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                   <span className="text-gray-500 font-display uppercase text-[9px] sm:text-[10px] tracking-[0.2em] whitespace-nowrap">
                    Perspective of:
                  </span>
                  <div className="relative inline-block w-full sm:w-auto">
                    <select 
                      className="w-full sm:w-auto bg-transparent border-b-2 border-[#c5b358] font-display text-[#c5b358] focus:outline-none px-2 py-1 text-xs sm:text-sm uppercase tracking-[0.2em] appearance-none cursor-pointer pr-8"
                      value={selectedTemplateId}
                      onChange={e => setSelectedTemplateId(e.target.value)}
                    >
                      {templates.map(t => <option key={t.id} value={t.id} className="bg-black text-[#e0e0d1]">{t.name}</option>)}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-[#c5b358]">
                      <Search className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-start xl:justify-end xl:max-w-xs">
                {selectedTemplate.criteria.map(c => (
                  <span key={c} className="px-2 py-0.5 sm:px-3 sm:py-1 bg-black border border-[#444444] text-[9px] sm:text-[10px] font-display uppercase text-gray-400 tracking-widest whitespace-nowrap">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-black/80 border border-[#c5b358] shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden relative">
               <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#c5b358] z-20 pointer-events-none"></div>
               <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#c5b358] z-20 pointer-events-none"></div>
               <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#c5b358] z-20 pointer-events-none"></div>
               <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#c5b358] z-20 pointer-events-none"></div>
               
               <div className="overflow-x-auto custom-scrollbar relative z-10">
                <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-[800px]">
                  <thead>
                    <tr className="border-b border-[#c5b358] bg-black">
                      <th className="w-40 sm:w-64 p-4 sm:p-6 border-r border-[#444444] font-display text-gray-500 text-[10px] sm:text-xs uppercase tracking-[0.2em] sticky left-0 bg-black z-10 shadow-[1px_0_0_#444]">
                        Tome Attributes
                      </th>
                      {comparisonResults.sortedElements.map(el => {
                        const isWinner = comparisonResults.overallWinners.includes(el.id);
                        return (
                          <th key={el.id} className="p-4 sm:p-6 border-r border-[#444444] bg-black last:border-r-0 relative min-w-[150px] sm:min-w-[200px]">
                             {isWinner && <div className="absolute top-0 left-0 w-full h-1 bg-[#c5b358] shadow-[0_2px_10px_rgba(197,179,88,0.5)]"></div>}
                            <div className="flex flex-col gap-0.5 sm:gap-1">
                              <span className={`text-[9px] sm:text-[10px] font-display uppercase tracking-[0.2em] ${isWinner ? 'text-[#c5b358]' : 'text-gray-500'}`}>
                                {isWinner ? 'Champion' : 'Artifact'}
                              </span>
                              <span className={`font-display bg-transparent text-base sm:text-xl tracking-[0.1em] break-words uppercase ${isWinner ? 'text-white' : 'text-[#e0e0d1]'}`}>{el.name}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333]">
                    {selectedTemplate.criteria.map(c => {
                      const result = comparisonResults.criteriaResults[c];
                      return (
                        <tr key={c} className="group hover:bg-[#111] transition-colors relative z-0">
                          <td className="w-40 sm:w-64 p-4 sm:p-6 border-r border-[#444444] align-top sticky left-0 bg-black group-hover:bg-[#111] transition-colors z-10 shadow-[1px_0_0_#444]">
                            <span className="font-display text-[#e0e0d1] block text-[10px] sm:text-xs uppercase tracking-[0.2em]">{c}</span>
                            <div className="w-4 sm:w-6 h-px bg-[#c5b358] mt-2"></div>
                          </td>
                          {comparisonResults.sortedElements.map(el => {
                            const score = el.ratings[c] !== undefined ? el.ratings[c] : 0;
                            const isWinner = result.winnerIds.includes(el.id);
                            
                            return (
                              <td key={el.id} className={`p-4 sm:p-6 border-r border-[#444444] last:border-r-0 align-middle ${isWinner ? 'bg-[#c5b358]/10 relative z-0' : 'relative z-0'}`}>
                                <div className="space-y-2 sm:space-y-3 z-10 relative">
                                  <div className="flex justify-between items-end">
                                    <span className={`text-xl sm:text-2xl font-display tracking-widest ${score < 0 ? 'text-red-500' : isWinner ? 'text-[#c5b358]' : 'text-gray-300'}`}>
                                      {score}
                                      <span className="text-[9px] sm:text-[10px] text-gray-500 ml-0.5 sm:ml-1 font-bold">PTS</span>
                                    </span>
                                    {isWinner && <span className="text-[#c5b358] text-sm">♦</span>}
                                  </div>
                                  <div className="h-1 sm:h-1.5 bg-[#222] overflow-hidden flex shadow-inner">
                                    <div 
                                      className={`h-full transition-all duration-1000 ease-out ${isWinner ? 'bg-[#c5b358] shadow-[0_0_8px_rgba(197,179,88,0.8)]' : 'bg-gray-500'}`}
                                      style={{ width: `${Math.max(0, Math.min(100, ((score + 20) / 40) * 100))}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-black/90 text-white border-t border-[#c5b358]">
                    <tr>
                      <td className="w-40 sm:w-64 p-4 sm:p-8 border-r border-[#444444] align-middle sticky left-0 bg-black/90 z-10 shadow-[1px_0_0_#444]">
                        <div className="text-[8px] sm:text-[10px] font-display uppercase tracking-[0.2em] text-[#c5b358] mb-1 sm:mb-2">Culmination</div>
                        <div className="text-base sm:text-xl font-display tracking-[0.1em] uppercase whitespace-nowrap text-[#e0e0d1]">Final Verdict</div>
                      </td>
                      {comparisonResults.sortedElements.map(el => {
                         const total = comparisonResults.overallScores[el.id];
                         const isWinner = comparisonResults.overallWinners.includes(el.id);
                         const avg = (+total / selectedTemplate.criteria.length).toFixed(1);
                         return (
                            <td key={el.id} className={`p-4 sm:p-8 border-r border-[#444444] last:border-r-0 ${isWinner ? 'bg-[#c5b358]/20 relative shadow-inner' : ''}`}>
                              {isWinner && <div className="absolute inset-x-0 bottom-0 h-1 sm:h-1.5 bg-[#c5b358] shadow-[0_0_20px_rgba(197,179,88,0.8)]"></div>}
                              <div className="flex items-center justify-between gap-3 sm:gap-6">
                                <div className="space-y-0.5 sm:space-y-1">
                                  <div className={`text-3xl sm:text-5xl font-display tracking-widest ${isWinner ? 'text-[#c5b358]' : 'text-gray-300'}`}>
                                    {avg}
                                    <span className={`text-[10px] sm:text-xs ml-0.5 sm:ml-1 font-bold ${isWinner ? 'text-gray-400' : 'text-gray-600'}`}>/20</span>
                                  </div>
                                  <div className={`text-[8px] sm:text-[10px] uppercase font-display tracking-[0.2em] ${isWinner ? 'text-[#c5b358]' : 'text-gray-500'}`}>
                                    {isWinner ? 'Grand Champion' : 'Tally'}
                                  </div>
                                </div>
                                {isWinner && (
                                  <div className="flex items-center justify-center shrink-0 text-[#c5b358]">
                                    <Trophy className="w-5 h-5 sm:w-8 sm:h-8 fill-[#c5b358] opacity-80 filter drop-shadow-[0_0_8px_rgba(197,179,88,0.8)]" />
                                  </div>
                                )}
                              </div>
                            </td>
                         )
                      })}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #000; 
          border: 1px solid #333;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333; 
          border: 1px solid #444;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c5b358; 
          border: 1px solid #e0e0d1;
        }
      `}</style>
    </div>
  );
}
