export default class ErrorLogger {
    debugging: boolean;
    errorOccurred: boolean;
    errors: any[];
    isHandlingError: boolean;
    sourceMapsLoader: SourceMapsLoader;
    debug(...output: any[]): void;
    enable(): void;
    getErrors: () => any[];
    hasErrorOccurred: () => any;
    isLoadingSourceMaps: () => any;
    isWorkingOnError: () => any;
    connectOnError(): void;
    connectUnhandledRejection(): void;
    onError(event: any): Promise<void>;
    onUnhandledRejection(event: any): Promise<void>;
    testPromiseError(): Promise<any>;
}
import SourceMapsLoader from "./source-maps-loader.js";
//# sourceMappingURL=error-logger.d.ts.map