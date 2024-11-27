import memo from "set-state-compare/src/memo"
import useCreatedEvent from "./use-created-event.mjs"

const ApiMakerEventCreated = memo((props) => {
  const {modelClass, onCreated, ...restProps} = props

  useCreatedEvent(modelClass, onCreated, restProps)

  return null
})

export default ApiMakerEventCreated
