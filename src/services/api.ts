// API service for Google Maps integration using modern API (minimizing deprecated PlacesService usage)
import { config } from '../config';

export interface GeocodingResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{
    photo_reference: string;
  }>;
}

export interface PlacesResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  photos?: Array<{
    photo_reference: string;
  }>;
}

// Modern Places API wrapper with efficient PlacesService usage
export class ModernPlacesAPI {
  private static instance: ModernPlacesAPI;
  private service: google.maps.places.PlacesService | null = null;

  private constructor() {}

  static getInstance(): ModernPlacesAPI {
    if (!ModernPlacesAPI.instance) {
      ModernPlacesAPI.instance = new ModernPlacesAPI();
    }
    return ModernPlacesAPI.instance;
  }

  private getService(): google.maps.places.PlacesService {
    if (!this.service) {
      // Create a minimal div for the service (required by Google)
      const div = document.createElement('div');
      div.style.display = 'none';
      document.body.appendChild(div);
      this.service = new google.maps.places.PlacesService(div);
    }
    return this.service;
  }

  // Modern text search with better error handling
  async textSearch(
    query: string,
    location?: { lat: number; lng: number },
    radius?: number,
    type?: string
  ): Promise<GeocodingResult[]> {
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }

      const service = this.getService();
      const allResults: GeocodingResult[] = [];
      let pagination: google.maps.places.PlaceSearchPagination | null = null;
      const performSearch = (request: google.maps.places.TextSearchRequest) => {
        service.textSearch(request, (results, status, paginationInfo) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const convertedResults = results.map(place => ({
              place_id: place.place_id || '',
              name: place.name || 'Unknown',
              formatted_address: place.formatted_address || 'No address available',
              geometry: {
                location: {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0
                }
              },
              rating: place.rating,
              user_ratings_total: place.user_ratings_total,
              types: place.types || [],
              photos: place.photos?.map(photo => ({
                photo_reference: photo.getUrl()
              })) || []
            }));
            
            allResults.push(...convertedResults);
            pagination = paginationInfo;
            
            // If there are more results and we haven't reached our limit, continue pagination
            if (pagination && pagination.hasNextPage && allResults.length < 60) {
              setTimeout(() => {
                pagination!.nextPage();
              }, 200); // Small delay to avoid rate limiting
            } else {
              resolve(allResults);
            }
          } else {
            console.warn(`Text search failed with status: ${status}`);
            resolve(allResults);
          }
        });
      };

      const request: google.maps.places.TextSearchRequest = {
        query: query
      };

      if (location) {
        request.location = new google.maps.LatLng(location.lat, location.lng);
        request.radius = radius || 16093;
      }

      if (type) {
        request.type = type as any;
      }

      performSearch(request);
    });
  }

  // Modern nearby search with better error handling and pagination
  async nearbySearch(
    location: { lat: number; lng: number },
    radius: number,
    type?: string
  ): Promise<GeocodingResult[]> {
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }

      const service = this.getService();
      const allResults: GeocodingResult[] = [];
      let pagination: google.maps.places.PlaceSearchPagination | null = null;

      const performSearch = (request: google.maps.places.PlaceSearchRequest) => {
        service.nearbySearch(request, (results, status, paginationInfo) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const convertedResults = results.map(place => ({
              place_id: place.place_id || '',
              name: place.name || 'Unknown',
              formatted_address: place.formatted_address || 'No address available',
              geometry: {
                location: {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0
                }
              },
              rating: place.rating,
              user_ratings_total: place.user_ratings_total,
              types: place.types || [],
              photos: place.photos?.map(photo => ({
                photo_reference: photo.getUrl()
              })) || []
            }));
            
            allResults.push(...convertedResults);
            pagination = paginationInfo;
            
            // If there are more results and we haven't reached our limit, continue pagination
            if (pagination && pagination.hasNextPage && allResults.length < 60) {
              setTimeout(() => {
                pagination!.nextPage();
              }, 200); // Small delay to avoid rate limiting
            } else {
              resolve(allResults);
            }
          } else {
            console.warn(`Nearby search failed with status: ${status}`);
            resolve(allResults);
          }
        });
      };

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: radius
      };

      if (type) {
        request.type = type as any;
      }

      performSearch(request);
    });
  }

  // Modern find place from query with better error handling
  async findPlaceFromQuery(
    query: string,
    location?: { lat: number; lng: number },
    radius?: number
  ): Promise<GeocodingResult[]> {
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }

      const service = this.getService();
      const request: google.maps.places.FindPlaceFromQueryRequest = {
        query: query,
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'rating', 'user_ratings_total', 'types', 'photos']
      };

      if (location) {
        request.locationBias = {
          center: new google.maps.LatLng(location.lat, location.lng),
          radius: radius || 16093
        };
      }

      service.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const convertedResults = results.map(place => ({
            place_id: place.place_id || '',
            name: place.name || 'Unknown',
            formatted_address: place.formatted_address || 'No address available',
            geometry: {
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0
              }
            },
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            types: place.types || [],
            photos: place.photos?.map(photo => ({
              photo_reference: photo.getUrl()
            })) || []
          }));
          resolve(convertedResults);
        } else {
          console.warn(`Find place search failed with status: ${status}`);
          resolve([]);
        }
      });
    });
  }

  // Modern place details with better error handling
  async getPlaceDetails(placeId: string): Promise<GeocodingResult | null> {
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }

      const service = this.getService();
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: placeId,
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'rating', 'user_ratings_total', 'types', 'photos']
      };

      service.getDetails(request, (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result) {
          const convertedResult = {
            place_id: result.place_id || '',
            name: result.name || 'Unknown',
            formatted_address: result.formatted_address || 'No address available',
            geometry: {
              location: {
                lat: result.geometry?.location?.lat() || 0,
                lng: result.geometry?.location?.lng() || 0
              }
            },
            rating: result.rating,
            user_ratings_total: result.user_ratings_total,
            types: result.types || [],
            photos: result.photos?.map(photo => ({
              photo_reference: photo.getUrl()
            })) || []
          };
          resolve(convertedResult);
        } else {
          console.warn(`Get place details failed with status: ${status}`);
          resolve(null);
        }
      });
    });
  }

  // Enhanced function to get multiple photos for a place
  async getPlaceWithMultiplePhotos(placeId: string): Promise<GeocodingResult | null> {
    try {
      const placeDetails = await this.getPlaceDetails(placeId);
      if (!placeDetails) return null;

      // If the place already has multiple photos, return as is
      if (placeDetails.photos && placeDetails.photos.length > 1) {
        console.log(`Place ${placeDetails.name} already has ${placeDetails.photos.length} photos`);
        return placeDetails;
      }

      // If it has only 1 photo, try to get more details
      if (placeDetails.photos && placeDetails.photos.length === 1) {
        console.log(`Enhancing photos for ${placeDetails.name}`);
        
        // Make another request with more specific photo fields
        const service = this.getService();
        const request: google.maps.places.PlaceDetailsRequest = {
          placeId: placeId,
          fields: ['photos']
        };

        return new Promise((resolve) => {
          service.getDetails(request, (result, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && result && result.photos) {
                             // Update the photos array with all available photos (up to 10)
               const enhancedPhotos = result.photos
                 .slice(0, 10) // Limit to 10 photos
                .map(photo => ({
                  photo_reference: photo.getUrl()
                }));
              
              console.log(`Enhanced ${placeDetails.name} with ${enhancedPhotos.length} photos`);
              
              resolve({
                ...placeDetails,
                photos: enhancedPhotos
              });
            } else {
              resolve(placeDetails);
            }
          });
        });
      }

      return placeDetails;
    } catch (error) {
      console.error('Error getting place with multiple photos:', error);
      return null;
    }
  }

  // Function to enhance search results with multiple photos
  async enhanceResultsWithPhotos(results: GeocodingResult[]): Promise<GeocodingResult[]> {
    const enhancedResults: GeocodingResult[] = [];
    
    for (const result of results) {
      try {
        // Only enhance places that have at least 1 photo
        if (result.photos && result.photos.length > 0) {
          const enhancedPlace = await this.getPlaceWithMultiplePhotos(result.place_id);
          if (enhancedPlace) {
            enhancedResults.push(enhancedPlace);
          } else {
            enhancedResults.push(result);
          }
        } else {
          enhancedResults.push(result);
        }
        
        // Add a small delay to avoid hitting API limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to enhance photos for ${result.name}:`, error);
        enhancedResults.push(result);
      }
    }
    
    return enhancedResults;
  }
}

