import BaseComponent from "../base-component"
import React, {createContext} from "react"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/build/shape-component.js"

const CurrentSwitchContext = createContext([])

const Switch = memo(shapeComponent(class Switch extends BaseComponent {
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

  setup() {
    this.useStates({
      lastUpdate: new Date(),
      pathShown: undefined,
      pathsMatched: {}
    })
  }

  render() {
    const {pathShown, pathsMatched} = this.s

    return (
      <CurrentSwitchContext.Provider value={{pathShown, pathsMatched, switchGroup: this}}>
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

    this.setState({
      lastUpdate: Math.random() + new Date().getTime(),
      pathShown: this.pathShown(newPathsMatched),
      pathsMatched: newPathsMatched
    })
  }
}))

export {CurrentSwitchContext}
export default Switch
