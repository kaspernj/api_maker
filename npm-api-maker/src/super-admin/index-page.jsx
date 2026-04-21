// @ts-check
/* eslint-disable sort-imports */
import memo from "set-state-compare/build/memo.js"
import ModelClassTable from "./model-class-table"
import PropTypes from "prop-types"
import React from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import {View} from "react-native"

/**
 * @typedef {object} Props
 * @property {Function} modelClass
 */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerSuperAdminIndexPage extends ShapeComponent {
  static propTypes = {
    modelClass: PropTypes.func.isRequired
  }

  render() {
    const {modelClass} = this.props

    return (
      <View testID="super-admin/index-page">
        <ModelClassTable modelClass={modelClass} />
      </View>
    )
  }
}))
