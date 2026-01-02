export default class ApiMakerCableSubscriptionPool {
    activeSubscriptions: number;
    connected: boolean;
    connect(subscriptionData: any): void;
    subscription: any;
    forEachSubscription(callback: any): void;
    isConnected: () => any;
    onConnected: () => void;
    onReceived: (rawData: any) => void;
    onSubscribed: () => void;
    onUnsubscribe(): void;
    registerSubscriptions(subscriptions: any): void;
    subscriptions: any;
    connectUnsubscriptionForSubscription(subscription: any): void;
}
//# sourceMappingURL=cable-subscription-pool.d.ts.map