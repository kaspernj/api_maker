export default class SourceMapsLoader {
    isLoadingSourceMaps: boolean;
    sourceMaps: any[];
    srcLoaded: {};
    loadSourceMapsForScriptTags(callback: any): void;
    loadSourceMapsForScriptTagsCallback: any;
    sourceMapForSource(callback: any): void;
    sourceMapForSourceCallback: any;
    loadSourceMaps(error: any): Promise<void>;
    getSources(error: any): any;
    getSourcesFromError(error: any): {
        originalUrl: any;
        sourceMapUrl: any;
    }[];
    getSourcesFromScripts(): {
        originalUrl: any;
        sourceMapUrl: any;
    }[];
    getMapURL({ script, src }: {
        script: any;
        src: any;
    }): any;
    includeMapURL: (src: any) => any;
    loadSourceMapForSource({ originalUrl, sourceMapUrl }: {
        originalUrl: any;
        sourceMapUrl: any;
    }): Promise<void>;
    loadUrl(url: any): HTMLAnchorElement;
    loadXhr(xhr: any, url: any): Promise<any>;
    parseStackTrace(stackTrace: any): string[];
    getStackTraceData(stackTrace: any): {
        filePath: any;
        fileString: string;
        methodName: any;
    }[];
}
//# sourceMappingURL=source-maps-loader.d.ts.map