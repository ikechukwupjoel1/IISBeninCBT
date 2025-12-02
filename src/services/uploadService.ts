import { supabase } from './supabaseClient';

/**
 * Upload Service
 * Handles file uploads to Supabase Storage
 */

export interface UploadResult {
    url: string;
    path: string;
    error?: string;
}

export const uploadService = {
    /**
     * Upload an image file to Supabase Storage
     * @param file - The file to upload
     * @param folder - The folder path (e.g., 'questions', 'options')
     * @param fileName - Optional custom file name
     * @returns Upload result with public URL
     */
    async uploadImage(
        file: File,
        folder: 'questions' | 'options',
        fileName?: string
    ): Promise<UploadResult> {
        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                return { url: '', path: '', error: 'File must be an image' };
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                return { url: '', path: '', error: 'File size must be less than 5MB' };
            }

            // Generate unique file name
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(7);
            const extension = file.name.split('.').pop();
            const finalFileName = fileName || `${timestamp}-${randomString}.${extension}`;

            // Create file path
            const filePath = `${folder}/${finalFileName}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('exam-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Upload error:', error);
                return { url: '', path: '', error: error.message };
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('exam-images')
                .getPublicUrl(filePath);

            return {
                url: publicUrl,
                path: filePath,
            };
        } catch (error: any) {
            console.error('Upload service error:', error);
            return { url: '', path: '', error: error.message };
        }
    },

    /**
     * Delete an image from Supabase Storage
     * @param path - The file path to delete
     */
    async deleteImage(path: string): Promise<{ error?: string }> {
        try {
            const { error } = await supabase.storage
                .from('exam-images')
                .remove([path]);

            if (error) {
                console.error('Delete error:', error);
                return { error: error.message };
            }

            return {};
        } catch (error: any) {
            console.error('Delete service error:', error);
            return { error: error.message };
        }
    },

    /**
     * Upload multiple images
     * @param files - Array of files to upload
     * @param folder - The folder path
     */
    async uploadMultiple(
        files: File[],
        folder: 'questions' | 'options'
    ): Promise<UploadResult[]> {
        const results = await Promise.all(
            files.map(file => this.uploadImage(file, folder))
        );
        return results;
    },

    /**
     * Get the public URL for an existing file
     * @param path - The file path
     */
    getPublicUrl(path: string): string {
        const { data: { publicUrl } } = supabase.storage
            .from('exam-images')
            .getPublicUrl(path);
        return publicUrl;
    }
};
