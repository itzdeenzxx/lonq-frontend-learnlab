import React from 'react';
import { FaPlane, FaCompass, FaHome, FaGift, FaUser } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const BottomNavbar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: FaPlane, label: 'Travel', path: '/routing' },
    { icon: FaCompass, label: 'Explore', path: '/gallery' },
    { icon: FaHome, label: 'Home', path: '/tinder' },
    { icon: FaGift, label: 'Reward', path: '/rewards' },
    { icon: FaUser, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 pb-6 flex justify-between items-end z-50 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = currentPath === item.path || (item.path === '/tinder' && currentPath === '/');
        const Icon = item.icon;
        
        return (
          <Link
            key={item.label}
            to={item.path}
            className="flex flex-col items-center gap-1"
          >
            <div className={`
              flex items-center justify-center transition-all duration-200
              ${isActive 
                ? 'w-12 h-12 bg-[#dd6e53] rounded-full -mt-6 shadow-lg border-4 border-white' 
                : 'w-8 h-8 text-gray-300'
              }
            `}>
              <Icon className={`
                ${isActive ? 'w-5 h-5 text-white' : 'w-5 h-5'}
              `} />
            </div>
            <span className={`
              text-[10px] font-medium
              ${isActive ? 'text-[#dd6e53]' : 'text-gray-300'}
            `}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavbar;
