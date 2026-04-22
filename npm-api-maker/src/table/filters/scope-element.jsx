// @ts-check
/* eslint-disable no-return-assign, sort-imports */
import PropTypes from "prop-types"
import memo from "set-state-compare/build/memo.js"
import {Pressable} from "react-native"
import React from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "../../utils/text"

const dataSets = {}

/**
 * @typedef {object} Props
 * @property {boolean} [active]
 * @property {Function} onScopeClicked
 * @property {string} scope
 */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ScopeElement extends ShapeComponent {
  static defaultProps = {
    active: false
  }

  static propTypes = {
    active: PropTypes.bool,
    onScopeClicked: PropTypes.func.isRequired,
    scope: PropTypes.string.isRequired
  }

  render() {
    const {active, scope} = this.p
    const style = active ? /** @type {import("react-native").TextStyle} */ ({fontWeight: "bold"}) : undefined

    return (
      <Pressable
        dataSet={dataSets[`scope-${scope}`] ||= {class: "scope-element", scopeName: scope}}
        key={scope}
        onPress={this.tt.onScopeClicked}
      >
        <Text style={style}>
          {scope}
        </Text>
      </Pressable>
    )
  }

  onScopeClicked = (e) => {
    e.preventDefault()

    this.p.onScopeClicked({scope: this.p.scope})
  }
}))
