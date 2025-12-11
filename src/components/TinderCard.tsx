import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useSpring, animated } from 'react-spring';
import { useDrag } from '@use-gesture/react';
import { FaInfoCircle, FaShareAlt } from 'react-icons/fa';
import liff from '@line/liff';
import type { TravelPlace } from '../types/TravelPlace';

export interface TinderCardRef {
  swipe: (dir: 'left' | 'right') => void;
}

interface TinderCardProps {
  place: TravelPlace;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}

const TinderCard = forwardRef<TinderCardRef, TinderCardProps>(({ place, onSwipe, isTop }, ref) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [{ x, y, rotate, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
  }));

  // Share to LINE friends using Flex Message
  const handleShareToLine = async () => {
    if (!liff.isInClient()) {
      alert('Please open this app in LINE to share with friends!');
      return;
    }

    setIsSharing(true);
    try {
      const flexMessage = {
        type: 'flex' as const,
        altText: `Check out ${place.name}! 🌟`,
        contents: {
          type: 'bubble' as const,
          hero: {
            type: 'image' as const,
            url: place.image || 'https://via.placeholder.com/400x300',
            size: 'full' as const,
            aspectRatio: '20:13' as const,
            aspectMode: 'cover' as const,
          },
          body: {
            type: 'box' as const,
            layout: 'vertical' as const,
            contents: [
              {
                type: 'text' as const,
                text: place.name,
                weight: 'bold' as const,
                size: 'xl' as const,
                color: '#dd6e53',
              },
              {
                type: 'box' as const,
                layout: 'vertical' as const,
                margin: 'lg' as const,
                spacing: 'sm' as const,
                contents: [
                  {
                    type: 'text' as const,
                    text: place.description || 'A must-visit destination!',
                    wrap: true,
                    color: '#666666',
                    size: 'sm' as const,
                  },
                ],
              },
              {
                type: 'box' as const,
                layout: 'horizontal' as const,
                margin: 'md' as const,
                spacing: 'sm' as const,
                contents: (place.tags?.slice(0, 3) || []).map(tag => ({
                  type: 'text' as const,
                  text: `#${tag}`,
                  size: 'xs' as const,
                  color: '#dd6e53',
                  flex: 0,
                })),
              },
            ],
          },
          footer: {
            type: 'box' as const,
            layout: 'vertical' as const,
            spacing: 'sm' as const,
            contents: [
              {
                type: 'text' as const,
                text: '🌿 Shared from LonQ',
                size: 'xs' as const,
                color: '#aaaaaa',
                align: 'center' as const,
              },
            ],
          },
        },
      };

      await liff.shareTargetPicker([flexMessage]);
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  useImperativeHandle(ref, () => ({
    swipe: (dir: 'left' | 'right') => {
      api.start({
        x: (200 + window.innerWidth) * (dir === 'right' ? 1 : -1),
        y: 0,
        rotate: dir === 'right' ? 20 : -20,
        config: { tension: 200, friction: 30 },
        onRest: () => onSwipe(dir)
      });
    }
  }));

  const bind = useDrag(
    (state: any) => {
      const { movement: [mx, my], direction: [xDir], down } = state;
      const trigger = Math.abs(mx) > 100;
      const dir = xDir < 0 ? 'left' : 'right';
      
      if (!down && trigger) {
        api.start({
          x: (200 + window.innerWidth) * (mx > 0 ? 1 : -1),
          y: my,
          rotate: mx / 10,
          scale: 1,
          config: { tension: 200, friction: 30 },
          onRest: () => onSwipe(dir)
        });
      } else {
        api.start({
          x: down ? mx : 0,
          y: down ? my : 0,
          rotate: down ? mx / 10 : 0,
          scale: down ? 1.1 : 1,
          config: { tension: 300, friction: 30 }
        });
      }
    },
    { enabled: isTop && !showDetails }
  );

  const toggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  return (
    <>
      <animated.div
        {...bind()}
        style={{
          x,
          y,
          rotate,
          scale,
          touchAction: 'none',
        }}
      className={`absolute top-0 left-0 bg-black rounded-3xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing ${
        isTop ? 'z-20' : 'z-10'
      } w-full h-full border border-white/10`}
    >
      <div className="relative h-full w-full">
        <img
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Dark gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />
        
        {/* Overlay indicators */}
        <animated.div
          style={{
            opacity: x.to((val: number) => (val > 0 ? val / 100 : 0)),
          }}
          className="absolute top-10 left-8 border-4 border-red-500 text-red-500 px-4 py-1 rounded-lg font-bold text-4xl tracking-widest transform -rotate-12 z-50 bg-white/20 backdrop-blur-sm"
        >
          LIKE
        </animated.div>
        
        <animated.div
          style={{
            opacity: x.to((val: number) => (val < 0 ? Math.abs(val) / 100 : 0)),
          }}
          className="absolute top-10 right-8 border-4 border-red-500 text-red-500 px-4 py-1 rounded-lg font-bold text-4xl tracking-widest transform rotate-12 z-50 bg-white/20 backdrop-blur-sm"
        >
          NOPE
        </animated.div>

        {/* Content Container */}
        <div className="absolute bottom-0 left-0 right-0 pt-24 pb-8 px-6 text-white flex flex-col justify-end z-10">
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-3xl font-bold leading-tight drop-shadow-md">{place.name}</h3>
            <button 
              onClick={toggleDetails}
              className="mb-1 p-2.5 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors border border-white/30"
            >
              <FaInfoCircle className="w-6 h-6 text-white" />
            </button>
          </div>
          <p className="text-base text-gray-100 line-clamp-2 font-light mb-4 drop-shadow-sm">{place.description}</p>
          
          {/* Tags Section */}
          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {place.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-black/30 backdrop-blur-md border border-white/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </animated.div>

    {/* Details Modal */}
    {showDetails && (
      <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl p-6 flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300 rounded-3xl overflow-y-auto">
        <div className="flex justify-between mb-4">
          <button 
            onClick={handleShareToLine}
            disabled={isSharing}
            className="flex items-center gap-2 px-4 py-2 bg-[#06C755] text-white rounded-full hover:bg-[#05a847] transition-colors disabled:opacity-50 font-medium text-sm"
          >
            <FaShareAlt className="w-4 h-4" />
            {isSharing ? 'Sharing...' : 'Share to LINE'}
          </button>
          <button 
            onClick={toggleDetails}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <span className="text-gray-500 font-bold text-xl">✕</span>
          </button>
        </div>
        
        <img 
          src={place.image} 
          alt={place.name} 
          className="w-full h-64 object-cover rounded-2xl mb-6 shadow-lg"
        />
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{place.name}</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {place.tags?.map((tag, index) => (
            <span key={index} className="px-3 py-1 bg-orange-100 text-[#dd6e53] rounded-full text-sm font-medium">
              #{tag}
            </span>
          ))}
        </div>
        
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>{place.description}</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <h4 className="font-bold text-orange-800 mb-2">Why go here?</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Amazing photo opportunities</li>
              <li>Rich cultural history</li>
              <li>Local delicacies nearby</li>
            </ul>
          </div>
        </div>
      </div>
    )}
  </>
  );
});

export default TinderCard;
