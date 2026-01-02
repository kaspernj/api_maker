/**
 * Thin XMLHttpRequest wrapper used across the client to talk to the API.
 * Provides helper verbs, CSRF token handling and consistent error formatting.
 */
export default class Api {
    /**
     * @param {string} path
     * @param {Record<string, any>|null} [pathParams]
     * @returns {Promise<any>}
     */
    static get: (path: string, pathParams?: Record<string, any> | null) => Promise<any>;
    /**
     * @param {string} path
     * @param {Record<string, any>|null} [pathParams]
     * @returns {Promise<any>}
     */
    static delete: (path: string, pathParams?: Record<string, any> | null) => Promise<any>;
    /**
     * @param {string} path
     * @param {Record<string, any>} [data]
     * @returns {Promise<any>}
     */
    static patch: (path: string, data?: Record<string, any>) => Promise<any>;
    /**
     * @param {string} path
     * @param {Record<string, any>} [data]
     * @returns {Promise<any>}
     */
    static post: (path: string, data?: Record<string, any>) => Promise<any>;
    /**
     * Performs a network request against the configured host.
     *
     * @param {object} args
     * @param {any} [args.data]
     * @param {Record<string, string>} [args.headers]
     * @param {"GET"|"POST"|"PATCH"|"PUT"|"DELETE"} args.method
     * @param {string} args.path
     * @param {Record<string, any>|null} [args.pathParams]
     * @returns {Promise<any>}
     */
    static request({ data, headers, method, path, pathParams }: {
        data?: any;
        headers?: Record<string, string>;
        method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
        path: string;
        pathParams?: Record<string, any> | null;
    }): Promise<any>;
    /**
     * Executes a prepared XMLHttpRequest and resolves/rejects based on status.
     *
     * @param {XMLHttpRequest} xhr
     * @param {any} data
     * @returns {Promise<any>}
     */
    static executeXhr(xhr: XMLHttpRequest, data: any): Promise<any>;
    /**
     * Adds default headers (CSRF + JSON) and forwards to `request`.
     *
     * @param {object} args
     * @param {Record<string, any>} [args.data]
     * @param {Record<string, string>} [args.headers]
     * @param {"GET"|"POST"|"PATCH"|"PUT"|"DELETE"} args.method
     * @param {string} args.path
     * @param {Record<string, any>|null} [args.pathParams]
     * @param {any} [args.rawData]
     * @returns {Promise<any>}
     */
    static requestLocal(args: {
        data?: Record<string, any>;
        headers?: Record<string, string>;
        method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
        path: string;
        pathParams?: Record<string, any> | null;
        rawData?: any;
    }): Promise<any>;
    /**
     * @param {string} path
     * @param {Record<string, any>} [data]
     * @returns {Promise<any>}
     */
    static put(path: string, data?: Record<string, any>): Promise<any>;
    /**
     * @returns {Promise<string>}
     */
    static _token: () => Promise<string>;
    /**
     * Parses the response body according to the response content-type.
     *
     * @param {XMLHttpRequest} xhr
     * @returns {any}
     */
    static _parseResponse(xhr: XMLHttpRequest): any;
}
//# sourceMappingURL=api.d.ts.map