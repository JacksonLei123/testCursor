import React, { useState, useEffect } from 'react';
import { Location } from '../types';

interface SimpleMapProps {
  searchQuery: string;
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
}

const SimpleMap: React.FC<SimpleMapProps> = ({
  searchQuery,
  selectedLocation,
  onLocationSelect
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!mapLoaded) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-blue-100">
      {/* Map placeholder with grid */}
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="absolute border-r border-gray-300" style={{ left: `${i * 5}%`, height: '100%' }}></div>
          ))}
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="absolute border-b border-gray-300" style={{ top: `${i * 5}%`, width: '100%' }}></div>
          ))}
        </div>
        
        {/* Map controls */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
          <div className="space-y-1">
            <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center">
              <span className="text-lg">+</span>
            </button>
            <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center">
              <span className="text-lg">−</span>
            </button>
          </div>
        </div>

        {/* Demo markers */}
        <div className="absolute top-1/4 left-1/4">
          <div 
            className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition-transform"
            onClick={() => onLocationSelect({
              id: '1',
              name: 'Central Park',
              address: 'Central Park, New York, NY',
              latitude: 40.7829,
              longitude: -73.9654,
              type: 'attraction',
              rating: 4.8,
              description: 'Famous urban park in Manhattan'
            })}
          ></div>
        </div>

        <div className="absolute top-1/3 right-1/3">
          <div 
            className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition-transform"
            onClick={() => onLocationSelect({
              id: '2',
              name: 'Times Square',
              address: 'Times Square, New York, NY',
              latitude: 40.7580,
              longitude: -73.9855,
              type: 'attraction',
              rating: 4.5,
              description: 'Major commercial intersection and tourist destination'
            })}
          ></div>
        </div>

        <div className="absolute bottom-1/3 left-1/3">
          <div 
            className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition-transform"
            onClick={() => onLocationSelect({
              id: '3',
              name: 'Empire State Building',
              address: '350 5th Ave, New York, NY',
              latitude: 40.7484,
              longitude: -73.9857,
              type: 'attraction',
              rating: 4.6,
              description: 'Iconic skyscraper and observation deck'
            })}
          ></div>
        </div>

        {/* Search results panel */}
        {searchQuery && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Search Results</h3>
            <div className="space-y-2">
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium text-gray-900">Central Park</h4>
                <p className="text-sm text-gray-600">Central Park, New York, NY</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium text-gray-900">Times Square</h4>
                <p className="text-sm text-gray-600">Times Square, New York, NY</p>
              </div>
            </div>
          </div>
        )}

        {/* Map info */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-600">
            <strong>Demo Map</strong><br/>
            Click markers to see location details<br/>
            Search for: "Central Park", "Times Square", etc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleMap; 