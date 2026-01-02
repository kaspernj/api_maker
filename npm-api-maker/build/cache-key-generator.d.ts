export default class CacheKeyGenerator {
    constructor(model: any);
    model: any;
    allModels: any[];
    readModels: {};
    filledModels: boolean;
    local(): any;
    recordModelType(relationshipType: any): void;
    recordModel(relationshipType: any, model: any): void;
    isModelRecorded(relationshipType: any, model: any): boolean;
    fillModels(model: any): void;
    cacheKey(): any;
    feedModel(model: any, md5: any): void;
}
//# sourceMappingURL=cache-key-generator.d.ts.map