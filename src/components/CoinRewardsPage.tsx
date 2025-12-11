import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCoins, FaCamera, FaCheckCircle, FaTrophy, FaStar, FaGift, FaCopy, FaMapMarkerAlt, FaArrowLeft, FaMountain, FaUtensils, FaHeart } from 'react-icons/fa';
import { CoinSystem } from '../utils/coinSystem';
import { UserService } from '../services/firebaseService';
import { useLiff } from '../hooks/useLiff';
import { QRCodeSVG } from 'qrcode.react';

interface Reward {
  id: string;
  name: string;
  description: string;
  image: string;
  coinCost: number;
  category: 'discount' | 'experience' | 'food' | 'souvenir';
  discountCode?: string;
  validUntil: string;
  location: string;
  originalPrice?: string;
}

const rewards: Reward[] = [
  {
    id: '1',
    name: '20% Off at Khao Soi Mae Sai',
    description: 'Enjoy authentic Northern Thai cuisine with 20% off your entire bill',
    image: 'https://www.mytravelbuzzg.com/wp-content/uploads/Khao-Soi-Mae-Sai-Restaurant-e1693473350860.jpg',
    coinCost: 50,
    category: 'food',
    discountCode: 'YEEP20KHAO',
    validUntil: '2025-12-31',
    location: 'Nimman Road, Chiang Mai',
    originalPrice: '150 THB'
  },
  {
    id: '2',
    name: 'Free Coffee at One Nimman',
    description: 'Redeem a free specialty coffee at any participating café in One Nimman',
    image: 'https://res.cloudinary.com/pillarshotels/image/upload/f_auto/web/cms/resources/attractions/on-03-1500x1000-w1800h1360.jpeg',
    coinCost: 30,
    category: 'food',
    discountCode: 'YEEPFREE',
    validUntil: '2025-12-31',
    location: 'One Nimman, Chiang Mai'
  },
  {
    id: '3',
    name: 'Ginger Farm Tour',
    description: 'Get 50% off organic farm tour including lunch and activities',
    image: 'https://images.squarespace-cdn.com/content/v1/5dcac1b37b75f56509c0a367/c96597eb-4afc-4346-b33c-1669a5281cd4/DSC00016.jpg',
    coinCost: 100,
    category: 'experience',
    discountCode: 'YEEPFARM50',
    validUntil: '2025-12-31',
    location: 'Ginger Farm, Mae Wang',
    originalPrice: '800 THB'
  },
  {
    id: '4',
    name: 'Wat Umong Meditation Session',
    description: 'Free guided meditation session at the ancient temple tunnels',
    image: 'https://cms.dmpcdn.com/travel/2020/11/03/9d45da30-1dbc-11eb-9275-d9e61fe8653e_original.jpg',
    coinCost: 80,
    category: 'experience',
    discountCode: 'YEEPZEN',
    validUntil: '2025-12-31',
    location: 'Wat Umong, Suthep'
  },
  {
    id: '5',
    name: 'Think Park Night Market Voucher',
    description: '100 THB shopping voucher for handmade crafts and local goods',
    image: 'https://changpuakmagazine.com/images/article/182925ArticleThumpnai_September2018-07-07_resize.jpg',
    coinCost: 40,
    category: 'souvenir',
    discountCode: 'YEEPCRAFT',
    validUntil: '2025-12-31',
    location: 'Think Park, Nimman'
  },
  {
    id: '6',
    name: 'Royal Park Bike Rental',
    description: 'Free 2-hour bicycle rental at Hor Kham Luang Royal Park',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Ho_Kum_Luang_%28I%29.jpg',
    coinCost: 25,
    category: 'experience',
    discountCode: 'YEEPBIKE',
    validUntil: '2025-12-31',
    location: 'Royal Agricultural Research Center'
  },
  {
    id: '7',
    name: 'Suki Chang Phueak Special',
    description: 'Free extra meat topping with any suki order',
    image: 'https://d13q9rhbndrrl0.cloudfront.net/posts/none/2021/8/1640512803955-655157687290318600.jpeg',
    coinCost: 20,
    category: 'food',
    discountCode: 'YEEPSUKI',
    validUntil: '2025-12-31',
    location: 'Chang Phueak Night Market'
  },
  {
    id: '8',
    name: 'Ang Kaew Sunset Picnic Set',
    description: 'Picnic basket rental with local snacks for sunset viewing',
    image: 'https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg',
    coinCost: 60,
    category: 'experience',
    discountCode: 'YEEPPICNIC',
    validUntil: '2025-12-31',
    location: 'Ang Kaew Reservoir, CMU'
  }
];

