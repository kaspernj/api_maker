import qs from "qs"

export default class {
  static get(path, data = null) {
    if (data) {
      var pathParamsString = qs.stringify(data, {"arrayFormat": "brackets"})
      path += `?${pathParamsString}`
    }

    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest()
      xhr.open("GET", path)
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.setRequestHeader("X-CSRF-Token", this._token())
      xhr.onload = () => {
        var response = this._parseResponse(xhr)

        if (xhr.status == 200) {
          resolve(response)
        } else {
          reject(response)
        }
      }
      xhr.send()
    })
  }

  static post(path, data = {}) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest()
      xhr.open("POST", path)
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.setRequestHeader("X-CSRF-Token", this._token())
      xhr.onload = () => {
        var response = this._parseResponse(xhr)

        if (xhr.status == 200) {
          resolve(response)
        } else {
          reject(response)
        }
      }
      xhr.send(JSON.stringify(data))
    })
  }

  static _token() {
    var tokenElement = document.querySelector("meta[name='csrf-token']")

    if (tokenElement)
      return tokenElement.getAttribute("content")
  }

  static _parseResponse(xhr) {
    var responseType = xhr.getResponseHeader("content-type")

    if (responseType.startsWith("application/json")) {
      return JSON.parse(xhr.responseText)
    } else {
      return xhr.responseText
    }
  }
}
