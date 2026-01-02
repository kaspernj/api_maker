export default class ApiMakerCableConnectionPool {
    static current(): any;
    cableSubscriptionPools: any[];
    connections: {};
    upcomingSubscriptionData: {};
    upcomingSubscriptions: {};
    connectEventToExistingSubscription({ path, subscription, value }: {
        path: any;
        subscription: any;
        value: any;
    }): boolean;
    connectModelEvent({ callback, path, value }: {
        callback: any;
        path: any;
        value: any;
    }): CableSubscription;
    connectCreated: (modelName: any, callback: any) => CableSubscription;
    connectEvent: (modelName: any, modelId: any, eventName: any, callback: any) => CableSubscription;
    connectDestroyed: (modelName: any, modelId: any, callback: any) => CableSubscription;
    connectModelClassEvent: (modelName: any, eventName: any, callback: any) => CableSubscription;
    connectUpdate: (modelName: any, modelId: any, callback: any) => CableSubscription;
    connectUpcoming: () => void;
    scheduleConnectUpcomingRunLast: RunLast;
}
import CableSubscription from "./cable-subscription.js";
import RunLast from "./run-last.js";
//# sourceMappingURL=cable-connection-pool.d.ts.map