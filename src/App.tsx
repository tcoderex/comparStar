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
    <div className="font-sans flex flex-col h-screen overflow-hidden text-[#e0e0d1] selection:bg-[#c5b358] selection:text-black">
      
      {/* Top Navigation (Skyrim Top Bar Style) */}
      <nav className="h-16 bg-black/80 border-b border-[#444444] font-display uppercase tracking-widest flex items-center px-4 sm:px-8 justify-between z-10 shrink-0 shadow-lg relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[#c5b358] flex items-center justify-center shrink-0" style={{ transform: 'rotate(45deg)' }}>
            <div style={{ transform: 'rotate(-45deg)' }}>
              <Star className="w-4 h-4 text-[#c5b358] fill-transparent" />
            </div>
          </div>
          <span className="font-bold tracking-widest text-lg hidden lg:inline-block text-[#e0e0d1]">COMPARSTAR</span>
        </div>
        
        <div className="flex flex-1 justify-center sm:max-w-xl md:max-w-3xl mx-auto h-full overflow-x-auto no-scrollbar absolute left-12 right-12 sm:static sm:left-auto sm:right-auto">
          <div className="flex h-full w-max sm:w-full justify-start sm:justify-center sm:gap-2 no-scrollbar pl-4 sm:pl-0 pr-4 sm:pr-0 items-center">
            <button
              onClick={() => setActiveTab('elements')}
              className={`px-3 sm:px-4 h-10 flex items-center justify-center gap-2 text-xs transition-all whitespace-nowrap nav-item ${
                activeTab === 'elements'
                  ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {activeTab === 'elements' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
              <span>Elements</span>
              {activeTab === 'elements' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
            </button>
            <span className="text-gray-700 text-xs hidden sm:inline">|</span>
            
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3 sm:px-4 h-10 flex items-center justify-center gap-2 text-xs transition-all whitespace-nowrap nav-item ${
                activeTab === 'compare'
                  ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {activeTab === 'compare' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
              <span>Compare</span>
              {activeTab === 'compare' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
            </button>
            <span className="text-gray-700 text-xs hidden sm:inline">|</span>
            
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 sm:px-4 h-10 flex items-center justify-center gap-2 text-xs transition-all whitespace-nowrap nav-item ${
                activeTab === 'templates'
                  ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {activeTab === 'templates' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
              <span>Templates</span>
              {activeTab === 'templates' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
            </button>
            <span className="text-gray-700 text-xs hidden sm:inline">|</span>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 sm:px-4 h-10 flex items-center justify-center gap-2 text-xs transition-all whitespace-nowrap nav-item ${
                activeTab === 'settings'
                  ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {activeTab === 'settings' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
              <span>Settings</span>
              {activeTab === 'settings' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 justify-end z-10">
          {store.user ? (
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-none border border-[#444444] cursor-pointer hover:border-[#c5b358] transition-all opacity-100 flex items-center justify-center"
                style={{ transform: 'rotate(45deg)' }}
                title={store.user.email || 'Profile'}
                onClick={() => setActiveTab('settings')}
              >
                {store.user.photoURL ? (
                  <img src={store.user.photoURL} alt="Profile" className="w-full h-full object-cover scale-150" style={{ transform: 'rotate(-45deg)' }} />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-[#c5b358] font-bold text-xs" style={{ transform: 'rotate(-45deg)' }}>
                     {store.user.displayName?.[0] || store.user.email?.[0] || 'U'}
                   </div>
                )}
              </div>
            </div>
          ) : (
            <div 
                className="w-8 h-8 rounded-none border border-[#444444] cursor-pointer hover:border-[#c5b358] transition-all bg-black flex items-center justify-center"
                style={{ transform: 'rotate(45deg)' }} 
                title="Sign In / Settings"
                onClick={() => setActiveTab('settings')}
              >
               <User className="w-4 h-4 text-[#444444]" style={{ transform: 'rotate(-45deg)' }} />
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl mx-auto h-full">
          {activeTab === 'elements' && (
            <TabElements
              store={store}
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
              store={store}
              templates={store.state.templates}
              addTemplate={store.addTemplate}
              updateTemplate={store.updateTemplate}
              deleteTemplate={store.deleteTemplate}
            />
          )}

          {activeTab === 'settings' && (
            <TabSettings store={store} />
          )}
        </div>
      </main>
      
    </div>
  );
}
