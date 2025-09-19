import { z } from "zod"

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    PORT: z.string().optional().default("3000"),


    NEXT_PUBLIC_USER_API_URL: z.string().min(1, 'User API URL is required'),
    NEXT_PUBLIC_ATTENDANCE_API_URL: z.string().min(1, 'Attendance API URL is required'),
    NEXT_PUBLIC_LOGGING_API_URL: z.string().min(1, 'Logging API URL is required'),

    // NEXT_PUBLIC_FIREBASE_VAPID_KEY: z.string().min(1, 'Firebase VAPID Key is required'),
});

export const validateEnvServer = async () => await envSchema.safeParseAsync(process.env);

// Extend ProcessEnv interface with environment variables schema
declare global {
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof envSchema> { }
    }
}