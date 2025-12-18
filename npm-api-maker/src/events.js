import {EventEmitter} from "eventemitter3"

const events = new EventEmitter()

events.setMaxListeners(1000)

export default events
