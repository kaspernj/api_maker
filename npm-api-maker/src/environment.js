const Browser = "browser"
const Server = "server"
const Native = "native"

const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
)

const canUseNative = typeof navigator != 'undefined' && navigator.product == 'ReactNative'
const device = canUseNative ? Native : canUseDOM ? Browser : Server

const SSRObject = {
  isBrowser: device === Browser,
  isServer: device === Server,
  isNative: device === Native,
  device,
  canUseWorkers: typeof Worker !== 'undefined',
  canUseEventListeners: device === Browser && !!window.addEventListener,
  canUseViewport: device === Browser && !!window.screen,
}

export default SSRObject
