import React, { useState } from 'react';
import { Location } from '../types';
import { X, Star, MapPin, Phone, Globe, Navigation } from 'lucide-react';
import { getDirections } from '../services/api';

interface SidebarProps {
  selectedLocation: Location | null;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedLocation, onClose }) => {
  const [directions, setDirections] = useState<any>(null);
  const [isLoadingDirections, setIsLoadingDirections] = useState(false);
  
  if (!selectedLocation) return null;

  const getTypeIcon = (type: Location['type']) => {
    switch (type) {
      case 'restaurant': return '🍽️';
      case 'hotel': return '🏨';
      case 'attraction': return '🎯';
      case 'business': return '🏢';
      default: return '📍';
    }
  };

  const getTypeLabel = (type: Location['type']) => {
    switch (type) {
      case 'restaurant': return 'Restaurant';
      case 'hotel': return 'Hotel';
      case 'attraction': return 'Attraction';
      case 'business': return 'Business';
      default: return 'Location';
    }
  };

  const handleGetDirections = async () => {
    setIsLoadingDirections(true);
    try {
      // For demo purposes, using a fixed starting point (Times Square)
      const startLat = 40.7580;
      const startLng = -73.9855;
      
      const route = await getDirections(
        startLat,
        startLng,
        selectedLocation.latitude,
        selectedLocation.longitude
      );
      
      setDirections(route);
    } catch (error) {
      console.error('Error getting directions:', error);
    } finally {
      setIsLoadingDirections(false);
    }
  };

  return (
    <div className="w-80 bg-white shadow-lg border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Location Details</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Location Header */}
          <div className="flex items-start space-x-3">
            <div className="text-2xl">{getTypeIcon(selectedLocation.type)}</div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {selectedLocation.name}
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                {getTypeLabel(selectedLocation.type)}
              </p>
              {selectedLocation.rating && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-700 ml-1">
                    {selectedLocation.rating} / 5.0
                  </span>
                  {selectedLocation.user_ratings_total && (
                    <span className="text-sm text-gray-500 ml-1">
                      ({selectedLocation.user_ratings_total} reviews)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

                     {/* Photos */}
           {selectedLocation.photos && selectedLocation.photos.length > 0 && (
             <div>
               <p className="text-sm font-medium text-gray-900 mb-2">Photos</p>
               <div className="grid grid-cols-2 gap-2">
                 {selectedLocation.photos.slice(0, 10).map((photo, index) => (
                   <img
                     key={index}
                     src={photo.photo_reference}
                     alt={`${selectedLocation.name} ${index + 1}`}
                     className="w-full h-24 object-cover rounded-lg"
                     onError={(e) => {
                       // Hide image if it fails to load
                       e.currentTarget.style.display = 'none';
                     }}
                   />
                 ))}
               </div>
             </div>
           )}

          {/* Address */}
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Address</p>
              <p className="text-sm text-gray-600">{selectedLocation.address}</p>
            </div>
          </div>

          {/* Description */}
          {selectedLocation.description && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">About</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedLocation.description}
              </p>
            </div>
          )}

          {/* Contact Information */}
          {(selectedLocation.phone || selectedLocation.website) && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Contact Information</h4>
              
              {selectedLocation.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a
                    href={`tel:${selectedLocation.phone}`}
                    className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {selectedLocation.phone}
                  </a>
                </div>
              )}
              
              {selectedLocation.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a
                    href={selectedLocation.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Coordinates */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-2">Coordinates</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Latitude:</span>
                <span className="ml-1 text-gray-900">{selectedLocation.latitude.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-gray-600">Longitude:</span>
                <span className="ml-1 text-gray-900">{selectedLocation.longitude.toFixed(6)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button 
          onClick={handleGetDirections}
          disabled={isLoadingDirections}
          className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoadingDirections ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Getting Directions...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </>
          )}
        </button>
        
        {directions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-2">Directions from Times Square</h4>
            <p className="text-sm text-blue-800">
              Distance: {Math.round(directions.distance / 1000 * 10) / 10} km
            </p>
            <p className="text-sm text-blue-800">
              Duration: {Math.round(directions.duration / 60)} min
            </p>
          </div>
        )}
        
        <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
          Save to Favorites
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 