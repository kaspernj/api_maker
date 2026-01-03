import {shapeComponent} from "set-state-compare/build/shape-component.js"
import PropTypes from "prop-types" // eslint-disable-line sort-imports
import React from "react"
import AttributeRow from "./attribute-row" // eslint-disable-line sort-imports
import BaseComponent from "../base-component"
import memo from "set-state-compare/build/memo.js"
import propTypesExact from "prop-types-exact"

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

    return attributes.map((attribute) => {
      return (
        <AttributeRow
          attribute={attribute}
          checkIfAttributeLoaded={checkIfAttributeLoaded}
          key={`attribute-${attribute}`}
          model={model}
        />
      )
    })
  }
}))
