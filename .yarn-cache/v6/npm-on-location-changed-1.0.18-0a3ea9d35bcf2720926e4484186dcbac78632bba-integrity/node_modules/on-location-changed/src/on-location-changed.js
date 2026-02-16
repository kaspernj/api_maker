import {callbacksHandler} from "./callbacks-handler.js"

const onLocationChanged = (callback) => callbacksHandler.onLocationChanged(callback)

export default onLocationChanged
