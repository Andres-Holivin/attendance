import multer from 'multer';
import { Request } from 'express';

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

export const createUploadMiddleware = (fileSizeLimit = 5 * 1024 * 1024) => {
    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: fileSizeLimit, // Default 5MB limit
        },
    });
};

// Pre-configured middleware for common use cases
export const upload = createUploadMiddleware();

// Middleware for single file upload
export const uploadSingle = upload.single('profileImage');