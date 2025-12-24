import React, {useCallback, useMemo} from "react" // eslint-disable-line sort-imports
import Devise from "./devise.js"
import {digg} from "diggerize" // eslint-disable-line sort-imports
import {events} from "./use-current-user.js" // eslint-disable-line sort-imports
import * as inflection from "inflection" // eslint-disable-line sort-imports
import Logger from "./logger.js"
import Services from "./services.js"
import useEventEmitter from "./use-event-emitter.js" // eslint-disable-line sort-imports
import useShape from "set-state-compare/build/use-shape.js"

const logger = new Logger({name: "ApiMaker / UseCurrentUserContext"})

logger.setDebug(false)

/**
 * @param {object} props
 * @param {function} props.children
 * @param {string} [props.scope]
 * @returns {import("react").ReactNode}
 */
const UseCurrentUserContext = (props) => { // eslint-disable-line react/function-component-definition, jest/require-hook
  const {children, scope = "user", ...restProps} = props

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to UseCurrentUserContext: ${Object.keys(restProps).join(", ")}`)
  }

  const s = useShape(props)
  const scopeName = `current${inflection.camelize(scope)}`
  const scopeInstance = Devise.getScope(scope)
  const ScopeContext = scopeInstance.getContext()

  s.meta.scope = scope
  s.meta.scopeName = scopeName

  const loadCurrentUserFromRequest = useCallback(async () => { // eslint-disable-line react-hooks/exhaustive-deps
    const {scope} = s.m
    const getArgsMethodName = `get${inflection.camelize(scope)}Args`
    const args = Devise[getArgsMethodName]()

    logger.debug(() => `Loading ${scope} with request`)

    const result = await Services.current().sendRequest("Devise::Current", {query: args.query, scope})
    const current = digg(result, "current")[0]

    if (current) Devise.updateSession(current)

    s.set({
      result: {
        loaded: true,
        model: current
      }
    })

    events.emit("currentUserLoaded", {current})
  }, [])

  const defaultCurrentUser = useCallback(() => { // eslint-disable-line react-hooks/exhaustive-deps
    const {scope, scopeName} = s.m
    let current

    if (Devise.current().hasCurrentScope(s.m.scope)) {
      current = Devise.current().getCurrentScope(scope)

      logger.debug(() => `Setting ${scope} from current scope: ${current?.id()}`)
    } else if (Devise.current().hasGlobalCurrentScope(scope)) {
      current = Devise[scopeName]()

      logger.debug(() => `Setting ${scope} from global current scope: ${current?.id()}`)
    }

    if (current) {
      events.emit("currentUserLoaded", {current})
    }

    return current
  }, [])

  s.useStates({
    result: () => ({
      loaded: false,
      model: defaultCurrentUser()
    })
  })

  const updateCurrentUser = useCallback(() => { // eslint-disable-line react-hooks/exhaustive-deps
    s.set({
      result: {
        loaded: true,
        model: Devise[s.m.scopeName]()
      }
    })
  }, [])

  useMemo(() => { // eslint-disable-line react-hooks/exhaustive-deps
    if (!Devise.current().hasGlobalCurrentScope(s.m.scope) && !Devise.current().hasCurrentScope(s.m.scope)) {
      logger.debug(() => `Devise hasn't got current scope ${s.m.scope} so loading from request`)
      loadCurrentUserFromRequest()
    }
  }, [])

  const onDeviseSignIn = useCallback(() => { // eslint-disable-line react-hooks/exhaustive-deps
    updateCurrentUser()
  }, [])

  const onDeviseSignOut = useCallback(() => { // eslint-disable-line react-hooks/exhaustive-deps
    updateCurrentUser()
  }, [])

  useEventEmitter(Devise.events(), "onDeviseSignIn", onDeviseSignIn)
  useEventEmitter(Devise.events(), "onDeviseSignOut", onDeviseSignOut)

  return (
    <ScopeContext.Provider value={s.s.result}>
      {children}
    </ScopeContext.Provider>
  )
}

export default UseCurrentUserContext
