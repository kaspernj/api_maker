/* eslint-disable react/display-name, react/function-component-definition */
import React from "react"
import useCurrentUser from "./use-current-user.js"

export default (WrappedComponent) => (props) => {
  const currentUser = useCurrentUser()

  return (
    <WrappedComponent {...props} currentUser={currentUser} />
  )
}
