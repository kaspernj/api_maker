export default class ApiMakerCableSubscription {
    events: EventEmitter<string | symbol, any>;
    subscribed: boolean;
    unsubscribe(): void;
}
import { EventEmitter } from "eventemitter3";
//# sourceMappingURL=cable-subscription.d.ts.map