const AttributeRow = require("./attribute-row").default
const PropTypes = require("prop-types")
const propTypesExact = require("prop-types-exact")
const React = require("react")

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
