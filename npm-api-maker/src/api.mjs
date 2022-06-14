import config from "./config.js"
import CustomError from "./custom-error.cjs"
import FormDataObjectizer from "form-data-objectizer"
import qs from "qs"

export default class Api {
  static get (path, pathParams = null) {
    return this.requestLocal({path, pathParams, method: "GET"})
  }

  static delete (path, pathParams = null) {
    return this.requestLocal({path, pathParams, method: "DELETE"})
  }

  static patch (path, data = {}) {
    return this.requestLocal({path, data, method: "PATCH"})
  }

  static post (path, data = {}) {
    return this.requestLocal({path, data, method: "POST"})
  }

  static request ({data, headers, method, path, pathParams, headers}) {
    let path = `${config.getHost()}${path}`

    if (args.pathParams) {
      const pathParamsString = qs.stringify(pathParams, {arrayFormat: "brackets"})
      path += `?${pathParamsString}`
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open(method, path, true)

      if (headers) {
        for (const headerName in headers) {
          xhr.setRequestHeader(headerName, headers[headerName])
        }
      }

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

  static requestLocal (args) {
    if (!args.headers) {
      args.headers = {}
    }

    const token = this._token()

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

    return this.request(args)
  }

  static put (path, data = {}) {
    return this.requestLocal({path, data, method: "PUT"})
  }

  static _token () {
    const tokenElement = document.querySelector("meta[name='csrf-token']")

    if (tokenElement)
      return tokenElement.getAttribute("content")
  }

  static _parseResponse (xhr) {
    const responseType = xhr.getResponseHeader("content-type")

    if (responseType && responseType.startsWith("application/json")) {
      return JSON.parse(xhr.responseText)
    } else {
      return xhr.responseText
    }
  }
}
