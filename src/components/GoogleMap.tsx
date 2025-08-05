import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Location } from '../types';
import { Star, Palette, Moon, Map, Navigation } from 'lucide-react';
import { searchLocations, searchLocationsByDistanceAndPopularity, convertToLocation, ModernPlacesAPI } from '../services/api';
import { config } from '../config';

interface GoogleMapProps {
  searchQuery: string;
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  onError?: () => void;
}

// Custom map styles for different themes
const mapStyles = {
  // Dark theme - sleek and modern
  dark: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    // Hide POI markers and labels
    {
      featureType: 'poi',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }],
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }],
    },
  ],

  // Retro theme - vintage look
  retro: [
    { elementType: 'geometry', stylers: [{ color: '#ebe3cd' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#523735' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f1e6' }] },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#c9b2a6' }],
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#dcd2be' }],
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#ae9e90' }],
    },
    {
      featureType: 'landscape.natural',
      elementType: 'geometry',
      stylers: [{ color: '#dfd2ae' }],
    },
    // Hide POI markers and labels
    {
      featureType: 'poi',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#dfd2ae' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#93817c' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry.fill',
      stylers: [{ color: '#a5b076' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#447530' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#f5f1e6' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#fdfcf8' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#f8c967' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#e9bc62' }],
    },
    {
      featureType: 'road.highway.controlled_access',
      elementType: 'geometry',
      stylers: [{ color: '#e98d58' }],
    },
    {
      featureType: 'road.highway.controlled_access',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#db8555' }],
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#806b63' }],
    },
    {
      featureType: 'transit.line',
      elementType: 'geometry',
      stylers: [{ color: '#dfd2ae' }],
    },
    {
      featureType: 'transit.line',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#8f7d77' }],
    },
    {
      featureType: 'transit.line',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#ebe3cd' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'geometry',
      stylers: [{ color: '#dfd2ae' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry.fill',
      stylers: [{ color: '#b9d3c2' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#92998d' }],
    },
  ],

  // Minimal theme - clean and simple
  minimal: [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#bdbdbd' }],
    },
    // Hide POI markers and labels
    {
      featureType: 'poi',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#eeeeee' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#e5e5e5' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9e9e9e' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#dadada' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#616161' }],
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9e9e9e' }],
    },
    {
      featureType: 'transit.line',
      elementType: 'geometry',
      stylers: [{ color: '#e5e5e5' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'geometry',
      stylers: [{ color: '#eeeeee' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#c9c9c9' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9e9e9e' }],
    },
  ],

  // Nature theme - green and earthy
  nature: [
    { elementType: 'geometry', stylers: [{ color: '#f5f5dc' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#2d5016' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5dc' }] },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#8b4513' }],
    },
    {
      featureType: 'landscape.natural',
      elementType: 'geometry',
      stylers: [{ color: '#90ee90' }],
    },
    // Hide POI markers and labels
    {
      featureType: 'poi',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#98fb98' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#2d5016' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry.fill',
      stylers: [{ color: '#228b22' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#ffffff' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#f4f4f4' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#fdfcf8' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#f8c967' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#e9bc62' }],
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#2d5016' }],
    },
    {
      featureType: 'transit.line',
      elementType: 'geometry',
      stylers: [{ color: '#dfd2ae' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'geometry',
      stylers: [{ color: '#dfd2ae' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry.fill',
      stylers: [{ color: '#87ceeb' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#2d5016' }],
    },
  ],
};

const GoogleMap: React.FC<GoogleMapProps> = ({
  searchQuery,
  selectedLocation,
  onLocationSelect,
  onError
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [currentTheme, setCurrentTheme] = useState<'default' | 'dark' | 'retro' | 'minimal' | 'nature'>('default');
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Helper function to detect category from query
  const detectCategoryFromQuery = useCallback((query: string): string | null => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('restaurant') || lowerQuery.includes('food') || lowerQuery.includes('dining')) {
      return 'restaurants';
    } else if (lowerQuery.includes('hotel') || lowerQuery.includes('lodging') || lowerQuery.includes('accommodation')) {
      return 'hotels';
    } else if (lowerQuery.includes('attraction') || lowerQuery.includes('tourist') || lowerQuery.includes('museum')) {
      return 'attractions';
    } else if (lowerQuery.includes('shopping') || lowerQuery.includes('mall') || lowerQuery.includes('store')) {
      return 'shopping';
    } else if (lowerQuery.includes('cafe') || lowerQuery.includes('coffee') || lowerQuery.includes('coffee shop')) {
      return 'cafes';
    }
    return null;
  }, []);

  // Helper function to detect if query is a specific place name vs general category
  const detectSearchType = useCallback((query: string): 'specific' | 'category' | 'unknown' => {
    const lowerQuery = query.toLowerCase().trim();
    
    // Check if it's a general category search
    const categoryKeywords = [
      'restaurant', 'restaurants', 'food', 'dining', 'eat',
      'hotel', 'hotels', 'lodging', 'accommodation', 'stay',
      'attraction', 'attractions', 'tourist', 'museum', 'park',
      'shopping', 'mall', 'store', 'shop', 'retail',
      'cafe', 'cafes', 'coffee', 'coffee shop', 'coffee shops',
      'bar', 'bars', 'pub', 'pubs', 'nightclub', 'nightclubs',
      'gym', 'gyms', 'fitness', 'exercise',
      'bank', 'banks', 'atm', 'atms',
      'gas', 'gas station', 'gas stations', 'fuel',
      'pharmacy', 'pharmacies', 'drugstore', 'drugstores'
    ];
    
    // Check if query contains category keywords
    const hasCategoryKeywords = categoryKeywords.some(keyword => 
      lowerQuery.includes(keyword)
    );
    
    // Check if it looks like a specific place name
    const specificPlaceIndicators = [
      // Brand names (common chains)
      'mcdonald', 'burger king', 'kfc', 'subway', 'domino',
      'starbucks', 'dunkin', 'tim hortons', 'peets',
      'walmart', 'target', 'costco', 'home depot', 'lowes',
      'macy', 'nordstrom', 'best buy', 'apple store',
      'hilton', 'marriott', 'hyatt', 'sheraton', 'holiday inn',
      'central park', 'times square', 'golden gate', 'statue of liberty',
      'disney', 'universal', 'six flags',
      'yankee stadium', 'madison square garden', 'staples center'
    ];
    
    const hasSpecificPlaceIndicators = specificPlaceIndicators.some(indicator => 
      lowerQuery.includes(indicator)
    );
    
    // Check for proper nouns (capitalized words) - common in specific place names
    const words = query.split(' ');
    const properNouns = words.filter(word => 
      word.length > 0 && word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()
    );
    const hasProperNouns = properNouns.length > 0;
    
    // Check for quoted text (often indicates specific place names)
    const hasQuotes = (query.includes('"') || query.includes("'"));
    
    // Decision logic
    if (hasSpecificPlaceIndicators || hasQuotes || (hasProperNouns && !hasCategoryKeywords)) {
      return 'specific';
    } else if (hasCategoryKeywords) {
      return 'category';
    } else {
      // Default to category for unknown queries
      return 'category';
    }
  }, []);

  // Get marker color based on location type and theme
  const getMarkerColor = useCallback((type: Location['type']) => {
    const colors = {
      default: {
        restaurant: '#ef4444',
        hotel: '#3b82f6',
        attraction: '#10b981',
        business: '#f59e0b',
        other: '#6b7280'
      },
      dark: {
        restaurant: '#f87171',
        hotel: '#60a5fa',
        attraction: '#34d399',
        business: '#fbbf24',
        other: '#9ca3af'
      },
      retro: {
        restaurant: '#dc2626',
        hotel: '#2563eb',
        attraction: '#059669',
        business: '#d97706',
        other: '#4b5563'
      },
      minimal: {
        restaurant: '#ef4444',
        hotel: '#3b82f6',
        attraction: '#10b981',
        business: '#f59e0b',
        other: '#6b7280'
      },
      nature: {
        restaurant: '#dc2626',
        hotel: '#1d4ed8',
        attraction: '#047857',
        business: '#d97706',
        other: '#374151'
      }
    };
    return colors[currentTheme][type] || colors[currentTheme].other;
  }, [currentTheme]);

  // Create custom marker SVG based on theme
  const createMarkerSVG = useCallback((type: Location['type'], isSelected: boolean = false) => {
    const color = getMarkerColor(type);
    const size = isSelected ? 32 : 24;
    const strokeWidth = isSelected ? 3 : 2;
    
    switch (currentTheme) {
      case 'dark':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="${color}" stroke="#1f2937" stroke-width="${strokeWidth}"/>
            <circle cx="12" cy="12" r="4" fill="#ffffff"/>
            ${isSelected ? '<circle cx="12" cy="12" r="16" fill="none" stroke="' + color + '" stroke-width="2" opacity="0.5"/>' : ''}
          </svg>
        `;
      case 'retro':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="#8b4513" stroke-width="${strokeWidth}"/>
            <circle cx="12" cy="9" r="3" fill="#ffffff"/>
          </svg>
        `;
      case 'minimal':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="6" width="12" height="12" fill="${color}" rx="2"/>
            <circle cx="12" cy="12" r="3" fill="#ffffff"/>
          </svg>
        `;
      case 'nature':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="#2d5016" stroke-width="${strokeWidth}"/>
            <path d="M12 6C10.34 6 9 7.34 9 9s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#ffffff"/>
          </svg>
        `;
      default:
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="${strokeWidth}"/>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="none"/>
          </svg>
        `;
    }
  }, [currentTheme, getMarkerColor]);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  }, []);

  // Add markers to map
  const addMarkers = useCallback((locations: Location[], selectedLocationId?: string | undefined) => {
    if (!mapInstanceRef.current) return;

    clearMarkers();

    locations.forEach((location) => {
      const isSelected = selectedLocationId === location.id;
      const marker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: mapInstanceRef.current,
        title: location.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(createMarkerSVG(location.type, isSelected))}`,
          scaledSize: new google.maps.Size(isSelected ? 32 : 24, isSelected ? 32 : 24),
          anchor: new google.maps.Point(isSelected ? 16 : 12, isSelected ? 16 : 12),
        },
        animation: isSelected ? google.maps.Animation.BOUNCE : undefined,
      });

      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          const themeStyles = {
            default: 'background: white; border-radius: 8px; padding: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);',
            dark: 'background: #1f2937; color: white; border-radius: 8px; padding: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);',
            retro: 'background: #f5f1e6; color: #523735; border-radius: 8px; padding: 12px; box-shadow: 0 4px 6px rgba(139,69,19,0.2);',
            minimal: 'background: white; color: #616161; border-radius: 8px; padding: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);',
            nature: 'background: #f5f5dc; color: #2d5016; border-radius: 8px; padding: 12px; box-shadow: 0 4px 6px rgba(45,80,22,0.2);'
          };
          
                    infoWindowRef.current.setContent(`
            <div style="${themeStyles[currentTheme]} max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">${location.name}</h3>
              <p style="margin: 0 0 8px 0; font-size: 12px; opacity: 0.8;">${location.address}</p>
              ${location.rating ? `<p style="margin: 0 0 8px 0; font-size: 12px;">⭐ ${location.rating}/5${location.user_ratings_total ? ` (${location.user_ratings_total} reviews)` : ''}</p>` : ''}
              <button onclick="window.selectLocation('${location.id}')" style="margin-top: 8px; padding: 6px 12px; background: ${getMarkerColor(location.type)}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">View Details</button>
            </div>
          `);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
        onLocationSelect(location);
      });

      markersRef.current.push(marker);
    });
  }, [clearMarkers, onLocationSelect, currentTheme, createMarkerSVG, getMarkerColor]);

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        
        setUserLocation(location);
        
        // Center map on user location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(location);
          mapInstanceRef.current.setZoom(15);
        }
        
        setIsGettingLocation(false);
        console.log('User location obtained:', location);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsGettingLocation(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location access denied. Please allow location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            alert('Location request timed out.');
            break;
          default:
            alert('An unknown error occurred while getting your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  // Change map theme
  const changeTheme = useCallback((theme: typeof currentTheme) => {
    setCurrentTheme(theme);
    if (mapInstanceRef.current) {
      const mapOptions: google.maps.MapOptions = {
        styles: theme === 'default' ? undefined : mapStyles[theme],
      };
      mapInstanceRef.current.setOptions(mapOptions);
    }
  }, []);

  // Initialize Google Maps (only once)
  useEffect(() => {
    const initMap = async () => {
      console.log('Initializing Google Maps...');
      console.log('API Key:', config.google.apiKey ? 'Set' : 'Not set');
      
      // Check if API key is set
      if (!config.google.apiKey || config.google.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        console.error('API key not properly configured');
        setError('Please set your Google Maps API key in src/config.ts');
        setIsLoading(false);
        return;
      }

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          console.error('Map loading timeout');
          setError('Map loading timed out. Please check your internet connection and try again.');
          setIsLoading(false);
          onError?.();
        }
      }, 15000); // 15 second timeout

      try {
        console.log('Loading Google Maps API...');
        const loader = new Loader({
          apiKey: config.google.apiKey,
          version: 'weekly',
          libraries: config.google.libraries as any,
        });

        const google = await loader.load();
        console.log('Google Maps API loaded successfully');
        
        if (mapRef.current) {
          console.log('Creating map instance...');
          const map = new google.maps.Map(mapRef.current, {
            center: {
              lat: config.app.defaultLocation.latitude,
              lng: config.app.defaultLocation.longitude,
            },
            zoom: config.app.defaultLocation.zoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT,
            },
            scrollwheel: true, // Enable zooming on scroll
            gestureHandling: 'cooperative', // Better scroll behavior
            styles: currentTheme === 'default' ? [
              // Hide POI markers and labels by default
              {
                featureType: 'poi',
                elementType: 'labels.icon',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'poi',
                elementType: 'labels.text',
                stylers: [{ visibility: 'off' }],
              },
            ] : mapStyles[currentTheme],
          });

          mapInstanceRef.current = map;
          infoWindowRef.current = new google.maps.InfoWindow();
          console.log('Map created successfully');
          clearTimeout(timeoutId);
          setIsLoading(false);
          
          // Add initial markers (empty for now)
          clearMarkers();
        } else {
          console.error('Map ref is null');
          setError('Failed to initialize map container');
          clearTimeout(timeoutId);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError(`Failed to load Google Maps: ${err instanceof Error ? err.message : 'Unknown error'}`);
        clearTimeout(timeoutId);
        setIsLoading(false);
        onError?.();
      }
    };

    // Only initialize if map doesn't exist yet
    if (!mapInstanceRef.current) {
      initMap();
    }
  }, [onError, clearMarkers, currentTheme, isLoading]);

  // Handle theme changes separately
  useEffect(() => {
    if (mapInstanceRef.current) {
      const newStyles = currentTheme === 'default' ? [
        // Hide POI markers and labels by default
        {
          featureType: 'poi',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text',
          stylers: [{ visibility: 'off' }],
        },
      ] : mapStyles[currentTheme];
      
      mapInstanceRef.current.setOptions({ styles: newStyles });
    }
  }, [currentTheme]);

  // Perform search function
  const performSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get map bounds and center for viewport-focused search
        let searchCenter: { lat: number; lng: number } | null = null;
        let searchBounds: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } } | null = null;
        
        if (mapInstanceRef.current) {
          const center = mapInstanceRef.current.getCenter();
          const bounds = mapInstanceRef.current.getBounds();
          
          if (center) {
            searchCenter = {
              lat: center.lat(),
              lng: center.lng(),
            };
          }
          
          if (bounds) {
            searchBounds = {
              ne: { lat: bounds.getNorthEast().lat(), lng: bounds.getNorthEast().lng() },
              sw: { lat: bounds.getSouthWest().lat(), lng: bounds.getSouthWest().lng() }
            };
          }
        }

        // Determine search type and strategy
        if (searchCenter) {
          let apiResults: any[] = [];
          
          const searchType = detectSearchType(searchQuery);
          const category = detectCategoryFromQuery(searchQuery);
          
          console.log('Search type detected:', searchType, 'for query:', searchQuery);
          console.log('Category detected:', category);
          const x = true
          if (x) {
            // For specific place searches, use text search with exact query
            console.log('Using specific place search for:', searchQuery);
            try {
              // Use the modern API's text search for specific places
              const placesAPI = ModernPlacesAPI.getInstance();
              apiResults = await placesAPI.textSearch(searchQuery, searchCenter, 50000); // Wider radius for specific places
              
                             // Filter results to be within bounds if available
               if (searchBounds) {
                 const bounds = searchBounds; // Store in local variable to help TypeScript
                //  apiResults = apiResults.filter(place => {
                //    const lat = place.geometry.location.lat;
                //    const lng = place.geometry.location.lng;
                //    return lat >= bounds.sw.lat && lat <= bounds.ne.lat && 
                //           lng >= bounds.sw.lng && lng <= bounds.ne.lng;
                //  });
               }
            } catch (error) {
              console.warn('Specific place search failed, falling back to category search:', error);
              // Fallback to category search if specific search fails
              if (category) {
                apiResults = await searchLocationsByDistanceAndPopularity(category, searchCenter, undefined, searchBounds || undefined);
              } else {
                apiResults = await searchLocationsByDistanceAndPopularity('establishment', searchCenter, undefined, searchBounds || undefined);
              }
            }
          } else {
            // For category searches, use the distance-based search with multiple strategies
            if (category) {
              console.log('Using distance and popularity search for category:', category);
              apiResults = await searchLocationsByDistanceAndPopularity(category, searchCenter, undefined, searchBounds || undefined);
            } else {
              // For non-category queries, still use distance and popularity search with a generic category
              console.log('No specific category detected, using distance and popularity search with generic category');
              apiResults = await searchLocationsByDistanceAndPopularity('establishment', searchCenter, undefined, searchBounds || undefined);
            }
          }
          
          if (apiResults.length > 0) {
            const locations = apiResults.map(convertToLocation);
            setSearchResults(locations);
            addMarkers(locations);
            console.log('Found', locations.length, 'results with viewport focus');
          } else {
            setSearchResults([]);
            addMarkers([]);
            console.log('No results found with viewport focus');
          }
        } else {
          // Map not ready yet, wait for it to load
          setSearchResults([]);
          addMarkers([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Search failed. Please check your API key and try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
      addMarkers([]);
      setError(null);
    }
  }, [searchQuery, addMarkers, detectCategoryFromQuery, detectSearchType]);

  // Handle search
  useEffect(() => {
    if (mapInstanceRef.current) {
      performSearch();
    }
  }, [performSearch]);

  // Update markers when selected location changes (without triggering search)
  useEffect(() => {
    if (mapInstanceRef.current && searchResults.length > 0) {
      addMarkers(searchResults, selectedLocation?.id);
    }
  }, [selectedLocation?.id, searchResults, addMarkers]);



  // Add global function for info window button
  useEffect(() => {
    (window as any).selectLocation = (locationId: string) => {
      const location = searchResults.find(loc => loc.id === locationId);
      if (location) {
        onLocationSelect(location);
      }
    };

    return () => {
      delete (window as any).selectLocation;
    };
  }, [searchResults, onLocationSelect]);

  // Close theme selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.theme-selector')) {
        setShowThemeSelector(false);
      }
    };

    if (showThemeSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showThemeSelector]);

  if (isLoading && !mapInstanceRef.current) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-md">
              <p className="text-sm text-red-800">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Location and Theme Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        {/* Location Button */}
        <button
          onClick={getUserLocation}
          disabled={isGettingLocation}
          className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Use my location"
        >
          {isGettingLocation ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          ) : (
            <Navigation className="w-5 h-5 text-gray-700" />
          )}
        </button>


        


        {/* Theme Selector */}
        <div className="relative theme-selector">
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors"
            title="Change map theme"
          >
            <Palette className="w-5 h-5 text-gray-700" />
          </button>
         
          {showThemeSelector && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-3 min-w-48">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Map Theme</h4>
              <div className="space-y-2">
                {[
                  { id: 'default', name: 'Default', icon: <Map className="w-4 h-4" /> },
                  { id: 'dark', name: 'Dark', icon: <Moon className="w-4 h-4" /> },
                  { id: 'retro', name: 'Retro', icon: <Map className="w-4 h-4" /> },
                  { id: 'minimal', name: 'Minimal', icon: <Map className="w-4 h-4" /> },
                  { id: 'nature', name: 'Nature', icon: <Map className="w-4 h-4" /> }
                ].map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      changeTheme(theme.id as typeof currentTheme);
                      setShowThemeSelector(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      currentTheme === theme.id
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {theme.icon}
                    <span className="text-sm font-medium">{theme.name}</span>
                    {currentTheme === theme.id && (
                      <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
             {/* Search results panel */}
               {searchQuery && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm max-h-96 overflow-y-auto">
           <h3 className="font-semibold text-gray-900 mb-3">Search Results</h3>
                                               <p className="text-xs text-gray-500 mb-3">
               Showing results ranked by distance and popularity (up to 80 locations)
             </p>
         
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          )}
          
          {!isLoading && searchResults.length > 0 && (
                         <div className="space-y-2">
               {searchResults.map((location) => (
                 <div
                   key={location.id}
                   className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                   onClick={() => onLocationSelect(location)}
                 >
                                       <div className="flex space-x-3">
                      <div className="flex-1 min-w-0">
                       <h4 className="font-medium text-gray-900 truncate">{location.name}</h4>
                       <p className="text-sm text-gray-600 truncate">{location.address}</p>
                       {location.rating && (
                         <div className="flex items-center mt-1">
                           <Star className="w-3 h-3 text-yellow-400 fill-current" />
                           <span className="text-xs text-gray-700 ml-1">{location.rating}</span>
                           {location.user_ratings_total && (
                             <span className="text-xs text-gray-500 ml-1">({location.user_ratings_total} reviews)</span>
                           )}
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          )}
          
          {!isLoading && searchResults.length === 0 && searchQuery && !error && (
            <div className="text-center py-4">
              <p className="text-gray-500">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default GoogleMap; 