import React, { useState, useCallback } from 'react';
import GoogleMap from './components/GoogleMap';
import SimpleMap from './components/SimpleMap';
import SearchBar from './components/SearchBar';
import Sidebar from './components/Sidebar';
import { Location } from './types';
import { config } from './config';
import { getDetailedPlaceInfo, convertToLocation } from './services/api';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [useSimpleMap, setUseSimpleMap] = useState(config.app.useFallbackMap);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
  }, []);

  const handleLocationSelect = useCallback(async (location: Location) => {
    // Set the basic location info immediately for UI responsiveness
    setSelectedLocation(location);
    setIsSidebarOpen(true);
    
    // Get detailed place information with multiple photos
    if (location.place_id) {
      try {
        const detailedPlace = await getDetailedPlaceInfo(location.place_id);
        if (detailedPlace) {
          const enhancedLocation = convertToLocation(detailedPlace);
          setSelectedLocation(enhancedLocation);
        }
      } catch (error) {
        console.error('Error getting detailed place info:', error);
        // Keep the original location if detailed info fails
      }
    }
  }, []);

  const handleMapError = useCallback(() => {
    setUseSimpleMap(true);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">MapQuest</h1>
          {useSimpleMap && (
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
              Demo Mode
            </span>
          )}
        </div>
        
        <SearchBar onSearch={handleSearch} />
        
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {useSimpleMap ? (
          <SimpleMap 
            searchQuery={searchQuery}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
          />
        ) : (
          <GoogleMap 
            searchQuery={searchQuery}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            onError={handleMapError}
          />
        )}
        
        {isSidebarOpen && (
          <Sidebar 
            selectedLocation={selectedLocation}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App; 