import {shapeComponent} from "set-state-compare/build/shape-component.js"
import PropTypes from "prop-types" // eslint-disable-line sort-imports
import React from "react"
import AttributeRow from "./attribute-row" // eslint-disable-line sort-imports
import BaseComponent from "../base-component"
import memo from "set-state-compare/build/memo.js"
import propTypesExact from "prop-types-exact"

export default memo(shapeComponent(class ApiMakerBootstrapAttributeRows extends BaseComponent {
  static defaultProps = {
    checkIfAttributeLoaded: false,
    defaultDateFormatName: undefined,
    defaultDateTimeFormatName: undefined
  }

  static propTypes = propTypesExact({
    attributes: PropTypes.array.isRequired,
    checkIfAttributeLoaded: PropTypes.bool.isRequired,
    defaultDateFormatName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    defaultDateTimeFormatName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    model: PropTypes.object.isRequired
  })

  render () {
    const {attributes, checkIfAttributeLoaded, defaultDateFormatName, defaultDateTimeFormatName, model} = this.p

    return attributes.map((attribute) => ( // eslint-disable-line no-extra-parens
      <AttributeRow
        attribute={attribute}
        checkIfAttributeLoaded={checkIfAttributeLoaded}
        defaultDateFormatName={defaultDateFormatName}
        defaultDateTimeFormatName={defaultDateTimeFormatName}
        key={`attribute-${attribute}`}
        model={model}
      />
    ))
  }
}))
