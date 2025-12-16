import React from "react"
import useCurrentUser from "./use-current-user.js"

export default (WrappedComponent) => (props) => {
  const currentUser = useCurrentUser()

  return (
    <WrappedComponent {...props} currentUser={currentUser} />
  )
}
