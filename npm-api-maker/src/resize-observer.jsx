import {memo} from "react"
import useResizeObserver from "./use-resize-observer.mjs"

const ApiMakerResizeObserver = memo(({element, onResize}) => {
  useResizeObserver(element, onResize)

  return null
})

export default ApiMakerResizeObserver
