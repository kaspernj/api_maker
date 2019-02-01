import AttributeRow from "./attribute-row"
import PropTypes from "prop-types"
import React from "react"

export default class BootstrapAttributeRows extends React.Component {
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
    return this.props.model[attribute]()
  }

  valueContent(attribute) {
    var value = this.value(attribute)

    if (value instanceof Date) {
      return I18n.strftime(value, "%Y-%m-%d %H:%M")
    } else {
      return this.value(attribute)
    }
  }
}

BootstrapAttributeRows.propTypes = {
  attributes: PropTypes.array.isRequired,
  model: PropTypes.object.isRequired
}
