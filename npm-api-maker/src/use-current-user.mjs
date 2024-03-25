import {useCallback, useEffect, useMemo} from "react"
import {camelize} from "inflection"
import Devise from "./devise.mjs"
import Services from "./services.mjs"
import useEventEmitter from "./use-event-emitter.mjs"
import useShape from "set-state-compare/src/use-shape.js"

const useCurrentUser = (args) => {
  const s = useShape(args || {})
  const scope = args?.scope || "user"
  const scopeName = `current${camelize(scope)}`

  s.meta.scope = scope
  s.meta.scopeName = scopeName

  const debugs = useCallback((debugCallback) => {
    if (s.props.debug) {
      let debugArgs = debugCallback()

      if (!Array.isArray(debugArgs)) debugArgs = [debugArgs]

      console.log("useCurrentUser", ...debugArgs)
    }
  })

  const loadCurrentUserFromRequest = useCallback(async () => {
    const {scope, scopeName} = s.m

    debugs(() => `Loading ${scope} with request`)

    const result = await Services.current().sendRequest("Devise::Current", {scope})
    const current = digg(result, "current")

    if (!(scopeName in s.setStates)) throw new Error(`'${scopeName}' not found in setStates`)

    Devise.updateSession(current)
    s.setStates[scopeName](current)

    if (s.props.onCurrentUserLoaded) setTimeout(() => s.props.onCurrentUserLoaded(current), 0)
  }, [])

  const defaultCurrentUser = useCallback(() => {
    const {scope, scopeName} = s.m

    if (Devise.current().hasCurrentScope(scope)) {
      const current = Devise[scopeName]()

      debugs(() => `Setting ${scope} from current scope: ${current?.id()}`)

      if (s.props.onCurrentUserLoaded) setTimeout(() => s.props.onCurrentUserLoaded(current), 0)

      return current
    }
  }, [])

  const useStatesArgument = {}

  useStatesArgument[scopeName] = defaultCurrentUser()

  s.useStates(useStatesArgument)

  const updateCurrentUser = useCallback(() => {
    const setStatesArgument = {}

    setStatesArgument[s.m.scopeName] = Devise[s.m.scopeName]()

    s.set(setStatesArgument)
  }, [])

  useEffect(() => {
    if (!Devise.current().hasCurrentScope(s.m.scope)) {
      loadCurrentUserFromRequest()
    }
  }, [])

  useEventEmitter(Devise.events(), "onDeviseSignIn", updateCurrentUser)
  useEventEmitter(Devise.events(), "onDeviseSignOut", updateCurrentUser)

  return s.s[scopeName]
}

export default useCurrentUser
