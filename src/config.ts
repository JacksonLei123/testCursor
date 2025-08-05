// Configuration file for API keys and settings

export const config = {
  // Google Maps configuration
  google: {
    apiKey: 'AIzaSyDNOfG8tf94V6pNYAMFku99FWHVPJPwIDA', // Replace with your actual API key
    libraries: ['places', 'geometry'],
  },
  
  // API endpoints
  api: {
    googleGeocoding: 'https://maps.googleapis.com/maps/api/geocode/json',
    googlePlaces: 'https://maps.googleapis.com/maps/api/place',
    googleDirections: 'https://maps.googleapis.com/maps/api/directions/json',
  },
  
  // App settings
  app: {
    defaultLocation: {
      latitude: 40.7128,
      longitude: -74.0060,
      zoom: 12,
    },
    searchDebounceMs: 300,
    maxSearchResults: 80,
    // Add fallback settings
    useFallbackMap: false, // Set to true to use SimpleMap instead of Google Maps
  },
};

// For production, you should use environment variables:
// export const config = {
//   mapbox: {
//     accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || '',
//     mapStyle: process.env.REACT_APP_MAPBOX_STYLE || 'mapbox://styles/mapbox/streets-v11',
//   },
//   // ... rest of config
// }; 