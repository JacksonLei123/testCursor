export interface Location {
  id: string;
  place_id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'restaurant' | 'hotel' | 'attraction' | 'business' | 'other';
  rating?: number;
  user_ratings_total?: number;
  phone?: string;
  website?: string;
  description?: string;
  photos?: Array<{
    photo_reference: string;
  }>;
}

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
} 