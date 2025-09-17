import { PubSub } from "@google-cloud/pubsub";

export enum PubSubTopics {
    USER = 'user',
}

export enum PubSubSubscriptions {
    USER_SERVICE_SUBSCRIPTION = 'user-service-subscription',
}

export function createPubSubService(pubSubClient: PubSub) {
    return {
        publish: async (topicName: PubSubTopics, data: any): Promise<boolean> => {
            try {
                const message = JSON.stringify(data);
                const dataBuffer = Buffer.from(message);
                await pubSubClient.topic(topicName).publishMessage({ data: dataBuffer });
                return true;
            } catch (error) {
                console.error('Error publishing message:', error);
                throw error;
            }
        },
        subscribe: async (subscriptionName: PubSubSubscriptions, callback: (data: any) => void): Promise<void> => {
            try {
                const subscription = pubSubClient.subscription(subscriptionName);
                subscription.on('message', (message) => {
                    const data = JSON.parse(message.data.toString());
                    callback(data);
                    message.ack();
                });
                subscription.on('error', (error) => {
                    throw error;
                });
            } catch (error) {
                console.error('Error subscribing to topic:', error);
                throw error;
            }
        }
    };
}