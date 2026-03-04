/* eslint-disable sort-imports */
import config from "./config.js"
import {digg} from "diggerize"
import * as inflection from "inflection"
import {useBreakpoint} from "responsive-breakpoints"
import {useMemo} from "react"

/**
 * @param {Record<string, any>} styles
 * @param {Array<Record<string, any>>} listOfStyles
 * @param {Record<string, any>} breakpoint
 * @param {Array<[string, any]>} breakpointsReverse
 * @param {string} arg
 * @returns {void}
 */
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

/**
 * @param {Record<string, any>} styles
 * @param {string | Array<string | Record<string, any>> | Record<string, any>} args
 * @param {Array<any>} [dependencies]
 * @returns {Array<Record<string, any>>}
 */
export default function useStyles(styles, args, dependencies = []) {
  const breakpoint = useBreakpoint()
  const breakpointName = digg(breakpoint, "name")
  const actualDependencies = [...dependencies, breakpointName]

  const listOfStyles = useMemo(() => {
    const listOfStyles = []
    const argsArray = Array.isArray(args) ? args : [args]
    // @ts-expect-error
    const breakpointsReverse = [...config.getBreakpoints()].reverse()

    for (const arg of argsArray) {
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