// Enhanced search with category filtering using the most modern available API
export const searchLocations = async (
  query: string, 
  category?: string,
  location?: { lat: number; lng: number },
  bounds?: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }
): Promise<GeocodingResult[]> => {
  console.log("HEY")
  console.log(query)
  try {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      console.error('Google Maps API not loaded');
      throw new Error('Google Maps API not available');
    }

    // Auto-detect category from query if not provided
    let detectedCategory = category;
    if (!category) {
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes('restaurant') || lowerQuery.includes('food') || lowerQuery.includes('dining')) {
        detectedCategory = 'restaurants';
      } else if (lowerQuery.includes('hotel') || lowerQuery.includes('lodging') || lowerQuery.includes('accommodation')) {
        detectedCategory = 'hotels';
      } else if (lowerQuery.includes('attraction') || lowerQuery.includes('tourist') || lowerQuery.includes('museum')) {
        detectedCategory = 'attractions';
      } else if (lowerQuery.includes('shopping') || lowerQuery.includes('mall') || lowerQuery.includes('store')) {
        detectedCategory = 'shopping';
      } else if (lowerQuery.includes('cafe') || lowerQuery.includes('coffee') || lowerQuery.includes('coffee shop')) {
        detectedCategory = 'cafes';
      }
    }

    // Convert category to Google Places API type
    let placeType: string | undefined;
    if (detectedCategory) {
      switch (detectedCategory) {
        case 'restaurants':
          placeType = 'restaurant';
          break;
        case 'hotels':
          placeType = 'lodging';
          break;
        case 'attractions':
          placeType = 'tourist_attraction';
          break;
        case 'shopping':
          placeType = 'shopping_mall';
          break;
        case 'cafes':
          placeType = 'cafe';
          break;
      }
    }

    console.log('Searching with query:', query, 'category:', detectedCategory, 'type:', placeType);

    // Use the modern Places API
    const allResults: GeocodingResult[] = [];
    const seenPlaceIds = new Set<string>();

    // Helper function to add unique results with type filtering
    const addUniqueResults = (places: GeocodingResult[]) => {
      places.forEach(place => {
        if (place.place_id && !seenPlaceIds.has(place.place_id)) {
          // Filter by type if a specific category is requested
          if (placeType && place.types && place.types.length > 0) {
            const isCorrectType = place.types.some(type => {
              switch (placeType) {
                case 'restaurant':
                  return type === 'restaurant' || type === 'food' || type === 'meal_takeaway' || type === 'meal_delivery';
                case 'lodging':
                  return type === 'lodging' || type === 'hotel';
                case 'tourist_attraction':
                  return type === 'tourist_attraction' || type === 'point_of_interest';
                case 'shopping_mall':
                  return type === 'shopping_mall' || type === 'store' || type === 'shopping';
                case 'cafe':
                  return type === 'cafe' || type === 'food';
                default:
                  return true;
              }
            });
            
            if (!isCorrectType) {
              console.log(`Filtering out ${place.name} (types: ${place.types.join(', ')}) - not matching requested type: ${placeType}`);
              return;
            }
          }
          
          seenPlaceIds.add(place.place_id);
          
          // Debug: Log photo information
          if (place.photos && place.photos.length > 0) {
            console.log(`Photos found for ${place.name}:`, place.photos.length, 'photos');
          }
          
          allResults.push({
            place_id: place.place_id,
            name: place.name || 'Unknown',
            formatted_address: place.formatted_address || 'No address available',
            geometry: {
              location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              }
            },
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            types: place.types || [],
            photos: place.photos || []
          });
        }
      });
    };

    // Calculate search radius based on bounds or use default
    let searchRadius = 16093; // 10 miles default
    if (bounds && location) {
      const centerLat = location.lat;
      const centerLng = location.lng;
      const neLat = bounds.ne.lat;
      const neLng = bounds.ne.lng;
      const swLat = bounds.sw.lat;
      const swLng = bounds.sw.lng;
      
      // Calculate distances to each corner
      const distanceToNE = Math.sqrt(Math.pow(neLat - centerLat, 2) + Math.pow(neLng - centerLng, 2)) * 111000;
      const distanceToSW = Math.sqrt(Math.pow(swLat - centerLat, 2) + Math.pow(swLng - centerLng, 2)) * 111000;
      const distanceToNW = Math.sqrt(Math.pow(neLat - centerLat, 2) + Math.pow(swLng - centerLng, 2)) * 111000;
      const distanceToSE = Math.sqrt(Math.pow(swLat - centerLat, 2) + Math.pow(neLng - centerLng, 2)) * 111000;
      
      searchRadius = Math.min(Math.max(distanceToNE, distanceToSW, distanceToNW, distanceToSE), 16093);
    }

    const placesAPI = ModernPlacesAPI.getInstance();

    // Strategy 1: Text Search using modern API
    try {
      const textResults = await placesAPI.textSearch(query, location, searchRadius, placeType);
      console.log('Text search results:', textResults.length, 'found');
      addUniqueResults(textResults);
    } catch (error) {
      console.warn('Text search failed:', error);
    }

    // Strategy 2: Nearby Search using modern API
    if (location && placeType) {
      try {
        const nearbyResults = await placesAPI.nearbySearch(location, searchRadius, placeType);
        console.log('Nearby search results:', nearbyResults.length, 'found');
        addUniqueResults(nearbyResults);
      } catch (error) {
        console.warn('Nearby search failed:', error);
      }
    }

    // Strategy 3: Find Place from Query using modern API
    if (location) {
      try {
        const findResults = await placesAPI.findPlaceFromQuery(query, location, searchRadius);
        console.log('Find place search results:', findResults.length, 'found');
        addUniqueResults(findResults);
      } catch (error) {
        console.warn('Find place search failed:', error);
      }
    }

    // Limit results to maxSearchResults
    const limitedResults = allResults.slice(0, config.app.maxSearchResults);
    
    console.log('Total search results:', limitedResults.length, 'found');
    return limitedResults;

  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

