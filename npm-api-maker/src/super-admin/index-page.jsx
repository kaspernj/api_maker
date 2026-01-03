/* eslint-disable sort-imports */
import BaseComponent from "../base-component"
import memo from "set-state-compare/build/memo.js"
import ModelClassTable from "./model-class-table"
import PropTypes from "prop-types"
import React from "react"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import {View} from "react-native"

export default memo(shapeComponent(class ApiMakerSuperAdminIndexPage extends BaseComponent {
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
