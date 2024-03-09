import {useCallback, useEffect, useState} from "react"
import Devise from "./devise.mjs"

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(Devise.currentUser())
  const updateCurrentUser = useCallback(() => {
    setCurrentUser(Devise.currentUser())
  }, [])

  useEffect(() => {
    Devise.events().addListener("onDeviseSignIn", updateCurrentUser)

    return () => {
      Devise.events().removeListener("onDeviseSignIn", updateCurrentUser)
    }
  })

  useEffect(() => {
    Devise.events().addListener("onDeviseSignOut", updateCurrentUser)

    return () => {
      Devise.events().removeListener("onDeviseSignOut", updateCurrentUser)
    }
  })

  return currentUser
}

export default useCurrentUser
