import { useState } from 'react';
import { SearchConfig } from '../types';
import { SEARCH_CONFIGS } from '../utils/constants';

export const useSearch = (userRole: string) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchConfig: SearchConfig = SEARCH_CONFIGS[userRole] || SEARCH_CONFIGS.client;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic here
  };

  return {
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    searchConfig,
    handleSearch
  };
};