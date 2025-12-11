import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { TravelPlace } from '../types/TravelPlace';
import { CoinSystem } from '../utils/coinSystem';
import CoinCounter from './CoinCounter';
import { ReviewService } from '../services/firebaseService';
import { useLiff, getUserStorageKey } from '../hooks/useLiff';
import { generateItinerary, type AIItinerary, type DayItinerary, type Activity } from '../services/geminiService';
import { FaMapMarkerAlt, FaRoute, FaCamera, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaTimes, FaStar, FaMapMarkedAlt, FaImage, FaChevronRight, FaRobot, FaClock, FaLightbulb, FaWallet, FaGripVertical, FaUtensils, FaCoffee, FaStore, FaShoppingBag } from 'react-icons/fa';
import { MdDirectionsBike, MdDirectionsCar, MdDirectionsWalk, MdMyLocation } from 'react-icons/md';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;

// Custom Icons
const createCustomIcon = (color: string) => new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

const defaultIcon = createCustomIcon('#dd6e53'); // Orange
const visitedIcon = createCustomIcon('#10B981'); // Green
const currentIcon = createCustomIcon('#3B82F6'); // Blue

interface RoutingPageProps {
  personality?: string;
  duration?: string;
  selectedPlaces?: TravelPlace[];
}

interface JourneyPlace {
  id: string;
  visited?: boolean;
  photos?: string[];
  rating?: number;
  review?: string;
}

interface Journey {
  personality: string;
  duration: string;
  places: JourneyPlace[];
}

interface Review {
  id?: string;
  userId: string;
  placeId: string;
  text: string;
  photoUrl: string;
  timestamp: any;
  userName: string;
  userPhoto: string;
}

