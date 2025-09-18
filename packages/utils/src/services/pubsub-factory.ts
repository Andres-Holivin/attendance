import { createPubSubClient, createPubSubService, env } from '../index';

/**
 * Creates a PubSub client instance using environment configuration
 * @returns PubSub client instance
 */
export const createDefaultPubSubClient = () => {
    return createPubSubClient(
        env.GOOGLE_PROJECT_ID,
        env.GOOGLE_PUB_SUB_CREDENTIALS_PATH,
        env.GOOGLE_PUB_SUB_CREDENTIALS_BASE64
    );
};

/**
 * Creates a PubSub service instance using default client configuration
 * @returns PubSub service instance
 */
export const createDefaultPubSubService = () => {
    const client = createDefaultPubSubClient();
    return createPubSubService(client);
};