import { createCloudinaryService } from '@workspace/utils';
import { cloudinaryConfig } from './cloudinary-config';

// Create and export the Cloudinary service instance
export const CloudinaryService = createCloudinaryService(cloudinaryConfig);

// Re-export types for convenience
export type { CloudinaryUploadResult } from '@workspace/utils';