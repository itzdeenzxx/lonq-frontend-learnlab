import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCoins, FaChevronRight, FaPlus } from 'react-icons/fa';
import { CoinSystem } from '../utils/coinSystem';
import { UserService } from '../services/firebaseService';
import { useLiff } from '../hooks/useLiff';

interface CoinCounterProps {
  showAnimation?: boolean;
  onCoinEarned?: (amount: number) => void;
}

const CoinCounter: React.FC<CoinCounterProps> = ({ showAnimation = false, onCoinEarned }) => {
  const { userId } = useLiff();
  const [coins, setCoins] = useState<number>(0);
  const [animatingCoins, setAnimatingCoins] = useState<number>(0);

  useEffect(() => {
    const updateCoins = async () => {
      if (userId) {
        const userCoins = await UserService.getCoins(userId);
        setCoins(userCoins);
      } else {
        const profile = CoinSystem.getUserProfile();
        setCoins(profile.totalCoins);
      }
    };

    updateCoins();
    
    // Listen for storage changes to update coins in real time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProfile') {
        updateCoins();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    const handleCoinUpdate = (e: CustomEvent) => {
      updateCoins();
      if (showAnimation && e.detail.earned) {
        setAnimatingCoins(e.detail.earned);
        setTimeout(() => setAnimatingCoins(0), 2000);
        onCoinEarned?.(e.detail.earned);
      }
    };

    window.addEventListener('coinUpdate' as any, handleCoinUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('coinUpdate' as any, handleCoinUpdate);
    };
  }, [showAnimation, onCoinEarned, userId]);

  return (
    <Link 
      to="/rewards"
      className="flex items-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-xl hover:shadow-2xl hover:from-[#c25a45] hover:to-[#c25a45] transition-all duration-300 transform hover:scale-105 active:scale-95 animate-pulse-glow cursor-pointer border-2 border-orange-300"
    >
      <div className="relative">
        <FaCoins className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce-slow" />
        
        {animatingCoins > 0 && (
          <div className="absolute -top-8 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce flex items-center gap-0.5">
            <FaPlus className="w-2 h-2" />
            {animatingCoins}
          </div>
        )}
      </div>
      
      <span className="font-bold text-base sm:text-lg">
        {coins.toLocaleString()}
      </span>
      
      <span className="text-xs sm:text-sm font-medium opacity-90 hidden sm:inline">
        Coins
      </span>
      
      {/* Small arrow indicator */}
      <FaChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
    </Link>
  );
};

export default CoinCounter;
