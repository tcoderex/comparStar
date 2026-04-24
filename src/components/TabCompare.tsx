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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 overflow-hidden rounded-xl">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
            <GitCompare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span className="uppercase tracking-tighter">Compare Workspace</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Items Selected:</span>
            <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full min-w-[2rem] text-center shadow-lg shadow-indigo-200/50 dark:shadow-none">
              {selectedElementIds.length}
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 space-y-4">
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex-1 relative group min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-lg p-1 shadow-sm w-full lg:w-auto">
                <select 
                  value={filterXadd} 
                  onChange={e => setFilterXadd(e.target.value)} 
                  className="bg-transparent text-[11px] px-3 py-2 focus:outline-none text-slate-700 dark:text-slate-200 font-bold uppercase tracking-tight cursor-pointer border-r border-slate-100 dark:border-slate-800 lg:border-r-0"
                >
                  <option value="">All XADDs</option>
                  {uniqueXadds.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <div className="hidden lg:block w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <select 
                  value={filterCategory} 
                  onChange={e => setFilterCategory(e.target.value)} 
                  className="bg-transparent text-[11px] px-3 py-2 focus:outline-none text-slate-700 dark:text-slate-200 font-bold uppercase tracking-tight cursor-pointer sm:border-r border-slate-100 dark:border-slate-800 lg:border-r-0"
                >
                  <option value="">Any Category</option>
                  {uniqueCategories.map((cat: any) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div className="hidden lg:block w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <select 
                  value={filterSubcategory} 
                  onChange={e => setFilterSubcategory(e.target.value)} 
                  className="bg-transparent text-[11px] px-3 py-2 focus:outline-none text-slate-700 dark:text-slate-200 font-bold uppercase tracking-tight cursor-pointer border-r border-slate-100 dark:border-slate-800 lg:border-r-0"
                >
                  <option value="">Any Subcategory</option>
                  {uniqueSubcategories.map((cat: any) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div className="hidden lg:block w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <select 
                  value={filterCompany} 
                  onChange={e => setFilterCompany(e.target.value)} 
                  className="bg-transparent text-[11px] px-3 py-2 focus:outline-none text-slate-700 dark:text-slate-300 font-bold uppercase tracking-tight cursor-pointer"
                >
                  <option value="">Any Company</option>
                  {uniqueCompanies.map((sub: any) => <option key={sub} value={sub}>{sub}</option>)}
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
                className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ml-auto sm:ml-0"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-1 custom-scrollbar">
            {filteredElements.length === 0 ? (
              <div className="col-span-full p-12 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No elements match your filters.</p>
              </div>
            ) : (
              filteredElements.map(el => {
                const isSelected = selectedElementIds.includes(el.id);
                return (
                  <button
                    key={el.id}
                    onClick={() => toggleElementSelection(el.id)}
                    className={`group relative p-4 rounded-xl text-left transition-all border-2 text-sm ${
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-500'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className={`font-black tracking-tight text-base ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-800 dark:text-slate-200'}`}>
                         {el.name}
                       </span>
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 dark:border-slate-700'}`}>
                         {isSelected && <Check className="w-3 h-3 text-white" />}
                       </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 opacity-80 mt-auto">
                      {el.templateName && <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">[{el.templateName}]</span>}
                      {el.category && <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded tracking-tighter">{el.category}</span>}
                      {el.subcategory && <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded tracking-tighter">{el.subcategory}</span>}
                      {el.company && <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded tracking-tighter">{el.company}</span>}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {!selectedTemplate && selectedElementIds.length >= 2 ? (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-8 rounded-xl text-center space-y-4">
               <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">Criteria Required</h3>
               <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto font-medium">To generate a comparison table, we need a set of evaluation criteria. Select an XADD to use as the "Perspective" for this analysis.</p>
               <select 
                 className="mx-auto block px-6 py-3 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-lg text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                 value={selectedTemplateId} 
                 onChange={e => setSelectedTemplateId(e.target.value)}
               >
                 <option value="">-- Choose Comparison Mode --</option>
                 {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
               </select>
            </div>
        ) : selectedElementIds.length < 2 ? (
          <div className="p-20 text-center space-y-4 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-6 transform -rotate-12 group-hover:rotate-0 transition-transform">
               <GitCompare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ready to Compare?</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto uppercase text-xs tracking-widest">Select at least <span className="text-indigo-600 dark:text-indigo-400 font-black">Two Elements</span> to reveal the comparison analysis scores.</p>
          </div>
        ) : (comparisonResults && selectedTemplate) ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between border-b pb-6 border-slate-200 dark:border-slate-800 gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Analysis Results</h1>
                  {comparisonResults.overallWinners.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-800 shadow-sm">
                      <Trophy className="w-3.5 h-3.5 sm:w-4 h-4 fill-current" />
                      Win Identified
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                   <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.2em] whitespace-nowrap">
                    Evaluation Perspective:
                  </span>
                  <div className="relative inline-block w-full sm:w-auto">
                    <select 
                      className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800 border-b-2 border-indigo-500 font-black text-slate-900 dark:text-slate-100 focus:outline-none px-2 py-1 text-xs sm:text-sm uppercase tracking-tight rounded-t shadow-sm appearance-none cursor-pointer pr-8"
                      value={selectedTemplateId}
                      onChange={e => setSelectedTemplateId(e.target.value)}
                    >
                      {templates.map(t => <option key={t.id} value={t.id} className="text-slate-900">{t.name}</option>)}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                      <Search className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-start xl:justify-end xl:max-w-xs">
                {selectedTemplate.criteria.map(c => (
                  <span key={c} className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[9px] sm:text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 rounded-lg shadow-sm whitespace-nowrap">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
               <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/80">
                      <th className="w-40 sm:w-64 p-4 sm:p-6 border-r border-slate-200 dark:border-slate-800 font-black text-slate-400 text-[10px] sm:text-xs uppercase tracking-widest sticky left-0 bg-slate-50 dark:bg-slate-950 z-10 shadow-[1px_0_0_#e2e8f0] dark:shadow-[1px_0_0_#1e293b]">
                        Evaluation Metrics
                      </th>
                      {comparisonResults.sortedElements.map(el => {
                        const isWinner = comparisonResults.overallWinners.includes(el.id);
                        return (
                          <th key={el.id} className="p-4 sm:p-6 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 last:border-r-0 relative min-w-[150px] sm:min-w-[200px]">
                             {isWinner && <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 shadow-[0_2px_10px_rgba(16,185,129,0.3)]"></div>}
                            <div className="flex flex-col gap-0.5 sm:gap-1">
                              <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${isWinner ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {isWinner ? 'Best Overall' : 'Element'}
                              </span>
                              <span className="font-black text-slate-900 dark:text-slate-100 text-base sm:text-xl tracking-tighter break-words">{el.name}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedTemplate.criteria.map(c => {
                      const result = comparisonResults.criteriaResults[c];
                      return (
                        <tr key={c} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="w-40 sm:w-64 p-4 sm:p-6 border-r border-slate-200 dark:border-slate-800 align-top sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors z-10 shadow-[1px_0_0_#e2e8f0] dark:shadow-[1px_0_0_#1e293b]">
                            <span className="font-black text-slate-800 dark:text-slate-200 block text-[10px] sm:text-xs uppercase tracking-wider">{c}</span>
                            <div className="w-4 sm:w-6 h-1 bg-indigo-500 mt-1.5 sm:mt-2"></div>
                          </td>
                          {comparisonResults.sortedElements.map(el => {
                            const score = el.ratings[c] !== undefined ? el.ratings[c] : 0;
                            const isWinner = result.winnerIds.includes(el.id);
                            
                            return (
                              <td key={el.id} className={`p-4 sm:p-6 border-r border-slate-100 dark:border-slate-800 last:border-r-0 align-middle ${isWinner ? 'bg-emerald-50/10 dark:bg-emerald-900/5' : ''}`}>
                                <div className="space-y-2 sm:space-y-3">
                                  <div className="flex justify-between items-end">
                                    <span className={`text-xl sm:text-2xl font-black tracking-tight ${score < 0 ? 'text-red-500' : isWinner ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                      {score}
                                      <span className="text-[9px] sm:text-[10px] text-slate-400 ml-0.5 sm:ml-1 font-bold">pts</span>
                                    </span>
                                    {isWinner && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />}
                                  </div>
                                  <div className="h-1.5 sm:h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                                    <div 
                                      className={`h-full transition-all duration-1000 ease-out shadow-sm ${isWinner ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-indigo-400 to-indigo-600'}`}
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
                  <tfoot className="bg-slate-950 text-white font-bold border-t border-slate-800">
                    <tr>
                      <td className="w-40 sm:w-64 p-4 sm:p-8 border-r border-slate-800 align-middle sticky left-0 bg-slate-950 z-10 shadow-[1px_0_0_#1e293b]">
                        <div className="text-[8px] sm:text-[10px] font-black uppercase text-indigo-400 mb-1 sm:mb-2 tracking-[0.2em]">Summary</div>
                        <div className="text-base sm:text-xl font-black tracking-tighter uppercase whitespace-nowrap">Average</div>
                      </td>
                      {comparisonResults.sortedElements.map(el => {
                         const total = comparisonResults.overallScores[el.id];
                         const isWinner = comparisonResults.overallWinners.includes(el.id);
                         const avg = (+total / selectedTemplate.criteria.length).toFixed(1);
                         return (
                            <td key={el.id} className={`p-4 sm:p-8 border-r border-slate-800 last:border-r-0 ${isWinner ? 'bg-indigo-900/30 relative' : ''}`}>
                              {isWinner && <div className="absolute inset-x-0 bottom-0 h-1.5 sm:h-2 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>}
                              <div className="flex items-center justify-between gap-3 sm:gap-6">
                                <div className="space-y-0.5 sm:space-y-1">
                                  <div className={`text-3xl sm:text-5xl font-black tracking-tighter ${isWinner ? 'text-emerald-400' : 'text-slate-100'}`}>
                                    {avg}
                                    <span className={`text-[10px] sm:text-xs ml-0.5 sm:ml-1 font-bold ${isWinner ? 'text-emerald-600' : 'text-slate-500'}`}>/20</span>
                                  </div>
                                  <div className={`text-[8px] sm:text-[10px] uppercase font-black tracking-[0.15em] ${isWinner ? 'text-emerald-500' : 'text-slate-500'}`}>
                                    {isWinner ? 'Winner' : 'Score'}
                                  </div>
                                </div>
                                {isWinner && (
                                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-emerald-500 rounded-full flex items-center justify-center rotate-12 shadow-lg shadow-emerald-900/50 transform scale-100 sm:scale-110 shrink-0">
                                    <Trophy className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
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
          background: #f1f5f9; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
      `}</style>
    </div>
  );
}
