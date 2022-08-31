import classNames from "classnames"
import {digg} from "diggerize"
import MoneyFormatter from "../../money-formatter"
import PropTypes from "prop-types"
import React from "react"
import strftime from "strftime"

export default class ApiMakerBootstrapAttributeRow extends React.PureComponent {
  static defaultProps = {
    checkIfAttributeLoaded: false
  }

  static propTypes = {
    attribute: PropTypes.string,
    checkIfAttributeLoaded: PropTypes.bool.isRequired,
    children: PropTypes.node,
    identifier: PropTypes.string,
    label: PropTypes.node,
    model: PropTypes.object,
    value: PropTypes.node
  }

  render () {
    const {attribute, checkIfAttributeLoaded, children, className, identifier, label, model, value, ...restProps} = this.props

    return (
      <div
        className={classNames(className, "component-api-maker-attribute-row")}
        data-attribute={attribute}
        data-identifier={identifier}
        {...restProps}
      >
        <div className="attribute-row-label">
          {this.label()}
        </div>
        <div className="attribute-row-value">
          {this.value()}
        </div>
      </div>
    )
  }

  label() {
    const {attribute, label, model} = this.props

    if ("label" in this.props) return label
    if (attribute && model) return model.constructor.humanAttributeName(attribute)

    throw new Error("Couldn't figure out label")
  }

  value() {
    const {attribute, checkIfAttributeLoaded, children, model} = this.props

    if (children) return children

    if (attribute && !(attribute in model))
      throw new Error(`Attribute not found: ${digg(model.modelClassData(), "name")}#${attribute}`)

    if (attribute && checkIfAttributeLoaded && !model.isAttributeLoaded(attribute))
      return null

    if (attribute && model) {
      const value = model[attribute]()

      return this.valueContent(value)
    }
  }

  valueContent(value) {
    if (value instanceof Date) {
      return strftime("%Y-%m-%d %H:%M", value)
    } else if (typeof value === "boolean") {
      if (value)
        return I18n.t("js.shared.yes")

      return I18n.t("js.shared.no")
    } else if (MoneyFormatter.isMoney(value)) {
      return MoneyFormatter.format(value)
    } else {
      return value
    }
  }
}
