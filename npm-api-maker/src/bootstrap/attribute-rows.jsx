// @ts-check
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import PropTypes from "prop-types" // eslint-disable-line sort-imports
import React from "react"
import AttributeRow from "./attribute-row" // eslint-disable-line sort-imports
import memo from "set-state-compare/build/memo.js"
import propTypesExact from "prop-types-exact"

/**
 * @typedef {object} Props
 * @property {any[]} attributes
 * @property {boolean=} checkIfAttributeLoaded
 * @property {Function|string=} defaultDateFormatName
 * @property {Function|string=} defaultDateTimeFormatName
 * @property {object} model
 */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerBootstrapAttributeRows extends ShapeComponent {
  static defaultProps = {
    checkIfAttributeLoaded: false,
    defaultDateFormatName: undefined,
    defaultDateTimeFormatName: undefined
  }

  static propTypes = propTypesExact({
    attributes: PropTypes.array.isRequired,
    checkIfAttributeLoaded: PropTypes.bool,
    defaultDateFormatName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    defaultDateTimeFormatName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    model: PropTypes.object.isRequired
  })

  render () {
    const {attributes, checkIfAttributeLoaded, defaultDateFormatName, defaultDateTimeFormatName, model} = this.p

    return attributes.map((attribute) => (
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
