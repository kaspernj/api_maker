/* eslint-disable jest/require-hook */
import {digg, digs} from "diggerize"

let isExpo = false

try {
  const REQUIRE_TERMINATOR = ""
  const Constants = require(`expo-constants${REQUIRE_TERMINATOR}`)
  const executionEnvironment = digg(Constants, "default", "executionEnvironment")
  const {ExecutionEnvironment} = digs(Constants, "ExecutionEnvironment")
  const {Bare, Standalone, StoreClient} = digs(ExecutionEnvironment, "Bare", "Standalone", "StoreClient")

  // True if the app is running in an `expo build` app or if it's running in Expo Go.
  isExpo = executionEnvironment === Bare || executionEnvironment === Standalone || executionEnvironment === StoreClient
} catch {
  // Do nothing - failed to require expo-constants
}

/** True when running in an Expo execution environment. */
export default isExpo
