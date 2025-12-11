import React from 'react';
import { FaSpa, FaUsers, FaMountain, FaSun, FaMoon, FaCalendarAlt, FaTimes, FaCheck, FaRoute } from 'react-icons/fa';
import { MdSelfImprovement, MdCelebration, MdExplore } from 'react-icons/md';

interface PersonalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (personality: string, duration: string) => void;
}

const PersonalityModal: React.FC<PersonalityModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [selectedPersonality, setSelectedPersonality] = React.useState<string>('');
  const [selectedDuration, setSelectedDuration] = React.useState<string>('');

  const personalities = [
    {
      id: 'introvert mode',
      name: 'Introvert Mode',
      description: 'Peaceful, less crowded places like temples and nature spots',
      icon: <MdSelfImprovement className="w-7 h-7 text-purple-500" />,
      bgColor: 'bg-purple-100'
    },
    {
      id: 'extrovert mode',
      name: 'Extrovert Mode', 
      description: 'Vibrant markets, social spots, and lively attractions',
      icon: <MdCelebration className="w-7 h-7 text-pink-500" />,
      bgColor: 'bg-pink-100'
    },
    {
      id: 'adventure mode',
      name: 'Adventure Mode',
      description: 'Exciting activities and outdoor experiences',
      icon: <MdExplore className="w-7 h-7 text-green-500" />,
      bgColor: 'bg-green-100'
    }
  ];

  const durations = [
    {
      id: '1 วัน ไม่ค้างคืน',
      name: '1 วัน ไม่ค้างคืน',
      description: 'Day trip - Maximum 3 destinations (randomly selected)',
      icon: <FaSun className="w-6 h-6 text-amber-500" />,
      bgColor: 'bg-amber-100'
    },
    {
      id: '2 วัน 1 คืน',
      name: '2 วัน 1 คืน', 
      description: 'Weekend getaway - Maximum 6 destinations (optimally selected)',
      icon: <FaMoon className="w-6 h-6 text-indigo-500" />,
      bgColor: 'bg-indigo-100'
    },
    {
      id: 'custom',
      name: 'Custom Duration',
      description: 'Flexible itinerary - All your saved places included',
      icon: <FaCalendarAlt className="w-6 h-6 text-teal-500" />,
      bgColor: 'bg-teal-100'
    }
  ];

  const handleConfirm = () => {
    if (selectedPersonality && selectedDuration) {
      onConfirm(selectedPersonality, selectedDuration);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-orange-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#dd6e53] to-[#c25a45] rounded-xl flex items-center justify-center">
                <FaRoute className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Plan Your Journey</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <FaTimes className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">Choose your travel personality and trip duration to get a personalized route</p>
        </div>

        <div className="p-6">
          {/* Personality Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Select Your Travel Personality</h3>
            <div className="grid grid-cols-1 gap-3">
              {personalities.map((personality) => (
                <button
                  key={personality.id}
                  onClick={() => setSelectedPersonality(personality.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:cursor-pointer hover:shadow-md ${
                    selectedPersonality === personality.id
                      ? 'border-[#dd6e53] bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${personality.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      {personality.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{personality.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{personality.description}</p>
                    </div>
                    {selectedPersonality === personality.id && (
                      <div className="ml-auto flex-shrink-0">
                        <div className="w-6 h-6 bg-[#dd6e53] rounded-full flex items-center justify-center">
                          <FaCheck className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Trip Duration</h3>
            <div className="grid grid-cols-1 gap-3">
              {durations.map((duration) => (
                <button
                  key={duration.id}
                  onClick={() => setSelectedDuration(duration.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:cursor-pointer hover:shadow-md ${
                    selectedDuration === duration.id
                      ? 'border-[#dd6e53] bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${duration.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      {duration.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{duration.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{duration.description}</p>
                    </div>
                    {selectedDuration === duration.id && (
                      <div className="ml-auto flex-shrink-0">
                        <div className="w-6 h-6 bg-[#dd6e53] rounded-full flex items-center justify-center">
                          <FaCheck className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedPersonality || !selectedDuration}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                selectedPersonality && selectedDuration
                  ? 'bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white hover:from-[#c25a45] hover:to-[#c25a45] transform hover:scale-105 shadow-lg'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create Route
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityModal;
