const {digg} = require("@kaspernj/object-digger")
const PropTypes = require("prop-types")
const PropTypesExact = require("prop-types-exact")
const React = require("react")

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
    // Apparently 'componentWillUnmount' can be called without 'componentDidMount' was called. Several bug reports on this.
    if (this.connectUpdated) {
      this.connectUpdated.unsubscribe()
    }
  }

  connect() {
    this.connectUpdated = this.props.model.connectUpdated(args => {
      if (!this.props.attribute || args.model.isAttributeLoaded(this.props.attribute)) {
        this.setState(
          {model: args.model},
          () => this.setAttribute()
        )
      } else {
        this.loadModelWithAttribute()
      }
    })
  }

  // This loads the model from the backend with the primary key and the attribute and calls setAttribute
  async loadModelWithAttribute() {
    const id = this.props.model.primaryKey()
    const modelClass = this.props.model.modelClass()
    const modelName = digg(modelClass.modelClassData(), "name")
    const primaryKey = digg(modelClass.modelClassData(), "primaryKey")

    const args = {}
    args[`${primaryKey}_eq`] = id

    const select = {}
    select[modelName] = [primaryKey, this.props.attribute]

    const model = await modelClass.ransack(args).select(select).first()

    this.setState(
      {model},
      () => this.setAttribute()
    )
  }

  setAttribute() {
    let newValue

    if (this.props.onValue) {
      newValue = this.props.onValue.apply(null, [{model: this.state.model}])
    } else {
      if (!this.state.model[this.props.attribute])
        throw new Error(`No such method: ${digg(this.state.model.modelClassData(), "name")}#${this.props.attribute}()`)

      newValue = this.state.model[this.props.attribute].apply(this.state.model)
    }

    this.setState({
      value: newValue
    })
  }

  render() {
    if (this.state.value === undefined)
      return null

    return this.state.value
  }
}
