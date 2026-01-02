export default class RunLast {
    constructor(callback: any);
    callback: any;
    queue(): void;
    flushTriggerCount: number;
    flushTrigger: () => void;
    flushTriggerQueue(): void;
    flushTimeout: NodeJS.Timeout;
    clearTimeout(): void;
    run(): void;
}
//# sourceMappingURL=run-last.d.ts.map