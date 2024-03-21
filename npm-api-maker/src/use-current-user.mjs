import {useCallback, useEffect} from "react"
import {camelize} from "inflection"
import Devise from "./devise.mjs"
import Services from "./services.mjs"
import useShape from "set-state-compare/src/use-shape.js"

const currentUserData = {}

const useCurrentUser = (args) => {
  const s = useShape()
  const scope = args?.scope || "user"

  s.meta.scope = scope
  s.meta.scopeName = useMemo(() => `current${camelize(s.m.scope)}`, [scope])

  const loadCurrentUserFromRequest = useCallback(async () => {
    const {scope, scopeName} = s.m.scope
    const result = await Services.current().sendRequest("Devise::Current", {scope})
    const current = digg(result, "current")

    currentUserData[scope] = current

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

  s.useStates({currentUser: defaultCurrentUser()})

  const updateCurrentUser = useCallback(() => {
    s.set({currentUser: Devise[s.m.scopeName]()})
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

  return s.s.currentUser
}

export default useCurrentUser
