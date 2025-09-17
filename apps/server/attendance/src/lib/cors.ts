
import { createCorsOptions, env } from '@workspace/utils';

export const corsOptions = createCorsOptions(env.ALLOWED_ORIGINS);