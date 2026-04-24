import React, { useState, useMemo } from 'react';
import { List, Plus, Search, Edit2, Trash2, Star, Save, SortAsc, SortDesc } from 'lucide-react';
import { ElementItem, XaddTemplate } from '../types';
import { SuggestionInput } from './SuggestionInput';

interface Props {
  elements: ElementItem[];
  templates: XaddTemplate[];
  addElement: (name: string, subcategory?: string, company?: string, category?: string) => void;
  deleteElement: (id: string) => void;
  renameElement: (id: string, name: string, subcategory?: string, company?: string, category?: string) => void;
  updateElementTemplate: (id: string, templateId: string) => void;
  updateElementRatings: (id: string, ratings: Record<string, number>) => void;
}

export function TabElements({
  elements,
  templates,
  addElement,
  deleteElement,
  renameElement,
  updateElementTemplate,
  updateElementRatings,
}: Props) {
  const [newName, setNewName] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'name' | 'ratingDesc' | 'ratingAsc'>('name');

  const GLOBAL_CATEGORIES = ['GAME', 'APPLICATION', 'TECHNOLOGY', 'MUSIC', 'MOVIE', 'SPORT', 'FOOD', 'TRAVEL', 'FASHION', 'SCIENCE', 'EDUCATION'];
  const GLOBAL_SUBCATEGORIES = ['SIMULATOR', 'FPS', 'RPG', 'STRATEGY', 'ACTION', 'PRODUCTIVITY', 'UTILITY', 'SOCIAL', 'ENTERTAINMENT', 'HARDWARE', 'SOFTWARE', 'SMARTPHONE', 'LAPTOP'];

  const uniqueSubcategories = useMemo(() => Array.from(new Set([...GLOBAL_SUBCATEGORIES, ...elements.map(el => el.subcategory).filter(Boolean).map(t => t.toUpperCase())])), [elements]);
  const uniqueCompanies = useMemo(() => Array.from(new Set(elements.map(el => el.company).filter(Boolean).map(c => c.toUpperCase()))), [elements]);
  const uniqueCategoriesValues = useMemo(() => Array.from(new Set([...GLOBAL_CATEGORIES, ...elements.map(el => el.category).filter(Boolean).map(c => c.toUpperCase())])), [elements]);

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newName.trim()) {
      addElement(newName.trim(), newSubcategory.trim(), newCompany.trim(), newCategory.trim());
      setNewName('');
      setNewSubcategory('');
      setNewCompany('');
      setNewCategory('');
    }
  };

  const calculateAvg = (el: ElementItem): number => {
    const vals = Object.values(el.ratings);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const sortedElements = useMemo(() => {
    const filtered = elements.filter(el => el.name.toLowerCase().includes(search.toLowerCase()));
    
    return filtered.sort((a, b) => {
      if (sortOrder === 'name') return a.name.localeCompare(b.name);
      
      const avgA = calculateAvg(a);
      const avgB = calculateAvg(b);
      
      if (sortOrder === 'ratingDesc') return avgB - avgA;
      return avgA - avgB;
    });
  }, [elements, search, sortOrder]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <form onSubmit={handleAdd} className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <input
            type="text"
            className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 transition-colors font-medium"
            placeholder="Element Name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <SuggestionInput
            placeholder="Category..."
            value={newCategory}
            onChange={setNewCategory}
            suggestions={uniqueCategoriesValues}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
          />
          <SuggestionInput
            placeholder="Subcategory..."
            value={newSubcategory}
            onChange={setNewSubcategory}
            suggestions={uniqueSubcategories}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
          />
          <SuggestionInput
            placeholder="Company..."
            value={newCompany}
            onChange={setNewCompany}
            suggestions={uniqueCompanies}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold shadow-sm shadow-indigo-200 uppercase tracking-widest text-sm"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span>Add</span>
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search elements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value="name">Sort by Name</option>
              <option value="ratingDesc">Rating: High to Low</option>
              <option value="ratingAsc">Rating: Low to High</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {sortedElements.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              No elements found. Add one to get started!
            </div>
          ) : (
            sortedElements.map((el) => (
              <ElementRow
                key={el.id}
                item={el}
                templates={templates}
                isEditing={editingId === el.id}
                setEditingId={setEditingId}
                deleteElement={deleteElement}
                renameElement={renameElement}
                updateElementTemplate={updateElementTemplate}
                updateElementRatings={updateElementRatings}
                uniqueSubcategories={uniqueSubcategories}
                uniqueCompanies={uniqueCompanies}
                uniqueCategoriesValues={uniqueCategoriesValues}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface ElementRowProps {
  key?: string;
  item: ElementItem;
  templates: XaddTemplate[];
  isEditing: boolean;
  setEditingId: (id: string | null) => void;
  deleteElement: (id: string) => void;
  renameElement: (id: string, name: string, subcategory?: string, company?: string, category?: string) => void;
  updateElementTemplate: (id: string, templateId: string) => void;
  updateElementRatings: (id: string, ratings: Record<string, number>) => void;
  uniqueSubcategories: string[];
  uniqueCompanies: string[];
  uniqueCategoriesValues: string[];
}

function ElementRow({
  item,
  templates,
  isEditing,
  setEditingId,
  deleteElement,
  renameElement,
  updateElementTemplate,
  updateElementRatings,
  uniqueSubcategories,
  uniqueCompanies,
  uniqueCategoriesValues,
}: ElementRowProps) {
  const [localName, setLocalName] = useState(item.name);
  const [localSubcategory, setLocalSubcategory] = useState(item.subcategory || '');
  const [localCompany, setLocalCompany] = useState(item.company || '');
  const [localCategory, setLocalCategory] = useState(item.category || '');
  const [localRatings, setLocalRatings] = useState<Record<string, number>>(item.ratings);
  const [isRenaming, setIsRenaming] = useState(false);

  const template = templates.find((t) => t.id === item.templateId);

  const calculateAvg = () => {
    const vals = Object.values(item.ratings);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const submitRename = () => {
    if (localName.trim() && (localName !== item.name || localSubcategory !== (item.subcategory || '') || localCompany !== (item.company || '') || localCategory !== (item.category || ''))) {
      renameElement(item.id, localName.trim(), localSubcategory.trim(), localCompany.trim(), localCategory.trim());
    } else {
      setLocalName(item.name); // reset
      setLocalSubcategory(item.subcategory || '');
      setLocalCompany(item.company || '');
      setLocalCategory(item.category || '');
    }
    setIsRenaming(false);
  };

  const handleRatingChange = (criteria: string, val: number) => {
    const newRatings = { ...localRatings, [criteria]: val };
    setLocalRatings(newRatings);
  };

  const saveRatings = () => {
    updateElementRatings(item.id, localRatings);
    setEditingId(null);
  };

  return (
    <div className={`p-4 sm:p-6 transition-colors border-l-4 ${isEditing ? 'bg-indigo-50/30 dark:bg-indigo-900/20 border-l-indigo-500 dark:border-l-indigo-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-transparent'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 shrink-0 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            {isRenaming ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  autoFocus
                  className="px-2 py-1 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-bold w-full max-w-[200px]"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  placeholder="Name"
                />
                <SuggestionInput
                  value={localCategory}
                  onChange={setLocalCategory}
                  suggestions={uniqueCategoriesValues}
                  placeholder="Category"
                  className="px-2 py-1 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-bold w-full max-w-[200px] text-xs"
                />
                <SuggestionInput
                  value={localSubcategory}
                  onChange={setLocalSubcategory}
                  suggestions={uniqueSubcategories}
                  placeholder="Subcategory"
                  className="px-2 py-1 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-bold w-full max-w-[200px] text-xs"
                />
                <SuggestionInput
                  value={localCompany}
                  onChange={setLocalCompany}
                  suggestions={uniqueCompanies}
                  placeholder="Company"
                  className="px-2 py-1 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-bold w-full max-w-[200px] text-xs"
                />
                <button onClick={submitRename} className="px-2 py-1 bg-indigo-600 text-white text-xs font-bold w-fit">Save</button>
              </div>
            ) : (
              <span className="font-bold text-slate-800 dark:text-slate-100 text-lg flex flex-wrap items-center gap-2 min-w-0">
                <span className="truncate">{item.name}</span>
                <button onClick={() => setIsRenaming(true)} className="text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1 shrink-0">
                  <Edit2 className="w-4 h-4" />
                </button>
                <div className="flex gap-1 shrink-0">
                  {item.category && (
                    <span className="py-0.5 px-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900 rounded text-[10px] uppercase font-black tracking-widest block">
                      {item.category}
                    </span>
                  )}
                  {item.subcategory && (
                    <span className="py-0.5 px-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded text-[10px] uppercase font-black tracking-widest block">
                      {item.subcategory}
                    </span>
                  )}
                  {item.company && (
                    <span className="py-0.5 px-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 rounded text-[10px] uppercase font-black tracking-widest block">
                      {item.company}
                    </span>
                  )}
                </div>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {template ? (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 border border-slate-200 dark:border-slate-700">
                Xadd: {template.name}
              </span>
            ) : (
              <span className="text-[10px] text-amber-600 dark:text-amber-500 uppercase font-bold tracking-widest bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 border border-amber-200 dark:border-amber-900/50">
                Uncategorized
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap mt-2 md:mt-0">
          {template && Object.keys(item.ratings).length > 0 && !isEditing && (
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-bold bg-white dark:bg-slate-900 px-3 py-1.5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {calculateAvg().toFixed(1)} <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mt-0.5">/ 20</span>
            </div>
          )}

          {!isEditing ? (
            <button
              onClick={() => {
                setLocalRatings(item.ratings);
                setEditingId(item.id);
              }}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm flex-1 sm:flex-none text-center"
            >
              Configure
            </button>
          ) : (
            <button
              onClick={() => setEditingId(null)}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-colors flex items-center justify-center border border-slate-200 dark:border-slate-800 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex-1 sm:flex-none text-center"
            >
              Cancel
            </button>
          )}

          <button
            onClick={() => deleteElement(item.id)}
            className="text-slate-400 hover:text-white p-2 hover:bg-red-500 transition-colors border border-transparent hover:border-red-600 shrink-0"
            title="Delete Element"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="mb-6">
            <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-3">
              Assign Xadd (Category)
            </label>
            {templates.length === 0 ? (
              <p className="text-sm font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-3">No xadd templates exist. Create one in the Customization tab first!</p>
            ) : (
              <select
                className="w-full max-w-sm px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                value={item.templateId || ''}
                onChange={(e) => {
                  updateElementTemplate(item.id, e.target.value);
                  setLocalRatings({});
                }}
              >
                <option value="" disabled>Select a template...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>

          {template && (
            <div className="space-y-6 bg-slate-50 dark:bg-slate-950 p-6 border border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Rate Criteria
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {template.criteria.map((c) => {
                  const val = localRatings[c] !== undefined ? localRatings[c] : 0;
                  return (
                    <div key={c} className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{c}</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {val} / 20
                        </div>
                      </div>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        step="1"
                        value={val}
                        onChange={(e) => handleRatingChange(c, parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 appearance-none cursor-pointer accent-indigo-600 focus:outline-none rounded-full"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={saveRatings}
                  className="w-full px-6 py-4 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-black tracking-widest uppercase shadow-md shadow-indigo-200/50 dark:shadow-none"
                >
                  <Save className="w-5 h-5" /> Save Ratings
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