const RoutingPage: React.FC = () => {
  const location = useLocation();
  const { userId, displayName, pictureUrl } = useLiff();
  const { personality, duration, selectedPlaces } = (location.state as RoutingPageProps) || {};
  const [optimizedRoute, setOptimizedRoute] = useState<TravelPlace[]>([]);
  const [, setCurrentJourney] = useState<Journey | null>(null);
  const [visitedPlaces, setVisitedPlaces] = useState<Set<string>>(new Set());
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  // Emergency routing state
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyPlace, setEmergencyPlace] = useState<TravelPlace | null>(null);
  const [alternativePlaces, setAlternativePlaces] = useState<TravelPlace[]>([]);
  // Photo gallery state
  const [placePhotos, setPlacePhotos] = useState<{ [placeId: string]: string[] }>({});
  const [isUploading, setIsUploading] = useState(false);
  // Review state
  const [placeRatings, setPlaceRatings] = useState<{ [placeId: string]: number }>({});
  const [placeReviews, setPlaceReviews] = useState<{ [placeId: string]: Review[] }>({});
  const [reviewText, setReviewText] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  // Full screen place detail view
  const [showPlaceDetail, setShowPlaceDetail] = useState(false);
  // AI Itinerary state
  const [aiItinerary, setAiItinerary] = useState<AIItinerary | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAISection, setShowAISection] = useState(false);
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragItemRef = React.useRef<number | null>(null);
  const dragOverItemRef = React.useRef<number | null>(null);

  // Helper functions (declared early to avoid dependency ordering issues)
  function shuffleArray(array: TravelPlace[]): TravelPlace[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const calculateDistance = React.useCallback((place1: TravelPlace, place2: TravelPlace): number => {
    const R = 6371;
    const dLat = (place2.lat - place1.lat) * Math.PI / 180;
    const dLon = (place2.long - place1.long) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(place1.lat * Math.PI / 180) * Math.cos(place2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const optimizeRouteOrder = React.useCallback((places: TravelPlace[]): TravelPlace[] => {
    if (places.length <= 1) return places;
    const unvisited = [...places];
    const ordered: TravelPlace[] = [];
    let currentPlace = unvisited.shift()!;
    ordered.push(currentPlace);
    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let shortestDistance = calculateDistance(currentPlace, unvisited[0]);
      for (let i = 1; i < unvisited.length; i++) {
        const distance = calculateDistance(currentPlace, unvisited[i]);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestIndex = i;
        }
      }
      currentPlace = unvisited.splice(nearestIndex, 1)[0];
      ordered.push(currentPlace);
    }
    return ordered;
  }, [calculateDistance]);

  const optimizeRoute = React.useCallback((places: TravelPlace[], personality?: string, duration?: string): TravelPlace[] => {
    if (places.length === 0) return [];
    let filteredPlaces = [...places];
    if (personality === 'introvert mode') {
      const introvertKeywords = ['temple', 'nature', 'park', 'sanctuary'];
      filteredPlaces.sort((a, b) => {
        const aScore = introvertKeywords.some(keyword =>
          a.name.toLowerCase().includes(keyword) || (a.description?.toLowerCase().includes(keyword) ?? false)
        ) ? 1 : 0;
        const bScore = introvertKeywords.some(keyword =>
          b.name.toLowerCase().includes(keyword) || (b.description?.toLowerCase().includes(keyword) ?? false)
        ) ? 1 : 0;
        return bScore - aScore;
      });
    } else {
      filteredPlaces.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    let maxPlaces = filteredPlaces.length;
    if (duration === '1 วัน ไม่ค้างคืน') {
      maxPlaces = 3;
    } else if (duration === '2 วัน 1 คืน') {
      maxPlaces = 6;
    }
    if (filteredPlaces.length > maxPlaces) {
      const topCandidates = filteredPlaces.slice(0, Math.min(maxPlaces * 2, filteredPlaces.length));
      filteredPlaces = shuffleArray(topCandidates).slice(0, maxPlaces);
    }
    if (filteredPlaces.length > 1) {
      filteredPlaces = optimizeRouteOrder(filteredPlaces);
    }
    return filteredPlaces;
  }, [optimizeRouteOrder]);

  // Trigger an emergency scenario (e.g., flood at next unvisited place) and suggest alternatives
  const triggerEmergencyPlan = () => {
    if (!optimizedRoute || optimizedRoute.length === 0) return;

    // Find next unvisited place (or fallback to first)
    const nextUnvisited = optimizedRoute.find(p => !visitedPlaces.has(p.id)) || optimizedRoute[0];
    setEmergencyPlace(nextUnvisited);

    // Gather candidate alternatives from likedPlaces (excluding the emergency place & already in optimizedRoute)
    try {
      const storageKey = getUserStorageKey('likedPlaces');
      const saved = localStorage.getItem(storageKey);
      const liked: TravelPlace[] = saved ? JSON.parse(saved) : [];
      const routeIds = new Set(optimizedRoute.map(p => p.id));
      let candidates = liked.filter(p => p.id !== nextUnvisited.id && !routeIds.has(p.id));
      // Fallback: allow other places in route (not the emergency place) if no external candidates
      if (candidates.length === 0) {
        candidates = optimizedRoute.filter(p => p.id !== nextUnvisited.id && !visitedPlaces.has(p.id));
      }
      // Shuffle and take up to 5
      const shuffled = [...candidates];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setAlternativePlaces(shuffled.slice(0, 5));
  } catch {
      setAlternativePlaces([]);
    }

    setShowEmergencyModal(true);
  };

  // Replace the emergency place in current route with selected alternative
  const handleSelectAlternative = (alt: TravelPlace) => {
    if (!emergencyPlace) return;
    const index = optimizedRoute.findIndex(p => p.id === emergencyPlace.id);
    if (index === -1) return;
    const newRoute = [...optimizedRoute];
    newRoute[index] = alt;
    setOptimizedRoute(newRoute);
    // Maintain visited set (alt will be unvisited)
    setShowEmergencyModal(false);
    setEmergencyPlace(null);
    setAlternativePlaces([]);
    // Update journey persistence
    // Note: CoinSystem might need update to handle this specific case, 
    // but for now we just update local state
  };

  const handlePhotoUpload = (placeId: string, photos: string[]) => {
    // Mark as visited locally
    const newVisited = new Set(visitedPlaces);
    newVisited.add(placeId);
    setVisitedPlaces(newVisited);
    
    // Update placePhotos
    setPlacePhotos(prev => ({
      ...prev,
      [placeId]: [...(prev[placeId] || []), ...photos]
    }));
    
    // Dispatch event to update coin counter
    // The actual coin addition is handled in PhotoUpload component via Firebase
    // But we can trigger a UI update if needed
    window.dispatchEvent(new CustomEvent('coinUpdate', { 
      detail: { earned: 50 } 
    }));
  };

  // Open Google Maps with directions
  const openGoogleMaps = (place: TravelPlace) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.long}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Open Google Maps for all route
  const openFullRouteInMaps = () => {
    if (optimizedRoute.length === 0) return;
    
    const origin = optimizedRoute[0];
    const destination = optimizedRoute[optimizedRoute.length - 1];
    const waypoints = optimizedRoute.slice(1, -1).map(p => `${p.lat},${p.long}`).join('|');
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.long}&destination=${destination.lat},${destination.long}&travelmode=driving`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    window.open(url, '_blank');
  };

  // Handle photo upload from file input
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, placeId: string) => {
    const files = event.target.files;
    if (!files || !userId) return;

    const currentPhotos = placePhotos[placeId] || [];
    const remainingSlots = 5 - currentPhotos.length;
    if (remainingSlots <= 0) {
      alert('Maximum 5 photos per place!');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);

    try {
      const uploadPromises = filesToProcess.map(async (file) => {
        const place = optimizedRoute.find(p => p.id === placeId);
        const photoUrl = await ReviewService.addReview(
          userId,
          placeId,
          `Visited ${place?.name || 'this place'}`,
          file,
          displayName || 'Anonymous',
          pictureUrl || ''
        );
        return photoUrl;
      });

      const newPhotoUrls = await Promise.all(uploadPromises);
      handlePhotoUpload(placeId, newPhotoUrls);
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Submit review
  const submitReview = async (placeId: string) => {
    if (!userId || selectedRating === 0) {
      alert('Please select a rating!');
      return;
    }

    setPlaceRatings(prev => ({
      ...prev,
      [placeId]: selectedRating
    }));

    // Mark as visited
    const newVisited = new Set(visitedPlaces);
    newVisited.add(placeId);
    setVisitedPlaces(newVisited);

    setShowReviewModal(false);
    setSelectedRating(0);
    setReviewText('');

    // Award coins for review
    window.dispatchEvent(new CustomEvent('coinUpdate', { 
      detail: { earned: 30 } 
    }));
  };

  // Load reviews for a place
  const loadPlaceReviews = async (placeId: string) => {
    try {
      const reviews = await ReviewService.getReviewsForPlace(placeId);
      setPlaceReviews(prev => ({
        ...prev,
        [placeId]: reviews
      }));
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    dragOverItemRef.current = index;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragItemRef.current !== null && dragOverItemRef.current !== null && dragItemRef.current !== dragOverItemRef.current) {
      const newRoute = [...optimizedRoute];
      const draggedItem = newRoute[dragItemRef.current];
      newRoute.splice(dragItemRef.current, 1);
      newRoute.splice(dragOverItemRef.current, 0, draggedItem);
      setOptimizedRoute(newRoute);
      
      // Update AI itinerary if it exists
      if (aiItinerary) {
        updateAIItineraryOrder(newRoute);
      }
    }
    dragItemRef.current = null;
    dragOverItemRef.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Touch drag handlers for mobile
  const touchStartY = React.useRef<number>(0);
  const touchCurrentIndex = React.useRef<number | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentIndex.current = index;
    dragItemRef.current = index;
    setDraggedIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchCurrentIndex.current === null) return;
    
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const dragItem = elements.find(el => el.getAttribute('data-drag-index') !== null);
    
    if (dragItem) {
      const overIndex = parseInt(dragItem.getAttribute('data-drag-index') || '0', 10);
      if (overIndex !== dragOverIndex) {
        dragOverItemRef.current = overIndex;
        setDragOverIndex(overIndex);
      }
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
    touchCurrentIndex.current = null;
  };

  // Update AI itinerary order to match new route order
  const updateAIItineraryOrder = (newRoute: TravelPlace[]) => {
    if (!aiItinerary) return;
    
    const placeIdToNewIndex = new Map<string, number>();
    newRoute.forEach((place, index) => {
      placeIdToNewIndex.set(place.id, index);
    });
    
    const updatedDays = aiItinerary.days.map(day => {
      const sortedActivities = [...day.activities].sort((a, b) => {
        const indexA = placeIdToNewIndex.get(a.placeId) ?? 999;
        const indexB = placeIdToNewIndex.get(b.placeId) ?? 999;
        return indexA - indexB;
      });
      return { ...day, activities: sortedActivities };
    });
    
    setAiItinerary({ ...aiItinerary, days: updatedDays });
  };

  // Generate AI Itinerary
  const handleGenerateAIItinerary = async () => {
    if (optimizedRoute.length === 0) return;
    
    setIsGeneratingAI(true);
    setShowAISection(true);
    
    try {
      const itinerary = await generateItinerary(
        optimizedRoute,
        personality || 'introvert mode',
        duration || '1 วัน ไม่ค้างคืน'
      );
      setAiItinerary(itinerary);
      setSelectedDay(1);
    } catch (error) {
      console.error('Error generating AI itinerary:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    // If places are passed from selection, use them directly
    if (selectedPlaces && selectedPlaces.length > 0) {
      const optimized = optimizeRouteOrder(selectedPlaces);
      setOptimizedRoute(optimized);
      
      // Initialize journey
      const newJourney: Journey = {
        personality: personality || 'custom',
        duration: duration || 'custom',
        places: optimized.map(p => ({ id: p.id, visited: false }))
      };
      setCurrentJourney(newJourney);
      
      // Save to localStorage
      const storageKey = getUserStorageKey('currentJourney');
      localStorage.setItem(storageKey, JSON.stringify(newJourney));
      return;
    }

    // Fallback to loading from localStorage if no state passed (e.g. refresh)
    const storageKey = getUserStorageKey('likedPlaces');
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const places = JSON.parse(saved);
      const optimized = optimizeRoute(places, personality, duration);
      setOptimizedRoute(optimized);
    }
  }, [personality, duration, selectedPlaces, optimizeRoute, optimizeRouteOrder]);

  const isPlaceVisited = (placeId: string) => {
    return visitedPlaces.has(placeId);
  };

  // optimizeRoute & helpers now declared earlier

  const regenerateRoute = () => {
    const saved = localStorage.getItem('likedPlaces');
    if (saved) {
      const places = JSON.parse(saved);
      const newRoute = optimizeRoute(places, personality, duration);
      setOptimizedRoute(newRoute);
      
      // Reset visited places for the new route
      setVisitedPlaces(new Set());
      setSelectedPlace(null);
      
      // Create a new journey with the regenerated route
      const newJourney = CoinSystem.createNewJourney(personality || 'default', duration || 'custom', newRoute);
      setCurrentJourney(newJourney);
    }
  };

  // Star Rating Component
  const StarRating = ({ rating, onRate, size = 'md' }: { rating: number; onRate?: (r: number) => void; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate && onRate(star)}
            disabled={!onRate}
            className={`${sizeClass} transition-transform hover:scale-110 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            <FaStar />
          </button>
        ))}
      </div>
    );
  };

  // Place Detail View Component
  const PlaceDetailView = ({ place, index }: { place: TravelPlace; index: number }) => {
    const photos = placePhotos[place.id] || [];
    const rating = placeRatings[place.id] || place.rating || 0;
    const reviews = placeReviews[place.id] || [];
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      loadPlaceReviews(place.id);
    }, [place.id]);

    return (
      <div className="fixed inset-0 bg-white z-[2000] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm p-4 flex items-center justify-between z-[2001]">
          <button 
            onClick={() => {
              setShowPlaceDetail(false);
              setSelectedPlace(null);
            }}
            className="p-2 hover:bg-[#faf5f3] rounded-full"
          >
            <FaArrowLeft className="text-[#dd6e53]" />
          </button>
          <button
            onClick={() => triggerEmergencyPlan()}
            className="p-2 hover:bg-red-50 rounded-full"
          >
            <FaExclamationTriangle className="text-red-500" />
          </button>
        </div>

        {/* Place Hero Card */}
        <div className="mx-4 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-[#dd6e53] to-[#dd6e53] text-white">
          <div className="h-48 flex items-center justify-center relative">
            {place.image ? (
              <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center">
                <FaMapMarkerAlt className="text-6xl opacity-50" />
              </div>
            )}
            <div className="absolute top-4 right-4 bg-white/90 text-[#dd6e53] px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              <FaStar /> {rating.toFixed(1)}
            </div>
          </div>
          <div className="p-4 bg-white text-gray-800">
            <h1 className="text-xl font-bold">{place.name}</h1>
            <p className="text-[#dd6e53] text-sm flex items-center gap-1">
              <FaMapMarkerAlt className="text-xs" />
              {place.country || 'Chiang Mai'}
            </p>
          </div>
        </div>

        {/* Check-in Status */}
        <div className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm">
          {visitedPlaces.has(place.id) ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-green-500 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-green-800">Checked In!</h3>
                <p className="text-green-600 text-sm">You've visited this destination</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <MdMyLocation className="text-gray-400 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Ready to Check In</h3>
                <p className="text-gray-500 text-sm">Take photos to check in at this destination</p>
              </div>
            </div>
          )}
        </div>

        {/* Photo Gallery Section */}
        <div className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">Check-In Photos</h3>
            <span className="text-sm text-gray-500">{photos.length}/5</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* Add Photo Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || photos.length >= 5}
              className="aspect-square border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
              ) : (
                <>
                  <FaCamera className="text-blue-500 text-xl mb-1" />
                  <span className="text-blue-500 text-xs">Add Photo</span>
                </>
              )}
            </button>
            
            {/* Existing Photos */}
            {photos.map((photo, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            
            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, 5 - photos.length - 1) }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center">
                <FaImage className="text-gray-300 text-xl" />
              </div>
            ))}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e, place.id)}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>

        {/* Review Section */}
        <div className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">Write a Review</h3>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-gray-600 text-sm">Your Rating:</span>
            <StarRating 
              rating={placeRatings[place.id] || 0} 
              onRate={(r) => setPlaceRatings(prev => ({ ...prev, [place.id]: r }))}
            />
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience..."
            className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none"
            rows={3}
          />
          <button
            onClick={() => submitReview(place.id)}
            disabled={!placeRatings[place.id]}
            className="w-full mt-3 bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            Submit Review (+30 coins)
          </button>
        </div>

        {/* Other Reviews */}
        {reviews.length > 0 && (
          <div className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm mb-20">
            <h3 className="font-bold text-gray-800 mb-3">Reviews ({reviews.length})</h3>
            <div className="space-y-3">
              {reviews.slice(0, 3).map((review, i) => (
                <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  {review.userPhoto && (
                    <img src={review.userPhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{review.userName}</p>
                    <p className="text-gray-600 text-sm">{review.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex gap-3">
          <button
            onClick={() => openGoogleMaps(place)}
            className="flex-1 bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <FaMapMarkedAlt /> Open in Maps
          </button>
          <button
            onClick={() => triggerEmergencyPlan()}
            className="px-4 border-2 border-[#dd6e53] text-[#dd6e53] py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <FaExclamationTriangle /> Emergency
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Full Screen Place Detail */}
      {showPlaceDetail && selectedPlace && (() => {
        const place = optimizedRoute.find(p => p.id === selectedPlace);
        const index = optimizedRoute.findIndex(p => p.id === selectedPlace);
        if (!place) return null;
        return <PlaceDetailView place={place} index={index} />;
      })()}

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm p-4 sticky top-0 z-[1000] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/gallery" className="p-2 hover:bg-orange-50 rounded-full transition-colors">
            <FaArrowLeft className="text-[#dd6e53]" />
          </Link>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">Your Journey</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <FaRoute className="text-[#dd6e53]" />
              {optimizedRoute.length} stops • {personality || 'Custom Trip'}
            </p>
          </div>
        </div>
        <CoinCounter />
      </div>

      {/* Map */}
      <div className="h-[50vh] relative z-0">
        <MapContainer 
          center={[18.7883, 98.9853]} 
          zoom={13} 
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Route Line */}
          {optimizedRoute.length > 1 && (
            <Polyline 
              positions={optimizedRoute.map(p => [p.lat, p.long])}
              color="#dd6e53"
              weight={5}
              opacity={0.8}
              dashArray="15, 10"
            />
          )}

          {/* Markers with numbers */}
          {optimizedRoute.map((place, index) => {
            const numberedIcon = new L.DivIcon({
              className: 'custom-marker',
              html: `<div style="background-color: ${visitedPlaces.has(place.id) ? '#10B981' : '#dd6e53'}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">${index + 1}</div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
              popupAnchor: [0, -16]
            });
            
            return (
              <Marker
                key={place.id}
                position={[place.lat, place.long]}
                icon={numberedIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedPlace(place.id);
                    setShowPlaceDetail(true);
                  },
                }}
              >
                <Popup>
                  <div className="text-center p-1">
                    <h3 className="font-bold">{place.name}</h3>
                    <button
                      onClick={() => {
                        setSelectedPlace(place.id);
                        setShowPlaceDetail(true);
                      }}
                      className="bg-[#dd6e53] text-white text-xs px-3 py-1 rounded-full mt-2"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Route List Section */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-6 relative z-10 p-4">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
        
        {/* Section Header */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#faf5f3] rounded-xl flex items-center justify-center border border-[#dd6e53]">
              <span className="text-[#dd6e53] font-bold text-lg">ก</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Route Order</h2>
              <p className="text-xs text-gray-500">Hold & drag to reorder stops</p>
            </div>
          </div>
          
          {/* Route Items with drag-and-drop reorder */}
          <div className="space-y-2">
            {optimizedRoute.map((place, index) => (
              <div
                key={place.id}
                data-drag-index={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`flex items-center gap-2 cursor-grab active:cursor-grabbing transition-all duration-200 ${
                  draggedIndex === index ? 'opacity-50 scale-95' : ''
                } ${
                  dragOverIndex === index && draggedIndex !== index ? 'transform translate-y-2' : ''
                }`}
              >
                {/* Drag Handle */}
                <div className="flex flex-col gap-0.5 p-2 text-gray-400 hover:text-[#dd6e53] touch-none">
                  <div className="flex gap-0.5">
                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                  </div>
                  <div className="flex gap-0.5">
                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                  </div>
                  <div className="flex gap-0.5">
                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                  </div>
                </div>
                
                {/* Place card */}
                <button
                  onClick={() => {
                    if (draggedIndex === null) {
                      setSelectedPlace(place.id);
                      setShowPlaceDetail(true);
                    }
                  }}
                  className={`flex-1 flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    visitedPlaces.has(place.id) 
                      ? 'bg-green-50 border border-green-200' 
                      : dragOverIndex === index && draggedIndex !== index
                        ? 'bg-[#dd6e53]/10 border-2 border-dashed border-[#dd6e53]'
                        : 'bg-[#faf5f3] border border-[#dd6e53]/30 hover:border-[#dd6e53]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    visitedPlaces.has(place.id) ? 'bg-green-500' : 'bg-[#dd6e53]'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-[#dd6e53]">{place.name}</h3>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <FaMapMarkerAlt className="text-[#dd6e53]" />
                      {place.country || 'Chiang Mai'}
                    </p>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI Travel Planner Section */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-purple-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FaRobot className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">AI Trip Planner</h2>
              <p className="text-xs text-gray-500">Let AI create your perfect itinerary</p>
            </div>
            {!showAISection && (
              <button
                onClick={handleGenerateAIItinerary}
                disabled={isGeneratingAI || optimizedRoute.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium text-sm disabled:opacity-50"
              >
                {isGeneratingAI ? 'Creating...' : 'Generate'}
              </button>
            )}
          </div>

          {/* AI Loading Animation */}
          {isGeneratingAI && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-purple-200 animate-spin border-t-purple-500"></div>
                <FaRobot className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-500 text-xl" />
              </div>
              <p className="mt-4 text-purple-600 font-medium">AI is planning your trip...</p>
              <p className="text-gray-400 text-sm">About 10-15 seconds</p>
            </div>
          )}

          {/* AI Itinerary Result */}
          {showAISection && aiItinerary && !isGeneratingAI && (
            <div className="space-y-4">
              {/* Offline Mode Notice */}
              {aiItinerary.isOffline && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-600">⚡</span>
                  </div>
                  <div>
                    <p className="text-amber-800 font-medium text-sm">Offline Mode</p>
                    <p className="text-amber-600 text-xs">AI unavailable. Here's a pre-built itinerary!</p>
                  </div>
                </div>
              )}
              
              {/* Trip Summary */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                <h3 className="font-bold text-purple-800 text-lg mb-1">{aiItinerary.tripName}</h3>
                <p className="text-gray-600 text-sm mb-3">{aiItinerary.summary}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <FaClock className="text-xs" /> {aiItinerary.totalDays} {aiItinerary.totalDays === 1 ? 'day' : 'days'}
                  </span>
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                    {aiItinerary.personality}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <FaWallet className="text-xs" /> {aiItinerary.budgetEstimate}
                  </span>
                </div>
              </div>

              {/* Day Tabs */}
              {aiItinerary.totalDays > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {aiItinerary.days.map((day) => (
                    <button
                      key={day.day}
                      onClick={() => setSelectedDay(day.day)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                        selectedDay === day.day
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-purple-100'
                      }`}
                    >
                      Day {day.day}
                    </button>
                  ))}
                </div>
              )}

              {/* Timeline for Selected Day */}
              {aiItinerary.days
                .filter(day => day.day === selectedDay)
                .map((day) => (
                  <div key={day.day} className="space-y-3">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">
                        {day.day}
                      </span>
                      {day.title}
                    </h4>
                    
                    <div className="space-y-3 relative">
                      {/* Timeline Line */}
                      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-purple-200"></div>
                      
                      {day.activities.map((activity, idx) => {
                        const place = optimizedRoute.find(p => p.id === activity.placeId);
                        const isNearby = activity.isNearbyRecommendation;
                        
                        // Get icon and colors based on activity type
                        const getActivityStyle = () => {
                          switch (activity.activityType) {
                            case 'restaurant':
                              return { icon: <FaUtensils />, bg: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', border: 'border-orange-200' };
                            case 'cafe':
                              return { icon: <FaCoffee />, bg: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', border: 'border-amber-200' };
                            case 'market':
                              return { icon: <FaStore />, bg: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700', border: 'border-purple-200' };
                            case 'shop':
                              return { icon: <FaShoppingBag />, bg: 'bg-pink-500', badge: 'bg-pink-100 text-pink-700', border: 'border-pink-200' };
                            case 'nightlife':
                              return { icon: <FaStar />, bg: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-200' };
                            case 'attraction':
                              return { icon: <FaMapMarkerAlt />, bg: 'bg-green-500', badge: 'bg-green-100 text-green-700', border: 'border-green-200' };
                            default:
                              return { icon: <FaMapMarkerAlt />, bg: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700', border: 'border-gray-100' };
                          }
                        };
                        
                        const style = getActivityStyle();
                        
                        return (
                          <div key={idx} className="relative pl-10">
                            {/* Timeline Dot */}
                            <div className={`absolute left-2.5 top-3 w-3 h-3 ${style.bg} rounded-full border-2 border-white shadow`}></div>
                            
                            <div 
                              className={`bg-white border ${isNearby ? style.border : 'border-gray-100'} rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow ${place ? 'cursor-pointer' : ''}`}
                              onClick={() => {
                                if (place) {
                                  setSelectedPlace(place.id);
                                  setShowPlaceDetail(true);
                                }
                              }}
                            >
                              <div className="flex items-start gap-3">
                                {/* Time Badge */}
                                <div className="flex-shrink-0">
                                  <span className={`px-2 py-1 ${style.badge} rounded-lg text-xs font-bold flex items-center gap-1`}>
                                    {isNearby && <span className="text-[10px]">{style.icon}</span>}
                                    {activity.time}
                                  </span>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-bold text-gray-800 truncate">{activity.placeName}</h5>
                                    <span className="text-xs text-gray-400 flex-shrink-0">{activity.duration}</span>
                                    {isNearby && (
                                      <span className={`text-[10px] px-1.5 py-0.5 ${style.badge} rounded-full`}>
                                        AI Pick
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                                  
                                  {/* Tips */}
                                  <div className="flex items-start gap-1.5 bg-yellow-50 rounded-lg p-2">
                                    <FaLightbulb className="text-yellow-500 text-xs flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-yellow-700">{activity.tips}</p>
                                  </div>
                                  
                                  {/* Transport to Next */}
                                  {activity.transportToNext && idx < day.activities.length - 1 && (
                                    <div className="mt-2 flex items-center gap-1.5 text-gray-400 text-xs">
                                      <MdDirectionsCar className="text-sm" />
                                      <span>{activity.transportToNext}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Place Image or Type Icon */}
                                {place?.image ? (
                                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                                    <img src={place.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ) : isNearby ? (
                                  <div className={`flex-shrink-0 w-12 h-12 ${style.bg} rounded-lg flex items-center justify-center text-white text-lg`}>
                                    {style.icon}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

              {/* Packing Tips */}
              {aiItinerary.packingTips && aiItinerary.packingTips.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <FaLightbulb className="text-blue-500" /> Travel Tips
                  </h4>
                  <ul className="space-y-1">
                    {aiItinerary.packingTips.map((tip, idx) => (
                      <li key={idx} className="text-blue-700 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Regenerate Button */}
              <button
                onClick={handleGenerateAIItinerary}
                className="w-full py-3 border-2 border-purple-500 text-purple-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors"
              >
                <FaRobot /> Regenerate Plan
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={openFullRouteInMaps}
            className="flex-1 bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <FaMapMarkedAlt /> Open In Maps
          </button>
          <button
            onClick={() => regenerateRoute()}
            className="flex-1 border-2 border-[#dd6e53] text-[#dd6e53] py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <FaRoute /> Modify Route
          </button>
        </div>

        {/* Emergency Button */}
        <button
          onClick={triggerEmergencyPlan}
          className="w-full border-2 border-[#dd6e53] text-[#dd6e53] py-3 rounded-xl font-bold flex items-center justify-center gap-2 mb-6"
        >
          <FaExclamationTriangle /> Report Emergency
        </button>
      </div>

      {/* Emergency Modal */}
      {showEmergencyModal && emergencyPlace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[3000] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <FaExclamationTriangle className="text-red-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Emergency Report</h2>
                </div>
                <button 
                  onClick={() => {
                    setShowEmergencyModal(false);
                    setEmergencyPlace(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FaTimes className="text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <h3 className="font-bold text-red-800 mb-1">⚠️ Issue at: {emergencyPlace.name}</h3>
                <p className="text-red-600 text-sm">Report an issue or find alternative destinations</p>
              </div>

              {alternativePlaces.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Alternative Places:</h4>
                  <div className="space-y-2">
                    {alternativePlaces.map((alt) => (
                      <button
                        key={alt.id}
                        onClick={() => handleSelectAlternative(alt)}
                        className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-[#dd6e53] hover:bg-orange-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FaMapMarkerAlt className="text-[#dd6e53]" />
                        </div>
                        <div className="flex-1 text-left">
                          <h5 className="font-medium text-gray-800">{alt.name}</h5>
                          <p className="text-xs text-gray-500">{alt.country || 'Chiang Mai'}</p>
                        </div>
                        <FaChevronRight className="text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    // Skip this place from the route
                    const newRoute = optimizedRoute.filter(p => p.id !== emergencyPlace.id);
                    setOptimizedRoute(newRoute);
                    setShowEmergencyModal(false);
                    setEmergencyPlace(null);
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium"
                >
                  Skip This Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutingPage;
