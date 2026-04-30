// @ts-check
/* eslint-disable sort-imports */
import React, {createContext} from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import PropTypes from "prop-types"
import memo from "set-state-compare/build/memo.js"
import propTypesExact from "prop-types-exact"

/**
 * @typedef {object} CurrentSwitchContextValue
 * @property {string | undefined} pathShown
 * @property {Record<string, boolean>} pathsMatched
 * @property {{s: State, setPathMatched: (path: string, matched: boolean) => void} | null} switchGroup
 */

const CurrentSwitchContext = createContext(/** @type {CurrentSwitchContextValue} */ ({
  pathShown: undefined,
  pathsMatched: {},
  switchGroup: null
}))

/**
 * @typedef {object} Props
 * @property {React.ReactNode} [children]
 * @property {string} [name]
 * @property {boolean} [single]
 */
/**
 * @typedef {object} State
 * @property {number} lastUpdate
 * @property {string | undefined} pathShown
 * @property {Record<string, boolean>} pathsMatched
 */
const Switch = memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class Switch extends ShapeComponent {
  static defaultProps = {
    name: "[no name]",
    single: true
  }

  static propTypes = propTypesExact({
    children: PropTypes.any,
    name: PropTypes.string,
    single: PropTypes.bool
  })

  pathsMatchedKeys = []
  state = {
    lastUpdate: Date.now(),
    pathShown: undefined,
    pathsMatched: {}
  }

  setup() {}

  render() {
    const {pathShown, pathsMatched} = this.s

    return (
      <CurrentSwitchContext.Provider value={/** @type {CurrentSwitchContextValue} */ ({pathShown, pathsMatched, switchGroup: this})}>
        {this.props.children}
      </CurrentSwitchContext.Provider>
    )
  }

  pathShown(pathsMatched) {
    for (const pathMatched of this.tt.pathsMatchedKeys) {
      const isPathMatched = pathsMatched[pathMatched]

      if (isPathMatched) {
        return pathMatched
      }
    }
  }

  setPathMatched(path, matched) {
    const {pathsMatchedKeys} = this.tt
    const {pathsMatched} = this.s

    if (!path) throw new Error("No 'path' given")
    if (pathsMatched[path] == matched) return

    if (!pathsMatchedKeys.includes(path)) {
      pathsMatchedKeys.push(path)
    }

    const newPathsMatched = {...this.s.pathsMatched}

    newPathsMatched[path] = matched

    this.s.lastUpdate = Math.random() + new Date().getTime()
    this.s.pathShown = this.pathShown(newPathsMatched)
    this.s.pathsMatched = newPathsMatched
  }
}))

export {CurrentSwitchContext}
export default Switch
