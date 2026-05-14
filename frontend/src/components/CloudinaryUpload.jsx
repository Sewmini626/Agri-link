import React, { useState } from 'react';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config/cloudinary';

const CloudinaryUpload = ({ onUploadSuccess, initialImages = [] }) => {
    const [images, setImages] = useState(initialImages || []);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);

        if (files.length + images.length > 5) {
            setError('You can only upload a maximum of 5 images.');
            return;
        }

        setUploading(true);
        setError('');

        const uploadedUrls = [];

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                uploadedUrls.push(data.secure_url);
            }

            const newImages = [...images, ...uploadedUrls];
            setImages(newImages);
            onUploadSuccess(newImages); // Layout component handles state
            setUploading(false);

        } catch (err) {
            console.error("Upload Error:", err);
            setError('Failed to upload images. Please check your configuration.');
            setUploading(false);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        const updatedImages = images.filter((_, index) => index !== indexToRemove);
        setImages(updatedImages);
        onUploadSuccess(updatedImages);
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Product Images (Max 5)</label>

            <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 5 files)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} disabled={uploading || images.length >= 5} />
                </label>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {uploading && <p className="text-blue-500 text-sm">Uploading...</p>}

            <div className="grid grid-cols-5 gap-4 mt-4">
                {images.map((url, index) => (
                    <div key={index} className="relative group">
                        <img src={url} alt={`Uploaded ${index}`} className="h-20 w-20 object-cover rounded shadow-md" />
                        <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CloudinaryUpload;
