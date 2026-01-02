import {useCallback, useLayoutEffect, useMemo} from "react"
import useShape from "set-state-compare/build/use-shape.js"

/**
 * @param {object} element
 * @param {function} callback
 * @return {void}
 */
const useResizeObserver = (element, callback) => {
  const s = useShape({callback})
  const onResize = useCallback((...args) => {
    s.p.callback(...args)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const observer = useMemo(() => new ResizeObserver(onResize), []) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.disconnect()
      }
    }
  }, [element]) // eslint-disable-line react-hooks/exhaustive-deps
}

export default useResizeObserver
