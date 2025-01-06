import {useCallback, useLayoutEffect} from "react"
import apiMakerConfig from "@kaspernj/api-maker/build/config"
import {Dimensions} from "react-native"
import useShape from "set-state-compare/src/use-shape"

const calculateBreakPoint = (window) => {
  const windowWidth = window.width
  const result = {}

  for (const breakpointData of apiMakerConfig.getBreakPoints()) {
    const breakpoint = breakpointData[0]
    const width = breakpointData[1]

    if (!result.name && windowWidth >= width) {
      result.name = breakpoint
    }

    result[`${breakpoint}Down`] = !result.name
    result[`${breakpoint}Up`] = Boolean(result.name)
  }

  if (result.name) {
    return result
  }

  throw new Error(`Couldn't not find breakpoint from window width: ${windowWidth}`)
}

const useBreakpoint = () => {
  const s = useShape()
  const onCalled = useCallback(({window}) => {
    const breakpoint = calculateBreakPoint(window)

    if (breakpoint.name != s.s.breakpoint.name) {
      s.set({breakpoint})
    }
  }, [])

  s.useStates({
    breakpoint: () => calculateBreakPoint(Dimensions.get("window"))
  })

  useLayoutEffect(() => {
    const subscription = Dimensions.addEventListener("change", onCalled)

    return () => subscription?.remove()
  })

  return s.s.breakpoint
}

export default useBreakpoint
