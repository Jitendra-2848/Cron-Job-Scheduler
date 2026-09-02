/**
 * Frontend Cloudinary Image Upload Utility
 * Uploads image file directly from the browser to Cloudinary Unsigned Upload Preset.
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || cloudName === 'your_cloud_name') {
    throw new Error('Cloudinary Cloud Name is missing. Please set VITE_CLOUDINARY_CLOUD_NAME in client/.env');
  }

  if (!uploadPreset || uploadPreset === 'your_upload_preset') {
    throw new Error('Cloudinary Upload Preset is missing. Please set VITE_CLOUDINARY_UPLOAD_PRESET in client/.env');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to upload image to Cloudinary');
  }

  return data.secure_url;
}
