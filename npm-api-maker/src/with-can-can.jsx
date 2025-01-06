import useCanCan from "./use-can-can"
import memo from "set-state-compare/src/memo"

export default (WrappedComponent, abilities) => {
  const WithCanCan = (props) => {
    const canCan = useCanCan(() => abilities)

    return <WrappedComponent canCan={canCan} {...props} />
  }

  return memo(WithCanCan)
}
