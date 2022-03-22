export default (WrappedComponent, ModelClass, args = {}) => class modelLoadWrapper extends BaseComponent {
  camelizedLower = ModelClass.modelName().camelizedLower()
  paramsVariableName = `${ModelClass.modelName().paramKey()}_id`

  shape = new Shape(this, {
    model: undefined,
    modelId: this.props.match.params[this.paramsVariableName] || this.props.match.params.id
  })

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
    const {modelId} = digs(this.shape, "modelId")
    const query = await ModelClass.ransack({id_eq: modelId})

    if (args.preload) query.preload(args.preload)
    if (args.select) query.select(args.select)

    const model = await query.first()

    this.shape.set({model})
  }

  loadNewModel() {
    const model = new ModelClass()

    this.shape.set({model})
  }

  render() {
    const {model, modelId} = digs(this.shape, "model", "modelId")
    const wrappedComponentProps = {}

    wrappedComponentProps[this.camelizedLower] = model
    wrappedComponentProps[`${this.camelizedLower}Id`] = modelId

    return (
      <WrappedComponent {...wrappedComponentProps} {...this.props} />
    )
  }
}
