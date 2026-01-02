export default class KeyValueStore {
    static current(): any;
    static get(key: any): any;
    static set(key: any, value: any): any;
    static getCachedParams(paramName: any, args?: {}): Promise<any>;
    static setCachedParams(paramName: any, qParams: any): any;
    database: any;
    get(key: any): Promise<any>;
    set(key: any, value: any): Promise<boolean>;
}
//# sourceMappingURL=key-value-store.d.ts.map