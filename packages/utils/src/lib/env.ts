import dotenv from "dotenv";
import { BeEnvValidationSchema } from "@workspace/validation/be-env";
import { z } from "zod";

dotenv.config({ override: true });

// Create a flexible environment validation function that services can use
function createEnvValidation<T extends z.ZodType>(schema: T): z.infer<T> {
    const _env = schema.safeParse(process.env);

    if (!_env.success) {
        console.error("❌ Invalid environment variables:");
        console.error(
            _env.error.issues
                .map((issue, idx: number) => `${idx + 1}) ${issue.path.join(".")} - ${issue.message}`)
                .join("\n")
        );
        process.exit(1); // Stop app if env invalid
    }

    return _env.data;
}


type EnvType = z.infer<typeof BeEnvValidationSchema>;

// Lazy environment validation - only validate when accessed
let _env: EnvType | null = null;
export const env = new Proxy({} as EnvType, {
    get(target, prop: keyof EnvType) {
        _env ??= createEnvValidation(BeEnvValidationSchema);
        return _env[prop];
    }
});