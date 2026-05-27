import React, { useState, useMemo } from 'react';
import { List, Plus, Search, Edit2, Trash2, Star, Save, SortAsc, SortDesc } from 'lucide-react';
import { ElementItem, XaddTemplate } from '../types';
import { SuggestionInput } from './SuggestionInput';
import { useAppStore } from '../store';

interface Props {
  store: any;
  elements: ElementItem[];
  templates: XaddTemplate[];
  addElement: (name: string, subcategory?: string, company?: string, category?: string) => void;
  deleteElement: (id: string) => void;
  renameElement: (id: string, name: string, subcategory?: string, company?: string, category?: string) => void;
  updateElementTemplate: (id: string, templateId: string) => void;
  updateElementRatings: (id: string, ratings: Record<string, number>) => void;
}

export function TabElements({
  store,
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

  const customCategories = store.state.customCategories;
  const customSubcategories = store.state.customSubcategories;

  const uniqueSubcategories = useMemo(() => Array.from(new Set([...customSubcategories, ...elements.map(el => el.subcategory).filter(Boolean).map(t => t.toUpperCase())])), [elements, customSubcategories]);
  const uniqueCompanies = useMemo(() => Array.from(new Set(elements.map(el => el.company).filter(Boolean).map(c => c.toUpperCase()))), [elements]);
  const uniqueCategoriesValues = useMemo(() => Array.from(new Set([...customCategories, ...elements.map(el => el.category).filter(Boolean).map(c => c.toUpperCase())])), [elements, customCategories]);

  const [error, setError] = useState<string | null>(null);

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    const nameTrimmed = newName.trim();
    if (nameTrimmed) {
      const isDuplicate = elements.some(el => 
        el.name.toLowerCase() === nameTrimmed.toLowerCase() &&
        (el.category || '').toLowerCase() === (newCategory.trim().toLowerCase() || '') &&
        (el.subcategory || '').toLowerCase() === (newSubcategory.trim().toLowerCase() || '') &&
        (el.company || '').toLowerCase() === (newCompany.trim().toLowerCase() || '')
      );

      if (isDuplicate) {
        setError('This element already exists with the same category/subcategory/company.');
        return;
      }

      const catTrim = newCategory.trim().toUpperCase();
      const subTrim = newSubcategory.trim().toUpperCase();

      addElement(nameTrimmed, newSubcategory.trim(), newCompany.trim(), newCategory.trim());

      const updates: any = {};
      if (catTrim && !customCategories.includes(catTrim)) {
        updates.customCategories = [...customCategories, catTrim];
      }
      if (subTrim && !customSubcategories.includes(subTrim)) {
        updates.customSubcategories = [...customSubcategories, subTrim];
      }
      if (Object.keys(updates).length > 0) {
        store.updateSettings(updates);
      }

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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      {error && (
        <div className="bg-red-950/40 border border-red-900 p-3 text-red-500 text-xs font-bold uppercase tracking-widest font-display animate-in fade-in zoom-in duration-300">
          {error}
        </div>
      )}

      <div className="bg-black/60 p-4 sm:p-6 border border-[#444444] flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        <form onSubmit={handleAdd} className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <input
            type="text"
            className="px-4 py-4 bg-black/50 border border-[#333] text-[#e0e0d1] focus:outline-none focus:border-[#c5b358] transition-colors font-bold text-sm uppercase font-display tracking-widest placeholder-gray-600"
            placeholder="NAME (e.g. SKYRIM)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <SuggestionInput
            placeholder="CATEGORY (e.g. QUEST)"
            value={newCategory}
            onChange={setNewCategory}
            suggestions={uniqueCategoriesValues}
            className="w-full px-4 py-4 bg-black/50 border border-[#333] text-[#e0e0d1] focus:outline-none focus:border-[#c5b358] transition-colors font-bold text-sm uppercase font-display tracking-widest placeholder-gray-600"
          />
          <SuggestionInput
            placeholder="SUBCATEGORY"
            value={newSubcategory}
            onChange={setNewSubcategory}
            suggestions={uniqueSubcategories}
            className="w-full px-4 py-4 bg-black/50 border border-[#333] text-[#e0e0d1] focus:outline-none focus:border-[#c5b358] transition-colors font-bold text-sm uppercase font-display tracking-widest placeholder-gray-600"
          />
          <SuggestionInput
            placeholder="COMPANY / FACTION"
            value={newCompany}
            onChange={setNewCompany}
            suggestions={uniqueCompanies}
            className="w-full px-4 py-4 bg-black/50 border border-[#333] text-[#e0e0d1] focus:outline-none focus:border-[#c5b358] transition-colors font-bold text-sm uppercase font-display tracking-widest placeholder-gray-600"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="px-6 py-3 border border-[#444444] text-[#c5b358] bg-transparent hover:bg-[#c5b358] hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#c5b358] disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm font-display"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {(uniqueCategoriesValues.length > 0 || uniqueSubcategories.length > 0) && (
        <div className="bg-black/40 p-4 border border-[#333]">
          <div className="flex flex-col gap-4">
            {uniqueCategoriesValues.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest mr-2 font-display">Quick Category:</span>
                {uniqueCategoriesValues.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setNewCategory(cat)}
                    className="px-2 py-1 bg-transparent border border-[#444444] text-[10px] font-bold uppercase text-gray-300 hover:border-[#c5b358] hover:text-[#c5b358] transition-all font-display tracking-widest"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
            {uniqueSubcategories.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest mr-2 font-display">Quick Sub:</span>
                {uniqueSubcategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setNewSubcategory(sub)}
                    className="px-2 py-1 bg-transparent border border-[#444444] text-[10px] font-bold uppercase text-gray-300 hover:border-[#c5b358] hover:text-[#c5b358] transition-all font-display tracking-widest"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-black/60 border border-[#444444] overflow-hidden shadow-lg">
        <div className="p-4 border-b border-[#333] flex flex-col sm:flex-row gap-4 justify-between items-center bg-black/80">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="SEARCH DISCOVERIES..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-transparent border border-[#444444] text-[#e0e0d1] text-xs font-display tracking-widest uppercase focus:outline-none focus:border-[#c5b358] placeholder-gray-600"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-2 bg-black border border-[#444444] text-gray-300 text-xs font-display tracking-widest uppercase focus:outline-none focus:border-[#c5b358]"
            >
              <option value="name">Sort by Name</option>
              <option value="ratingDesc">Rating: High to Low</option>
              <option value="ratingAsc">Rating: Low to High</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-[#333]">
          {sortedElements.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-display uppercase tracking-widest">
              No elements found. The scroll is blank.
            </div>
          ) : (
            sortedElements.map((el) => (
              <ElementRow
                key={el.id}
                item={el}
                allElements={elements}
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
                store={store}
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
  allElements: ElementItem[];
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
  store: any;
}

function ElementRow({
  item,
  allElements,
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
  store,
}: ElementRowProps) {
  const [localName, setLocalName] = useState(item.name);
  const [localSubcategory, setLocalSubcategory] = useState(item.subcategory || '');
  const [localCompany, setLocalCompany] = useState(item.company || '');
  const [localCategory, setLocalCategory] = useState(item.category || '');
  const [localRatings, setLocalRatings] = useState<Record<string, number>>(item.ratings);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  const template = templates.find((t) => t.id === item.templateId);

  const calculateAvg = () => {
    const vals = Object.values(item.ratings);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const submitRename = () => {
    setRenameError(null);
    const nameTrimmed = localName.trim();
    
    if (nameTrimmed && (nameTrimmed !== item.name || localSubcategory !== (item.subcategory || '') || localCompany !== (item.company || '') || localCategory !== (item.category || ''))) {
      const isDuplicate = allElements.some(el => 
        el.id !== item.id &&
        el.name.toLowerCase() === nameTrimmed.toLowerCase() &&
        (el.category || '').toLowerCase() === (localCategory.trim().toLowerCase() || '') &&
        (el.subcategory || '').toLowerCase() === (localSubcategory.trim().toLowerCase() || '') &&
        (el.company || '').toLowerCase() === (localCompany.trim().toLowerCase() || '')
      );

      if (isDuplicate) {
        setRenameError('Duplicate element detected.');
        return;
      }

      renameElement(item.id, nameTrimmed, localSubcategory.trim(), localCompany.trim(), localCategory.trim());

      const catTrim = localCategory.trim().toUpperCase();
      const subTrim = localSubcategory.trim().toUpperCase();
      const updates: any = {};
      const customCat = store.state.customCategories || [];
      const customSub = store.state.customSubcategories || [];
      if (catTrim && !customCat.includes(catTrim)) updates.customCategories = [...customCat, catTrim];
      if (subTrim && !customSub.includes(subTrim)) updates.customSubcategories = [...customSub, subTrim];
      if (Object.keys(updates).length > 0) store.updateSettings(updates);

    } else if (!nameTrimmed) {
      setLocalName(item.name);
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
    <div className={`p-4 sm:p-6 transition-colors border-l-4 ${isEditing ? 'bg-black/80 border-l-[#c5b358]' : 'hover:bg-[#1a1a1a] border-l-transparent'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 shrink-0 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            {isRenaming ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  autoFocus
                  className="px-3 py-2 bg-black border border-[#c5b358] focus:outline-none focus:ring-1 focus:ring-[#c5b358] text-[#e0e0d1] font-display tracking-widest w-full max-w-[200px]"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  placeholder="NAME"
                />
                <SuggestionInput
                  value={localCategory}
                  onChange={setLocalCategory}
                  suggestions={uniqueCategoriesValues}
                  placeholder="CATEGORY"
                  className="px-3 py-2 bg-black border border-[#444444] focus:outline-none focus:border-[#c5b358] text-[#e0e0d1] font-display tracking-widest w-full max-w-[200px] text-xs"
                />
                <SuggestionInput
                  value={localSubcategory}
                  onChange={setLocalSubcategory}
                  suggestions={uniqueSubcategories}
                  placeholder="SUBCATEGORY"
                  className="px-3 py-2 bg-black border border-[#444444] focus:outline-none focus:border-[#c5b358] text-[#e0e0d1] font-display tracking-widest w-full max-w-[200px] text-xs"
                />
                <SuggestionInput
                  value={localCompany}
                  onChange={setLocalCompany}
                  suggestions={uniqueCompanies}
                  placeholder="FACTION/COMPANY"
                  className="px-3 py-2 bg-black border border-[#444444] focus:outline-none focus:border-[#c5b358] text-[#e0e0d1] font-display tracking-widest w-full max-w-[200px] text-xs"
                />
                {renameError && (
                  <span className="text-[10px] text-red-500 font-bold tracking-tight bg-red-950/40 p-1 border border-red-900">{renameError}</span>
                )}
                <div className="flex gap-2 mt-2">
                  <button onClick={submitRename} className="px-3 py-1 bg-transparent border border-[#c5b358] text-[#c5b358] hover:bg-[#c5b358] hover:text-black font-display tracking-widest uppercase text-xs w-fit transition-colors">Save</button>
                  <button onClick={() => { setIsRenaming(false); setRenameError(null); }} className="px-3 py-1 bg-transparent border border-[#444444] text-gray-400 hover:border-gray-300 font-display tracking-widest uppercase text-xs w-fit transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <span className="font-display text-[#e0e0d1] text-xl tracking-widest uppercase flex flex-wrap items-center gap-2 min-w-0">
                <span className="truncate drop-shadow-md">{item.name}</span>
                <button onClick={() => setIsRenaming(true)} className="text-gray-600 hover:text-[#c5b358] transition-colors p-1 shrink-0">
                  <Edit2 className="w-4 h-4" />
                </button>
                <div className="flex gap-2 shrink-0 ml-2">
                  {item.category && (
                    <span className="py-0.5 px-2 bg-black border border-[#444444] text-[#c5b358] text-[9px] uppercase font-bold tracking-widest block font-sans">
                      {item.category}
                    </span>
                  )}
                  {item.subcategory && (
                    <span className="py-0.5 px-2 bg-black border border-[#444444] text-gray-300 text-[9px] uppercase font-bold tracking-widest block font-sans">
                      {item.subcategory}
                    </span>
                  )}
                  {item.company && (
                    <span className="py-0.5 px-2 bg-black border border-[#444444] text-gray-400 text-[9px] uppercase font-bold tracking-widest block font-sans">
                      {item.company}
                    </span>
                  )}
                </div>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {template ? (
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest bg-transparent p-0 flex items-center font-display gap-2">
                <span className="text-[#c5b358]">♦</span> XADD: {template.name}
              </span>
            ) : (
              <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest bg-transparent p-0 flex items-center font-display gap-2">
                <span className="text-gray-700">♦</span> UNCATEGORIZED
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap mt-2 md:mt-0">
          {template && Object.keys(item.ratings).length > 0 && !isEditing && (
            <div className="flex items-center gap-2 text-[#e0e0d1] font-display tracking-widest bg-black px-3 py-1.5 border border-[#444444]">
              <Star className="w-4 h-4 fill-[#c5b358] text-[#c5b358]" />
              {calculateAvg().toFixed(1)} <span className="text-[10px] text-gray-500 uppercase mt-0.5">/ 20</span>
            </div>
          )}

          {!isEditing ? (
            <button
              onClick={() => {
                setLocalRatings(item.ratings);
                setEditingId(item.id);
              }}
              className="px-4 py-2 border border-[#444444] bg-transparent text-gray-300 font-display tracking-widest uppercase text-sm hover:border-[#c5b358] hover:text-[#c5b358] transition-colors flex-1 sm:flex-none text-center"
            >
              Configure
            </button>
          ) : (
            <button
              onClick={() => setEditingId(null)}
              className="px-4 py-2 text-gray-400 hover:text-white font-display uppercase tracking-widest transition-colors flex items-center justify-center border border-[#444444] hover:bg-[#333] flex-1 sm:flex-none text-center text-sm"
            >
              Cancel
            </button>
          )}

          <button
            onClick={() => deleteElement(item.id)}
            className="text-gray-600 hover:text-red-500 p-2 border border-transparent hover:border-red-900 hover:bg-black transition-colors shrink-0"
            title="Delete Discovery"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mt-6 pt-6 border-t border-[#333]">
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase text-gray-500 tracking-widest mb-3 font-display">
              Assign XADD (Category Tome)
            </label>
            {templates.length === 0 ? (
              <p className="text-sm font-medium text-red-500 bg-red-950/20 border border-red-900 p-3 font-display tracking-widest">No tomes discovered. Visit the Templates tab first!</p>
            ) : (
              <select
                className="w-full max-w-sm px-4 py-2 bg-black border border-[#444444] text-[#e0e0d1] font-display tracking-widest focus:outline-none focus:border-[#c5b358] uppercase"
                value={item.templateId || ''}
                onChange={(e) => {
                  updateElementTemplate(item.id, e.target.value);
                  setLocalRatings({});
                }}
              >
                <option value="" disabled>SELECT A TOME...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>

          {template && (
            <div className="space-y-6 bg-black/50 p-6 border border-[#444444] relative">
              
              {/* Decorative Corners */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#c5b358]"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#c5b358]"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#c5b358]"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#c5b358]"></div>

              <h4 className="text-lg font-display uppercase tracking-[0.2em] text-[#e0e0d1] flex items-center gap-2 mb-8 justify-center">
                <span className="text-[#444] mr-2">♦</span> Rate Attributes <span className="text-[#444] ml-2">♦</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {template.criteria.map((c) => {
                  const val = localRatings[c] !== undefined ? localRatings[c] : 0;
                  return (
                    <div key={c} className="space-y-3">
                      <div className="flex justify-between items-end text-sm">
                        <span className="font-display tracking-[0.1em] text-[#c5b358] uppercase text-xs">{c}</span>
                        <div className={`flex items-center gap-1 font-display tracking-widest ${val < 0 ? 'text-red-400' : 'text-gray-300'}`}>
                          {val} <span className="text-[#444] text-[10px]">/ 20</span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min="-20"
                          max="20"
                          step="1"
                          value={val}
                          onChange={(e) => handleRatingChange(c, parseInt(e.target.value))}
                          className="w-full h-1 bg-[#333] appearance-none cursor-pointer focus:outline-none"
                          style={{
                            backgroundImage: 'linear-gradient(#c5b358, #c5b358)',
                            backgroundSize: `${((val + 20) / 40) * 100}% 100%`,
                            backgroundRepeat: 'no-repeat'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-8 mt-8 border-t border-[#333] flex justify-center">
                <button
                  onClick={saveRatings}
                  className="px-8 py-3 bg-transparent border border-[#444444] text-[#c5b358] hover:border-[#c5b358] hover:bg-black transition-colors flex items-center justify-center gap-3 font-display tracking-[0.2em] text-sm uppercase"
                >
                  <Save className="w-4 h-4" /> Seal Attributes
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
