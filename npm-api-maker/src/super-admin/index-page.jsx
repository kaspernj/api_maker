import BaseComponent from "../base-component.js"
import memo from "set-state-compare/src/memo.js"
import ModelClassTable from "./model-class-table.jsx"
import PropTypes from "prop-types"
import React from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
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
