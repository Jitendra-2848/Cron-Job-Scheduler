import React, { useState } from 'react';
import { UploadCloud, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  defaultImageUrl?: string;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadSuccess,
  defaultImageUrl = '',
  label = 'Upload Image to Cloudinary'
}) => {
  const [imageUrl, setImageUrl] = useState<string>(defaultImageUrl);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setImageUrl(url);
      onUploadSuccess(url);
      toast.success('Image uploaded to Cloudinary successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to upload image to Cloudinary');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}

      <div className="flex items-center gap-4">
        {/* Preview thumbnail */}
        <div className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 relative">
          {imageUrl ? (
            <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-400" />
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer">
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4 text-emerald-500" />
              <span>{imageUrl ? 'Change Image' : 'Select Image'}</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {imageUrl && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{imageUrl}</span>
        </div>
      )}
    </div>
  );
};
