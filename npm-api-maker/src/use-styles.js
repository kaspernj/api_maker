// @ts-check
/* eslint-disable sort-imports */
import config from "./config.js"
import {digg} from "diggerize"
import * as inflection from "inflection"
import {useBreakpoint} from "responsive-breakpoints"
import {useMemo} from "react"

/** @typedef {boolean | string | ((args: object) => object)} BreakpointValue */
/** @typedef {Record<string, BreakpointValue>} BreakpointState */
/** @typedef {import("react-native").ImageStyle | import("react-native").TextStyle | import("react-native").ViewStyle} NamedStyle */
/** @typedef {Record<string, NamedStyle>} StyleDictionary */
/** @typedef {Record<string, boolean>} StyleFlags */
/** @typedef {Array<[string, BreakpointValue]>} ReverseBreakpoints */

/**
 * @param {StyleDictionary} styles
 * @param {Array<NamedStyle>} listOfStyles
 * @param {BreakpointState} breakpoint
 * @param {ReverseBreakpoints} breakpointsReverse
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
 * @param {StyleDictionary} styles
 * @param {string | Array<string | StyleFlags> | StyleFlags} args
 * @param {Array<boolean | number | string | null | undefined>} [dependencies]
 * @returns {Array<NamedStyle>}
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
