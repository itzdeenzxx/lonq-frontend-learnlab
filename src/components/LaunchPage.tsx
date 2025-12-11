import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkedAlt, FaImages, FaGift, FaUser, FaHeart, FaTimes, FaPlane } from 'react-icons/fa';
import { MdExplore } from 'react-icons/md';
import CoinCounter from './CoinCounter';
import { useLiff } from '../hooks/useLiff';

const chiangMaiImages = [
  { url: 'https://cms.dmpcdn.com/travel/2020/11/03/9d45da30-1dbc-11eb-9275-d9e61fe8653e_original.jpg', name: 'Wat Umong' },
  { url: 'https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg', name: 'Ang Kaew' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Ho_Kum_Luang_%28I%29.jpg', name: 'Hor Kham Luang' },
  { url: 'https://res.cloudinary.com/pillarshotels/image/upload/f_auto/web/cms/resources/attractions/on-03-1500x1000-w1800h1360.jpeg', name: 'One Nimman' },
  { url: 'https://images.squarespace-cdn.com/content/v1/5dcac1b37b75f56509c0a367/c96597eb-4afc-4346-b33c-1669a5281cd4/DSC00016.jpg', name: 'Ginger Farm' },
  { url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/0e/cd/b2/caption.jpg?w=900&h=500&s=1', name: 'Mae Kha Canal' },
];

const LaunchPage: React.FC = () => {
  const { isLoggedIn, displayName, pictureUrl } = useLiff();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  // Auto-rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % chiangMaiImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-200/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 -left-20 w-48 h-48 bg-amber-200/40 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 right-1/4 w-56 h-56 bg-yellow-200/40 rounded-full blur-3xl animate-float"></div>
        
        {/* Flying plane */}
        <div className="absolute top-20 animate-fly-across">
          <FaPlane className="text-4xl text-gray-300 opacity-30" />
        </div>
      </div>

      {/* User Profile - Top Left - Clickable to Profile Page */}
      <button 
        onClick={() => navigate('/profile')}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center space-x-2 sm:space-x-3 bg-white/90 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2 rounded-full shadow-xl animate-fade-in border-2 border-orange-200 hover:border-[#dd6e53] hover:bg-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        {pictureUrl ? (
          <img
            src={pictureUrl}
            alt={displayName || 'User'}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-[#dd6e53] shadow-md"
          />
        ) : (
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-[#dd6e53] bg-orange-100 flex items-center justify-center shadow-md">
            <FaUser className="w-5 h-5 text-[#dd6e53]" />
          </div>
        )}
        <span className="text-gray-800 font-semibold text-sm sm:text-base hidden sm:inline">{displayName || 'User'}</span>
      </button>

      {/* Coin Counter - Top Right */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-10 animate-fade-in">
        <CoinCounter />
      </div>

      <div className="text-center space-y-6 sm:space-y-8 max-w-md w-full relative z-10 pt-20 sm:pt-0">
        {/* Logo/Icon with animation */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-[#dd6e53] to-[#dd6e53] rounded-3xl flex items-center justify-center shadow-xl animate-bounce-slow rotate-3 hover:rotate-0 transition-transform duration-300">
          <FaMapMarkedAlt className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </div>

        {/* Title with gradient animation */}
        <div className="animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 animate-gradient-text">
            LonQ
          </h1>
          <p className="text-gray-600 text-base sm:text-lg px-4">
            Discover amazing places in Chiang Mai
          </p>
        </div>

        {/* Chiang Mai Image Gallery */}
        <div className="relative h-40 sm:h-48 rounded-2xl overflow-hidden shadow-xl animate-fade-in-delayed">
          {chiangMaiImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 sm:p-4">
                <p className="text-white font-medium text-sm sm:text-base">{img.name}</p>
              </div>
            </div>
          ))}
          
          {/* Image indicators */}
          <div className="absolute bottom-14 sm:bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {chiangMaiImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-white w-4' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3 sm:space-y-4 animate-slide-up px-4" style={{ animationDelay: '0.2s' }}>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            Swipe through beautiful travel destinations in Chiang Mai, save your favorites, earn coins, and redeem exclusive discounts!
          </p>
          
          <div className="flex items-center justify-center space-x-6 sm:space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <FaTimes className="text-red-500" />
              </div>
              <span className="text-xs sm:text-sm">Skip</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center animate-heart-beat">
                <FaHeart className="text-green-500" />
              </div>
              <span className="text-xs sm:text-sm">Love it</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 sm:space-y-4 stagger-fade-in px-4">
          <Link 
            to="/tinder"
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white py-3 sm:py-4 px-6 sm:px-8 rounded-2xl font-semibold text-base sm:text-lg shadow-lg hover:from-[#c25a45] hover:to-[#c25a45] transform hover:scale-105 transition-all duration-200 ripple-effect"
          >
            <MdExplore className="w-5 h-5 sm:w-6 sm:h-6" />
            Start Exploring
          </Link>
          
          <Link 
            to="/gallery"
            className="flex items-center justify-center gap-2 w-full bg-white text-[#dd6e53] py-3 sm:py-4 px-6 sm:px-8 rounded-2xl font-semibold text-base sm:text-lg border-2 border-orange-200 hover:border-[#dd6e53] hover:bg-orange-50 transform hover:scale-105 transition-all duration-200"
          >
            <FaImages className="w-5 h-5 sm:w-6 sm:h-6" />
            View My Gallery
          </Link>

          <Link 
            to="/rewards"
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-400 to-[#dd6e53] text-white py-3 sm:py-4 px-6 sm:px-8 rounded-2xl font-semibold text-base sm:text-lg shadow-lg hover:from-amber-500 hover:to-[#c25a45] transform hover:scale-105 transition-all duration-200"
          >
            <FaGift className="w-5 h-5 sm:w-6 sm:h-6" />
            Redeem Rewards
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-orange-100 animate-fade-in px-4" style={{ animationDelay: '0.5s' }}>
          <div className="text-center card-hover-lift p-2 sm:p-3 rounded-xl bg-white/50 backdrop-blur-sm">
            <div className="text-xl sm:text-2xl font-bold text-[#dd6e53]">13+</div>
            <div className="text-xs sm:text-sm text-gray-500">Places</div>
          </div>
          <div className="text-center card-hover-lift p-2 sm:p-3 rounded-xl bg-white/50 backdrop-blur-sm">
            <div className="text-xl sm:text-2xl font-bold text-[#dd6e53]">8+</div>
            <div className="text-xs sm:text-sm text-gray-500">Rewards</div>
          </div>
          <div className="text-center card-hover-lift p-2 sm:p-3 rounded-xl bg-white/50 backdrop-blur-sm">
            <div className="text-xl sm:text-2xl font-bold text-[#dd6e53]">∞</div>
            <div className="text-xs sm:text-sm text-gray-500">Adventures</div>
          </div>
        </div>

        {/* Scrolling Gallery Preview */}
        <div className="overflow-hidden rounded-xl mt-4 px-4">
          <div className="flex animate-scroll-left">
            {[...chiangMaiImages, ...chiangMaiImages].map((img, index) => (
              <div key={index} className="flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 mx-1 rounded-lg overflow-hidden">
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className="pt-6 text-center text-xs text-gray-400 space-x-4 px-4">
          <Link to="/privacy" className="hover:text-[#dd6e53] transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-[#dd6e53] transition-colors">
            Terms of Use
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LaunchPage;
