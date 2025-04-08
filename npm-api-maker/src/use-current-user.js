import React, {createContext, useCallback, useContext, useMemo} from "react"
import Devise from "./devise"
import {digg} from "diggerize"
import * as inflection from "inflection"
import Logger from "./logger"
import Services from "./services"
import useEventEmitter from "./use-event-emitter"
import useShape from "set-state-compare/src/use-shape"

const logger = new Logger({name: "ApiMaker / useCurrentUser"})

// logger.setDebug(true)

const useCurrentUser = (props) => {
  const scope = props?.scope || "user"
  const scopeInstance = Devise.getScope(scope)
  const currentUserContext = useContext(scopeInstance.getContext())

  return currentUserContext
}

const WithCurrentUser = (props) => {
  const s = useShape(props || {})
  const scope = props?.scope || "user"
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

    s.set({current})

    if (s.props.onCurrentUserLoaded) setTimeout(() => s.props.onCurrentUserLoaded(current), 0)
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

    if (current && s.props.onCurrentUserLoaded) {
      setTimeout(() => s.props.onCurrentUserLoaded(current), 0)
    }

    return current
  }, [])

  s.useStates({current: () => defaultCurrentUser()})

  const updateCurrentUser = useCallback(() => {
    s.set({current: Devise[s.m.scopeName]()})
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
    <ScopeContext.Provider value={s.s.current}>
      {props.children}
    </ScopeContext.Provider>
  )
}

export {WithCurrentUser}
export default useCurrentUser
