import memo from "set-state-compare/src/memo"
import useResizeObserver from "./use-resize-observer"

const ApiMakerResizeObserver = memo(({element, onResize}) => {
  useResizeObserver(element, onResize)

  return null
})

export default ApiMakerResizeObserver
