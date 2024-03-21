import {useCallback, useEffect} from "react"
import {camelize} from "inflection"
import Devise from "./devise.mjs"
import Services from "./services.mjs"
import useShape from "set-state-compare/src/use-shape.js"

const currentUserData = {}

const useCurrentUser = (args) => {
  const s = useShape()

  s.meta.scope = args?.scope || "user"
  s.meta.scopeName = `current${camelize(s.m.scope)}`

  const loadCurrentUserFromRequest = useCallback(async () => {
    const result = await Services.current().sendRequest("Devise::Current", {scope: s.m.scope})
    const current = digg(result, "current")

    currentUserData[scope] = current

    s.setStates[s.m.scopeName](current)
  }, [])

  const defaultCurrentUser = useCallback(() => {
    if (s.m.scope in currentUserData) {
      return currentUserData[scope]
    }
  }, [])

  s.useStates({currentUser: defaultCurrentUser()})

  const updateCurrentUser = useCallback(() => {
    s.set({currentUser: Devise[s.m.scopeName]()})
  }, [])

  useEffect(() => {
    if (!(s.m.scope in currentUserData)) {
      if (Devise.current().hasCurrentScope(s.m.scope)) {
        currentUserData[s.m.scope] = Devise[s.m.scopeName]()
      } else {
        loadCurrentUserFromRequest()
      }
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
