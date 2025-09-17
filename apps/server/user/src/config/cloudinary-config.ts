// Re-export from utils package
export {
    createCloudinaryConfig,
    createCloudinaryService,
    type CloudinaryConfig,
    type CloudinaryUploadResult
} from '@workspace/utils';

import { createCloudinaryConfig, env } from '@workspace/utils';

// Create the Cloudinary configuration for the user service
export const cloudinaryConfig = createCloudinaryConfig(
    env.CLOUDINARY_CLOUD_NAME,
    env.CLOUDINARY_API_KEY,
    env.CLOUDINARY_API_SECRET,
    {
        PROFILE_PHOTOS: env.CLOUDINARY_UPLOAD_FOLDER,
        DOCUMENTS: env.CLOUDINARY_DOCUMENTS_FOLDER,
        AVATARS: env.CLOUDINARY_AVATARS_FOLDER,
    }
);