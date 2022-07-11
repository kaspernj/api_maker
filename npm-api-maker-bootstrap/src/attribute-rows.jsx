import AttributeRow from "./attribute-row"
import {digs} from "diggerize"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerBootstrapAttributeRows extends React.PureComponent {
  static defaultProps = {
    checkIfAttributeLoaded: false
  }

  static propTypes = propTypesExact({
    attributes: PropTypes.array.isRequired,
    checkIfAttributeLoaded: PropTypes.bool.isRequired,
    model: PropTypes.object.isRequired
  })

  classObject = this.props.model.modelClass()

  render () {
    const {attributes, checkIfAttributeLoaded, model} = digs(this.props, "attributes", "checkIfAttributeLoaded", "model")

    return attributes.map((attribute) =>
      <AttributeRow attribute={attribute} checkIfAttributeLoaded={checkIfAttributeLoaded} key={`attribute-${attribute}`} model={model} />
    )
  }
}
