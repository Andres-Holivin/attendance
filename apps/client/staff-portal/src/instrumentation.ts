import { validateEnvServer } from "./lib/env";
import { $ZodIssue } from "zod/v4/core";

// Construct error messages from Zod issues
const constructEnvErrorMessages = (errors: $ZodIssue[]): string[] => {
    return errors.map((error, idx) => {
        return `${idx + 1}) ${error.path.join('.')} : ${error.message}`;
    });
};

// Register and validate environment variables at startup
export async function register() {
    const envValidationResult = await validateEnvServer();

    if (envValidationResult.error) {
        const errorMessages = constructEnvErrorMessages(envValidationResult.error.issues);
        throw new Error(
            `\n\n❌ Error in loading environment variables:\n${errorMessages.join('\n')}\n`
        );
    }

    console.info('✅ Environment variables loaded successfully');
}