// Extended search function for maximum results using multiple strategies
export const searchLocationsExtended = async (
  query: string, 
  category?: string,
  location?: { lat: number; lng: number }
): Promise<GeocodingResult[]> => {
  try {
    // First, get results from the enhanced searchLocations function
    const baseResults = await searchLocations(query, category, location);
    
    // If we already have a good number of results, return them
    if (baseResults.length >= 100) {
      return baseResults;
    }

    // Additional search strategies for more results
    const additionalResults: GeocodingResult[] = [];
    const seenPlaceIds = new Set(baseResults.map(r => r.place_id));

    // Helper function to add unique results with type filtering
    const addUniqueResults = (places: GeocodingResult[]) => {
      places.forEach(place => {
        if (place.place_id && !seenPlaceIds.has(place.place_id)) {
          // Filter by type if a specific category is requested
          let placeType: string | undefined;
          if (category) {
            switch (category) {
              case 'restaurants':
                placeType = 'restaurant';
                break;
              case 'hotels':
                placeType = 'lodging';
                break;
              case 'attractions':
                placeType = 'tourist_attraction';
                break;
              case 'shopping':
                placeType = 'shopping_mall';
                break;
              case 'cafes':
                placeType = 'cafe';
                break;
            }
          }
          
          if (placeType && place.types && place.types.length > 0) {
            const isCorrectType = place.types.some(type => {
              switch (placeType) {
                case 'restaurant':
                  return type === 'restaurant' || type === 'food' || type === 'meal_takeaway' || type === 'meal_delivery';
                case 'lodging':
                  return type === 'lodging' || type === 'hotel';
                case 'tourist_attraction':
                  return type === 'tourist_attraction' || type === 'point_of_interest';
                case 'shopping_mall':
                  return type === 'shopping_mall' || type === 'store' || type === 'shopping';
                case 'cafe':
                  return type === 'cafe' || type === 'food';
                default:
                  return true;
              }
            });
            
            if (!isCorrectType) {
              console.log(`Extended search filtering out ${place.name} (types: ${place.types.join(', ')}) - not matching requested type: ${placeType}`);
              return;
            }
          }
          
          seenPlaceIds.add(place.place_id);
          additionalResults.push({
            place_id: place.place_id,
            name: place.name || 'Unknown',
            formatted_address: place.formatted_address || 'No address available',
            geometry: {
              location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              }
            },
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            types: place.types || [],
            photos: place.photos || []
          });
        }
      });
    };

    // Strategy: Search with category-specific query variations (only if category is specified)
    let queryVariations: string[] = [query];
    if (category) {
      // Add category-specific variations that maintain the category focus
      switch (category) {
        case 'restaurants':
          queryVariations = [
            query,
            `${query} restaurant`,
            `${query} food`,
            `${query} dining`
          ];
          break;
        case 'hotels':
          queryVariations = [
            query,
            `${query} hotel`,
            `${query} lodging`,
            `${query} accommodation`
          ];
          break;
        case 'attractions':
          queryVariations = [
            query,
            `${query} attraction`,
            `${query} tourist`,
            `${query} museum`
          ];
          break;
        case 'shopping':
          queryVariations = [
            query,
            `${query} shopping`,
            `${query} store`,
            `${query} mall`
          ];
          break;
        case 'cafes':
          queryVariations = [
            query,
            `${query} cafe`,
            `${query} coffee`,
            `${query} coffee shop`
          ];
          break;
      }
    }

    // Convert category to Google Places API type
    let placeType: string | undefined;
    if (category) {
      switch (category) {
        case 'restaurants':
          placeType = 'restaurant';
          break;
        case 'hotels':
          placeType = 'lodging';
          break;
        case 'attractions':
          placeType = 'tourist_attraction';
          break;
        case 'shopping':
          placeType = 'shopping_mall';
          break;
        case 'cafes':
          placeType = 'cafe';
          break;
      }
    }

    // Perform searches with different query variations using modern API
    const variationPromises = queryVariations.slice(1).map(async variation => {
      try {
        const textResults = await ModernPlacesAPI.getInstance().textSearch(variation, location, 16093, placeType);
        console.log(`Variation search "${variation}":`, textResults.length, 'found');
        addUniqueResults(textResults);
      } catch (error) {
        console.warn(`Variation search "${variation}" failed:`, error);
      }
    });

    // Strategy: Search with broader categories using modern API (only if no specific category is requested)
    const broaderCategories = category ? [] : ['establishment', 'point_of_interest'];
    const categoryPromises = broaderCategories.map(async cat => {
      try {
        if (!location) return;
        const nearbyResults = await ModernPlacesAPI.getInstance().nearbySearch(location, 16093, cat);
        console.log(`Category search "${cat}":`, nearbyResults.length, 'found');
        addUniqueResults(nearbyResults);
      } catch (error) {
        console.warn(`Category search "${cat}" failed:`, error);
      }
    });

    // Execute all additional searches
    await Promise.all([...variationPromises, ...categoryPromises]);

    // Combine and return results
    const allResults = [...baseResults, ...additionalResults];
    const finalResults = allResults.slice(0, config.app.maxSearchResults);
    
    console.log('Extended search results:', finalResults.length, 'found');
    return finalResults;

  } catch (error) {
    console.error('Error in extended search:', error);
    // Fallback to regular search
    return searchLocations(query, category, location);
  }
};

