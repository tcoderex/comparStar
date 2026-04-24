import React, { useState } from 'react';
import { useAppStore } from './store';
import { TabElements } from './components/TabElements';
import { TabTemplates } from './components/TabTemplates';
import { TabCompare } from './components/TabCompare';
import { TabSettings } from './components/TabSettings';
import { LayoutGrid, Layers, GitCompare, Star, LogOut, LogIn, Settings, User } from 'lucide-react';
import { signInWithGoogle, signOut } from './firebase';

type Tab = 'elements' | 'compare' | 'templates' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('elements');
  const store = useAppStore();

  if (store.loading && store.user && store.state.templates.length === 0 && store.state.elements.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">Syncing Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-sans flex flex-col overflow-hidden selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900 dark:selection:text-indigo-100">
      
      {/* Top Navigation */}
      <nav className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 sm:px-8 justify-between z-10 shrink-0 shadow-sm relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center rounded-sm shrink-0 shadow-sm shadow-indigo-200">
            <Star className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-black tracking-tight text-xl hidden lg:inline-block">COMPARSTAR</span>
        </div>
        
        <div className="flex flex-1 justify-center sm:max-w-xl md:max-w-3xl mx-auto h-full overflow-x-auto no-scrollbar absolute left-12 right-12 sm:static sm:left-auto sm:right-auto">
          <div className="flex h-full w-max sm:w-full justify-start sm:justify-center sm:gap-2 no-scrollbar pl-4 sm:pl-0 pr-4 sm:pr-0">
            <button
              onClick={() => setActiveTab('elements')}
              className={`px-3 sm:px-6 h-full flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 border-b-2 text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'elements'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-900/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Elements</span>
              <span className="sm:hidden text-[10px]">Elements</span>
            </button>
            
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3 sm:px-6 h-full flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 border-b-2 text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'compare'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-900/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <GitCompare className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Compare</span>
              <span className="sm:hidden text-[10px]">Compare</span>
            </button>
            
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 sm:px-6 h-full flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 border-b-2 text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'templates'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-900/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Templates</span>
              <span className="sm:hidden text-[10px]">Templates</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 sm:px-6 h-full flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 border-b-2 text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-900/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden text-[10px]">Settings</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 justify-end z-10 bg-white dark:bg-slate-950">
          {store.user ? (
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm hover:ring-2 hover:ring-indigo-500 transition-all opacity-100" 
                title={store.user.email || 'Profile'}
                onClick={() => setActiveTab('settings')}
              >
                {store.user.photoURL ? (
                  <img src={store.user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                     {store.user.displayName?.[0] || store.user.email?.[0] || 'U'}
                   </div>
                )}
              </div>
            </div>
          ) : (
            <div 
                className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm hover:ring-2 hover:ring-indigo-500 transition-all bg-slate-100 dark:bg-slate-800 flex items-center justify-center" 
                title="Sign In / Settings"
                onClick={() => setActiveTab('settings')}
              >
               <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl mx-auto h-full">
          {activeTab === 'elements' && (
            <TabElements
              elements={store.state.elements}
              templates={store.state.templates}
              addElement={store.addElement}
              deleteElement={store.deleteElement}
              renameElement={store.renameElement}
              updateElementTemplate={store.updateElementTemplate}
              updateElementRatings={store.updateElementRatings}
            />
          )}
          
          {activeTab === 'compare' && (
            <TabCompare
              elements={store.state.elements}
              templates={store.state.templates}
            />
          )}
          
          {activeTab === 'templates' && (
            <TabTemplates
              templates={store.state.templates}
              addTemplate={store.addTemplate}
              updateTemplate={store.updateTemplate}
              deleteTemplate={store.deleteTemplate}
            />
          )}

          {activeTab === 'settings' && (
            <TabSettings />
          )}
        </div>
      </main>
      
    </div>
  );
}
