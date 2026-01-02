export default class Params {
    /** @returns {Record<string, any>} */
    static parse(): Record<string, any>;
    /**
     * @param {object} given
     * @returns {object}
     */
    static change(given: object): object;
    /**
     * @param {Record<string, any>} params
     * @returns {string}
     */
    static withParams(params: Record<string, any>): string;
    /**
     * @param {Record<string, any>} given
     * @param {{appHistory?: any}} opts
     */
    static changeParams(given: Record<string, any>, opts?: {
        appHistory?: any;
    }): void;
    /**
     * @param {HTMLFormElement} form
     * @returns {Record<string, any>}
     */
    static serializeForm(form: HTMLFormElement): Record<string, any>;
    /**
     * This is used to set all empty values to 'undefined' which makes qs removed those elements from the query string
     * @param {Record<string, any>} given
     * @returns {Record<string, any>}
     */
    static setUndefined(given: Record<string, any>): Record<string, any>;
}
//# sourceMappingURL=params.d.ts.map