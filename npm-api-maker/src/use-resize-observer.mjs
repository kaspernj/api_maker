import {useCallback, useMemo} from "react"
import useShape from "set-state-compare/src/use-shape.js"

const useResizeObserver = (element, callback) => {
  const s = useShape({callback})
  const onResize = useCallback((...args) => {
    s.p.callback(...args)
  }, [])
  const observer = useMemo(() => new ResizeObserver(onResize), [])

  useEffect(() => {
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.disconnect()
      }
    }
  }, [element])
}

export default useResizeObserver
