export default apiMakerConfig;
declare const apiMakerConfig: ApiMakerConfig;
declare class ApiMakerConfig {
    global: any;
    events: EventEmitter<string | symbol, any>;
    getEvents(): EventEmitter<string | symbol, any>;
    /** @returns {import("history").BrowserHistory} */
    getHistory(): import("history").BrowserHistory;
    /** @returns {string} */
    getHost(): string;
}
import { EventEmitter } from "eventemitter3";
//# sourceMappingURL=config.d.ts.map