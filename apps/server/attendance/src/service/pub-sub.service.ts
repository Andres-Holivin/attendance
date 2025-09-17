import { createDefaultPubSubService, PubSubTopics, PubSubSubscriptions } from '@workspace/utils';

// Create the service instance
export const PubsubService = createDefaultPubSubService();
export { PubSubTopics, PubSubSubscriptions };