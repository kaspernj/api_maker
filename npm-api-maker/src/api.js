// @ts-check
/* eslint-disable sort-imports */

import config from "./config.js"
import CustomError from "./custom-error.js"
import FormDataObjectizer from "form-data-objectizer"
import Logger from "./logger.js"
import qs from "qs"
import SessionStatusUpdater from "./session-status-updater.js"
import urlEncode from "./url-encode.js"

const logger = new Logger({name: "ApiMaker / Api"})

// logger.setDebug(true)

/**
 * Thin XMLHttpRequest wrapper used across the client to talk to the API.
 * Provides helper verbs, CSRF token handling and consistent error formatting.
 */
export default class Api {
  // eslint-disable-next-line lines-around-comment
  /**
   * @param {string} path
   * @param {Record<string, any>|null} [pathParams]
   * @returns {Promise<any>}
   */
  static get = (path, pathParams = null) => Api.requestLocal({path, pathParams, method: "GET"})

  /**
   * @param {string} path
   * @param {Record<string, any>|null} [pathParams]
   * @returns {Promise<any>}
   */
  static delete = (path, pathParams = null) => Api.requestLocal({path, pathParams, method: "DELETE"})

  /**
   * @param {string} path
   * @param {Record<string, any>} [data]
   * @returns {Promise<any>}
   */
  static patch = (path, data = {}) => Api.requestLocal({path, data, method: "PATCH"})

  /**
   * @param {string} path
   * @param {Record<string, any>} [data]
   * @returns {Promise<any>}
   */
  static post = (path, data = {}) => Api.requestLocal({path, data, method: "POST"})

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
   * @param {any} data
   * @returns {Promise<any>}
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
   * @param {Record<string, any>} [args.data]
   * @param {Record<string, string>} [args.headers]
   * @param {"GET"|"POST"|"PATCH"|"PUT"|"DELETE"} args.method
   * @param {string} args.path
   * @param {Record<string, any>|null} [args.pathParams]
   * @param {any} [args.rawData]
   * @returns {Promise<any>}
   */
  static async requestLocal(args) {
    let headers = {}

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
      // @ts-ignore Allow string body despite data being typed as record
      args.data = JSON.stringify(args.data)
    }

    if (args.rawData) {
      args.data = args.rawData
    }

    return this.request({...args, headers})
  }

  /**
   * @param {string} path
   * @param {Record<string, any>} [data]
   * @returns {Promise<any>}
   */
  static async put(path, data = {}) {
    return this.requestLocal({path, data, method: "PUT"})
  }

  /**
   * @returns {Promise<string>}
   */
  static _token = async() => SessionStatusUpdater.current().getCsrfToken()

  /**
   * Parses the response body according to the response content-type.
   *
   * @param {XMLHttpRequest} xhr
   * @returns {any}
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
