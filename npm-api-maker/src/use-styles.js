/* eslint-disable sort-imports */
import config from "./config.js"
import {digg} from "diggerize"
import * as inflection from "inflection"
import useBreakpoint from "./use-breakpoint.js"
import {useMemo} from "react"

function handleStringStyle(styles, listOfStyles, breakpoint, breakpointsReverse, arg) { // eslint-disable-line func-style, max-params
  if (!(arg in styles)) {
    throw new Error(`No such styling '${arg}' in given styles: ${Object.keys(styles).join(", ")}`)
  }

  listOfStyles.push(styles[arg])

  for (const breakpointData of breakpointsReverse) {
    const breakpointName = breakpointData[0]
    const breakpointStyleNameUp = `${arg}${inflection.camelize(breakpointName)}Up`
    const breakpointStyleNameDown = `${arg}${inflection.camelize(breakpointName)}Down`
    const breakpointIsUp = digg(breakpoint, `${breakpointName}Up`)
    const breakpointIsDown = digg(breakpoint, `${breakpointName}Down`)

    if (breakpointStyleNameUp in styles && breakpointIsUp) {
      listOfStyles.push(styles[breakpointStyleNameUp])
    }

    if (breakpointStyleNameDown in styles && breakpointIsDown) {
      listOfStyles.push(styles[breakpointStyleNameDown])
    }
  }
}

export default function useStyles(styles, args, dependencies = []) {
  const breakpoint = useBreakpoint()
  const breakpointName = digg(breakpoint, "name")
  const actualDependencies = [...dependencies, breakpointName]

  const listOfStyles = useMemo(() => {
    const listOfStyles = []
    const breakpointsReverse = [...config.getBreakpoints()].reverse()

    if (!Array.isArray(args)) {
      args = [args] // eslint-disable-line no-param-reassign
    }

    for (const arg of args) {
      if (typeof arg == "string") {
        handleStringStyle(styles, listOfStyles, breakpoint, breakpointsReverse, arg)
      } else if (typeof arg == "object") {
        for (const key in arg) {
          const value = arg[key]

          if (value) {
            handleStringStyle(styles, listOfStyles, breakpoint, breakpointsReverse, key)
          }
        }
      } else {
        throw new Error(`Unhandled type: ${typeof arg}`)
      }
    }

    return listOfStyles
  }, actualDependencies)

  return listOfStyles
}
