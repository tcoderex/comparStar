import React, { useState, useEffect } from 'react';
import { useAppStore } from './store';
import { TabElements } from './components/TabElements';
import { TabTemplates } from './components/TabTemplates';
import { TabCompare } from './components/TabCompare';
import { TabSettings } from './components/TabSettings';
import { LogOut, LogIn } from 'lucide-react';
import { signOut, signInWithGoogleRedirect } from './firebase';
import TitleBar from './components/TitleBar';

type Tab = 'elements' | 'compare' | 'templates' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    return (localStorage.getItem('activeTab') as Tab) || 'elements';
  });
  const store = useAppStore();

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  if (store.loading && store.user && store.state.templates.length === 0 && store.state.elements.length === 0) {
    return (
      <div className="font-sans flex flex-col h-screen overflow-hidden bg-[#111111] text-[#e0e0d1]">
        <TitleBar />
        <div className="flex-1 flex items-center justify-center flex-col gap-6">
          <div className="w-8 h-8 border border-[#c5b358] flex items-center justify-center animate-pulse" style={{ transform: 'rotate(45deg)' }}>
            <div style={{ transform: 'rotate(-45deg)' }}>
              <span className="text-[#c5b358] text-base font-black">C</span>
            </div>
          </div>
          <p className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-[#c5b358] animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans flex flex-col h-screen overflow-hidden text-[#e0e0d1] selection:bg-[#c5b358] selection:text-black">

      <TitleBar />

      {/* Top Navigation (Skyrim Top Bar Style) */}
      <nav className="h-12 bg-black/70 border-b border-[#444444] font-display uppercase tracking-widest flex items-center px-4 z-10 shrink-0 shadow-lg">
        <div className="flex flex-1 justify-center h-full">
          <div className="flex h-full items-center gap-1">
            <button
              onClick={() => setActiveTab('elements')}
              className={`px-3 h-8 flex items-center justify-center gap-2 text-xs transition-all whitespace-nowrap nav-item ${
                activeTab === 'elements'
                  ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] bg-white/5'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {activeTab === 'elements' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
              <span>Elements</span>
              {activeTab === 'elements' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
            </button>
            <span className="text-gray-700 text-xs">|</span>

            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3 h-8 flex items-center justify-center gap-2 text-xs transition-all whitespace-nowrap nav-item ${
                activeTab === 'compare'
                  ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] bg-white/5'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {activeTab === 'compare' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
              <span>Compare</span>
              {activeTab === 'compare' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
            </button>
            <span className="text-gray-700 text-xs">|</span>

            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 h-8 flex items-center justify-center gap-2 text-xs transition-all whitespace-nowrap nav-item ${
                activeTab === 'templates'
                  ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] bg-white/5'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {activeTab === 'templates' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
              <span>Templates</span>
              {activeTab === 'templates' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
            </button>
            <span className="text-gray-700 text-xs">|</span>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 h-8 flex items-center justify-center gap-2 text-xs transition-all whitespace-nowrap nav-item ${
                activeTab === 'settings'
                  ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] bg-white/5'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {activeTab === 'settings' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
              <span>Settings</span>
              {activeTab === 'settings' && <span className="text-[#c5b358] text-[8px] animate-pulse">♦</span>}
            </button>
          </div>
        </div>

        {/* Auth button — right side of nav */}
        <div className="flex items-center shrink-0 ml-2">
          {store.user ? (
            <button
              onClick={signOut}
              title={`Sign out (${store.user.displayName || store.user.email})`}
              className="flex items-center gap-2 px-3 h-8 text-[10px] text-gray-400 hover:text-[#c5b358] transition-colors border border-transparent hover:border-[#444444]"
            >
              {store.user.photoURL ? (
                <img src={store.user.photoURL} alt="" className="w-5 h-5 rounded-full" />
              ) : (
                <span className="w-5 h-5 border border-[#c5b358] flex items-center justify-center text-[#c5b358] text-[8px] font-black">
                  {(store.user.displayName || store.user.email || 'U')[0].toUpperCase()}
                </span>
              )}
              <LogOut className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={signInWithGoogleRedirect}
              className="flex items-center gap-2 px-3 h-8 text-[10px] font-display tracking-widest text-[#c5b358] border border-[#c5b358]/40 hover:border-[#c5b358] hover:bg-[#c5b358]/10 transition-all"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </button>
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
