export default class ApiMakerPreloaded {
    /**
     * @param {Record<string, Record<string, Record<string, Record<string, any>>>>} response
     */
    constructor(response: Record<string, Record<string, Record<string, Record<string, any>>>>);
    response: Record<string, Record<string, Record<string, Record<string, any>>>>;
    /** @returns {void} */
    loadPreloadedModels(): void;
    preloaded: {};
    /** @returns {import("./base-model.js").default} */
    getModel(type: any, id: any): import("./base-model.js").default;
}
//# sourceMappingURL=preloaded.d.ts.map