// Autocomplete search for better suggestions using modern Google Maps JavaScript API
export const getAutocompleteSuggestions = async (input: string): Promise<GeocodingResult[]> => {
  try {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      console.error('Google Maps API not loaded');
      return [];
    }

    // Create autocomplete service
    const autocompleteService = new google.maps.places.AutocompleteService();
    
    return new Promise((resolve) => {
      autocompleteService.getPlacePredictions({
        input: input,
        types: ['establishment'],
        sessionToken: new google.maps.places.AutocompleteSessionToken(),
      }, async (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          // Get place details for each prediction using the modern API
          const results: GeocodingResult[] = [];
          
          for (const prediction of predictions.slice(0, 5)) {
            try {
                             const findResults = await ModernPlacesAPI.getInstance().findPlaceFromQuery(prediction.description || '');
               if (findResults.length > 0) {
                 results.push(findResults[0]);
               }
            } catch (error) {
              console.warn('Error getting place details for prediction:', error);
            }
          }
          
          resolve(results);
        } else {
          console.error('Autocomplete API error:', status);
          resolve([]);
        }
      });
    });
  } catch (error) {
    console.error('Error getting autocomplete suggestions:', error);
    return [];
  }
};

// Search by category only using modern API
export const searchByCategory = async (category: string, location?: { lat: number; lng: number }): Promise<GeocodingResult[]> => {
  try {
    // Convert category to Google Places API type
    let placeType: string;
    switch (category) {
      case 'restaurants':
        placeType = 'restaurant';
        break;
      case 'hotels':
        placeType = 'lodging';
        break;
      case 'attractions':
        placeType = 'tourist_attraction';
        break;
      case 'shopping':
        placeType = 'shopping_mall';
        break;
      case 'cafes':
        placeType = 'cafe';
        break;
      default:
        placeType = 'establishment';
    }

    const allResults: GeocodingResult[] = [];
    const seenPlaceIds = new Set<string>();

    // Helper function to add unique results with type filtering
    const addUniqueResults = (places: GeocodingResult[]) => {
      places.forEach(place => {
        if (place.place_id && !seenPlaceIds.has(place.place_id)) {
          // Filter by type if a specific category is requested
          if (place.types && place.types.length > 0) {
            const isCorrectType = place.types.some(type => {
              switch (placeType) {
                case 'restaurant':
                  return type === 'restaurant' || type === 'food' || type === 'meal_takeaway' || type === 'meal_delivery';
                case 'lodging':
                  return type === 'lodging' || type === 'hotel';
                case 'tourist_attraction':
                  return type === 'tourist_attraction' || type === 'point_of_interest';
                case 'shopping_mall':
                  return type === 'shopping_mall' || type === 'store' || type === 'shopping';
                case 'cafe':
                  return type === 'cafe' || type === 'food';
                default:
                  return true;
              }
            });
            
            if (!isCorrectType) {
              console.log(`Category search filtering out ${place.name} (types: ${place.types.join(', ')}) - not matching requested type: ${placeType}`);
              return;
            }
          }
          
          seenPlaceIds.add(place.place_id);
          allResults.push({
            place_id: place.place_id,
            name: place.name || 'Unknown',
            formatted_address: place.formatted_address || 'No address available',
            geometry: {
              location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              }
            },
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            types: place.types || [],
            photos: place.photos || []
          });
        }
      });
    };

    // Strategy 1: Text Search using modern API
    try {
      const textResults = await ModernPlacesAPI.getInstance().textSearch(category, location, 50000, placeType);
      console.log('Category text search results:', textResults.length, 'found');
      addUniqueResults(textResults);
    } catch (error) {
      console.warn('Category text search failed:', error);
    }

    // Strategy 2: Nearby Search using modern API
    if (location) {
      try {
        const nearbyResults = await ModernPlacesAPI.getInstance().nearbySearch(location, 50000, placeType);
        console.log('Category nearby search results:', nearbyResults.length, 'found');
        addUniqueResults(nearbyResults);
      } catch (error) {
        console.warn('Category nearby search failed:', error);
      }
    }

    return allResults.slice(0, config.app.maxSearchResults);

  } catch (error) {
    console.error('Error searching by category:', error);
    return [];
  }
};

