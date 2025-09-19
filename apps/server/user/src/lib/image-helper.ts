
import { cloudinaryConfig } from '../config/cloudinary-config';

import { CloudinaryService } from '../config/cloudinary';

export async function handleImageUpload(file: Express.Multer.File, existingImageUrl?: string): Promise<string> {
    // Convert buffer to base64 data URL for Cloudinary
    const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Delete old image if exists
    if (existingImageUrl) {
        try {
            await handleImageDelete(existingImageUrl);
        } catch (deleteError) {
            console.log('Failed to delete old image:', deleteError);
            // Continue with upload even if delete fails
        }
    }  // Upload new image
    const uploadResult = await CloudinaryService.uploadImage(base64Data);
    return uploadResult.secure_url;
}

export async function handleImageDelete(imageUrl: string): Promise<void> {
    // Extract public_id from existing URL
    const urlParts = imageUrl.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    if (publicIdWithExtension) {
        const folderPath = cloudinaryConfig.folders.PROFILE_PHOTOS;
        const publicId = `${folderPath}/${publicIdWithExtension.split('.')[0]}`;
        await CloudinaryService.deleteFile(publicId);
    }
}