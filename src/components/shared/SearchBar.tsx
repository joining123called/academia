import React from 'react';
import { Search } from 'lucide-react';
import clsx from 'clsx';
import { SearchConfig } from '../../types';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  config: SearchConfig;
  isFocused: boolean;
  onFocusChange: (focused: boolean) => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  config,
  isFocused,
  onFocusChange,
  className
}) => (
  <div className={clsx("relative", className)}>
    <Search className={clsx(
      "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-150",
      isFocused ? "text-violet-500" : "text-gray-400"
    )} />
    <input
      type="text"
      className={clsx(
        "w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-150",
        "focus:ring-2 focus:ring-violet-500 focus:border-violet-500",
        isFocused ? "border-violet-500" : "border-gray-300"
      )}
      placeholder={config.placeholder}
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      onFocus={() => onFocusChange(true)}
      onBlur={() => onFocusChange(false)}
    />
    
    {isFocused && (
      <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
        {config.categories.map((category, index) => (
          <button
            key={index}
            className="w-full px-4 py-2 flex items-center hover:bg-gray-50 transition-colors duration-150"
          >
            <category.icon className={clsx("h-5 w-5 mr-3", category.color)} />
            <span className="text-sm text-gray-700">{category.label}</span>
          </button>
        ))}
      </div>
    )}
  </div>
);