import { useState, useEffect } from 'react';
import { Minus, Square, X, Minimize2 } from 'lucide-react';

const win = (window as any).electronAPI;

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    win?.onMaximize?.(setIsMaximized);
  }, []);

  return (
    <div className="flex h-10 bg-black/90 border-b border-[#444444] select-none shrink-0">
      <div className="flex items-center gap-3 px-4 w-56 app-drag-region">
        <div className="w-5 h-5 border border-[#c5b358] flex items-center justify-center shrink-0" style={{ transform: 'rotate(45deg)' }}>
          <div style={{ transform: 'rotate(-45deg)' }}>
            <span className="text-[#c5b358] text-xs font-black">C</span>
          </div>
        </div>
        <span className="text-[#c5b358] text-xs font-display tracking-[0.15em]">COMPARSTAR</span>
      </div>

      <div className="flex-1 app-drag-region" />

      <div className="flex items-center">
        <button
          onClick={() => win?.minimize()}
          className="h-10 w-12 flex items-center justify-center text-[#666666] hover:text-[#e0e0d1] hover:bg-[#1a1a1a] transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => win?.maximize()}
          className="h-10 w-12 flex items-center justify-center text-[#666666] hover:text-[#e0e0d1] hover:bg-[#1a1a1a] transition-colors"
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Square className="w-3 h-3" />}
        </button>
        <button
          onClick={() => win?.close()}
          className="h-10 w-12 flex items-center justify-center text-[#666666] hover:text-red-400 hover:bg-red-950/50 transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
