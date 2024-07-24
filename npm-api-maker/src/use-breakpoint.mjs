import {useCallback, useLayoutEffect} from "react"
import apiMakerConfig from "@kaspernj/api-maker/src/config.mjs"
import useShape from "set-state-compare/src/use-shape.js"

const useBreakpoint = () => {
  const s = useShape()

  const calculateBreakPoint = useCallback(() => {
    const windowWidth = window.innerWidth

    for (const breakpointData of apiMakerConfig.getBreakPoints()) {
      const breakpoint = breakpointData[0]
      const width = breakpointData[1]

      if (windowWidth >= width) return breakpoint
    }

    throw new Error(`Couldn't not find breakpoint from window width: ${windowWidth}`)
  }, [])

  const onCalled = useCallback(() => {
    const breakpoint = calculateBreakPoint()

    if (breakpoint != s.s.breakpoint) {
      s.set({breakpoint})
    }
  }, [])

  s.useStates({
    breakpoint: () => calculateBreakPoint()
  })

  useLayoutEffect(() => {
    window.addEventListener("resize", onCalled)

    return () => {
      window.removeEventListener("resize", onCalled)
    }
  }, [])

  return {breakpoint: s.s.breakpoint}
}

export default useBreakpoint
