import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, MapPin, Clock, Filter, Star, Coffee, Hotel, Camera, ShoppingBag, Utensils } from 'lucide-react';
import { searchLocations, getAutocompleteSuggestions } from '../services/api';
import { config } from '../config';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

interface SearchCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  query: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search categories with better search terms
  const searchCategories: SearchCategory[] = [
    { id: 'restaurants', name: 'Restaurants', icon: <Utensils className="w-4 h-4" />, query: 'restaurants near me' },
    { id: 'hotels', name: 'Hotels', icon: <Hotel className="w-4 h-4" />, query: 'hotels near me' },
    { id: 'attractions', name: 'Attractions', icon: <Camera className="w-4 h-4" />, query: 'tourist attractions near me' },
    { id: 'shopping', name: 'Shopping', icon: <ShoppingBag className="w-4 h-4" />, query: 'shopping malls near me' },
    { id: 'cafes', name: 'Cafes', icon: <Coffee className="w-4 h-4" />, query: 'coffee shops near me' },
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save search to recent searches
  const saveToRecentSearches = useCallback((searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }, [recentSearches]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      saveToRecentSearches(query.trim());
      setIsFocused(false);
    }
  }, [query, onSearch, saveToRecentSearches]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
    setSuggestions([]);
    setSelectedCategory('');
  }, [onSearch]);

  const handleSuggestionClick = useCallback((suggestion: any) => {
    const searchTerm = suggestion.name || suggestion.formatted_address || suggestion;
    setQuery(searchTerm);
    onSearch(searchTerm);
    saveToRecentSearches(searchTerm);
    setIsFocused(false);
  }, [onSearch, saveToRecentSearches]);

  const handleCategoryClick = useCallback((category: SearchCategory) => {
    setSelectedCategory(category.id);
    const searchTerm = category.query;
    setQuery(searchTerm);
    // Pass both the search term and category for better results
    onSearch(searchTerm);
    saveToRecentSearches(searchTerm);
    setIsFocused(false);
  }, [onSearch, saveToRecentSearches]);

  // Get real-time suggestions with more details
  useEffect(() => {
    const getSuggestions = async () => {
      if (query.length >= 2 && isFocused) {
        setIsLoadingSuggestions(true);
        try {
          // Try autocomplete first for better suggestions
          const autocompleteResults = await getAutocompleteSuggestions(query);
          if (autocompleteResults.length > 0) {
            setSuggestions(autocompleteResults.slice(0, 8));
          } else {
            // Fallback to regular search
            const results = await searchLocations(query);
            setSuggestions(results.slice(0, 8));
          }
        } catch (error) {
          console.error('Error getting suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(getSuggestions, config.app.searchDebounceMs);
    return () => clearTimeout(timeoutId);
  }, [query, isFocused]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1 max-w-2xl mx-4" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center bg-white border rounded-lg shadow-sm transition-all duration-200 ${
          isFocused ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-300'
        }`}>
          <div className="absolute left-3 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search for places, restaurants, hotels, attractions..."
            className="w-full pl-10 pr-20 py-3 text-gray-900 placeholder-gray-500 focus:outline-none bg-transparent"
          />
          
          <div className="absolute right-2 flex items-center space-x-1">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={`p-1 rounded transition-colors ${
                showAdvancedSearch ? 'text-primary-500 bg-primary-50' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
      
      {/* Advanced Search Panel */}
      {showAdvancedSearch && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {searchCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                  selectedCategory === category.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category.icon}
                <span className="text-xs mt-1 font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Search suggestions dropdown */}
      {isFocused && (query || suggestions.length > 0 || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
          <div className="p-3">
            {/* Recent Searches */}
            {recentSearches.length > 0 && !query && (
              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Clock className="w-4 h-4 mr-1" />
                  Recent searches
                </div>
                <div className="space-y-1">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center"
                    >
                      <MapPin className="w-3 h-3 mr-2 text-gray-400" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {!query && (
              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Star className="w-4 h-4 mr-1" />
                  Popular searches
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Central Park', 'Times Square', 'Empire State Building', 'Statue of Liberty', 'Brooklyn Bridge', 'Metropolitan Museum'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Search Suggestions */}
            {query.length >= 2 && (
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Search className="w-4 h-4 mr-1" />
                  Suggestions
                </div>
                {isLoadingSuggestions ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                    <span className="ml-2 text-sm text-gray-600">Searching...</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      >
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {suggestion.name || suggestion.formatted_address}
                            </div>
                            {suggestion.formatted_address && suggestion.name && (
                              <div className="text-xs text-gray-500 truncate">
                                {suggestion.formatted_address}
                              </div>
                            )}
                          </div>
                          {suggestion.rating && (
                            <div className="flex items-center ml-2 text-xs text-gray-500">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="ml-1">{suggestion.rating}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 