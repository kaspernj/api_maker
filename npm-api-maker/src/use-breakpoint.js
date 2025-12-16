import {useCallback} from "react"
import config from "./config.js"
import {Dimensions} from "react-native"
import * as inflection from "inflection"
import isExpo from "./is-expo.js"
import useEventEmitter from "./use-event-emitter.js"
import useEventListener from "./use-event-listener.js"
import useShape from "set-state-compare/src/use-shape.js"

function calculateBreakPoint(breakpoints) {
  let windowWidth

  if (isExpo) {
    windowWidth = Dimensions.get("window").width
  } else if (typeof window !== "undefined" && window.innerWidth !== undefined) {
    // Use 'window.innerWidth' outside Expo because sometimes window width excludes scroll
    windowWidth = window.innerWidth
  } else {
    throw new Error("Didn't know where to get window width from")
  }

  const result = {}

  for (const breakpointData of breakpoints) {
    const breakpoint = breakpointData[0]
    const width = breakpointData[1]

    if (!result.name && windowWidth >= width) {
      result.name = breakpoint
      result[`${breakpoint}Down`] = true
    } else {
      result[`${breakpoint}Down`] = !result.name
    }

    result[`${breakpoint}Up`] = Boolean(result.name)
  }

  if (result.name) {
    return result
  }

  throw new Error(`Couldn't not find breakpoint from window width: ${windowWidth}`)
}

const sizeTypes = ["down", "up"]

const useBreakpoint = (args = {}) => {
  const s = useShape(args)

  s.meta.breakpoints ||= config.getBreakpoints()

  const checkAndUpdateBreakpoint = useCallback(() => {
    const breakpoint = calculateBreakPoint(s.m.breakpoints)

    if (breakpoint.name != s.s.breakpoint.name) {
      s.set({breakpoint})
    }
  }, [])

  const onDimensionsChange = useCallback(() => {
    checkAndUpdateBreakpoint()
  }, [])

  const onBreakpointsChange = useCallback(({newValue}) => {
    s.meta.breakpoints = newValue
    checkAndUpdateBreakpoint()
  }, [])

  s.useStates({
    breakpoint: () => calculateBreakPoint(s.m.breakpoints)
  })

  const styling = useCallback((args) => {
    const style = Object.assign({}, args.base)

    for (const breakpointData of s.m.breakpoints) {
      const breakpoint = breakpointData[0]

      for (const sizeType of sizeTypes) {
        const breakpointWithSizeType = `${breakpoint}${inflection.camelize(sizeType)}`

        if (args[breakpointWithSizeType] && s.s.breakpoint[breakpointWithSizeType]) {
          Object.assign(style, args[breakpointWithSizeType])
        }
      }
    }

    return style
  }, [])

  useEventEmitter(config.getEvents(), "onBreakpointsChange", onBreakpointsChange)
  useEventListener(Dimensions, "change", onDimensionsChange)

  return {
    styling,
    ...s.s.breakpoint
  }
}

export default useBreakpoint
