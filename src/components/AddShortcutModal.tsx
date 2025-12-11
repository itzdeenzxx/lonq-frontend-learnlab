import React, { useState } from 'react';
import { FaHome, FaTimes, FaRocket, FaCheckCircle } from 'react-icons/fa';
import { MdAddToHomeScreen, MdMoreVert } from 'react-icons/md';
import { UserService } from '../services/firebaseService';

interface AddShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

const AddShortcutModal: React.FC<AddShortcutModalProps> = ({ isOpen, onClose, userId }) => {
  const [showSteps, setShowSteps] = useState(false);

  const handleShowSteps = () => {
    setShowSteps(true);
  };

  const handleDone = async () => {
    // Save to Firebase
    if (userId) {
      try {
        await UserService.setShortcutAdded(userId);
      } catch (error) {
        console.error('Error saving shortcut status:', error);
      }
    }
    onClose();
  };

  const handleSkip = () => {
    // Don't save to Firebase - allow modal to show again next time
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up">
        {/* Header with illustration */}
        <div className="bg-gradient-to-br from-[#dd6e53] to-[#c25a45] p-6 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <MdAddToHomeScreen className="w-10 h-10 text-[#dd6e53]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Add to Home Screen</h2>
            <p className="text-white/90 text-sm">Quick access to LonQ anytime!</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {showSteps ? (
            // Steps View
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 text-center">
                Follow these steps:
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">Tap the menu button</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MdMoreVert className="w-6 h-6 text-green-500" />
                      <span className="text-gray-500 text-xs">at the top right corner</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Tap "Add to Home Screen"</p>
                    <p className="text-gray-500 text-xs mt-1">or "Add shortcut"</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Tap "Add" to confirm</p>
                    <p className="text-gray-500 text-xs mt-1">Done! 🎉</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleDone}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 mt-4"
              >
                <FaCheckCircle className="w-5 h-5" />
                Done!
              </button>
            </div>
          ) : (
            // Initial View
            <>
              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                  <div className="w-10 h-10 bg-[#dd6e53] rounded-full flex items-center justify-center flex-shrink-0">
                    <FaHome className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">One-tap access</p>
                    <p className="text-gray-500 text-xs">Open LonQ instantly from your home screen</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                  <div className="w-10 h-10 bg-[#dd6e53] rounded-full flex items-center justify-center flex-shrink-0">
                    <FaRocket className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Faster loading</p>
                    <p className="text-gray-500 text-xs">No need to open LINE first</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleShowSteps}
                  className="w-full bg-gradient-to-r from-[#dd6e53] to-[#c25a45] text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:from-[#c25a45] hover:to-[#b04d3a] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <MdAddToHomeScreen className="w-6 h-6" />
                  Add Shortcut
                </button>
                
                <button
                  onClick={handleSkip}
                  className="w-full text-gray-500 py-3 px-6 rounded-2xl font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <FaTimes className="w-4 h-4" />
                  Maybe Later
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddShortcutModal;
