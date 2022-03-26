import Params from "./params.cjs"
import React from "react"

export default (WrappedComponent, ModelClass, args = {}) => class modelLoadWrapper extends React.PureComponent {
  camelizedLower = ModelClass.modelName().camelizedLower()
  paramsVariableName = `${ModelClass.modelName().paramKey()}_id`

  state = {
    model: undefined,
    modelId: this.props.match.params[this.paramsVariableName] || this.props.match.params.id
  }

  componentDidMount() {
    if (args.newIfNoId && !this.getModelId()) {
      this.loadNewModel()
    } else if (!args.optional || this.getModelId()) {
      this.loadExistingModel()
    }
  }

  getModelId() {
    return this.props.match.params[this.paramsVariableName] || this.props.match.params.id
  }

  async loadExistingModel() {
    const {modelId} = digs(this.state, "modelId")
    const query = await ModelClass.ransack({id_eq: modelId})

    if (args.abilities) query.abilities(args.abilities)
    if (args.preload) query.preload(args.preload)
    if (args.select) query.select(args.select)

    const model = await query.first()

    this.setState({model})
  }

  loadNewModel() {
    const params = Params.parse()
    const paramKey = ModelClass.modelName().paramKey()
    const modelDataFromParams = params[paramKey] || {}
    const modelData = Object.assign({}, args.newAttributes, modelDataFromParams)
    const model = new ModelClass(modelData)

    this.setState({model})
  }

  render() {
    const {model, modelId} = digs(this.state, "model", "modelId")
    const wrappedComponentProps = {}

    wrappedComponentProps[this.camelizedLower] = model
    wrappedComponentProps[`${this.camelizedLower}Id`] = modelId

    return (
      <WrappedComponent {...wrappedComponentProps} {...this.props} />
    )
  }
}
