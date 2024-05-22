import config from "./config.mjs"
import CustomError from "./custom-error.mjs"
import FormDataObjectizer from "form-data-objectizer"
import Logger from "./logger.mjs"
import qs from "qs"
import SessionStatusUpdater from "./session-status-updater.mjs"
import urlEncode from "./url-encode.mjs"

const logger = new Logger({name: "ApiMaker / Api"})

// logger.setDebug(true)

export default class Api {
  static get = async (path, pathParams = null) =>  await Api.requestLocal({path, pathParams, method: "GET"})
  static delete = async (path, pathParams = null) => await Api.requestLocal({path, pathParams, method: "DELETE"})
  static patch = async (path, data = {}) => await Api.requestLocal({path, data, method: "PATCH"})
  static post = async (path, data = {}) => await Api.requestLocal({path, data, method: "POST"})

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

  static executeXhr(xhr, data) {
    return new Promise((resolve, reject) => {
      xhr.onload = () => {
        const response = this._parseResponse(xhr)

        if (xhr.status == 200) {
          resolve(response)
        } else {
          const customError = new CustomError(`Request failed with code: ${xhr.status}`, {response, xhr})

          if (data instanceof FormData) {
            customError.peakflowParameters = FormDataObjectizer.toObject(data)
          } else {
            customError.peakflowParameters = data
          }

          reject(customError)
        }
      }

      xhr.send(data)
    })
  }

  static async requestLocal(args) {
    if (!args.headers) {
      args.headers = {}
    }

    const token = await this._token()

    logger.debug(() => `Got token: ${token}`)

    if (token) {
      args.headers["X-CSRF-Token"] = token
    }

    if (args.data) {
      args.headers["Content-Type"] = "application/json"
      args.data = JSON.stringify(args.data)
    }

    if (args.rawData) {
      args.data = args.rawData
    }

    return await this.request(args)
  }

  static async put(path, data = {}) {
    return await this.requestLocal({path, data, method: "PUT"})
  }

  static _token = async () => await SessionStatusUpdater.current().getCsrfToken()

  static _parseResponse(xhr) {
    const responseType = xhr.getResponseHeader("content-type")

    if (responseType && responseType.startsWith("application/json")) {
      return JSON.parse(xhr.responseText)
    } else {
      return xhr.responseText
    }
  }
}
