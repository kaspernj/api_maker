import useCurrentUser from "./use-current-user.mjs"

export default (WrappedComponent) => (props) => {
  const currentUser = useCurrentUser()

  return (
    <WrappedComponent {...props} currentUser={currentUser} />
  )
}
