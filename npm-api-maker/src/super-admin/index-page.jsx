import BaseComponent from "../base-component"
import {memo} from "react"
import ModelClassTable from "./model-class-table"
import PropTypes from "prop-types"
import {shapeComponent} from "set-state-compare/src/shape-component.js"

export default memo(shapeComponent(class ApiMakerSuperAdminIndexPage extends BaseComponent {
  static propTypes = {
    modelClass: PropTypes.func.isRequired
  }

  render() {
    const {modelClass} = this.props

    return (
      <div className="super-admin--index-page">
        <ModelClassTable modelClass={modelClass} />
      </div>
    )
  }
}))
