import { z } from "zod";
export const BeEnvValidationSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().min(1, "PORT is required").transform((val) => parseInt(val, 10)),

    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    SESSION_NAME: z.string().min(1, "SESSION_NAME is required"),
    SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),


    ALLOWED_ORIGINS: z.string().min(1, "ALLOWED_ORIGINS is required").transform((val) => val.split(',')),

    // Service URLs
    USER_SERVICE_URL: z.string().default("http://localhost:3001"),

    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
    CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
    CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),

    // Cloudinary Upload Folders
    CLOUDINARY_UPLOAD_FOLDER: z.string().default("attendance/profile-photos"),
    CLOUDINARY_DOCUMENTS_FOLDER: z.string().default("attendance/documents"),
    CLOUDINARY_AVATARS_FOLDER: z.string().default("attendance/avatars"),

    GOOGLE_PROJECT_ID: z.string().min(1, "GOOGLE_PROJECT_ID is required"),
    // Google Cloud Service Account Credentials - use either path or base64 encoded JSON
    GOOGLE_PUB_SUB_CREDENTIALS_PATH: z.string().optional(),
    GOOGLE_PUB_SUB_CREDENTIALS_BASE64: z.string().optional(),

    AUTH_RATE_LIMIT: z.coerce.number().default(1000),
    API_RATE_LIMIT: z.coerce.number().default(1000),
}).refine(
    (data) => data.GOOGLE_PUB_SUB_CREDENTIALS_PATH || data.GOOGLE_PUB_SUB_CREDENTIALS_BASE64,
    {
        message: "Either GOOGLE_PUB_SUB_CREDENTIALS_PATH or GOOGLE_PUB_SUB_CREDENTIALS_BASE64 must be provided",
        path: ["GOOGLE_PUB_SUB_CREDENTIALS_PATH"],
    }
)