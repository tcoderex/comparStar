import React, { useState, useEffect, useMemo } from 'react';
import { LogIn, LogOut, SquareCheck as CheckSquare, Trash2, Shield, Moon, Sun, Monitor, TriangleAlert as AlertTriangle, Plus, Save, Sparkles, Hash, CreditCard as Edit2, Wifi, WifiOff } from 'lucide-react';
import { signInWithGoogleRedirect, signOut } from '../firebase';
import { db } from '../firebase';
import { disableNetwork, enableNetwork } from 'firebase/firestore';

export function TabSettings({ store }: { store: any }) {
  const [activeTab, setActiveTab] = useState<'sync' | 'manage' | 'presets'>('sync');
  
  // State for new items
  const [newSuggestion, setNewSuggestion] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');

  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [subcategoryError, setSubcategoryError] = useState<string | null>(null);

  const [editingPreset, setEditingPreset] = useState<{ type: 'suggestion' | 'category' | 'subcategory', oldVal: string, newVal: string } | null>(null);

  const [successMsg, setSuccessMsg] = useState<{ type: string, msg: string } | null>(null);
  const [firestoreOnline, setFirestoreOnline] = useState(() => localStorage.getItem('fsOnline') !== 'false');
  
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (localStorage.getItem('fsOnline') === 'false') {
      disableNetwork(db).catch(() => {});
    }
  }, []);

  const customSuggestions = store.state.customSuggestions || [];
  const customCategories = store.state.customCategories || [];
  const customSubcategories = store.state.customSubcategories || [];
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [confirmingElements, setConfirmingElements] = useState(false);
  const [confirmingTemplates, setConfirmingTemplates] = useState(false);
  const [confirmingSubcategories, setConfirmingSubcategories] = useState(false);
  const [confirmingCompanies, setConfirmingCompanies] = useState(false);
  const [confirmingCategories, setConfirmingCategories] = useState(false);

  const uniqueSubcategories = useMemo(() => Array.from(new Set(store.state.elements.map(el => el.subcategory).filter(Boolean))), [store.state.elements]);
  const uniqueCompanies = useMemo(() => Array.from(new Set(store.state.elements.map(el => el.company).filter(Boolean))), [store.state.elements]);
  const uniqueCategories = useMemo(() => Array.from(new Set(store.state.elements.map(el => el.category).filter(Boolean))), [store.state.elements]);

  const handleBulkDelete = async (type: 'elements' | 'templates' | 'subcategory' | 'company' | 'category') => {
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
    } else if (type === 'subcategory' && selectedSubcategories.length > 0) {
      if (confirmingSubcategories) {
        for (const val of selectedSubcategories) {
          await store.deleteMetadata('subcategory', val);
        }
        setSelectedSubcategories([]);
        setConfirmingSubcategories(false);
      } else {
        setConfirmingSubcategories(true);
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

  const toggleAll = (type: 'elements' | 'templates' | 'subcategory' | 'company' | 'category') => {
    if (type === 'elements') {
      if (selectedElements.length === store.state.elements.length) setSelectedElements([]);
      else setSelectedElements(store.state.elements.map(e => e.id));
      setConfirmingElements(false);
    } else if (type === 'templates') {
      if (selectedTemplates.length === store.state.templates.length) setSelectedTemplates([]);
      else setSelectedTemplates(store.state.templates.map(t => t.id));
      setConfirmingTemplates(false);
    } else if (type === 'subcategory') {
      if (selectedSubcategories.length === uniqueSubcategories.length) setSelectedSubcategories([]);
      else setSelectedSubcategories(uniqueSubcategories);
      setConfirmingSubcategories(false);
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
      
      <div className="flex gap-4 border-b border-[#444444] mb-8 font-display">
        <button
          onClick={() => setActiveTab('sync')}
          className={`px-4 py-3 font-bold border-b-2 transition-colors uppercase tracking-widest ${
            activeTab === 'sync' ? 'border-[#c5b358] text-white drop-shadow-[0_0_8px_rgba(197,179,88,0.8)]' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Account & Sync
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-3 font-bold border-b-2 transition-colors uppercase tracking-widest ${
            activeTab === 'manage' ? 'border-[#c5b358] text-white drop-shadow-[0_0_8px_rgba(197,179,88,0.8)]' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Data Manager
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`px-4 py-3 font-bold border-b-2 transition-colors uppercase tracking-widest ${
            activeTab === 'presets' ? 'border-[#c5b358] text-white drop-shadow-[0_0_8px_rgba(197,179,88,0.8)]' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Quick Presets
        </button>
      </div>

      {activeTab === 'sync' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/60 p-6 border border-[#444444] shadow-sm space-y-6">
            <div className="flex items-center gap-4 border-b border-[#333] pb-6">
              <div 
                className="w-16 h-16 border border-[#c5b358] flex items-center justify-center overflow-hidden shrink-0"
                style={{ transform: 'rotate(45deg)' }}
              >
                {store.user?.photoURL ? (
                  <img src={store.user.photoURL} alt="Profile" className="w-full h-full object-cover scale-150" style={{ transform: 'rotate(-45deg)' }} />
                ) : (
                  <Shield className="w-8 h-8 text-[#c5b358]" style={{ transform: 'rotate(-45deg)' }} />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-display tracking-widest text-[#e0e0d1] uppercase">
                  {store.user ? store.user.displayName : 'Wanderer'}
                </h3>
                <p className="text-sm font-medium text-gray-500">
                  {store.user ? store.user.email : 'Using local offline storage'}
                </p>
              </div>
            </div>

            <div className="pt-6 border-b border-[#333] pb-6 flex flex-col items-start gap-4">
              <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-2 font-display">Realm Details</h4>
              {!store.user ? (
                <div className="space-y-6 w-full max-w-xl">
                  <p className="text-sm font-medium text-gray-400 max-w-md">
                    You are currently using Star Compare offline. Your findings are saved strictly to this device. Register to safely sync elements to the global realm.
                  </p>
                  
                  <button
                    onClick={signInWithGoogleRedirect}
                    className="px-6 py-3 border border-[#444444] text-[#c5b358] font-bold flex items-center justify-center gap-2 hover:bg-[#c5b358] hover:text-black transition text-sm uppercase tracking-widest font-display"
                  >
                    <LogIn className="w-5 h-5" /> Sign In with Google
                  </button>

                  <div className="border border-red-900/40 p-4 bg-red-950/20 text-xs text-red-400 space-y-2 max-w-lg">
                    <div className="flex items-center gap-2 font-bold uppercase tracking-wider font-display text-[#c5b358]">
                      <AlertTriangle className="w-4 h-4" />
                      Vercel Authentication Guide
                    </div>
                    <p className="font-medium leading-relaxed">
                      If you're hosting this quest on <span className="underline font-bold text-gray-300">xcompar.vercel.app</span>, please ensure the Firebase realm is aligned:
                    </p>
                    <ol className="list-decimal pl-5 space-y-1 font-medium leading-relaxed">
                      <li>Open the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold text-gray-300">Firebase Console</a>.</li>
                      <li>Go to <strong>Authentication</strong> &gt; <strong>Settings</strong> &gt; <strong>Authorized domains</strong>.</li>
                      <li>Click <strong>Add domain</strong> and enter <code className="bg-black/50 px-1 py-0.5 font-mono text-gray-300">xcompar.vercel.app</code>.</li>
                      <li>If enchantments block the popup, use the <strong>Redirect</strong> sign in above.</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-400 max-w-md">
                    Your discoveries are being safely recorded in real time with project: <strong className="text-[#c5b358] font-mono tracking-wider">tcoderex</strong>
                  </p>
                  <button
                    onClick={signOut}
                    className="px-6 py-3 border border-[#444444] text-[#c5b358] font-bold flex items-center gap-2 hover:bg-[#444444] hover:text-white transition uppercase tracking-widest font-display"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
            
            <div className="pt-2 flex flex-col items-start gap-4">
              <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-2 font-display">Network State</h4>
              <div className="flex items-center gap-4">
                <button
                  onClick={async () => {
                    if (firestoreOnline) {
                      await disableNetwork(db);
                      setFirestoreOnline(false);
                      localStorage.setItem('fsOnline', 'false');
                    } else {
                      await enableNetwork(db);
                      setFirestoreOnline(true);
                      localStorage.setItem('fsOnline', 'true');
                    }
                  }}
                  className={`px-5 py-3 border font-bold flex items-center justify-center gap-2 transition text-sm uppercase tracking-widest font-display ${
                    firestoreOnline
                      ? 'border-emerald-700 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30'
                      : 'border-red-800 text-red-400 bg-red-950/20 hover:bg-red-900/30'
                  }`}
                >
                  {firestoreOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                  {firestoreOnline ? 'ONLINE' : 'OFFLINE'}
                </button>
                <span className="text-xs font-medium text-gray-500">
                  Toggle Firestore network. Offline mode uses only local IndexedDB cache.
                </span>
              </div>
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
                          {el.subcategory && (
                            <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-tighter rounded">
                              {el.subcategory}
                            </span>
                          )}
                          {el.company && (
                            <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-tighter rounded">
                              {el.company}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-1">
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
                      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-1">
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
                  label: 'Subcategories', 
                  data: uniqueSubcategories, 
                  field: 'subcategory' as const, 
                  color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20', 
                  selected: selectedSubcategories, 
                  setSelected: setSelectedSubcategories,
                  confirming: confirmingSubcategories,
                  setConfirming: setConfirmingSubcategories
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

      {activeTab === 'presets' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Global Suggestions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight">Global Criteria</h3>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Suggestions for templates</p>
              </div>
              
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setSuggestionError(null);
                  const val = newSuggestion.trim().toUpperCase();
                  if (val) {
                    if (customSuggestions.includes(val)) {
                      setSuggestionError('Criteria already exists in presets.');
                    } else {
                      store.updateSettings({ customSuggestions: [...customSuggestions, val] });
                      setNewSuggestion('');
                      setSuccessMsg({ type: 'suggestion', msg: 'Criteria added!' });
                    }
                  }
                }} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSuggestion}
                      onChange={(e) => setNewSuggestion(e.target.value)}
                      placeholder="NEW CRITERIA..."
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button type="submit" className="p-2 bg-indigo-600 text-white hover:bg-indigo-700 transition">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {suggestionError && <p className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 animate-pulse"><AlertTriangle className="w-3 h-3" /> {suggestionError}</p>}
                  {successMsg?.type === 'suggestion' && <p className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1"><CheckSquare className="w-3 h-3" /> {successMsg.msg}</p>}
                </form>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-wrap gap-2 content-start custom-scrollbar">
                {customSuggestions.map(s => (
                  <div key={s} className="group flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                    {editingPreset?.type === 'suggestion' && editingPreset.oldVal === s ? (
                      <div className="flex items-center gap-1">
                        <input 
                          autoFocus
                          className="w-24 bg-white dark:bg-slate-950 border border-indigo-500 focus:outline-none text-[10px] px-1"
                          value={editingPreset.newVal}
                          onChange={(e) => setEditingPreset({ ...editingPreset, newVal: e.target.value.toUpperCase() })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const updated = customSuggestions.map(i => i === s ? editingPreset.newVal.trim() : i);
                              store.updateSettings({ customSuggestions: updated });
                              setEditingPreset(null);
                            }
                            if (e.key === 'Escape') setEditingPreset(null);
                          }}
                        />
                        <button onClick={() => {
                          const updated = customSuggestions.map(i => i === s ? editingPreset.newVal.trim() : i);
                          store.updateSettings({ customSuggestions: updated });
                          setEditingPreset(null);
                        }} className="text-emerald-600"><Plus className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <>
                        {s}
                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingPreset({ type: 'suggestion', oldVal: s, newVal: s })} className="hover:text-indigo-950 dark:hover:text-white">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => store.updateSettings({ customSuggestions: customSuggestions.filter(i => i !== s) })}
                            className="hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Categories */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 bg-amber-500 rounded-sm"></div>
                  <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight">Quick Categories</h3>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Suggestions for elements</p>
              </div>
              
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setCategoryError(null);
                  const val = newCategory.trim().toUpperCase();
                  if (val) {
                    if (customCategories.includes(val)) {
                      setCategoryError('Category already exists in presets.');
                    } else {
                      store.updateSettings({ customCategories: [...customCategories, val] });
                      setNewCategory('');
                      setSuccessMsg({ type: 'category', msg: 'Category added!' });
                    }
                  }
                }} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="NEW CATEGORY..."
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button type="submit" className="p-2 bg-amber-600 text-white hover:bg-amber-700 transition">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {categoryError && <p className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 animate-pulse"><AlertTriangle className="w-3 h-3" /> {categoryError}</p>}
                  {successMsg?.type === 'category' && <p className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1"><CheckSquare className="w-3 h-3" /> {successMsg.msg}</p>}
                </form>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-wrap gap-2 content-start custom-scrollbar">
                {customCategories.map(s => (
                  <div key={s} className="group flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight">
                    {editingPreset?.type === 'category' && editingPreset.oldVal === s ? (
                      <div className="flex items-center gap-1">
                        <input 
                          autoFocus
                          className="w-24 bg-white dark:bg-slate-950 border border-amber-500 focus:outline-none text-[10px] px-1"
                          value={editingPreset.newVal}
                          onChange={(e) => setEditingPreset({ ...editingPreset, newVal: e.target.value.toUpperCase() })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const updated = customCategories.map(i => i === s ? editingPreset.newVal.trim() : i);
                              store.updateSettings({ customCategories: updated });
                              setEditingPreset(null);
                            }
                            if (e.key === 'Escape') setEditingPreset(null);
                          }}
                        />
                        <button onClick={() => {
                          const updated = customCategories.map(i => i === s ? editingPreset.newVal.trim() : i);
                          store.updateSettings({ customCategories: updated });
                          setEditingPreset(null);
                        }} className="text-emerald-600"><Plus className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <>
                        {s}
                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingPreset({ type: 'category', oldVal: s, newVal: s })} className="hover:text-amber-950 dark:hover:text-white">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => store.updateSettings({ customCategories: customCategories.filter(i => i !== s) })}
                            className="hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Subcategories */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 bg-emerald-500 rounded-sm"></div>
                  <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight">Quick Subs</h3>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Additional groupings</p>
              </div>
              
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setSubcategoryError(null);
                  const val = newSubcategory.trim().toUpperCase();
                  if (val) {
                    if (customSubcategories.includes(val)) {
                      setSubcategoryError('Subcategory already exists in presets.');
                    } else {
                      store.updateSettings({ customSubcategories: [...customSubcategories, val] });
                      setNewSubcategory('');
                      setSuccessMsg({ type: 'subcategory', msg: 'Subcategory added!' });
                    }
                  }
                }} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubcategory}
                      onChange={(e) => setNewSubcategory(e.target.value)}
                      placeholder="NEW SUBCATEGORY..."
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button type="submit" className="p-2 bg-emerald-600 text-white hover:bg-emerald-700 transition">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {subcategoryError && <p className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 animate-pulse"><AlertTriangle className="w-3 h-3" /> {subcategoryError}</p>}
                  {successMsg?.type === 'subcategory' && <p className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1"><CheckSquare className="w-3 h-3" /> {successMsg.msg}</p>}
                </form>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-wrap gap-2 content-start custom-scrollbar">
                {customSubcategories.map(s => (
                  <div key={s} className="group flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
                    {editingPreset?.type === 'subcategory' && editingPreset.oldVal === s ? (
                      <div className="flex items-center gap-1">
                        <input 
                          autoFocus
                          className="w-24 bg-white dark:bg-slate-950 border border-emerald-500 focus:outline-none text-[10px] px-1"
                          value={editingPreset.newVal}
                          onChange={(e) => setEditingPreset({ ...editingPreset, newVal: e.target.value.toUpperCase() })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const updated = customSubcategories.map(i => i === s ? editingPreset.newVal.trim() : i);
                              store.updateSettings({ customSubcategories: updated });
                              setEditingPreset(null);
                            }
                            if (e.key === 'Escape') setEditingPreset(null);
                          }}
                        />
                        <button onClick={() => {
                          const updated = customSubcategories.map(i => i === s ? editingPreset.newVal.trim() : i);
                          store.updateSettings({ customSubcategories: updated });
                          setEditingPreset(null);
                        }} className="text-emerald-600"><Plus className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <>
                        {s}
                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingPreset({ type: 'subcategory', oldVal: s, newVal: s })} className="hover:text-emerald-950 dark:hover:text-white">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => store.updateSettings({ customSubcategories: customSubcategories.filter(i => i !== s) })}
                            className="hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
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

