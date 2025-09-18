import { PubSub } from "@google-cloud/pubsub";

export function createPubSubClient(projectId: string, credentialsPath?: string, credentialsBase64?: string) {
    if (credentialsBase64) {
        console.log('Using base64 encoded credentials for PubSub client');
        // Decode base64 credentials and parse as JSON
        const credentialsJson = Buffer.from(credentialsBase64, 'base64').toString('utf-8');
        const credentials = JSON.parse(credentialsJson);

        return new PubSub({
            projectId,
            credentials,
        });
    } else if (credentialsPath) {
        console.log('Using file-based credentials for PubSub client');
        // Use keyFilename for file-based credentials
        return new PubSub({
            projectId,
            keyFilename: credentialsPath,
        });
    } else {
        throw new Error('Either credentialsPath or credentialsBase64 must be provided');
    }
}