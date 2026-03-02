import {EventEmitter} from "eventemitter3"

/** Shared event bus for API Maker modules. */
const events = new EventEmitter()

export default events
