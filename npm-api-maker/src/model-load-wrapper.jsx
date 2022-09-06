import {digg, digs} from "diggerize"
import EventUpdated from "./event-updated"
import Params from "./params.mjs"
import PropTypes from "prop-types"
import React from "react"
import withQueryParams from "on-location-changed/src/with-query-params"

export default (WrappedComponent, mdelClassArg, args = {}) => {
  class ModelLoadWrapper extends React.PureComponent {
    static propTypes = {
      queryParams: PropTypes.object
    }

    modelClass = this.resolveModelClass(mdelClassArg)
    camelizedLower = this.modelClass.modelName().camelizedLower()
    paramsVariableName = `${this.modelClass.modelName().paramKey()}_id`

    state = {
      model: undefined,
      modelId: this.getModelId(),
      notFound: undefined
    }

    resolveModelClass(modelClassArg) {
      if (typeof modelClassArg == "object") {
        const {queryParams} = digs(this.props, "queryParams")

        return modelClassArg.callback({queryParams})
      }

      return modelClassArg
    }

    componentDidMount() {
      this.loadModel()
    }

    componentDidUpdate() {
      const newModelId = this.getModelId()

      // The model ID was changed in the URL and a different model should be loaded
      if (newModelId != this.state.modelId) {
        this.setState({model: undefined, modelId: newModelId})
        this.loadExistingModel()
      }
    }

    loadModel = async () => {
      if (args.newIfNoId && !this.getModelId()) {
        return await this.loadNewModel()
      } else if (!args.optional || this.getModelId()) {
        return await this.loadExistingModel()
      }
    }

    getModelId() {
      if (args.loadByQueryParam)
        return args.loadByQueryParam({props: this.props})

      return this.props.match.params[this.paramsVariableName] || this.props.match.params.id
    }

    loadExistingModel = async () => {
      const modelId = this.getModelId()
      const ModelClass = digg(this, "modelClass")
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

  if (args.loadByQueryParam) return withQueryParams(ModelLoadWrapper)

  return ModelLoadWrapper
}
