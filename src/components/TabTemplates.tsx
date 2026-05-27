import React, { useState, useMemo } from 'react';
import { Settings, Plus, Trash2, Save, Edit2, Sparkles } from 'lucide-react';
import { XaddTemplate } from '../types';
import { SuggestionInput } from './SuggestionInput';
import { useAppStore } from '../store';

interface Props {
  store: any;
  templates: XaddTemplate[];
  addTemplate: (t: Omit<XaddTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<Omit<XaddTemplate, 'id' | 'userId' | 'createdAt'>>) => void;
  deleteTemplate: (id: string) => void;
}

export function TabTemplates({ store, templates, addTemplate, updateTemplate, deleteTemplate }: Props) {
  const [name, setName] = useState('');
  const [criteriaInput, setCriteriaInput] = useState('');
  const [criteria, setCriteria] = useState<string[]>([]);

  const customSuggestions = store.state.customSuggestions;

  const allUniqueCriteria = useMemo(() => {
    const set = new Set<string>();
    templates.forEach(t => t.criteria.forEach(c => set.add(c)));
    return Array.from(set).sort();
  }, [templates]);

  // Logic for "Most Frequent" criteria to help organization
  const popularCriteria = useMemo(() => {
    const counts: Record<string, number> = {};
    templates.forEach(t => t.criteria.forEach(c => counts[c] = (counts[c] || 0) + 1));
    const frequent = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
    
    // Combine global and frequent, unique
    return Array.from(new Set([...customSuggestions, ...frequent]));
  }, [templates, customSuggestions]);

  const handleAddCriteria = (val?: string) => {
    const target = (val || criteriaInput).trim().toUpperCase();
    if (target && !criteria.includes(target)) {
      setCriteria([...criteria, target]);
      setCriteriaInput('');
    }
  };

  const handleRemoveCriteria = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    const nameTrimmed = name.trim().toUpperCase();
    if (!nameTrimmed) {
      setError('Please enter a name for the workspace.');
      return;
    }
    if (criteria.length === 0) {
      setError('Please add at least one criteria.');
      return;
    }

    if (templates.some(t => t.name.toUpperCase() === nameTrimmed)) {
      setError('A workspace with this name already exists.');
      return;
    }

    addTemplate({ name: nameTrimmed, criteria });
    
    // Auto-add new criteria to settings
    const newSuggestions = [...customSuggestions];
    let changed = false;
    for (const c of criteria) {
      if (!newSuggestions.includes(c)) {
        newSuggestions.push(c);
        changed = true;
      }
    }
    if (changed) store.updateSettings({ customSuggestions: newSuggestions });

    setName('');
    setCriteria([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      {error && (
        <div className="bg-red-950/40 border border-red-900 p-3 text-red-500 text-xs font-bold uppercase tracking-widest font-display animate-in fade-in zoom-in duration-300">
          {error}
        </div>
      )}

      <div className="bg-black/60 p-6 md:p-8 border border-[#444444] shadow-lg relative">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#c5b358]"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#c5b358]"></div>
        
        <h2 className="text-xl font-display font-medium tracking-[0.2em] mb-8 flex items-center justify-center gap-3 text-[#e0e0d1] border-b border-[#333] pb-6 uppercase">
          <span className="text-[#444]">♦</span> CREATE NEW TOME <span className="text-[#444]">♦</span>
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-display uppercase tracking-[0.1em] text-gray-500 mb-2">
                Tome Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-4 bg-black/50 border border-[#333] text-[#e0e0d1] focus:outline-none focus:border-[#c5b358] transition-colors font-bold text-sm uppercase placeholder-gray-600 font-display tracking-widest"
                placeholder="ENTER NAME (e.g. WEAPONS)"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-[0.1em] text-gray-500 mb-2">
                Clone Criteria From
              </label>
              <select
                onChange={(e) => {
                  const t = templates.find(temp => temp.id === e.target.value);
                  if (t) setCriteria([...t.criteria]);
                }}
                className="w-full px-4 py-4 bg-black/50 border border-[#333] text-[#e0e0d1] focus:outline-none focus:border-[#c5b358] font-bold text-sm uppercase cursor-pointer appearance-none font-display tracking-widest"
                defaultValue=""
              >
                <option value="" disabled className="text-gray-600">-- SELECT TOME TO CLONE --</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-display uppercase tracking-[0.1em] text-gray-500 mb-2 mt-4">
              Attributes / Criteria
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <SuggestionInput
                value={criteriaInput}
                onChange={setCriteriaInput}
                suggestions={allUniqueCriteria}
                className="w-full px-4 py-4 bg-black/50 border border-[#333] text-[#e0e0d1] focus:outline-none focus:border-[#c5b358] transition-colors font-bold text-sm uppercase font-display tracking-widest placeholder-gray-600"
                placeholder="ENTER ATTRIBUTE (e.g. DAMAGE, WEIGHT)"
              />
              <button
                type="button"
                onClick={() => handleAddCriteria()}
                className="px-8 py-4 bg-transparent border border-[#444444] text-[#c5b358] hover:bg-[#c5b358] hover:text-black transition-colors flex items-center justify-center gap-2 font-display uppercase tracking-widest text-sm"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>

            {/* Global Suggestions Box */}
            <div className="mt-8 p-6 bg-black/40 border border-[#333]">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#c5b358]" />
                <span className="text-xs font-display uppercase text-gray-400 tracking-widest">Global Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularCriteria.map(pc => (
                  <button
                    key={pc}
                    type="button"
                    onClick={() => handleAddCriteria(pc)}
                    className={`px-3 py-1.5 bg-transparent border border-[#444444] text-[10px] font-display uppercase tracking-widest transition-all ${
                      criteria.includes(pc)
                        ? 'opacity-30 cursor-default line-through text-gray-500'
                        : 'text-gray-300 hover:border-[#c5b358] hover:text-[#c5b358]'
                    }`}
                    disabled={criteria.includes(pc)}
                  >
                    + {pc}
                  </button>
                ))}
              </div>
            </div>
            
            {criteria.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {criteria.map((c, i) => (
                  <li key={i} className="bg-black border border-[#c5b358] text-[#c5b358] px-3 py-1.5 text-xs font-display uppercase tracking-widest flex items-center gap-3">
                    {c}
                    <button
                      onClick={() => handleRemoveCriteria(i)}
                      className="text-[#c5b358] hover:text-red-500 focus:outline-none p-0.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-8 mt-8 border-t border-[#333] flex justify-center">
            <button
              onClick={handleSave}
              disabled={!name.trim() || criteria.length === 0}
              className="px-8 py-4 bg-transparent border border-[#444444] text-[#c5b358] hover:border-[#c5b358] hover:bg-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-display text-sm tracking-[0.2em] uppercase w-full sm:w-auto"
            >
              <Save className="w-4 h-4" />
              Scribe Tome
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-display tracking-[0.1em] text-gray-500 uppercase flex items-center gap-2">
          <span className="text-[#444]">♦</span> Saved Tomes <span className="text-[#444]">♦</span>
        </h3>
        {templates.length === 0 ? (
          <div className="p-4 bg-black/50 border border-[#333] text-gray-500 text-sm font-display tracking-widest flex justify-center">No tomes exist in the library.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <TemplateRow 
                key={t.id} 
                t={t} 
                deleteTemplate={deleteTemplate} 
                updateTemplate={updateTemplate}
                allUniqueCriteria={allUniqueCriteria}
                popularCriteria={popularCriteria}
                store={store}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TemplateRowProps {
  key?: string;
  t: XaddTemplate;
  deleteTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<Omit<XaddTemplate, 'id' | 'userId' | 'createdAt'>>) => void;
  allUniqueCriteria: string[];
  popularCriteria: string[];
  store: any;
}

function TemplateRow({ t, deleteTemplate, updateTemplate, allUniqueCriteria, popularCriteria, store }: TemplateRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState(t.name);
  const [localCriteria, setLocalCriteria] = useState(t.criteria);
  const [newCriteria, setNewCriteria] = useState('');

  const handleSave = () => {
    if (localName.trim() && localCriteria.length > 0) {
      updateTemplate(t.id, { name: localName.trim().toUpperCase(), criteria: localCriteria });

      const newSuggestions = [...(store.state.customSuggestions || [])];
      let changed = false;
      for (const c of localCriteria) {
        if (!newSuggestions.includes(c)) {
          newSuggestions.push(c);
          changed = true;
        }
      }
      if (changed) store.updateSettings({ customSuggestions: newSuggestions });

    }
    setIsEditing(false);
  };

  const addCriteria = (val?: string) => {
    const target = (val || newCriteria).trim().toUpperCase();
    if (target && !localCriteria.includes(target)) {
      setLocalCriteria([...localCriteria, target]);
      setNewCriteria('');
    }
  };

  if (isEditing) {
    return (
      <div className="bg-black/80 p-6 border border-[#c5b358] flex flex-col items-start gap-4 w-full shadow-[0_0_15px_rgba(197,179,88,0.2)]">
        <input
          type="text"
          className="w-full px-3 py-2 bg-black border border-[#c5b358] focus:outline-none focus:ring-1 focus:ring-[#c5b358] font-display text-lg text-[#e0e0d1] tracking-widest uppercase"
          value={localName}
          onChange={(e) => setLocalName(e.target.value.toUpperCase())}
          placeholder="TOME NAME"
        />
        
        <div className="w-full space-y-2">
          <div className="flex gap-2">
            <SuggestionInput
              value={newCriteria}
              onChange={setNewCriteria}
              suggestions={allUniqueCriteria}
              className="flex-1 px-3 py-2 bg-black border border-[#444444] focus:outline-none focus:border-[#c5b358] text-sm text-[#e0e0d1] font-display tracking-widest uppercase placeholder-gray-600"
              placeholder="NEW ATTRIBUTE..."
            />
            <button onClick={() => addCriteria()} className="px-4 bg-transparent border border-[#444444] text-[#c5b358] hover:border-[#c5b358] font-display uppercase tracking-widest text-sm transition-colors">Add</button>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-1">
             {popularCriteria.slice(0, 5).map(pc => (
               <button
                 key={pc}
                 onClick={() => addCriteria(pc)}
                 className="text-[10px] font-display tracking-widest uppercase text-gray-500 hover:text-[#c5b358] px-1 transition-colors"
               >
                 + {pc}
               </button>
             ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {localCriteria.map((c, i) => (
              <span key={i} className="flex items-center gap-1 bg-black text-gray-300 px-2.5 py-1 text-[10px] uppercase font-display tracking-widest border border-[#444444]">
                {c}
                <button onClick={() => setLocalCriteria(localCriteria.filter((_, idx) => idx !== i))} className="text-[#c5b358] hover:text-red-500 ml-1 transition-colors">
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2 w-full mt-4">
          <button onClick={handleSave} className="flex-1 bg-transparent border border-[#c5b358] text-[#c5b358] py-2 text-xs font-display uppercase tracking-[0.2em] hover:bg-[#c5b358] hover:text-black transition-colors">
            Seal
          </button>
          <button onClick={() => { setLocalName(t.name); setLocalCriteria(t.criteria); setIsEditing(false); }} className="flex-1 bg-transparent border border-[#444444] text-gray-400 py-2 text-xs font-display uppercase tracking-[0.2em] hover:border-gray-300 hover:text-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/60 p-6 border border-[#333] hover:border-[#c5b358] transition-colors group flex flex-col items-start gap-4 relative">
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-transparent group-hover:border-[#c5b358] transition-colors"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-transparent group-hover:border-[#c5b358] transition-colors"></div>
      
      <div className="flex justify-between items-start w-full mb-2 border-b border-[#333] pb-2">
        <h4 className="font-display text-[#e0e0d1] tracking-[0.2em] uppercase text-lg">{t.name}</h4>
        <div className="flex gap-2 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-600 hover:text-[#c5b358] transition-colors p-1"
            title="Edit Tome"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteTemplate(t.id)}
            className="text-gray-600 hover:text-red-500 transition-colors p-1"
            title="Burn Tome"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 w-full">
        {t.criteria.map((c, i) => (
          <span key={i} className="bg-transparent text-gray-400 px-2 py-0.5 text-[10px] uppercase font-display tracking-widest border border-[#444444]">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
