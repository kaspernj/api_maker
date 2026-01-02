import AttributeRow from "./attribute-row.js"
import BaseComponent from "../base-component.js"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"
import {shapeComponent} from "set-state-compare/build/shape-component.js"

export default memo(shapeComponent(class ApiMakerBootstrapAttributeRows extends BaseComponent {
  static defaultProps = {
    checkIfAttributeLoaded: false
  }

  static propTypes = propTypesExact({
    attributes: PropTypes.array.isRequired,
    checkIfAttributeLoaded: PropTypes.bool.isRequired,
    model: PropTypes.object.isRequired
  })

  render () {
    const {attributes, checkIfAttributeLoaded, model} = this.p

    return attributes.map((attribute) =>
      <AttributeRow attribute={attribute} checkIfAttributeLoaded={checkIfAttributeLoaded} key={`attribute-${attribute}`} model={model} />
    )
  }
}))
