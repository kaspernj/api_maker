export default class ApiMakerDevise {
    static callSignOutEvent(args: any): void;
    /** @returns {ApiMakerDevise} */
    static current(): ApiMakerDevise;
    static events(): any;
    static addUserScope(scope: any, args?: {}): void;
    static getScope(scope: any): any;
    static signIn(username: any, password: any, args?: {}): Promise<{
        model: any;
        response: any;
    }>;
    static updateSession(model: any, args?: {}): void;
    static setSignedOut(args: any): void;
    static signOut(args?: {}): Promise<any>;
    hasCurrentScope(scope: any): boolean;
    currents: {};
    getCurrentScope(scope: any): any;
    hasGlobalCurrentScope(scope: any): boolean;
    loadCurrentScope(scope: any): any;
}
//# sourceMappingURL=devise.d.ts.map