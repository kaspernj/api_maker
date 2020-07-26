import AttributeRow from "./attribute-row"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerBootstrapAttributeRows extends React.Component {
  static defaultProps = {
    checkIfAttributeLoaded: false
  }

  static propTypes = PropTypesExact({
    attributes: PropTypes.array.isRequired,
    checkIfAttributeLoaded: PropTypes.bool.isRequired,
    model: PropTypes.object.isRequired
  })

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

    if (this.props.checkIfAttributeLoaded && !this.props.model.isAttributeLoaded(attribute))
      return ""

    return this.props.model[attribute]()
  }

  valueContent(attribute) {
    const value = this.value(attribute)

    if (value instanceof Date) {
      return I18n.strftime(value, "%Y-%m-%d %H:%M")
    } else if (typeof value === "boolean") {
      if (value)
        return I18n.t("js.shared.yes")

      return I18n.t("js.shared.no")
    } else {
      return value
    }
  }
}
