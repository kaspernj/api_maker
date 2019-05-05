import PropTypes from "prop-types"
import React from "react"

export default class ApiMakerUpdatedAttribute extends React.Component {
  static propTypes = {
    attribute: PropTypes.string,
    model: PropTypes.object.isRequired,
    onValue: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      model: this.props.model
    }
  }

  componentWillMount() {
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
    var newValue

    if (this.props.onValue) {
      newValue = this.props.onValue.apply(null, [{model: this.state.model}])
    } else {
      if (!this.state.model[this.props.attribute])
        throw new Error(`No such method: ${this.state.model.modelClassData().name()}#${this.props.attribute}()`)

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
