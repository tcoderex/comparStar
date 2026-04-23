import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { LogIn, LogOut, CheckSquare, Trash2, Shield, Moon, Sun, Monitor, AlertTriangle } from 'lucide-react';
import { signInWithGoogle, signOut } from '../firebase';

export function TabSettings() {
  const store = useAppStore();
  const [activeTab, setActiveTab] = useState<'sync' | 'manage'>('sync');
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [confirmingElements, setConfirmingElements] = useState(false);
  const [confirmingTemplates, setConfirmingTemplates] = useState(false);
  const [confirmingTypes, setConfirmingTypes] = useState(false);
  const [confirmingCompanies, setConfirmingCompanies] = useState(false);
  const [confirmingCategories, setConfirmingCategories] = useState(false);

  const uniqueTypes = useMemo(() => Array.from(new Set(store.state.elements.map(el => el.type).filter(Boolean))), [store.state.elements]);
  const uniqueCompanies = useMemo(() => Array.from(new Set(store.state.elements.map(el => el.company).filter(Boolean))), [store.state.elements]);
  const uniqueCategories = useMemo(() => Array.from(new Set(store.state.elements.map(el => el.category).filter(Boolean))), [store.state.elements]);

  const handleBulkDelete = async (type: 'elements' | 'templates' | 'type' | 'company' | 'category') => {
    if (type === 'elements' && selectedElements.length > 0) {
      if (confirmingElements) {
        store.bulkDelete('elements', selectedElements);
        setSelectedElements([]);
        setConfirmingElements(false);
      } else {
        setConfirmingElements(true);
      }
    } else if (type === 'templates' && selectedTemplates.length > 0) {
      if (confirmingTemplates) {
        store.bulkDelete('templates', selectedTemplates);
        setSelectedTemplates([]);
        setConfirmingTemplates(false);
      } else {
        setConfirmingTemplates(true);
      }
    } else if (type === 'type' && selectedTypes.length > 0) {
      if (confirmingTypes) {
        for (const val of selectedTypes) {
          await store.deleteMetadata('type', val);
        }
        setSelectedTypes([]);
        setConfirmingTypes(false);
      } else {
        setConfirmingTypes(true);
      }
    } else if (type === 'company' && selectedCompanies.length > 0) {
      if (confirmingCompanies) {
        for (const val of selectedCompanies) {
          await store.deleteMetadata('company', val);
        }
        setSelectedCompanies([]);
        setConfirmingCompanies(false);
      } else {
        setConfirmingCompanies(true);
      }
    } else if (type === 'category' && selectedCategories.length > 0) {
      if (confirmingCategories) {
        for (const val of selectedCategories) {
          await store.deleteMetadata('category', val);
        }
        setSelectedCategories([]);
        setConfirmingCategories(false);
      } else {
        setConfirmingCategories(true);
      }
    }
  };

  const toggleAll = (type: 'elements' | 'templates' | 'type' | 'company' | 'category') => {
    if (type === 'elements') {
      if (selectedElements.length === store.state.elements.length) setSelectedElements([]);
      else setSelectedElements(store.state.elements.map(e => e.id));
      setConfirmingElements(false);
    } else if (type === 'templates') {
      if (selectedTemplates.length === store.state.templates.length) setSelectedTemplates([]);
      else setSelectedTemplates(store.state.templates.map(t => t.id));
      setConfirmingTemplates(false);
    } else if (type === 'type') {
      if (selectedTypes.length === uniqueTypes.length) setSelectedTypes([]);
      else setSelectedTypes(uniqueTypes);
      setConfirmingTypes(false);
    } else if (type === 'company') {
      if (selectedCompanies.length === uniqueCompanies.length) setSelectedCompanies([]);
      else setSelectedCompanies(uniqueCompanies);
      setConfirmingCompanies(false);
    } else if (type === 'category') {
      if (selectedCategories.length === uniqueCategories.length) setSelectedCategories([]);
      else setSelectedCategories(uniqueCategories);
      setConfirmingCategories(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('sync')}
          className={`px-4 py-3 font-bold border-b-2 transition-colors ${
            activeTab === 'sync' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Account & Sync
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-3 font-bold border-b-2 transition-colors ${
            activeTab === 'manage' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Data Manager
        </button>
      </div>

      {activeTab === 'sync' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                {store.user?.photoURL ? (
                  <img src={store.user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Shield className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {store.user ? store.user.displayName : 'Guest User'}
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {store.user ? store.user.email : 'Using local offline storage'}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col items-start gap-4 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 dark:text-slate-400">Appearance</h4>
              <div className="flex bg-slate-100 p-1 rounded-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700 w-full sm:w-auto">
                {(['system', 'light', 'dark'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => store.setTheme(t)}
                    className={`flex items-center justify-center gap-2 flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold uppercase tracking-widest transition-all ${
                      store.state.theme === t 
                        ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' 
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {t === 'light' && <Sun className="w-4 h-4" />}
                    {t === 'dark' && <Moon className="w-4 h-4" />}
                    {t === 'system' && <Monitor className="w-4 h-4" />}
                    <span className="hidden sm:inline">{t}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col items-start gap-4 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 dark:text-slate-400">Account</h4>
              {!store.user ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-md">
                    You are currently using Star Compare offline. Your data is saved locally to this device. Register to safely sync elements and templates to the cloud.
                  </p>
                  <button
                    onClick={signInWithGoogle}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm shadow-indigo-200 dark:shadow-none"
                  >
                    <LogIn className="w-5 h-5" /> Sign In with Google
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-md">
                    Your data is being safely synced to your account in real time.
                  </p>
                  <button
                    onClick={signOut}
                    className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-300 dark:border-slate-700"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Elements Manager */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm max-h-[600px] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight">Elements</h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{store.state.elements.length} Items</p>
                </div>
                <div className="flex items-center gap-2">
                  {confirmingElements && (
                    <button 
                      onClick={() => setConfirmingElements(false)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700 transition uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => handleBulkDelete('elements')}
                    disabled={selectedElements.length === 0}
                    className={`px-3 py-1.5 font-bold text-[10px] border disabled:opacity-50 transition flex items-center gap-1 uppercase tracking-widest ${
                      confirmingElements 
                        ? 'bg-red-600 text-white border-red-700 hover:bg-red-700' 
                        : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/50'
                    }`}
                  >
                    {confirmingElements ? <AlertTriangle className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                    {confirmingElements ? 'Confirm' : `Delete (${selectedElements.length})`}
                  </button>
                </div>
              </div>
              
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <button onClick={() => toggleAll('elements')} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition">
                  Toggle All
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white dark:bg-slate-900 custom-scrollbar">
                {store.state.elements.length === 0 ? (
                  <p className="p-4 text-center text-sm text-slate-400 font-medium">No elements.</p>
                ) : (
                  store.state.elements.map(el => (
                    <div key={el.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition group">
                      <input
                        type="checkbox"
                        checked={selectedElements.includes(el.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedElements([...selectedElements, el.id]);
                          else setSelectedElements(selectedElements.filter(id => id !== el.id));
                          setConfirmingElements(false);
                        }}
                        className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500 bg-white dark:bg-slate-800 cursor-pointer"
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{el.name}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {el.category && (
                            <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-tighter rounded">
                              {el.category}
                            </span>
                          )}
                          {el.type && (
                            <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-tighter rounded">
                              {el.type}
                            </span>
                          )}
                          {el.company && (
                            <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-tighter rounded">
                              {el.company}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button 
                          onClick={() => {
                            if (confirm('Delete this element?')) store.deleteElement(el.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Templates Manager */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm max-h-[600px] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight">Templates</h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{store.state.templates.length} Items</p>
                </div>
                <div className="flex items-center gap-2">
                  {confirmingTemplates && (
                    <button 
                      onClick={() => setConfirmingTemplates(false)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700 transition uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => handleBulkDelete('templates')}
                    disabled={selectedTemplates.length === 0}
                    className={`px-3 py-1.5 font-bold text-[10px] border disabled:opacity-50 transition flex items-center gap-1 uppercase tracking-widest ${
                      confirmingTemplates 
                        ? 'bg-red-600 text-white border-red-700 hover:bg-red-700' 
                        : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/50'
                    }`}
                  >
                    {confirmingTemplates ? <AlertTriangle className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                    {confirmingTemplates ? 'Confirm' : `Delete (${selectedTemplates.length})`}
                  </button>
                </div>
              </div>
              
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <button onClick={() => toggleAll('templates')} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition">
                  Toggle All
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white dark:bg-slate-900 custom-scrollbar">
                {store.state.templates.length === 0 ? (
                  <p className="p-4 text-center text-sm text-slate-400 font-medium">No templates.</p>
                ) : (
                  store.state.templates.map(t => (
                    <div key={t.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition group">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedTemplates([...selectedTemplates, t.id]);
                          else setSelectedTemplates(selectedTemplates.filter(id => id !== t.id));
                          setConfirmingTemplates(false);
                        }}
                        className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500 bg-white dark:bg-slate-800 cursor-pointer"
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate flex-1">{t.name}</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button 
                          onClick={() => {
                            if (confirm('Delete this template?')) store.deleteTemplate(t.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Metadata Management Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-500 tracking-[0.2em] px-1">Metadata Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  label: 'Categories', 
                  data: uniqueCategories, 
                  field: 'category' as const, 
                  color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', 
                  selected: selectedCategories, 
                  setSelected: setSelectedCategories,
                  confirming: confirmingCategories,
                  setConfirming: setConfirmingCategories
                },
                { 
                  label: 'Types', 
                  data: uniqueTypes, 
                  field: 'type' as const, 
                  color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20', 
                  selected: selectedTypes, 
                  setSelected: setSelectedTypes,
                  confirming: confirmingTypes,
                  setConfirming: setConfirmingTypes
                },
                { 
                  label: 'Companies', 
                  data: uniqueCompanies, 
                  field: 'company' as const, 
                  color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', 
                  selected: selectedCompanies, 
                  setSelected: setSelectedCompanies,
                  confirming: confirmingCompanies,
                  setConfirming: setConfirmingCompanies
                },
              ].map(section => (
                <div key={section.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm rounded-xl overflow-hidden max-h-[400px]">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-slate-100 text-xs uppercase tracking-tight">{section.label}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{section.data.length} Values</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleBulkDelete(section.field)}
                        disabled={section.selected.length === 0}
                        className={`p-1.5 rounded transition border ${
                          section.confirming
                            ? 'bg-red-600 text-white border-red-700'
                            : 'text-red-500 border-transparent hover:bg-red-50 dark:hover:bg-red-950/30'
                        } disabled:opacity-30`}
                        title="Bulk Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                    <button onClick={() => toggleAll(section.field)} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition">
                      Toggle All
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-white dark:bg-slate-900">
                    {section.data.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-400 font-medium italic">None found.</p>
                    ) : (
                      section.data.map(val => (
                        <label key={val} className="flex items-center gap-2 p-2 group hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition cursor-pointer">
                          <input
                            type="checkbox"
                            checked={section.selected.includes(val)}
                            onChange={(e) => {
                              if (e.target.checked) section.setSelected([...section.selected, val]);
                              else section.setSelected(section.selected.filter(v => v !== val));
                              section.setConfirming(false);
                            }}
                            className="w-3.5 h-3.5 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500 bg-white dark:bg-slate-800"
                          />
                          <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-tight truncate flex-1 ${section.color}`}>
                            {val}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </div>
  );
}

