import {memo} from "react"
import useCreatedEvent from "./use-created-event.mjs"

const ApiMakerEventCreated = memo((props) => {
  const {modelClass, onCreated, ...restProps} = props

  useCreatedEvent(modelClass, onCreated, restProps)

  return null
})

export default ApiMakerEventCreated
