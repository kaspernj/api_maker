import EventUpdated from "./event-updated"
import Params from "./params.mjs"
import React from "react"

export default (WrappedComponent, ModelClass, args = {}) => class modelLoadWrapper extends React.PureComponent {
  camelizedLower = ModelClass.modelName().camelizedLower()
  paramsVariableName = `${ModelClass.modelName().paramKey()}_id`

  state = {
    model: undefined,
    modelId: this.props.match.params[this.paramsVariableName] || this.props.match.params.id,
    notFound: undefined
  }

  componentDidMount() {
    this.loadModel()
  }

  loadModel = async () => {
    if (args.newIfNoId && !this.getModelId()) {
      return await this.loadNewModel()
    } else if (!args.optional || this.getModelId()) {
      return await this.loadExistingModel()
    }
  }

  getModelId() {
    return this.props.match.params[this.paramsVariableName] || this.props.match.params.id
  }

  loadExistingModel = async () => {
    const {modelId} = digs(this.state, "modelId")
    const query = await ModelClass.ransack({id_eq: modelId})

    if (args.abilities) query.abilities(args.abilities)
    if (args.preload) query.preload(args.preload)
    if (args.select) query.select(args.select)

    const model = await query.first()

    this.setState({
      model,
      notFound: !model
    })
  }

  async loadNewModel() {
    const params = Params.parse()
    const paramKey = ModelClass.modelName().paramKey()
    const modelDataFromParams = params[paramKey] || {}

    let defaults = {}

    if (args.newIfNoId?.defaults) {
      defaults = await args.newIfNoId.defaults()
    }

    const modelData = Object.assign(defaults, args.newAttributes, modelDataFromParams)
    const model = new ModelClass({
      isNewRecord: true,
      data: {a: modelData}
    })

    this.setState({model})
  }

  render() {
    const {onUpdated, reloadModel} = digs(this, "onUpdated", "reloadModel")
    const {model, modelId, notFound} = digs(this.state, "model", "modelId", "notFound")
    const wrappedComponentProps = {}

    wrappedComponentProps[this.camelizedLower] = model
    wrappedComponentProps[`${this.camelizedLower}Id`] = modelId
    wrappedComponentProps[`${this.camelizedLower}NotFound`] = notFound

    return (
      <>
        {args.events &&
          <EventEmitterListener event="reloadModel" events={args.events} onCalled={reloadModel} />
        }
        {model && args.eventUpdated &&
          <EventUpdated model={model} onUpdated={onUpdated} />
        }
        <WrappedComponent {...wrappedComponentProps} {...this.props} />
      </>
    )
  }

  reloadModel = () => this.loadModel()
  onUpdated = this.loadExistingModel
}
