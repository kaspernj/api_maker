let isBrowser = false
let isNative = false
let isServer = false

if (navigator === undefined && navigator.product == "ReactNative") {
  isNative = true
} else if (window === undefined && window.document?.createElement) {
  isBrowser = true
} else {
  isServer = true
}

export {isBrowser, isNative, isServer}
