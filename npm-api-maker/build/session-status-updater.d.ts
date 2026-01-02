export default class ApiMakerSessionStatusUpdater {
    static current(args: any): any;
    constructor(args?: {});
    events: {};
    timeout: any;
    useMetaElement: unknown;
    connectOnlineEvent(): void;
    connectWakeEvent(): void;
    getCsrfToken(): Promise<any>;
    csrfToken: any;
    sessionStatus(): Promise<any>;
    onSignedOut(callback: any): void;
    startTimeout(): void;
    updateTimeout: NodeJS.Timeout;
    stopTimeout(): void;
    updateSessionStatus: () => Promise<void>;
    updateMetaElementsFromResult(result: any): void;
    updateUserSessionsFromResult(result: any): void;
    updateUserSessionScopeFromResult(scopeName: any, scope: any): void;
}
//# sourceMappingURL=session-status-updater.d.ts.map