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

const CurrentUserContext = createContext()
const useCurrentUser = (props) => {
  const scope = props?.scope || "user"
  const scopeName = `current${inflection.camelize(scope)}`
  const currentUserContext = useContext(CurrentUserContext)

  return currentUserContext[scopeName]
}

const WithCurrentUser = (props) => {
  const s = useShape(props || {})
  const scope = props?.scope || "user"
  const scopeName = `current${inflection.camelize(scope)}`

  s.meta.scope = scope
  s.meta.scopeName = scopeName

  const loadCurrentUserFromRequest = useCallback(async () => {
    const {scope, scopeName} = s.m
    const getArgsMethodName = `get${inflection.camelize(scope)}Args`
    const args = Devise[getArgsMethodName]()

    logger.debug(() => `Loading ${scope} with request`)

    const result = await Services.current().sendRequest("Devise::Current", {query: args.query, scope})
    const current = digg(result, "current")[0]

    if (!(scopeName in s.setStates)) throw new Error(`'${scopeName}' not found in setStates`)
    if (current) Devise.updateSession(current)

    s.setStates[scopeName](current)

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

  const useStatesArgument = {}

  useStatesArgument[scopeName] = () => defaultCurrentUser()

  s.useStates(useStatesArgument)

  const updateCurrentUser = useCallback(() => {
    const setStatesArgument = {}

    setStatesArgument[s.m.scopeName] = Devise[s.m.scopeName]()

    s.set(setStatesArgument)
  }, [])

  useMemo(() => {
    if (!Devise.current().hasGlobalCurrentScope(s.m.scope) && !Devise.current().hasCurrentScope(s.m.scope)) {
      logger.debug(() => `Devise hasn't got current scope ${s.m.scope} so loading from request`)
      loadCurrentUserFromRequest()
    }
  }, [])

  useEventEmitter(Devise.events(), "onDeviseSignIn", updateCurrentUser)
  useEventEmitter(Devise.events(), "onDeviseSignOut", updateCurrentUser)

  return (
    <CurrentUserContext.Provider value={s.state}>
      {props.children}
    </CurrentUserContext.Provider>
  )
}

export {WithCurrentUser}
export default useCurrentUser
