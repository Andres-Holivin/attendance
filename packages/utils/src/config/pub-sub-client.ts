import { PubSub } from "@google-cloud/pubsub";

export function createPubSubClient(projectId: string, keyFilename: string) {
    return new PubSub({
        projectId,
        keyFilename,
    });
}