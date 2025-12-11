import React, { useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import type { TravelPlace } from '../types/TravelPlace';

interface PlaceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  likedPlaces: TravelPlace[];
  onConfirm: (selectedPlaces: TravelPlace[]) => void;
}

const PlaceSelectionModal: React.FC<PlaceSelectionModalProps> = ({ isOpen, onClose, likedPlaces, onConfirm }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleConfirm = () => {
    const selected = likedPlaces.filter(p => selectedIds.has(p.id));
    onConfirm(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-6 bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] text-white">
          <h2 className="text-2xl font-bold">Select Destinations</h2>
          <p className="text-orange-100 text-sm mt-1">Choose where you want to go</p>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {likedPlaces.map(place => (
            <div 
              key={place.id}
              onClick={() => toggleSelection(place.id)}
              className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selectedIds.has(place.id) 
                  ? 'border-[#dd6e53] bg-orange-50' 
                  : 'border-gray-100 hover:border-orange-200'
              }`}
            >
              <img src={place.image} alt={place.name} className="w-16 h-16 rounded-lg object-cover" />
              <div className="ml-3 flex-1">
                <h3 className="font-bold text-gray-800">{place.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-1">{place.description}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedIds.has(place.id)
                  ? 'bg-[#dd6e53] border-[#dd6e53]'
                  : 'border-gray-300'
              }`}>
                {selectedIds.has(place.id) && <FaCheck className="text-white text-xs" />}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white shadow-lg transition-all ${
              selectedIds.size > 0
                ? 'bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] hover:from-[#c25a45] hover:to-orange-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Next ({selectedIds.size})
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceSelectionModal;
