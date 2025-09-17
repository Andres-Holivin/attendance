import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryConfig {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    folders: {
        PROFILE_PHOTOS: string;
        DOCUMENTS: string;
        AVATARS: string;
    };
}

export interface CloudinaryUploadResult {
    public_id: string;
    version: number;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    tags: string[];
    bytes: number;
    type: string;
    etag: string;
    placeholder: boolean;
    url: string;
    secure_url: string;
    folder?: string;
    access_mode: string;
    original_filename: string;
}

export function createCloudinaryConfig(
    cloudName: string,
    apiKey: string,
    apiSecret: string,
    folders: { PROFILE_PHOTOS: string; DOCUMENTS: string; AVATARS: string }
): CloudinaryConfig {
    return {
        cloudName,
        apiKey,
        apiSecret,
        folders,
    };
}

export function createCloudinaryService(config: CloudinaryConfig) {
    // Configure Cloudinary
    cloudinary.config({
        cloud_name: config.cloudName,
        api_key: config.apiKey,
        api_secret: config.apiSecret,
    });

    return {
        /**
         * Upload image to Cloudinary
         * @param file - Buffer or file path
         * @param folder - Folder to upload to (optional, defaults to profile photos folder)
         * @returns Promise with upload result
         */
        async uploadImage(
            file: Buffer | string,
            folder = config.folders.PROFILE_PHOTOS
        ): Promise<CloudinaryUploadResult> {
            try {
                const result = await cloudinary.uploader.upload(file as string, {
                    folder,
                    resource_type: 'image',
                    transformation: [
                        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
                        { quality: 'auto:good' },
                        { format: 'jpg' }
                    ]
                });
                return result as CloudinaryUploadResult;
            } catch (error) {
                console.error('Error uploading image to Cloudinary:', error);
                throw new Error('Failed to upload image');
            }
        },

        /**
         * Upload document to Cloudinary
         * @param file - Buffer or file path
         * @param folder - Folder to upload to (optional, defaults to documents folder)
         * @returns Promise with upload result
         */
        async uploadDocument(
            file: Buffer | string,
            folder = config.folders.DOCUMENTS
        ): Promise<CloudinaryUploadResult> {
            try {
                const result = await cloudinary.uploader.upload(file as string, {
                    folder,
                    resource_type: 'auto'
                });
                return result as CloudinaryUploadResult;
            } catch (error) {
                console.error('Error uploading document to Cloudinary:', error);
                throw new Error('Failed to upload document');
            }
        },

        /**
         * Delete file from Cloudinary
         * @param publicId - Public ID of the file to delete
         * @returns Promise with deletion result
         */
        async deleteFile(publicId: string): Promise<any> {
            try {
                const result = await cloudinary.uploader.destroy(publicId);
                return result;
            } catch (error) {
                console.error('Error deleting file from Cloudinary:', error);
                throw new Error('Failed to delete file');
            }
        },

        /**
         * Get folder path for specific upload type
         * @param folderType - Type of folder to get path for
         * @returns Folder path string
         */
        getFolder(folderType: keyof CloudinaryConfig['folders']): string {
            return config.folders[folderType];
        }
    };
}