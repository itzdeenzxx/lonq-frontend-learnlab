import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaMapMarkerAlt, FaStar, FaTimes, FaArrowLeft, FaMapMarkedAlt } from 'react-icons/fa';
import type { TravelPlace } from '../types/TravelPlace';
import PersonalityModal from './PersonalityModal';
import PlaceSelectionModal from './PlaceSelectionModal';
import CoinCounter from './CoinCounter';
import { useLiff } from '../hooks/useLiff';
import { UserService } from '../services/firebaseService';
import { mockTravelPlaces } from '../data/travelPlaces';

const GalleryPage: React.FC = () => {
  const [likedPlaces, setLikedPlaces] = useState<TravelPlace[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { userId } = useLiff();

  useEffect(() => {
    // Load liked places from Firebase
    const loadLikedPlaces = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const likedPlaceIds = await UserService.getLikedPlaces(userId);
        const likedPlacesData = mockTravelPlaces.filter(place => 
          likedPlaceIds.includes(place.id)
        );
        setLikedPlaces(likedPlacesData);
      } catch (error) {
        console.error('Error loading liked places:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLikedPlaces();
  }, [userId]);

  const clearGallery = async () => {
    if (userId) {
      try {
        await UserService.clearLikedPlaces(userId);
        setLikedPlaces([]);
      } catch (error) {
        console.error('Error clearing gallery:', error);
      }
    }
  };

  const removePlace = async (placeId: string) => {
    if (userId) {
      try {
        await UserService.removeLikedPlace(userId, placeId);
        setLikedPlaces(prev => prev.filter(place => place.id !== placeId));
      } catch (error) {
        console.error('Error removing place:', error);
      }
    }
  };

  const handleTravelPlan = (personality: string, duration: string) => {
    setIsModalOpen(false);
    setIsSelectionModalOpen(true);
    // Store personality/duration temporarily or pass them through
    // For now, we'll pass them when confirming selection
    (window as any).tempTripSettings = { personality, duration };
  };

  const handlePlaceSelection = (selectedPlaces: TravelPlace[]) => {
    const settings = (window as any).tempTripSettings || {};
    navigate('/routing', { 
      state: { 
        personality: settings.personality, 
        duration: settings.duration,
        selectedPlaces 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Responsive */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="p-3 sm:p-4 md:p-6">
          {/* Mobile Layout */}
          <div className="flex flex-col space-y-3 sm:space-y-4 md:hidden">
            {/* Top row - Back button and title */}
            <div className="flex items-center justify-between">
              <Link 
                to="/"
                className="flex items-center space-x-2 text-[#dd6e53] hover:text-[#dd6e53]"
              >
                <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-xs sm:text-sm">Back</span>
              </Link>
              
              <div className="text-center">
                <h1 className="text-base sm:text-lg font-bold text-gray-800">My Gallery</h1>
                <p className="text-xs text-gray-500">{likedPlaces.length} saved places</p>
              </div>
            </div>
            
            {/* Bottom row - Actions */}
            <div className="flex items-center justify-between gap-2">
              <CoinCounter />
              <div className="flex items-center gap-2">
                {likedPlaces.length > 0 && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white px-3 py-2 rounded-xl font-medium text-xs sm:text-sm hover:from-[#c25a45] hover:to-[#c25a45] transition-all duration-200 shadow-lg"
                  >
                    Travel
                  </button>
                )}
                {likedPlaces.length > 0 && (
                  <button
                    onClick={clearGallery}
                    className="text-red-500 hover:text-red-600 text-xs font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <Link 
              to="/"
              className="flex items-center space-x-2 text-[#dd6e53] hover:text-[#dd6e53]"
            >
              <FaArrowLeft className="w-6 h-6" />
              <span className="font-medium">Back</span>
            </Link>
            
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">My Gallery</h1>
              <p className="text-sm text-gray-500">{likedPlaces.length} saved places</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <CoinCounter />
              {likedPlaces.length > 0 && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white px-4 py-2 rounded-xl font-medium hover:from-[#c25a45] hover:to-[#c25a45] transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Travel
                </button>
              )}
              {likedPlaces.length > 0 && (
                <button
                  onClick={clearGallery}
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6">
        {likedPlaces.length === 0 ? (
          // Empty state
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <FaHeart className="w-10 h-10 sm:w-12 sm:h-12 text-[#dd6e53]" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              No places saved yet
            </h2>
            
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-sm mx-auto">
              Start swiping through destinations to build your dream travel collection!
            </p>
            
            <Link
              to="/tinder"
              className="inline-block bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white py-2.5 sm:py-3 px-6 sm:px-8 rounded-2xl font-semibold text-sm sm:text-base hover:from-[#c25a45] hover:to-[#c25a45] transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          // Gallery grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {likedPlaces.map((place) => (
              <div 
                key={place.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                  
                  <button
                    onClick={() => removePlace(place.id)}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                  >
                    <FaTimes className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
                
                <div className="p-4 sm:p-5">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                    {place.name}
                  </h3>
                  
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                    {place.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-xs sm:text-sm text-[#dd6e53]">
                      <FaMapMarkerAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                      <span className="font-mono text-xs">
                        {place.lat.toFixed(4)}, {place.long.toFixed(4)}
                      </span>
                    </div>
                    
                    {place.rating && (
                      <div className="flex items-center text-xs sm:text-sm">
                        <FaStar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-yellow-500" />
                        <span className="text-gray-700 font-medium">{place.rating}</span>
                        <span className="text-gray-500 ml-1">/ 5.0</span>
                      </div>
                    )}
                    
                    {place.country && (
                      <div className="inline-block bg-orange-100 text-[#dd6e53] px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium">
                        {place.country}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      window.open(`https://www.google.com/maps?q=${place.lat},${place.long}`, '_blank');
                    }}
                    className="w-full mt-3 sm:mt-4 bg-orange-100 text-[#dd6e53] py-2 px-4 rounded-xl hover:bg-orange-200 transition-colors duration-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-2"
                  >
                    <FaMapMarkedAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    View on Map
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <PersonalityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleTravelPlan}
      />
      
      <PlaceSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        likedPlaces={likedPlaces}
        onConfirm={handlePlaceSelection}
      />
    </div>
  );
};

export default GalleryPage;
