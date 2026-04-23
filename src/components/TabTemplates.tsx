import React, { useState, useMemo } from 'react';
import { Settings, Plus, Trash2, Save, Edit2, Sparkles } from 'lucide-react';
import { XaddTemplate } from '../types';
import { SuggestionInput } from './SuggestionInput';

interface Props {
  templates: XaddTemplate[];
  addTemplate: (t: Omit<XaddTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<Omit<XaddTemplate, 'id' | 'userId' | 'createdAt'>>) => void;
  deleteTemplate: (id: string) => void;
}

export function TabTemplates({ templates, addTemplate, updateTemplate, deleteTemplate }: Props) {
  const [name, setName] = useState('');
  const [criteriaInput, setCriteriaInput] = useState('');
  const [criteria, setCriteria] = useState<string[]>([]);

  const allUniqueCriteria = useMemo(() => {
    const set = new Set<string>();
    templates.forEach(t => t.criteria.forEach(c => set.add(c)));
    return Array.from(set).sort();
  }, [templates]);

  // Logic for "Most Frequent" criteria to help organization
  const popularCriteria = useMemo(() => {
    const counts: Record<string, number> = {};
    templates.forEach(t => t.criteria.forEach(c => counts[c] = (counts[c] || 0) + 1));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
  }, [templates]);

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

  const handleSave = () => {
    if (!name.trim() || criteria.length === 0) return;
    addTemplate({ name: name.trim(), criteria });
    setName('');
    setCriteria([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="w-8 h-8 bg-indigo-100 flex items-center justify-center">
            <Settings className="w-4 h-4 text-indigo-600" />
          </div>
          CREATE NEW XADD
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
                Xadd Label Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-medium text-slate-800 dark:text-slate-100"
                placeholder="e.g., GAME, APP, MOVIE..."
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
                Clone Criteria From
              </label>
              <select
                onChange={(e) => {
                  const t = templates.find(temp => temp.id === e.target.value);
                  if (t) setCriteria([...t.criteria]);
                }}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-xs uppercase text-slate-500 dark:text-slate-400 cursor-pointer appearance-none"
                defaultValue=""
              >
                <option value="" disabled>-- Pick a workspace --</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
              Criteria Inputs
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <SuggestionInput
                value={criteriaInput}
                onChange={setCriteriaInput}
                suggestions={allUniqueCriteria}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-medium"
                placeholder="e.g., GRAPHIC, SIZE, PRICE..."
              />
              <button
                type="button"
                onClick={() => handleAddCriteria()}
                className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 font-bold shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>

            {/* Smart Organization Helper */}
            {popularCriteria.length > 0 && (
              <div className="mt-4 p-4 bg-indigo-50/30 dark:bg-slate-950/50 border border-indigo-100 dark:border-indigo-900/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Global Suggestions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularCriteria.map(pc => (
                    <button
                      key={pc}
                      type="button"
                      onClick={() => handleAddCriteria(pc)}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-[10px] font-black uppercase text-slate-600 dark:text-indigo-300 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                    >
                      + {pc}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {criteria.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {criteria.map((c, i) => (
                  <li key={i} className="bg-white dark:bg-indigo-950/30 border text-indigo-700 dark:text-indigo-300 px-3 py-1.5 text-xs font-black uppercase tracking-wider flex items-center gap-3 border-indigo-200 dark:border-indigo-500/30 group hover:border-indigo-400">
                    {c}
                    <button
                      onClick={() => handleRemoveCriteria(i)}
                      className="text-slate-400 hover:text-red-500 focus:outline-none p-0.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleSave}
              disabled={!name.trim() || criteria.length === 0}
              className="w-full px-6 py-4 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold text-sm tracking-widest uppercase shadow-md shadow-indigo-200/50 dark:shadow-none"
            >
              <Save className="w-4 h-4" />
              Save Workspace
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">Saved Workspaces</h3>
        {templates.length === 0 ? (
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 italic">No xadds created yet. Create one above to get started!</div>
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
}

function TemplateRow({ t, deleteTemplate, updateTemplate, allUniqueCriteria, popularCriteria }: TemplateRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState(t.name);
  const [localCriteria, setLocalCriteria] = useState(t.criteria);
  const [newCriteria, setNewCriteria] = useState('');

  const handleSave = () => {
    if (localName.trim() && localCriteria.length > 0) {
      updateTemplate(t.id, { name: localName.trim().toUpperCase(), criteria: localCriteria });
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
      <div className="bg-white dark:bg-slate-900 p-6 border-2 border-indigo-500 dark:border-indigo-400 flex flex-col items-start gap-4 shadow-md w-full">
        <input
          type="text"
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 font-black text-lg text-slate-800 dark:text-slate-100"
          value={localName}
          onChange={(e) => setLocalName(e.target.value.toUpperCase())}
          placeholder="XADD NAME"
        />
        
        <div className="w-full space-y-2">
          <div className="flex gap-2">
            <SuggestionInput
              value={newCriteria}
              onChange={setNewCriteria}
              suggestions={allUniqueCriteria}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-sm font-medium text-slate-900 dark:text-white"
              placeholder="New criteria..."
            />
            <button onClick={() => addCriteria()} className="px-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold">Add</button>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-1">
             {popularCriteria.slice(0, 5).map(pc => (
               <button
                 key={pc}
                 onClick={() => addCriteria(pc)}
                 className="text-[8px] font-black uppercase text-indigo-400 hover:text-indigo-600 px-1"
               >
                 + {pc}
               </button>
             ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {localCriteria.map((c, i) => (
              <span key={i} className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 text-[10px] uppercase font-black tracking-widest border border-indigo-200 dark:border-indigo-800">
                {c}
                <button onClick={() => setLocalCriteria(localCriteria.filter((_, idx) => idx !== i))} className="hover:text-red-500 ml-1">
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2 w-full mt-2">
          <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-2 text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors">
            Save
          </button>
          <button onClick={() => { setLocalName(t.name); setLocalCriteria(t.criteria); setIsEditing(false); }} className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 text-xs font-bold uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-colors group flex flex-col items-start gap-4 shadow-sm relative">
      <div className="flex justify-between items-start w-full mb-2">
        <h4 className="font-black text-slate-800 dark:text-slate-100 tracking-tight text-lg">{t.name}</h4>
        <div className="flex gap-2 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors p-2 rounded"
            title="Edit Xadd"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteTemplate(t.id)}
            className="text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors p-2 rounded"
            title="Delete Xadd"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 w-full">
        {t.criteria.map((c, i) => (
          <span key={i} className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 px-2.5 py-1 text-[10px] uppercase font-black tracking-widest border border-slate-200 dark:border-slate-800">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
