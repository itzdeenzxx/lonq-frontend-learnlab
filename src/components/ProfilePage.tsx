import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaHeart, FaCheckCircle, FaCoins, FaTrophy, FaCamera, FaStar } from 'react-icons/fa';
import { MdPlace, MdExplore } from 'react-icons/md';
import type { TravelPlace } from '../types/TravelPlace';
import { CoinSystem } from '../utils/coinSystem';
import { getUserStorageKey, useLiff } from '../hooks/useLiff';
import CoinCounter from './CoinCounter';

const ProfilePage: React.FC = () => {
  const { displayName, pictureUrl } = useLiff();
  const [likedPlaces, setLikedPlaces] = useState<TravelPlace[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'liked' | 'visited'>('liked');
  const [stats, setStats] = useState({
    totalCoins: 0,
    totalLiked: 0,
    totalVisited: 0,
    rewardsRedeemed: 0
  });

  useEffect(() => {
    // Load liked places
    const storageKey = getUserStorageKey('likedPlaces');
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const places = JSON.parse(saved);
      setLikedPlaces(places);
      setStats(prev => ({ ...prev, totalLiked: places.length }));
    }

    // Load visited places
    const visitedKey = getUserStorageKey('visitedPlaces');
    const visitedSaved = localStorage.getItem(visitedKey);
    if (visitedSaved) {
      const visited = JSON.parse(visitedSaved);
      setVisitedPlaces(visited);
      setStats(prev => ({ ...prev, totalVisited: visited.length }));
    }

    // Load coin data
    const profile = CoinSystem.getUserProfile();
    setStats(prev => ({
      ...prev,
      totalCoins: profile.totalCoins,
      rewardsRedeemed: profile.journeys.length // Using completed journeys as proxy for rewards
    }));
  }, []);

  const visitedPlaceObjects = likedPlaces.filter(place => visitedPlaces.includes(place.id));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#dd6e53] via-#dd6e53 to-amber-500 text-white">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between p-4 sm:p-6">
            <Link 
              to="/"
              className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Back</span>
            </Link>
            
            <h1 className="text-xl sm:text-2xl font-bold">My Profile</h1>
            
            <div className="w-20"></div>
          </div>

          {/* Profile Info */}
          <div className="px-4 sm:px-6 pb-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="relative">
                {pictureUrl ? (
                  <img
                    src={pictureUrl}
                    alt={displayName || 'User'}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg bg-white/20 flex items-center justify-center">
                    <FaCamera className="w-8 h-8 text-white/60" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  <FaTrophy className="w-4 h-4 text-[#dd6e53]" />
                </div>
              </div>

              {/* User Info */}
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold">{displayName || 'Traveler'}</h2>
                <p className="text-white/80 text-sm sm:text-base mt-1">Chiang Mai Explorer</p>
                
                {/* Stats Summary */}
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                    <FaHeart className="w-3 h-3" />
                    <span className="text-sm font-semibold">{stats.totalLiked}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                    <FaCheckCircle className="w-3 h-3" />
                    <span className="text-sm font-semibold">{stats.totalVisited}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                    <FaCoins className="w-3 h-3" />
                    <span className="text-sm font-semibold">{stats.totalCoins}</span>
                  </div>
                </div>
              </div>

              {/* Coin Counter */}
              <div className="hidden lg:block">
                <CoinCounter />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
            <div className="w-12 h-12 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <FaHeart className="w-6 h-6 text-[#dd6e53]" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalLiked}</div>
            <div className="text-xs text-gray-500 mt-1">Liked Places</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
            <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
              <FaCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalVisited}</div>
            <div className="text-xs text-gray-500 mt-1">Visited</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
            <div className="w-12 h-12 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-2">
              <FaCoins className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalCoins}</div>
            <div className="text-xs text-gray-500 mt-1">Total Coins</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
            <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <FaStar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.rewardsRedeemed}</div>
            <div className="text-xs text-gray-500 mt-1">Journeys</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-lg">
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'liked'
                ? 'bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaHeart className="w-4 h-4" />
            <span className="hidden sm:inline">Liked Places</span>
            <span className="sm:hidden">Liked</span>
            <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">{stats.totalLiked}</span>
          </button>

          <button
            onClick={() => setActiveTab('visited')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'visited'
                ? 'bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaCheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Visited Places</span>
            <span className="sm:hidden">Visited</span>
            <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">{stats.totalVisited}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'liked' && (
          <>
            {likedPlaces.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <FaHeart className="w-10 h-10 text-[#dd6e53]" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No liked places yet</h3>
                <p className="text-gray-600 mb-6">Start exploring to add places you love!</p>
                <Link
                  to="/tinder"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white py-3 px-6 rounded-xl font-semibold hover:from-[#c25a45] hover:to-[#c25a45] transition-all duration-200 shadow-lg"
                >
                  <MdExplore className="w-5 h-5" />
                  Start Exploring
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {likedPlaces.map((place) => (
                  <div 
                    key={place.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative h-40 sm:h-48">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                      {visitedPlaces.includes(place.id) && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-2 shadow-lg">
                          <FaCheckCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                        {place.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {place.description}
                      </p>
                      
                      <div className="flex items-center text-sm text-[#dd6e53] mb-3">
                        <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                        <span className="text-xs truncate">{place.lat.toFixed(4)}, {place.long.toFixed(4)}</span>
                      </div>

                      {place.rating && (
                        <div className="flex items-center text-sm mb-3">
                          <FaStar className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-gray-700 font-medium">{place.rating}</span>
                          <span className="text-gray-500 ml-1">/ 5.0</span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          window.open(`https://www.google.com/maps?q=${place.lat},${place.long}`, '_blank');
                        }}
                        className="w-full bg-orange-100 text-[#dd6e53] py-2 px-4 rounded-xl hover:bg-orange-200 transition-colors duration-200 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <MdPlace className="w-4 h-4" />
                        View on Map
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'visited' && (
          <>
            {visitedPlaceObjects.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <FaCheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No visited places yet</h3>
                <p className="text-gray-600 mb-6">Complete journeys to mark places as visited!</p>
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white py-3 px-6 rounded-xl font-semibold hover:from-[#c25a45] hover:to-[#c25a45] transition-all duration-200 shadow-lg"
                >
                  <MdExplore className="w-5 h-5" />
                  Plan a Journey
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {visitedPlaceObjects.map((place) => (
                  <div 
                    key={place.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-40 sm:h-48">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-2 shadow-lg">
                        <FaCheckCircle className="w-4 h-4" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <span className="text-white text-xs font-medium">✓ Visited</span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                        {place.name}
                      </h3>
                      
                      <div className="flex items-center text-sm text-[#dd6e53] mb-3">
                        <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                        <span className="text-xs truncate">{place.lat.toFixed(4)}, {place.long.toFixed(4)}</span>
                      </div>

                      {place.rating && (
                        <div className="flex items-center text-sm">
                          <FaStar className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-gray-700 font-medium">{place.rating}</span>
                          <span className="text-gray-500 ml-1">/ 5.0</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
