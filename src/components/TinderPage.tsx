import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTimes, FaHeart, FaUndo, FaImages, FaArrowLeft } from 'react-icons/fa';
import { MdCelebration } from 'react-icons/md';
import TinderCard, { TinderCardRef } from '../components/TinderCard';
import { mockTravelPlaces } from '../data/travelPlaces';
import type { TravelPlace } from '../types/TravelPlace';
import { useLiff } from '../hooks/useLiff';
import { UserService } from '../services/firebaseService';

const TinderPage: React.FC = () => {
  const [allPlaces] = useState(mockTravelPlaces);
  const [availablePlaces, setAvailablePlaces] = useState<TravelPlace[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPlaces, setLikedPlaces] = useState<TravelPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const cardRef = useRef<TinderCardRef>(null);
  const { userId } = useLiff();
  const navigate = useNavigate();

  // Load liked places from Firebase on component mount
  useEffect(() => {
    const loadLikedPlaces = async () => {
      if (!userId) {
        // If no user, show all places
        setAvailablePlaces(allPlaces);
        setIsLoading(false);
        return;
      }
      
      try {
        const likedPlaceIds = await UserService.getLikedPlaces(userId);
        const likedPlacesData = allPlaces.filter(place => 
          likedPlaceIds.includes(place.id)
        );
        setLikedPlaces(likedPlacesData);
        
        // Filter out already liked places from available places
        const notLikedPlaces = allPlaces.filter(place => 
          !likedPlaceIds.includes(place.id)
        );
        setAvailablePlaces(notLikedPlaces);
      } catch (error) {
        console.error('Error loading liked places:', error);
        setAvailablePlaces(allPlaces);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLikedPlaces();
  }, [userId, allPlaces]);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentPlace = availablePlaces[currentIndex];
    
    if (direction === 'right' && currentPlace) {
      setLikedPlaces(prev => [...prev, currentPlace]);
      // Save to Firebase
      if (userId) {
        UserService.addLikedPlace(userId, currentPlace.id).catch(err => 
          console.error('Error saving liked place:', err)
        );
      }
    }
    
    setCurrentIndex(prev => prev + 1);
  }, [availablePlaces, currentIndex, userId]);

  const handleUndo = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevPlace = availablePlaces[prevIndex];
      
      // Check if the previous place was liked and remove it
      setLikedPlaces(prev => {
        const isLiked = prev.some(p => p.id === prevPlace.id);
        if (isLiked) {
          // Remove from Firebase
          if (userId) {
            UserService.removeLikedPlace(userId, prevPlace.id).catch(err =>
              console.error('Error removing liked place:', err)
            );
          }
          return prev.filter(p => p.id !== prevPlace.id);
        }
        return prev;
      });
      
      setCurrentIndex(prevIndex);
    }
  };

  const handleButtonAction = (direction: 'left' | 'right') => {
    if (cardRef.current) {
      cardRef.current.swipe(direction);
    }
  };

  const remainingPlaces = availablePlaces.slice(currentIndex, currentIndex + 2);
  const isFinished = currentIndex >= availablePlaces.length;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#dd6e53] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4">Loading...</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-sm"></div>
        
        <div className="relative z-10 text-center space-y-6 max-w-md w-full">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#dd6e53] to-[#dd6e53] rounded-full flex items-center justify-center shadow-2xl animate-bounce">
            <MdCelebration className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-white">
            That's all for now!
          </h2>
          
          <p className="text-gray-300 text-base px-4">
            You've explored all available destinations. Check out your gallery to see what you loved!
          </p>
          
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl">
            <div className="text-4xl font-bold text-[#dd6e53] mb-1">{likedPlaces.length}</div>
            <div className="text-sm text-gray-300">Places saved to gallery</div>
          </div>
          
          <div className="space-y-3 px-4 pt-4">
            <Link
              to="/gallery"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-[#c25a45] hover:to-orange-700 transition-all duration-200 shadow-lg"
            >
              <FaImages className="w-5 h-5" />
              View My Gallery
            </Link>
            
            <button
              onClick={() => setCurrentIndex(0)}
              className="flex items-center justify-center gap-2 w-full bg-white/10 text-white py-4 px-6 rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
            >
              <FaUndo className="w-5 h-5" />
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black overflow-hidden">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=2940&auto=format&fit=crop" 
          alt="Background" 
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      {/* Header - Minimal */}
      <div className="flex-none flex items-center justify-between p-4 z-20 pt-12">
        <button 
          onClick={() => navigate('/')}
          className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all active:scale-95"
        >
          <FaArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="text-white font-bold text-lg tracking-wider">DISCOVER</div>
        <div className="w-10 flex justify-end">
           {/* Notification dot example */}
           <div className="relative">
             <div className="w-2 h-2 bg-red-500 rounded-full absolute top-0 right-0"></div>
             <div className="w-8 h-8 bg-white/20 rounded-full"></div>
           </div>
        </div>
      </div>

      {/* Cards container */}
      <div className="flex-grow relative z-10 flex items-center justify-center w-full -mt-6">
        <div className="relative w-[90%] max-w-[360px] h-[65vh]">
          {remainingPlaces.map((place, index) => (
            <TinderCard
              ref={index === 0 ? cardRef : null}
              key={place.id}
              place={place}
              onSwipe={handleSwipe}
              isTop={index === 0}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex-none relative z-20 pb-8 pt-4 px-6">
        <div className="flex justify-center items-center gap-6 max-w-xs mx-auto">
          {/* Undo Button */}
          <button
            onClick={handleUndo}
            className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-transform active:scale-95"
          >
            <FaUndo className="w-6 h-6 text-yellow-500" />
          </button>
          
          {/* Nope Button */}
          <button
            onClick={() => handleButtonAction('left')}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-transform active:scale-95 border-2 border-red-100"
          >
            <FaTimes className="w-8 h-8 text-red-500" />
          </button>
          
          {/* Like Button */}
          <button
            onClick={() => handleButtonAction('right')}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-transform active:scale-95 border-2 border-green-100"
          >
            <FaHeart className="w-8 h-8 text-red-500" /> {/* Image shows red heart */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TinderPage;
