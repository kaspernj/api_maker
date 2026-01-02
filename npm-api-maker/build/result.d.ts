export default class ApiMakerResult {
    /**
     * @param {object} data
     * @param {import("./collection.js").default} data.collection
     * @param {object} data.response
     */
    constructor(data: {
        collection: import("./collection.js").default<any>;
        response: object;
    });
    data: {
        collection: import("./collection.js").default<any>;
        response: object;
    };
    /** @returns {number} */
    count(): number;
    /** @returns {number} */
    currentPage(): number;
    /** @returns {Array<import("./base-model.js").default>} */
    models(): Array<import("./base-model.js").default>;
    /** @returns {typeof import("./base-model.js").default} */
    modelClass(): typeof import("./base-model.js").default;
    /** @returns {number} */
    perPage(): number;
    /** @returns {number} */
    totalCount(): number;
    /** @returns {number} */
    totalPages(): number;
}
//# sourceMappingURL=result.d.ts.map