import AttributeRow from "./attribute-row"
import PropTypes from "prop-types"
import React from "react"

export default class BootstrapAttributeRows extends React.Component {
  static propTypes = {
    attributes: PropTypes.array.isRequired,
    model: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      classObject: props.model.modelClass()
    }
  }

  render() {
    return this.props.attributes.map((attribute) =>
      <AttributeRow key={`attribute-${attribute}`} label={this.state.classObject.humanAttributeName(attribute)}>
        {this.valueContent(attribute)}
      </AttributeRow>
    )
  }

  value(attribute) {
    if (!(attribute in this.props.model))
      throw new Error(`Attribute not found: ${this.props.model.modelClassData().name}#${attribute}`)

    return this.props.model[attribute]()
  }

  valueContent(attribute) {
    var value = this.value(attribute)

    if (value instanceof Date) {
      return I18n.strftime(value, "%Y-%m-%d %H:%M")
    } else if (typeof value === "boolean") {
      if (value)
        return I18n.t("js.shared.yes")

      return I18n.t("js.shared.no")
    } else {
      return this.value(attribute)
    }
  }
}
