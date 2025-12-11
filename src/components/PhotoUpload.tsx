import React, { useState, useRef } from 'react';
import { ReviewService } from '../services/firebaseService';
import { useLiff } from '../hooks/useLiff';

interface PhotoUploadProps {
  placeId: string;
  placeName: string;
  onPhotosUploaded: (photos: string[]) => void;
  maxPhotos?: number;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  placeId,
  placeName, 
  onPhotosUploaded, 
  maxPhotos = 3 
}) => {
  const { userId, displayName, pictureUrl } = useLiff();
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !userId) return;

    const remainingSlots = maxPhotos - uploadedPhotos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    setIsUploading(true);

    try {
      const uploadPromises = filesToProcess.map(async (file) => {
        // Upload to Firebase and create review
        const photoUrl = await ReviewService.addReview(
          userId,
          placeId,
          reviewText || `Visited ${placeName}`,
          file,
          displayName || 'Anonymous',
          pictureUrl || ''
        );
        return photoUrl;
      });

      const newPhotoUrls = await Promise.all(uploadPromises);
      const newPhotos = [...uploadedPhotos, ...newPhotoUrls];
      setUploadedPhotos(newPhotos);
      onPhotosUploaded(newPhotos);
      setReviewText(''); // Clear review text after upload
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
    setUploadedPhotos(newPhotos);
    onPhotosUploaded(newPhotos);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-[#dd6e53]/30 relative z-[100]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#dd6e53]">
            📸 Review & Earn Coins
          </h3>
          <p className="text-sm text-[#dd6e53]/70">{placeName}</p>
        </div>
        <div className="text-sm text-gray-500">
          {uploadedPhotos.length}/{maxPhotos} photos
        </div>
      </div>

      {/* Review Text Input */}
      <div className="mb-4">
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write a review before uploading a photo..."
          className="w-full p-3 border border-[#dd6e53]/30 rounded-lg focus:ring-2 focus:ring-[#dd6e53] focus:border-transparent text-sm relative z-[101]"
          rows={2}
        />
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {uploadedPhotos.map((photo, index) => (
          <div key={index} className="relative group">
            <img 
              src={photo} 
              alt={`Photo ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg border-2 border-[#dd6e53]/30"
            />
            <button
              onClick={() => removePhoto(index)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity z-[102]"
            >
              ×
            </button>
          </div>
        ))}
        
        {/* Upload Slot */}
        {uploadedPhotos.length < maxPhotos && (
          <button
            onClick={() => {
              if (!reviewText.trim()) {
                alert("Please write a review first!");
                return;
              }
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
            className="w-full h-24 border-2 border-dashed border-[#dd6e53]/50 rounded-lg flex flex-col items-center justify-center text-[#dd6e53] hover:border-[#dd6e53] hover:bg-[#faf5f3] transition-all duration-200 disabled:opacity-50 relative z-[101]"
          >
            {isUploading ? (
              <div className="animate-spin w-6 h-6 border-2 border-[#dd6e53] border-t-transparent rounded-full"></div>
            ) : (
              <>
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs">Add Photo & Review</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        className="hidden"
      />
      
      <p className="text-xs text-gray-500 text-center mt-2">
        Upload a photo and write a review to earn 50 coins!
      </p>
    </div>
  );
};

export default PhotoUpload;
