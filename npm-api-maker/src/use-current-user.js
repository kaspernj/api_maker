import React, {useCallback, useContext, useMemo} from "react"
import Devise from "./devise"
import {digg} from "diggerize"
import EventEmitter from "events"
import * as inflection from "inflection"
import Logger from "./logger"
import Services from "./services"
import useEventEmitter from "./use-event-emitter"
import useShape from "set-state-compare/src/use-shape"

const events = new EventEmitter()
const logger = new Logger({name: "ApiMaker / useCurrentUser"})

logger.setDebug(false)

/**
 * @param {object} props
 * @param {string} props.scope
 * @param {boolean} props.withData
 * @returns {import("./base-model.js").default}
 */
const useCurrentUser = (props = {}) => {
  const {scope = "user", withData, ...restProps} = props

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to useCurrentUser: ${Object.keys(restProps).join(", ")}`)
  }

  const scopeInstance = Devise.getScope(scope)
  const currentUserContext = useContext(scopeInstance.getContext())

  if (withData) {
    return currentUserContext
  } else {
    return currentUserContext.model
  }
}

/**
 * @param {object} props
 * @param {function} props.children
 * @param {string} props.scope
 * @returns {import("react").ReactNode}
 */
const WithCurrentUser = (props = {}) => {
  const {children, scope = "user", ...restProps} = props

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to WithCurrentUser: ${Object.keys(restProps).join(", ")}`)
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

export {events, WithCurrentUser}
export default useCurrentUser
