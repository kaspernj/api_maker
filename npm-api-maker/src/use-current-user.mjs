import {useCallback, useEffect, useMemo} from "react"
import {camelize} from "inflection"
import Devise from "./devise.mjs"
import Services from "./services.mjs"
import useShape from "set-state-compare/src/use-shape.js"

const currentUserData = {}

const useCurrentUser = (args) => {
  const s = useShape()
  const scope = args?.scope || "user"
  const scopeName = useMemo(() => `current${camelize(scope)}`, [scope])

  s.meta.scope = scope
  s.meta.scopeName = scopeName

  const loadCurrentUserFromRequest = useCallback(async () => {
    const {scope, scopeName} = s.m
    const result = await Services.current().sendRequest("Devise::Current", {scope})
    const current = digg(result, "current")

    currentUserData[scope] = current

    if (!(scopeName in s.setStates)) throw new Error(`'${scopeName}' not found in setStates`)

    s.setStates[scopeName](current)
  }, [])

  const defaultCurrentUser = useCallback(() => {
    const {scope, scopeName} = s.m

    if (scope in currentUserData) {
      return currentUserData[scope]
    } else if (Devise.current().hasCurrentScope(scope)) {
      currentUserData[scope] = Devise[scopeName]()

      return currentUserData[scope]
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
    if (!(s.m.scope in currentUserData)) {
      loadCurrentUserFromRequest()
    }
  }, [])

  useEffect(() => {
    Devise.events().addListener("onDeviseSignIn", updateCurrentUser)

    return () => {
      Devise.events().removeListener("onDeviseSignIn", updateCurrentUser)
    }
  }, [])

  useEffect(() => {
    Devise.events().addListener("onDeviseSignOut", updateCurrentUser)

    return () => {
      Devise.events().removeListener("onDeviseSignOut", updateCurrentUser)
    }
  }, [])

  return s.s[scopeName]
}

export default useCurrentUser
