import React, { useState, useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}

export function SuggestionInput({ value, onChange, suggestions, placeholder, className }: Props) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(value.toLowerCase()) && 
    s.toLowerCase() !== value.toLowerCase()
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1" ref={containerRef}>
      <input
        type="text"
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => {
                onChange(s);
                setShowSuggestions(false);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
