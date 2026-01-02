export default class ApiMakerCommandSubmitData {
    /**
     * @param {object} data
     * @param {Record<string, any>} [data.global]
     * @param {import("./commands-pool.js").PoolDataType} data.pool
     */
    constructor(data: {
        global?: Record<string, any>;
        pool: import("./commands-pool.js").PoolDataType;
    });
    data: {
        global?: Record<string, any>;
        pool: import("./commands-pool.js").PoolDataType;
    };
    filesCount: number;
    jsonData: Record<any, any>;
    /** @returns {number} */
    getFilesCount: () => number;
    /** @returns {Record<string, object>} */
    getJsonData: () => Record<string, object>;
    getRawData(): Record<any, any>;
    rawData: Record<any, any>;
    getFormData(): any;
    /**
     * @param {any} value
     * @param {string} type
     * @returns
     */
    convertDynamic(value: any, type: string): any;
    /**
     * @param {any} object
     * @param {string} type
     * @returns {boolean}
     */
    shouldSkip(object: any, type: string): boolean;
    /**
     * @param {any} value
     * @returns {boolean}
     */
    isObject(value: any): boolean;
    /**
     * @param {Array<any>} array
     * @param {string} type
     * @returns {Array<any>}
     */
    traverseArray(array: Array<any>, type: string): Array<any>;
    /**
     * @param {Record<any, any>} object
     * @param {string} type
     * @returns {Record<any, any>}
     */
    traverseObject(object: Record<any, any>, type: string): Record<any, any>;
}
//# sourceMappingURL=command-submit-data.d.ts.map