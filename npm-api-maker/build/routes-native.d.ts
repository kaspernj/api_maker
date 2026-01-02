export default class ApiMakerRoutesNative {
    constructor({ getLocale }: {
        getLocale: any;
    });
    getLocale: any;
    routeDefinitions: any[];
    routeTranslationParts: {};
    loadRouteDefinitions(routeDefinitions: any, routeDefinitionArgs: any): void;
    loadRouteTranslations(i18n: any): void;
    i18n: any;
    translateRoute({ args, localizedRoutes, pathParts, url }: {
        args: any;
        localizedRoutes: any;
        pathParts: any;
        url: any;
    }): any;
    addHostToRoute({ host, port, protocol, translatedRoute }: {
        host: any;
        port: any;
        protocol: any;
        translatedRoute: any;
    }): string;
}
//# sourceMappingURL=routes-native.d.ts.map