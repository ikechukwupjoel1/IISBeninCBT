import React, { useState, useRef } from 'react';
import { Button } from './UI';
import { Icons } from './Icons';
import { uploadService } from '../../services/uploadService';

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    folder: 'questions' | 'options';
    currentImageUrl?: string;
    label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    onUploadComplete,
    folder,
    currentImageUrl,
    label = 'Upload Image'
}) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload file
        setUploading(true);
        setError(null);

        const result = await uploadService.uploadImage(file, folder);

        setUploading(false);

        if (result.error) {
            setError(result.error);
            setPreview(null);
        } else {
            onUploadComplete(result.url);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onUploadComplete('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">{label}</label>

            {preview ? (
                <div className="relative inline-block">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-slate-200"
                    />
                    <button
                        onClick={handleRemove}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        type="button"
                    >
                        <Icons.X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-brand-500 transition-colors"
                >
                    <Icons.Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                    <p className="text-sm text-slate-600 mb-1">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">
                        PNG, JPG, GIF up to 5MB
                    </p>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {uploading && (
                <div className="flex items-center gap-2 text-sm text-brand-600">
                    <Icons.Spinner className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                    <Icons.ExclamationTriangle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};
