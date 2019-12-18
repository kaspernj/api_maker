import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerUpdatedAttribute extends React.Component {
  static propTypes = PropTypesExact({
    attribute: PropTypes.string,
    model: PropTypes.object.isRequired,
    onValue: PropTypes.func
  })

  constructor(props) {
    super(props)
    this.state = {
      model: this.props.model
    }
  }

  componentDidMount() {
    this.setAttribute()
    this.connect()
  }

  componentWillUnmount() {
    this.connectUpdated.unsubscribe()
  }

  connect() {
    this.connectUpdated = this.props.model.connectUpdated(args =>
      this.setState(
        {model: args.model},
        () => this.setAttribute()
      )
    )
  }

  setAttribute() {
    let newValue

    if (this.props.onValue) {
      newValue = this.props.onValue.apply(null, [{model: this.state.model}])
    } else {
      if (!this.state.model[this.props.attribute])
        throw new Error(`No such method: ${this.state.model.modelClassData().name}#${this.props.attribute}()`)

      newValue = this.state.model[this.props.attribute].apply(this.state.model)
    }

    this.setState({
      value: newValue
    })
  }

  render() {
    if (this.state.value === undefined)
      return ""

    return this.state.value
  }
}
