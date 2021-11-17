const AttributeRow = require("./attribute-row").default
const {digg} = require("diggerize")
const PropTypes = require("prop-types")
const propTypesExact = require("prop-types-exact")
const React = require("react")
const strftime = require("strftime")

export default class ApiMakerBootstrapAttributeRows extends React.PureComponent {
  static defaultProps = {
    checkIfAttributeLoaded: false
  }

  static propTypes = propTypesExact({
    attributes: PropTypes.array.isRequired,
    checkIfAttributeLoaded: PropTypes.bool.isRequired,
    model: PropTypes.object.isRequired
  })

  constructor (props) {
    super(props)
    this.state = {
      classObject: props.model.modelClass()
    }
  }

  render () {
    return this.props.attributes.map((attribute) =>
      <AttributeRow attribute={attribute} key={`attribute-${attribute}`} label={this.state.classObject.humanAttributeName(attribute)}>
        {this.valueContent(attribute)}
      </AttributeRow>
    )
  }

  value (attribute) {
    if (!(attribute in this.props.model))
      throw new Error(`Attribute not found: ${digg(this.props.model.modelClassData(), "name")}#${attribute}`)

    if (this.props.checkIfAttributeLoaded && !this.props.model.isAttributeLoaded(attribute))
      return null

    return this.props.model[attribute]()
  }

  valueContent (attribute) {
    const value = this.value(attribute)

    if (value instanceof Date) {
      return strftime("%Y-%m-%d %H:%M", value)
    } else if (typeof value === "boolean") {
      if (value)
        return I18n.t("js.shared.yes")

      return I18n.t("js.shared.no")
    } else {
      return value
    }
  }
}
