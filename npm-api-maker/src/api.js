// @ts-check

import config from "./config.js"
import CustomError from "./custom-error.js" // eslint-disable-line sort-imports
import FormDataObjectizer from "form-data-objectizer"
import Logger from "./logger.js"
import qs from "qs"
import SessionStatusUpdater from "./session-status-updater.js" // eslint-disable-line sort-imports
import urlEncode from "./url-encode.js"

const logger = new Logger({name: "ApiMaker / Api"})

// logger.setDebug(true)

/** @typedef {string | number | boolean | null | undefined} ApiPrimitive */
/** @typedef {object | ApiPrimitive | Array<object | ApiPrimitive>} ApiJsonValue */
/** @typedef {Record<string, ApiPrimitive>} ApiPathParams */
/** @typedef {Record<string, ApiJsonValue>} ApiJsonData */
/** @typedef {ApiJsonData | FormData | string | undefined} ApiRequestBody */
/** @typedef {object | string} ApiResponseBody */

/**
 * Thin XMLHttpRequest wrapper used across the client to talk to the API.
 * Provides helper verbs, CSRF token handling and consistent error formatting.
 */
export default class Api { // eslint-disable-line padded-blocks

  /**
   * @param {string} path
   * @param {ApiPathParams|null} [pathParams]
   * @returns {Promise<ApiResponseBody>}
   */
  static get = (path, pathParams = null) => Api.requestLocal({path, pathParams, method: "GET"})

  /**
   * @param {string} path
   * @param {ApiPathParams|null} [pathParams]
   * @returns {Promise<ApiResponseBody>}
   */
  static delete = (path, pathParams = null) => Api.requestLocal({path, pathParams, method: "DELETE"})

  /**
   * @param {string} path
   * @param {ApiJsonData} [data]
   * @returns {Promise<ApiResponseBody>}
   */
  static patch = (path, data = {}) => Api.requestLocal({path, data, method: "PATCH"})

  /**
   * @param {string} path
   * @param {ApiJsonData} [data]
   * @returns {Promise<ApiResponseBody>}
   */
  static post = (path, data = {}) => Api.requestLocal({path, data, method: "POST"})

  /**
   * Performs a network request against the configured host.
   *
   * @param {object} args
   * @param {ApiRequestBody} [args.data]
   * @param {Record<string, string>} [args.headers]
   * @param {"GET"|"POST"|"PATCH"|"PUT"|"DELETE"} args.method
   * @param {string} args.path
   * @param {ApiPathParams|null} [args.pathParams]
   * @returns {Promise<ApiResponseBody>}
   */
  static async request({data, headers, method, path, pathParams}) {
    let requestPath = ""
    if (config.getHost()) requestPath += config.getHost()
    requestPath += path

    if (pathParams) {
      const pathParamsString = qs.stringify(pathParams, {arrayFormat: "brackets", encoder: urlEncode})
      requestPath += `?${pathParamsString}`
    }

    const xhr = new XMLHttpRequest()

    xhr.open(method, requestPath, true)
    xhr.withCredentials = true

    if (headers) {
      for (const headerName in headers) {
        xhr.setRequestHeader(headerName, headers[headerName])
      }
    }

    const response = await Api.executeXhr(xhr, data)

    return response
  }

  /**
   * Executes a prepared XMLHttpRequest and resolves/rejects based on status.
   *
   * @param {XMLHttpRequest} xhr
   * @param {ApiRequestBody} data
   * @returns {Promise<ApiResponseBody>}
   */
  static executeXhr(xhr, data) {
    return new Promise((resolve, reject) => {
      xhr.onload = () => {
        const response = this._parseResponse(xhr)

        if (xhr.status == 200) {
          resolve(response)
        } else {
          // @ts-ignore Allow extra xhr on error args
          const customError = new CustomError(`Request failed with code: ${xhr.status}`, {response, xhr})

          if (data instanceof FormData) {
            // @ts-ignore Add custom debug payload
            customError.peakflowParameters = FormDataObjectizer.toObject(data)
          } else {
            // @ts-ignore Add custom debug payload
            customError.peakflowParameters = data
          }

          reject(customError)
        }
      }

      xhr.send(data)
    })
  }

  /**
   * Adds default headers (CSRF + JSON) and forwards to `request`.
   *
   * @param {object} args
   * @param {ApiJsonData} [args.data]
   * @param {Record<string, string>} [args.headers]
   * @param {"GET"|"POST"|"PATCH"|"PUT"|"DELETE"} args.method
   * @param {string} args.path
   * @param {ApiPathParams|null} [args.pathParams]
   * @param {ApiRequestBody} [args.rawData]
   * @returns {Promise<ApiResponseBody>}
   */
  static async requestLocal(args) {
    let headers = /** @type {Record<string, string>} */ ({})
    /** @type {ApiRequestBody} */
    let requestBody = args.data

    if (args.headers) {
      headers = {...args.headers}
    }

    const token = await this._token()

    logger.debug(() => `Got token: ${token}`)

    if (token) {
      headers["X-CSRF-Token"] = token
    }

    if (args.data) {
      headers["Content-Type"] = "application/json"
      requestBody = JSON.stringify(args.data)
    }

    if (args.rawData) {
      requestBody = args.rawData
    }

    return this.request({...args, data: requestBody, headers})
  }

  /**
   * @param {string} path
   * @param {ApiJsonData} [data]
   * @returns {Promise<ApiResponseBody>}
   */
  static async put(path, data = {}) {
    return this.requestLocal({path, data, method: "PUT"})
  }

  /** @returns {Promise<string>} */
  static _token = async() => SessionStatusUpdater.current().getCsrfToken()

  /**
   * Parses the response body according to the response content-type.
   *
   * @param {XMLHttpRequest} xhr
   * @returns {ApiResponseBody}
   */
  static _parseResponse(xhr) {
    const responseType = xhr.getResponseHeader("content-type")

    if (responseType && responseType.startsWith("application/json")) {
      return JSON.parse(xhr.responseText)
    } else {
      return xhr.responseText
    }
  }
}
