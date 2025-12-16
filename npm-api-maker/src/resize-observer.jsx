import memo from "set-state-compare/src/memo.js"
import useResizeObserver from "./use-resize-observer.js"

const ApiMakerResizeObserver = memo(({element, onResize}) => {
  useResizeObserver(element, onResize)

  return null
})

export default ApiMakerResizeObserver
