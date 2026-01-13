/* eslint-disable jest/require-hook, react/function-component-definition, sort-imports */
import React, {useCallback, useMemo} from "react"
import Devise from "./devise.js"
import {digg} from "diggerize"
import {events} from "./use-current-user.js"
import * as inflection from "inflection"
import Logger from "./logger.js"
import Services from "./services.js"
import useEventEmitter from "ya-use-event-emitter"
import useShape from "set-state-compare/build/use-shape.js"

const logger = new Logger({name: "ApiMaker / UseCurrentUserContext"})

logger.setDebug(false)

/**
 * @param {object} props
 * @param {Function} props.children
 * @param {string} [props.scope]
 * @returns {import("react").ReactNode}
 */
const UseCurrentUserContext = (props) => {
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

  const loadCurrentUserFromRequest = useCallback(async () => {
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

  const defaultCurrentUser = useCallback(() => {
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

  const updateCurrentUser = useCallback(() => {
    s.set({
      result: {
        loaded: true,
        model: Devise[s.m.scopeName]()
      }
    })
  }, [])

  useMemo(() => {
    if (!Devise.current().hasGlobalCurrentScope(s.m.scope) && !Devise.current().hasCurrentScope(s.m.scope)) {
      logger.debug(() => `Devise hasn't got current scope ${s.m.scope} so loading from request`)
      loadCurrentUserFromRequest()
    }
  }, [])

  const onDeviseSignIn = useCallback(() => {
    updateCurrentUser()
  }, [])

  const onDeviseSignOut = useCallback(() => {
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
