import useCanCan from "./use-can-can.mjs"
import {memo} from "react"

export default (WrappedComponent, abilities) => {
  const WithCanCan = (props) => {
    const {canCan} = useCanCan(() => abilities)

    return <WrappedComponent canCan={canCan} {...props} />
  }

  return memo(WithCanCan)
}
