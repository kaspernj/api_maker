// @ts-check
import config from "./config.js";
import CustomError from "./custom-error.js"; // eslint-disable-line sort-imports
import FormDataObjectizer from "form-data-objectizer";
import Logger from "./logger.js";
import qs from "qs";
import SessionStatusUpdater from "./session-status-updater.js"; // eslint-disable-line sort-imports
import urlEncode from "./url-encode.js";
const logger = new Logger({ name: "ApiMaker / Api" });
// logger.setDebug(true)
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
    static get = (path, pathParams = null) => Api.requestLocal({ path, pathParams, method: "GET" });
    /**
     * @param {string} path
     * @param {Record<string, any>|null} [pathParams]
     * @returns {Promise<any>}
     */
    static delete = (path, pathParams = null) => Api.requestLocal({ path, pathParams, method: "DELETE" });
    /**
     * @param {string} path
     * @param {Record<string, any>} [data]
     * @returns {Promise<any>}
     */
    static patch = (path, data = {}) => Api.requestLocal({ path, data, method: "PATCH" });
    /**
     * @param {string} path
     * @param {Record<string, any>} [data]
     * @returns {Promise<any>}
     */
    static post = (path, data = {}) => Api.requestLocal({ path, data, method: "POST" });
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
    static async request({ data, headers, method, path, pathParams }) {
        let requestPath = "";
        if (config.getHost())
            requestPath += config.getHost();
        requestPath += path;
        if (pathParams) {
            const pathParamsString = qs.stringify(pathParams, { arrayFormat: "brackets", encoder: urlEncode });
            requestPath += `?${pathParamsString}`;
        }
        const xhr = new XMLHttpRequest();
        xhr.open(method, requestPath, true);
        xhr.withCredentials = true;
        if (headers) {
            for (const headerName in headers) {
                xhr.setRequestHeader(headerName, headers[headerName]);
            }
        }
        const response = await Api.executeXhr(xhr, data);
        return response;
    }
    /**
     * Executes a prepared XMLHttpRequest and resolves/rejects based on status.
     *
     * @param {XMLHttpRequest} xhr
     * @param {any} data
     * @returns {Promise<any>}
     */
    static executeXhr(xhr, data) {
        return new Promise((resolve, reject) => {
            xhr.onload = () => {
                const response = this._parseResponse(xhr);
                if (xhr.status == 200) {
                    resolve(response);
                }
                else {
                    // @ts-ignore Allow extra xhr on error args
                    const customError = new CustomError(`Request failed with code: ${xhr.status}`, { response, xhr });
                    if (data instanceof FormData) {
                        // @ts-ignore Add custom debug payload
                        customError.peakflowParameters = FormDataObjectizer.toObject(data);
                    }
                    else {
                        // @ts-ignore Add custom debug payload
                        customError.peakflowParameters = data;
                    }
                    reject(customError);
                }
            };
            xhr.send(data);
        });
    }
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
    static async requestLocal(args) {
        let headers = {};
        if (args.headers) {
            headers = { ...args.headers };
        }
        const token = await this._token();
        logger.debug(() => `Got token: ${token}`);
        if (token) {
            headers["X-CSRF-Token"] = token;
        }
        if (args.data) {
            headers["Content-Type"] = "application/json";
            // @ts-ignore Allow string body despite data being typed as record
            args.data = JSON.stringify(args.data);
        }
        if (args.rawData) {
            args.data = args.rawData;
        }
        return this.request({ ...args, headers });
    }
    /**
     * @param {string} path
     * @param {Record<string, any>} [data]
     * @returns {Promise<any>}
     */
    static async put(path, data = {}) {
        return this.requestLocal({ path, data, method: "PUT" });
    }
    /**
     * @returns {Promise<string>}
     */
    static _token = async () => SessionStatusUpdater.current().getCsrfToken();
    /**
     * Parses the response body according to the response content-type.
     *
     * @param {XMLHttpRequest} xhr
     * @returns {any}
     */
    static _parseResponse(xhr) {
        const responseType = xhr.getResponseHeader("content-type");
        if (responseType && responseType.startsWith("application/json")) {
            return JSON.parse(xhr.responseText);
        }
        else {
            return xhr.responseText;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6Ii9zcmMvIiwic291cmNlcyI6WyJhcGkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWTtBQUVaLE9BQU8sTUFBTSxNQUFNLGFBQWEsQ0FBQTtBQUNoQyxPQUFPLFdBQVcsTUFBTSxtQkFBbUIsQ0FBQSxDQUFDLG1DQUFtQztBQUMvRSxPQUFPLGtCQUFrQixNQUFNLHNCQUFzQixDQUFBO0FBQ3JELE9BQU8sTUFBTSxNQUFNLGFBQWEsQ0FBQTtBQUNoQyxPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUE7QUFDbkIsT0FBTyxvQkFBb0IsTUFBTSw2QkFBNkIsQ0FBQSxDQUFDLG1DQUFtQztBQUNsRyxPQUFPLFNBQVMsTUFBTSxpQkFBaUIsQ0FBQTtBQUV2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBQyxDQUFDLENBQUE7QUFFbkQsd0JBQXdCO0FBRXhCOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxPQUFPLE9BQU8sR0FBRztJQUV0Qjs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQTtJQUU3Rjs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQTtJQUVuRzs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFB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SUFDSCxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssSUFBRyxFQUFFLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUE7SUFFeEU7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUc7UUFDdkIsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFBO1FBRTFELElBQUksWUFBWSxJQUFJLFlBQVksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDO1lBQ2hFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDckMsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLEdBQUcsQ0FBQyxZQUFZLENBQUE7UUFDekIsQ0FBQztJQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtY2hlY2tcblxuaW1wb3J0IGNvbmZpZyBmcm9tIFwiLi9jb25maWcuanNcIlxuaW1wb3J0IEN1c3RvbUVycm9yIGZyb20gXCIuL2N1c3RvbS1lcnJvci5qc1wiIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgc29ydC1pbXBvcnRzXG5pbXBvcnQgRm9ybURhdGFPYmplY3RpemVyIGZyb20gXCJmb3JtLWRhdGEtb2JqZWN0aXplclwiXG5pbXBvcnQgTG9nZ2VyIGZyb20gXCIuL2xvZ2dlci5qc1wiXG5pbXBvcnQgcXMgZnJvbSBcInFzXCJcbmltcG9ydCBTZXNzaW9uU3RhdHVzVXBkYXRlciBmcm9tIFwiLi9zZXNzaW9uLXN0YXR1cy11cGRhdGVyLmpzXCIgLy8gZXNsaW50LWRpc2FibGUtbGluZSBzb3J0LWltcG9ydHNcbmltcG9ydCB1cmxFbmNvZGUgZnJvbSBcIi4vdXJsLWVuY29kZS5qc1wiXG5cbmNvbnN0IGxvZ2dlciA9IG5ldyBMb2dnZXIoe25hbWU6IFwiQXBpTWFrZXIgLyBBcGlcIn0pXG5cbi8vIGxvZ2dlci5zZXREZWJ1Zyh0cnVlKVxuXG4vKipcbiAqIFRoaW4gWE1MSHR0cFJlcXVlc3Qgd3JhcHBlciB1c2VkIGFjcm9zcyB0aGUgY2xpZW50IHRvIHRhbGsgdG8gdGhlIEFQSS5cbiAqIFByb3ZpZGVzIGhlbHBlciB2ZXJicywgQ1NSRiB0b2tlbiBoYW5kbGluZyBhbmQgY29uc2lzdGVudCBlcnJvciBmb3JtYXR0aW5nLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcGkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBhZGRlZC1ibG9ja3NcblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fG51bGx9IFtwYXRoUGFyYW1zXVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICAgKi9cbiAgc3RhdGljIGdldCA9IChwYXRoLCBwYXRoUGFyYW1zID0gbnVsbCkgPT4gQXBpLnJlcXVlc3RMb2NhbCh7cGF0aCwgcGF0aFBhcmFtcywgbWV0aG9kOiBcIkdFVFwifSlcblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fG51bGx9IFtwYXRoUGFyYW1zXVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICAgKi9cbiAgc3RhdGljIGRlbGV0ZSA9IChwYXRoLCBwYXRoUGFyYW1zID0gbnVsbCkgPT4gQXBpLnJlcXVlc3RMb2NhbCh7cGF0aCwgcGF0aFBhcmFtcywgbWV0aG9kOiBcIkRFTEVURVwifSlcblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fSBbZGF0YV1cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICovXG4gIHN0YXRpYyBwYXRjaCA9IChwYXRoLCBkYXRhID0ge30pID0+IEFwaS5yZXF1ZXN0TG9jYWwoe3BhdGgsIGRhdGEsIG1ldGhvZDogXCJQQVRDSFwifSlcblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fSBbZGF0YV1cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICovXG4gIHN0YXRpYyBwb3N0ID0gKHBhdGgsIGRhdGEgPSB7fSkgPT4gQXBpLnJlcXVlc3RMb2NhbCh7cGF0aCwgZGF0YSwgbWV0aG9kOiBcIlBPU1RcIn0pXG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGEgbmV0d29yayByZXF1ZXN0IGFnYWluc3QgdGhlIGNvbmZpZ3VyZWQgaG9zdC5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGFyZ3NcbiAgICogQHBhcmFtIHthbnl9IFthcmdzLmRhdGFdXG4gICAqIEBwYXJhbSB7UmVjb3JkPHN0cmluZywgc3RyaW5nPn0gW2FyZ3MuaGVhZGVyc11cbiAgICogQHBhcmFtIHtcIkdFVFwifFwiUE9TVFwifFwiUEFUQ0hcInxcIlBVVFwifFwiREVMRVRFXCJ9IGFyZ3MubWV0aG9kXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcmdzLnBhdGhcbiAgICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fG51bGx9IFthcmdzLnBhdGhQYXJhbXNdXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gICAqL1xuICBzdGF0aWMgYXN5bmMgcmVxdWVzdCh7ZGF0YSwgaGVhZGVycywgbWV0aG9kLCBwYXRoLCBwYXRoUGFyYW1zfSkge1xuICAgIGxldCByZXF1ZXN0UGF0aCA9IFwiXCJcbiAgICBpZiAoY29uZmlnLmdldEhvc3QoKSkgcmVxdWVzdFBhdGggKz0gY29uZmlnLmdldEhvc3QoKVxuICAgIHJlcXVlc3RQYXRoICs9IHBhdGhcblxuICAgIGlmIChwYXRoUGFyYW1zKSB7XG4gICAgICBjb25zdCBwYXRoUGFyYW1zU3RyaW5nID0gcXMuc3RyaW5naWZ5KHBhdGhQYXJhbXMsIHthcnJheUZvcm1hdDogXCJicmFja2V0c1wiLCBlbmNvZGVyOiB1cmxFbmNvZGV9KVxuICAgICAgcmVxdWVzdFBhdGggKz0gYD8ke3BhdGhQYXJhbXNTdHJpbmd9YFxuICAgIH1cblxuICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICB4aHIub3BlbihtZXRob2QsIHJlcXVlc3RQYXRoLCB0cnVlKVxuICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlXG5cbiAgICBpZiAoaGVhZGVycykge1xuICAgICAgZm9yIChjb25zdCBoZWFkZXJOYW1lIGluIGhlYWRlcnMpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyTmFtZSwgaGVhZGVyc1toZWFkZXJOYW1lXSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IEFwaS5leGVjdXRlWGhyKHhociwgZGF0YSlcblxuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIGEgcHJlcGFyZWQgWE1MSHR0cFJlcXVlc3QgYW5kIHJlc29sdmVzL3JlamVjdHMgYmFzZWQgb24gc3RhdHVzLlxuICAgKlxuICAgKiBAcGFyYW0ge1hNTEh0dHBSZXF1ZXN0fSB4aHJcbiAgICogQHBhcmFtIHthbnl9IGRhdGFcbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICovXG4gIHN0YXRpYyBleGVjdXRlWGhyKHhociwgZGF0YSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IHRoaXMuX3BhcnNlUmVzcG9uc2UoeGhyKVxuXG4gICAgICAgIGlmICh4aHIuc3RhdHVzID09IDIwMCkge1xuICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gQHRzLWlnbm9yZSBBbGxvdyBleHRyYSB4aHIgb24gZXJyb3IgYXJnc1xuICAgICAgICAgIGNvbnN0IGN1c3RvbUVycm9yID0gbmV3IEN1c3RvbUVycm9yKGBSZXF1ZXN0IGZhaWxlZCB3aXRoIGNvZGU6ICR7eGhyLnN0YXR1c31gLCB7cmVzcG9uc2UsIHhocn0pXG5cbiAgICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEZvcm1EYXRhKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIEFkZCBjdXN0b20gZGVidWcgcGF5bG9hZFxuICAgICAgICAgICAgY3VzdG9tRXJyb3IucGVha2Zsb3dQYXJhbWV0ZXJzID0gRm9ybURhdGFPYmplY3RpemVyLnRvT2JqZWN0KGRhdGEpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgQWRkIGN1c3RvbSBkZWJ1ZyBwYXlsb2FkXG4gICAgICAgICAgICBjdXN0b21FcnJvci5wZWFrZmxvd1BhcmFtZXRlcnMgPSBkYXRhXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVqZWN0KGN1c3RvbUVycm9yKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHhoci5zZW5kKGRhdGEpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGRlZmF1bHQgaGVhZGVycyAoQ1NSRiArIEpTT04pIGFuZCBmb3J3YXJkcyB0byBgcmVxdWVzdGAuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzXG4gICAqIEBwYXJhbSB7UmVjb3JkPHN0cmluZywgYW55Pn0gW2FyZ3MuZGF0YV1cbiAgICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+fSBbYXJncy5oZWFkZXJzXVxuICAgKiBAcGFyYW0ge1wiR0VUXCJ8XCJQT1NUXCJ8XCJQQVRDSFwifFwiUFVUXCJ8XCJERUxFVEVcIn0gYXJncy5tZXRob2RcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFyZ3MucGF0aFxuICAgKiBAcGFyYW0ge1JlY29yZDxzdHJpbmcsIGFueT58bnVsbH0gW2FyZ3MucGF0aFBhcmFtc11cbiAgICogQHBhcmFtIHthbnl9IFthcmdzLnJhd0RhdGFdXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gICAqL1xuICBzdGF0aWMgYXN5bmMgcmVxdWVzdExvY2FsKGFyZ3MpIHtcbiAgICBsZXQgaGVhZGVycyA9IHt9XG5cbiAgICBpZiAoYXJncy5oZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzID0gey4uLmFyZ3MuaGVhZGVyc31cbiAgICB9XG5cbiAgICBjb25zdCB0b2tlbiA9IGF3YWl0IHRoaXMuX3Rva2VuKClcblxuICAgIGxvZ2dlci5kZWJ1ZygoKSA9PiBgR290IHRva2VuOiAke3Rva2VufWApXG5cbiAgICBpZiAodG9rZW4pIHtcbiAgICAgIGhlYWRlcnNbXCJYLUNTUkYtVG9rZW5cIl0gPSB0b2tlblxuICAgIH1cblxuICAgIGlmIChhcmdzLmRhdGEpIHtcbiAgICAgIGhlYWRlcnNbXCJDb250ZW50LVR5cGVcIl0gPSBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgLy8gQHRzLWlnbm9yZSBBbGxvdyBzdHJpbmcgYm9keSBkZXNwaXRlIGRhdGEgYmVpbmcgdHlwZWQgYXMgcmVjb3JkXG4gICAgICBhcmdzLmRhdGEgPSBKU09OLnN0cmluZ2lmeShhcmdzLmRhdGEpXG4gICAgfVxuXG4gICAgaWYgKGFyZ3MucmF3RGF0YSkge1xuICAgICAgYXJncy5kYXRhID0gYXJncy5yYXdEYXRhXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCh7Li4uYXJncywgaGVhZGVyc30pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fSBbZGF0YV1cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICovXG4gIHN0YXRpYyBhc3luYyBwdXQocGF0aCwgZGF0YSA9IHt9KSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdExvY2FsKHtwYXRoLCBkYXRhLCBtZXRob2Q6IFwiUFVUXCJ9KVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59XG4gICAqL1xuICBzdGF0aWMgX3Rva2VuID0gYXN5bmMoKSA9PiBTZXNzaW9uU3RhdHVzVXBkYXRlci5jdXJyZW50KCkuZ2V0Q3NyZlRva2VuKClcblxuICAvKipcbiAgICogUGFyc2VzIHRoZSByZXNwb25zZSBib2R5IGFjY29yZGluZyB0byB0aGUgcmVzcG9uc2UgY29udGVudC10eXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge1hNTEh0dHBSZXF1ZXN0fSB4aHJcbiAgICogQHJldHVybnMge2FueX1cbiAgICovXG4gIHN0YXRpYyBfcGFyc2VSZXNwb25zZSh4aHIpIHtcbiAgICBjb25zdCByZXNwb25zZVR5cGUgPSB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJjb250ZW50LXR5cGVcIilcblxuICAgIGlmIChyZXNwb25zZVR5cGUgJiYgcmVzcG9uc2VUeXBlLnN0YXJ0c1dpdGgoXCJhcHBsaWNhdGlvbi9qc29uXCIpKSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4geGhyLnJlc3BvbnNlVGV4dFxuICAgIH1cbiAgfVxufVxuIl19