// Google Geocoding API - Convert address to coordinates using JavaScript API
export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  try {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
      console.error('Google Maps API not loaded');
      return null;
    }

    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve) => {
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const result = results[0];
          resolve({
            place_id: result.place_id || '',
            formatted_address: result.formatted_address || '',
            geometry: {
              location: {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng(),
              },
            },
            name: result.formatted_address || '',
            types: result.types || [],
          });
        } else {
          console.error('Geocoding error:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

// Google Places API - Get nearby places with category filtering using modern API
export const getNearbyPlaces = async (
  latitude: number, 
  longitude: number, 
  radius: number = 1000,
  category?: string
): Promise<GeocodingResult[]> => {
  try {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      console.error('Google Maps API not loaded');
      return [];
    }

    // Convert category to Google Places API type
    let placeType: string | undefined;
    if (category) {
      switch (category) {
        case 'restaurants':
          placeType = 'restaurant';
          break;
        case 'hotels':
          placeType = 'lodging';
          break;
        case 'attractions':
          placeType = 'tourist_attraction';
          break;
        case 'shopping':
          placeType = 'shopping_mall';
          break;
        case 'cafes':
          placeType = 'cafe';
          break;
      }
    }

    const nearbyResults = await ModernPlacesAPI.getInstance().nearbySearch({ lat: latitude, lng: longitude }, radius, placeType);
    
    const convertedResults: GeocodingResult[] = nearbyResults
      .slice(0, config.app.maxSearchResults);
    
    return convertedResults;
  } catch (error) {
    console.error('Error getting nearby places:', error);
    return [];
  }
};

// Google Directions API - Get directions between two points using JavaScript API
export const getDirections = async (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
) => {
  try {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
      console.error('Google Maps API not loaded');
      return null;
    }

    const directionsService = new google.maps.DirectionsService();
    
    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(startLat, startLng),
      destination: new google.maps.LatLng(endLat, endLng),
      travelMode: google.maps.TravelMode[mode.toUpperCase() as keyof typeof google.maps.TravelMode],
    };
    
    return new Promise((resolve) => {
      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          resolve(result.routes[0] || null);
        } else {
          console.error('Directions API error:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error getting directions:', error);
    return null;
  }
};

// Convert Google Places result to our Location interface
export const convertToLocation = (result: GeocodingResult) => {
  // Determine location type based on Google Places types
  let type: 'restaurant' | 'hotel' | 'attraction' | 'business' | 'other' = 'other';
  const types = result.types || [];
  
  if (types.includes('restaurant') || types.includes('food')) {
    type = 'restaurant';
  } else if (types.includes('lodging') || types.includes('hotel')) {
    type = 'hotel';
  } else if (types.includes('tourist_attraction') || types.includes('point_of_interest')) {
    type = 'attraction';
  } else if (types.includes('establishment') || types.includes('store')) {
    type = 'business';
  }
  
  // Debug: Log photo information
  if (result.photos && result.photos.length > 0) {
    console.log(`Converting location ${result.name} with ${result.photos.length} photos`);
  }
  
  return {
    id: result.place_id,
    place_id: result.place_id,
    name: result.name || 'Unknown Location',
    address: result.formatted_address,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    type,
    rating: result.rating,
    user_ratings_total: result.user_ratings_total,
    description: result.formatted_address,
    photos: result.photos,
  };
};

// Enhanced mock data with more variety and category-specific locations
export const getMockLocations = () => {
  return [
    // Attractions
    {
      id: '1',
      name: 'Central Park',
      address: 'Central Park, New York, NY',
      latitude: 40.7829,
      longitude: -73.9654,
      type: 'attraction' as const,
      rating: 4.8,
      user_ratings_total: 15420,
      description: 'Famous urban park in Manhattan',
      photos: [
        { photo_reference: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop' },
        { photo_reference: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop' },
        { photo_reference: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop' },
        { photo_reference: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop' },
        { photo_reference: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop' },
        { photo_reference: 'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=400&h=300&fit=crop' }
      ]
    },
    {
      id: '2',
      name: 'Times Square',
      address: 'Times Square, New York, NY',
      latitude: 40.7580,
      longitude: -73.9855,
      type: 'attraction' as const,
      rating: 4.5,
      user_ratings_total: 8920,
      description: 'Major commercial intersection and tourist destination'
    },
    {
      id: '3',
      name: 'Empire State Building',
      address: '350 5th Ave, New York, NY',
      latitude: 40.7484,
      longitude: -73.9857,
      type: 'attraction' as const,
      rating: 4.6,
      description: 'Iconic skyscraper and observation deck',
      photos: [
        { photo_reference: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop' },
        { photo_reference: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop' },
        { photo_reference: 'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=400&h=300&fit=crop' },
        { photo_reference: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop' }
      ]
    },
    {
      id: '4',
      name: 'Statue of Liberty',
      address: 'Liberty Island, New York, NY',
      latitude: 40.6892,
      longitude: -74.0445,
      type: 'attraction' as const,
      rating: 4.7,
      description: 'Famous statue and national monument'
    },
    {
      id: '7',
      name: 'Brooklyn Bridge',
      address: 'Brooklyn Bridge, New York, NY',
      latitude: 40.7061,
      longitude: -73.9969,
      type: 'attraction' as const,
      rating: 4.6,
      description: 'Iconic suspension bridge connecting Manhattan and Brooklyn'
    },
    {
      id: '8',
      name: 'Metropolitan Museum of Art',
      address: '1000 5th Ave, New York, NY',
      latitude: 40.7794,
      longitude: -73.9632,
      type: 'attraction' as const,
      rating: 4.7,
      description: 'World-famous art museum'
    },
    // Restaurants
    {
      id: '5',
      name: 'Katz\'s Delicatessen',
      address: '205 E Houston St, New York, NY',
      latitude: 40.7223,
      longitude: -73.9874,
      type: 'restaurant' as const,
      rating: 4.4,
      user_ratings_total: 3240,
      description: 'Famous Jewish deli known for pastrami sandwiches',
      photos: [
        { photo_reference: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop' }
      ]
    },
    {
      id: '9',
      name: 'Joe\'s Pizza',
      address: '123 Carmine St, New York, NY',
      latitude: 40.7308,
      longitude: -74.0027,
      type: 'restaurant' as const,
      rating: 4.3,
      description: 'Classic New York pizza joint'
    },
    {
      id: '10',
      name: 'Shake Shack',
      address: 'Madison Square Park, New York, NY',
      latitude: 40.7414,
      longitude: -73.9880,
      type: 'restaurant' as const,
      rating: 4.2,
      description: 'Popular burger and shake restaurant'
    },
    // Hotels
    {
      id: '6',
      name: 'The Plaza Hotel',
      address: '768 5th Ave, New York, NY',
      latitude: 40.7645,
      longitude: -73.9740,
      type: 'hotel' as const,
      rating: 4.3,
      description: 'Luxury hotel and National Historic Landmark'
    },
    {
      id: '11',
      name: 'The Waldorf Astoria',
      address: '301 Park Ave, New York, NY',
      latitude: 40.7561,
      longitude: -73.9765,
      type: 'hotel' as const,
      rating: 4.5,
      description: 'Historic luxury hotel'
    },
    {
      id: '12',
      name: 'The Standard High Line',
      address: '848 Washington St, New York, NY',
      latitude: 40.7415,
      longitude: -74.0080,
      type: 'hotel' as const,
      rating: 4.1,
      description: 'Modern hotel with rooftop bar'
    },
    // Shopping
    {
      id: '13',
      name: 'Macy\'s Herald Square',
      address: '151 W 34th St, New York, NY',
      latitude: 40.7505,
      longitude: -73.9934,
      type: 'business' as const,
      rating: 4.0,
      description: 'Famous department store'
    },
    {
      id: '14',
      name: 'Saks Fifth Avenue',
      address: '611 5th Ave, New York, NY',
      latitude: 40.7589,
      longitude: -73.9787,
      type: 'business' as const,
      rating: 4.2,
      description: 'Luxury department store'
    },
    // Cafes
    {
      id: '15',
      name: 'Starbucks Reserve',
      address: '61 9th Ave, New York, NY',
      latitude: 40.7415,
      longitude: -74.0080,
      type: 'business' as const,
      rating: 4.1,
      description: 'Premium coffee experience'
    },
    {
      id: '16',
      name: 'Blue Bottle Coffee',
      address: '450 W 15th St, New York, NY',
      latitude: 40.7415,
      longitude: -74.0080,
      type: 'business' as const,
      rating: 4.3,
      description: 'Artisanal coffee shop'
    }
  ];
}; 

// Distance and popularity search using modern API with custom ranking
export const searchLocationsByDistanceAndPopularity = async (
  category: string,
  location: { lat: number; lng: number },
  maxResults: number = config.app.maxSearchResults,
  bounds?: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }
): Promise<GeocodingResult[]> => {
  try {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      console.error('Google Maps API not loaded');
      throw new Error('Google Maps API not available');
    }

    const allResults: GeocodingResult[] = [];
    const seenPlaceIds = new Set<string>();

    // Helper function to check if a location is within bounds
    const isWithinBounds = (lat: number, lng: number): boolean => {
      if (!bounds) return true; // If no bounds provided, accept all results
      return lat >= bounds.sw.lat && lat <= bounds.ne.lat && 
             lng >= bounds.sw.lng && lng <= bounds.ne.lng;
    };

    // Helper function to add unique results
    const addUniqueResults = (places: GeocodingResult[]) => {
      places.forEach(place => {
        if (place.place_id && !seenPlaceIds.has(place.place_id)) {
          // Filter by type if a specific category is requested
          let placeType: string | undefined;
          switch (category) {
            case 'restaurants':
            case 'restaurant':
              placeType = 'restaurant';
              break;
            case 'hotels':
            case 'lodging':
              placeType = 'lodging';
              break;
            case 'attractions':
            case 'tourist_attraction':
              placeType = 'tourist_attraction';
              break;
            case 'shopping':
            case 'shopping_mall':
            case 'store':
              placeType = 'shopping_mall';
              break;
            case 'cafes':
            case 'cafe':
              placeType = 'cafe';
              break;
            case 'establishment':
              // For generic establishment searches, accept all establishment types
              placeType = 'establishment';
              break;
          }
          
          if (placeType && place.types && place.types.length > 0) {
            const isCorrectType = place.types.some(type => {
              switch (placeType) {
                case 'restaurant':
                  return type === 'restaurant' || type === 'food' || type === 'meal_takeaway' || type === 'meal_delivery';
                case 'lodging':
                  return type === 'lodging' || type === 'hotel';
                case 'tourist_attraction':
                  return type === 'tourist_attraction' || type === 'point_of_interest';
                case 'shopping_mall':
                  return type === 'shopping_mall' || type === 'store' || type === 'shopping';
                case 'cafe':
                  return type === 'cafe' || type === 'food';
                case 'establishment':
                  // For establishment searches, accept any business establishment type
                  return type === 'establishment' || type === 'point_of_interest' || 
                         type === 'store' || type === 'restaurant' || type === 'lodging' || 
                         type === 'tourist_attraction' || type === 'cafe' || type === 'food';
                default:
                  return true;
              }
            });
            
            if (!isCorrectType) {
              console.log(`Distance search filtering out ${place.name} (types: ${place.types.join(', ')}) - not matching requested type: ${placeType}`);
              return;
            }
          }
          
          // Filter by bounds - only include results within the map viewport
          if (!isWithinBounds(place.geometry.location.lat, place.geometry.location.lng)) {
            console.log(`Distance search filtering out ${place.name} - outside map bounds`);
            return;
          }
          
          seenPlaceIds.add(place.place_id);
          
          // Debug: Log photo information
          if (place.photos && place.photos.length > 0) {
            console.log(`Photos found for ${place.name}:`, place.photos.length, 'photos');
          }
          
          allResults.push({
            place_id: place.place_id,
            name: place.name || 'Unknown',
            formatted_address: place.formatted_address || 'No address available',
            geometry: {
              location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              }
            },
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            types: place.types || [],
            photos: place.photos || []
          });
        }
      });
    };

    // Calculate distance between two points using Haversine formula
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Calculate score based on distance only
    const calculateScore = (place: GeocodingResult): number => {
      const distance = calculateDistance(
        location.lat, location.lng,
        place.geometry.location.lat, place.geometry.location.lng
      );
      
      // Normalize distance score (closer = higher score)
      const normalizedDistance = Math.max(0, 1 - (distance / 50));
      
      // Return only distance-based score (no popularity consideration)
      return normalizedDistance;
    };

    // Calculate search radius based on bounds if available, otherwise use a reasonable default
    const calculateSearchRadius = (): number => {
      if (!bounds) {
        return 50000; // Default 50km radius if no bounds
      }
      
      // Calculate the diagonal distance of the bounds to ensure we cover the entire viewport
      const diagonalDistance = calculateDistance(
        bounds.sw.lat, bounds.sw.lng,
        bounds.ne.lat, bounds.ne.lng
      );
      
      // Add some buffer (20% extra) to ensure we get enough results
      const radiusWithBuffer = diagonalDistance * 0.5 * 1.2 * 1000; // Convert to meters
      
      // Cap at reasonable maximum (20km) to avoid too broad searches
      return Math.min(radiusWithBuffer, 20000);
    };

    const searchRadius = calculateSearchRadius();
    console.log(`Using search radius: ${searchRadius}m (${(searchRadius/1000).toFixed(1)}km)`);

    // Perform multiple searches with different strategies to get more results using modern API
    const performSearches = async (): Promise<void> => {
      const searches: Promise<void>[] = [];

      // Convert category to Google Places API type
      let placeType: string | undefined;
      switch (category) {
        case 'restaurants':
        case 'restaurant':
          placeType = 'restaurant';
          break;
        case 'hotels':
        case 'lodging':
          placeType = 'lodging';
          break;
        case 'attractions':
        case 'tourist_attraction':
          placeType = 'tourist_attraction';
          break;
        case 'shopping':
        case 'shopping_mall':
        case 'store':
          placeType = 'shopping_mall';
          break;
        case 'cafes':
        case 'cafe':
          placeType = 'cafe';
          break;
        case 'establishment':
          placeType = 'establishment';
          break;
      }

      // Strategy 1: Text search for popular places using modern API
      searches.push((async () => {
        try {
          const textResults = await ModernPlacesAPI.getInstance().textSearch(category, location, searchRadius, placeType);
          console.log(`Text search found ${textResults.length} results for ${category}`);
          addUniqueResults(textResults);
        } catch (error) {
          console.warn(`Text search failed for ${category}:`, error);
        }
      })());

      // Strategy 2: Nearby search with prominence ranking using modern API
      searches.push((async () => {
        try {
          const nearbyResults = await ModernPlacesAPI.getInstance().nearbySearch(location, searchRadius, placeType);
          console.log(`Nearby search found ${nearbyResults.length} results for ${category}`);
          addUniqueResults(nearbyResults);
        } catch (error) {
          console.warn(`Nearby search failed for ${category}:`, error);
        }
      })());

      // Strategy 3: Find place from query using modern API
      searches.push((async () => {
        try {
          const findResults = await ModernPlacesAPI.getInstance().findPlaceFromQuery(category, location, searchRadius);
          console.log(`Find place search found ${findResults.length} results for ${category}`);
          addUniqueResults(findResults);
        } catch (error) {
          console.warn(`Find place search failed for ${category}:`, error);
        }
      })());

      // Strategy 4: Additional text searches with variations to get more results
      const queryVariations = [
        category,
        `${category} near me`,
        `best ${category}`,
        `popular ${category}`,
        `top ${category}`
      ];

      queryVariations.forEach((query, index) => {
        if (index > 0) { // Skip the first one as it's already covered by Strategy 1
          searches.push((async () => {
            try {
              const variationResults = await ModernPlacesAPI.getInstance().textSearch(query, location, searchRadius, placeType);
              console.log(`Text search variation "${query}" found ${variationResults.length} results`);
              addUniqueResults(variationResults);
            } catch (error) {
              console.warn(`Text search variation "${query}" failed:`, error);
            }
          })());
        }
      });

      await Promise.all(searches);
    };

    // Execute all search strategies
    await performSearches();

    // Sort results by distance only (closer places first)
    allResults.sort((a, b) => {
      const scoreA = calculateScore(a);
      const scoreB = calculateScore(b);
      return scoreB - scoreA; // Higher score first (closer places have higher scores)
    });

    // Limit results to maxSearchResults
    const limitedResults = allResults.slice(0, maxResults);
    
    console.log(`Distance-only search completed: ${limitedResults.length} results for ${category} within map bounds`);
    return limitedResults;

  } catch (error) {
    console.error('Error in distance and popularity search:', error);
    throw error;
  }
};

// Keep the old function for backward compatibility
export const searchLocationsByDistanceOnly = async (
  category: string,
  location: { lat: number; lng: number },
  maxResults: number = config.app.maxSearchResults,
  bounds?: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }
): Promise<GeocodingResult[]> => {
  return searchLocationsByDistanceAndPopularity(category, location, maxResults, bounds);
};

// Get detailed place information with multiple photos when a location is selected
export const getDetailedPlaceInfo = async (placeId: string): Promise<GeocodingResult | null> => {
  try {
    console.log('Getting detailed place info for:', placeId);
    const placesAPI = ModernPlacesAPI.getInstance();
    const detailedPlace = await placesAPI.getPlaceDetails(placeId);
    
    if (detailedPlace && detailedPlace.photos && detailedPlace.photos.length > 0) {
      // Get additional photos using getPlaceWithMultiplePhotos
      const placeWithMultiplePhotos = await placesAPI.getPlaceWithMultiplePhotos(placeId);
      if (placeWithMultiplePhotos && placeWithMultiplePhotos.photos) {
        detailedPlace.photos = placeWithMultiplePhotos.photos.slice(0, 10); // Limit to 10 photos
      }
    }
    
    console.log('Detailed place info retrieved successfully');
    return detailedPlace;
  } catch (error) {
    console.error('Error getting detailed place info:', error);
    return null;
  }
}; 