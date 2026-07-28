const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dughdt8sf';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'qubink_uploads';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('cloud_name', CLOUD_NAME);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed with status ${response.status}`);
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Image Upload Error:', error);
    throw error;
  }
};

export const uploadImageToCloudinary = uploadToCloudinary;