const categoryIcons: Record<string, React.ReactNode> = {
  discount: <FaGift className="inline w-4 h-4" />,
  experience: <FaMountain className="inline w-4 h-4" />,
  food: <FaUtensils className="inline w-4 h-4" />,
  souvenir: <FaHeart className="inline w-4 h-4" />
};

const categoryColors: Record<string, string> = {
  discount: 'from-blue-400 to-blue-600',
  experience: 'from-green-400 to-green-600',
  food: 'from-[#dd6e53] to-[#dd6e53]',
  souvenir: 'from-pink-400 to-pink-600'
};

const CoinRewardsPage: React.FC = () => {
  const { userId } = useLiff();
  const [userCoins, setUserCoins] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [redeemedReward, setRedeemedReward] = useState<Reward | null>(null);
  const [redemptionData, setRedemptionData] = useState<any>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCoins = async () => {
      if (userId) {
        const coins = await UserService.getCoins(userId);
        setUserCoins(coins);
      } else {
        const profile = CoinSystem.getUserProfile();
        setUserCoins(profile.totalCoins);
      }
    };
    fetchCoins();
  }, [userId]);

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(r => r.category === selectedCategory);

  const handleRedeem = async (reward: Reward) => {
    if (userCoins >= reward.coinCost) {
      setIsLoading(true);
      try {
        if (userId) {
          // Real Firebase Redemption
          const result = await UserService.redeemReward(userId, reward.id, reward.coinCost, reward);
          setRedemptionData(result);
          
          // Update local coin state immediately
          setUserCoins(prev => prev - reward.coinCost);
        } else {
          // Fallback for non-logged in users (local storage)
          const profile = CoinSystem.getUserProfile();
          profile.totalCoins -= reward.coinCost;
          CoinSystem.saveUserProfile(profile);
          setUserCoins(profile.totalCoins);
          setRedemptionData({
            qrCodeData: `LOCAL:${Date.now()}:${reward.id}`,
            id: `local-${Date.now()}`
          });
        }
        
        // Show success modal
        setRedeemedReward(reward);
        setShowModal(true);
      } catch (error) {
        console.error("Redemption failed:", error);
        alert("Redemption failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 -left-20 w-48 h-48 bg-orange-200/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 right-1/4 w-56 h-56 bg-amber-200/30 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#dd6e53] via-#dd6e53 to-amber-500 text-white sticky top-0 z-20">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Link 
              to="/"
              className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
            >
              <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              <span className="font-medium text-xs sm:text-sm md:text-base">Back</span>
            </Link>
            
            <div className="text-center">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold flex items-center gap-2 justify-center">
                <FaCoins className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce-slow" /> Rewards
              </h1>
              <p className="text-xs sm:text-sm text-white/80">Redeem your coins for discounts</p>
            </div>
            
            {/* Coin Balance */}
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1.5 sm:px-4 sm:py-2 rounded-full">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <FaCoins className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-bold text-sm sm:text-lg">{userCoins.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 relative z-10">
        {/* How to Earn Coins Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-orange-100 animate-fade-in">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <FaCoins className="w-5 h-5 sm:w-6 sm:h-6 text-[#dd6e53]" /> How to Earn Coins
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl">
              <FaCamera className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 text-[#dd6e53]" />
              <div className="font-semibold text-[#dd6e53] text-sm sm:text-base">+10 coins</div>
              <div className="text-xs text-gray-600">Upload Photo</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <FaCheckCircle className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 text-green-600" />
              <div className="font-semibold text-green-700 text-sm sm:text-base">+5 coins</div>
              <div className="text-xs text-gray-600">Visit a Place</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl">
              <FaTrophy className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 text-[#dd6e53]" />
              <div className="font-semibold text-orange-700 text-sm sm:text-base">+100 coins</div>
              <div className="text-xs text-gray-600">Complete Journey</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <FaStar className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold text-blue-700 text-sm sm:text-base">+20 coins</div>
              <div className="text-xs text-gray-600">Write Review</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 animate-fade-in-delayed">
          {['all', 'food', 'experience', 'souvenir'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 flex items-center gap-1.5 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
              }`}
            >
              {category === 'all' ? (
                <><FaGift className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> All</>
              ) : (
                <>{categoryIcons[category]} {category.charAt(0).toUpperCase() + category.slice(1)}</>
              )}
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {filteredRewards.map((reward, index) => (
            <div 
              key={reward.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-36 sm:h-40 overflow-hidden">
                <img
                  src={reward.image}
                  alt={reward.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r ${categoryColors[reward.category]} text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                  {categoryIcons[reward.category]} <span className="hidden sm:inline">{reward.category}</span>
                </div>
                
                {/* Coin Cost Badge */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1 shadow-lg">
                  <FaCoins className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{reward.coinCost}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4">
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-1 text-sm sm:text-base">{reward.name}</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{reward.description}</p>
                
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {reward.location}
                </div>
                
                {reward.originalPrice && (
                  <div className="text-xs text-gray-400 mb-2">
                    Original: <span className="line-through">{reward.originalPrice}</span>
                  </div>
                )}

                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={userCoins < reward.coinCost || isLoading}
                  className={`w-full py-2 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    userCoins >= reward.coinCost && !isLoading
                      ? 'bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white hover:from-[#c25a45] hover:to-[#c25a45] transform hover:scale-105 shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : userCoins >= reward.coinCost ? (
                    <><FaGift className="w-4 h-4" /> Redeem Now</>
                  ) : (
                    `Need ${reward.coinCost - userCoins} more coins`
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Chiang Mai Featured Places */}
        <div className="mt-8 sm:mt-10 animate-fade-in">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <FaMountain className="w-5 h-5 sm:w-6 sm:h-6 text-[#dd6e53]" /> Featured Places in Chiang Mai
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 overflow-hidden">
            <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-3 sm:pb-4 scrollbar-hide">
              {[
                { name: 'Doi Suthep', image: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Ho_Kum_Luang_%28I%29.jpg', tag: 'Temple' },
                { name: 'Old City', image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/0e/cd/b2/caption.jpg?w=900&h=500&s=1', tag: 'Culture' },
                { name: 'Nimman', image: 'https://res.cloudinary.com/pillarshotels/image/upload/f_auto/web/cms/resources/attractions/on-03-1500x1000-w1800h1360.jpeg', tag: 'Shopping' },
                { name: 'Ang Kaew', image: 'https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg', tag: 'Nature' },
              ].map((place, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 w-48 rounded-xl overflow-hidden shadow-md transform hover:scale-105 transition-transform duration-300"
                >
                  <div className="relative h-32">
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <div className="text-white font-medium text-sm">{place.name}</div>
                      <div className="text-white/80 text-xs">{place.tag}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Redemption Success Modal */}
      {showModal && redeemedReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-6 text-center animate-scale-in">
            <FaGift className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-[#dd6e53] animate-bounce-slow" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Congratulations!</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">You've redeemed: {redeemedReward.name}</p>
            
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Your discount code:</p>
              <div className="flex items-center justify-center gap-2 mb-3">
                <code className="bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-mono font-bold text-base sm:text-lg text-[#dd6e53] border-2 border-dashed border-orange-300">
                  {redeemedReward.discountCode}
                </code>
                <button
                  onClick={() => copyCode(redeemedReward.discountCode || '')}
                  className="p-2 bg-[#dd6e53] text-white rounded-lg hover:bg-[#c25a45] transition-colors"
                >
                  <FaCopy className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              {/* QR Code Section */}
              {redemptionData && (
                <div className="flex flex-col items-center justify-center bg-white p-3 rounded-lg border border-orange-200">
                  <QRCodeSVG 
                    value={redemptionData.qrCodeData || 'ERROR'} 
                    size={128}
                    level={"H"}
                    includeMargin={true}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Scan to verify</p>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mb-3 sm:mb-4">
              Valid until: {redeemedReward.validUntil}<br/>
              Location: {redeemedReward.location}
            </p>
            
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base hover:from-[#c25a45] hover:to-[#c25a45] transition-all flex items-center justify-center gap-2"
            >
              <FaCheckCircle className="w-4 h-4" /> Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoinRewardsPage;
