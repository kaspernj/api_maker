const {CustomError} = require("./custom-error")
const FormDataToObject = require("./form-data-to-object")
const qs = require("qs")

module.exports = class Api {
  static get(path, pathParams = null) {
    return this.requestLocal({path, pathParams, method: "GET"})
  }

  static delete(path, pathParams = null) {
    return this.requestLocal({path, pathParams, method: "DELETE"})
  }

  static patch(path, data = {}) {
    return this.requestLocal({path, data, method: "PATCH"})
  }

  static post(path, data = {}) {
    return this.requestLocal({path, data, method: "POST"})
  }

  static request(args) {
    let path = args.path

    if (args.pathParams) {
      const pathParamsString = qs.stringify(args.pathParams, {arrayFormat: "brackets"})
      path += `?${pathParamsString}`
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open(args.method, path, true)

      if (args.headers) {
        for(const headerName in args.headers) {
          xhr.setRequestHeader(headerName, args.headers[headerName])
        }
      }

      xhr.onload = () => {
        const response = this._parseResponse(xhr)

        if (xhr.status == 200) {
          resolve(response)
        } else {
          const customError = new CustomError(`Request failed with code: ${xhr.status}`, {response, xhr})

          if (args.data instanceof FormData) {
            customError.peakflowParameters = FormDataToObject.toObject(args.data)
          } else {
            customError.peakflowParameters = args.data
          }

          reject(customError)
        }
      }

      xhr.send(args.data)
    })
  }

  static requestLocal(args) {
    if (!args.headers)
      args["headers"] = {}

    const token = this._token()
    if (token)
      args["headers"]["X-CSRF-Token"] = token

    if (args.data) {
      args["headers"]["Content-Type"] = "application/json"
      args["data"] = JSON.stringify(args.data)
    }

    if (args.rawData)
      args["data"] = args.rawData

    return this.request(args)
  }

  static put(path, data = {}) {
    return this.requestLocal({path, data, method: "PUT"})
  }

  static _token() {
    const tokenElement = document.querySelector("meta[name='csrf-token']")

    if (tokenElement)
      return tokenElement.getAttribute("content")
  }

  static _parseResponse(xhr) {
    const responseType = xhr.getResponseHeader("content-type")

    if (responseType && responseType.startsWith("application/json")) {
      return JSON.parse(xhr.responseText)
    } else {
      return xhr.responseText
    }
  }
}
