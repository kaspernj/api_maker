import {digg, digs} from "diggerize"
import EventUpdated from "./event-updated"
import * as inflection from "inflection"
import Params from "./params.mjs"
import PropTypes from "prop-types"
import React from "react"
import withQueryParams from "on-location-changed/src/with-query-params"

export default (WrappedComponent, modelClassArg, argsArg = {}) => {
  class ApiMakerWithModel extends React.PureComponent {
    static propTypes = {
      queryParams: PropTypes.object
    }

    modelClass = this.resolveModelClass(modelClassArg)
    args = this.resolveArgs()
    modelVariableName = inflection.camelize(this.modelClass.modelClassData().name, true)
    paramsVariableName = `${this.modelClass.modelName().paramKey()}_id`

    state = {
      model: undefined,
      modelId: this.getModelId(),
      notFound: undefined
    }

    resolveArgs() {
      if (typeof argsArg == "function") {
        return argsArg({
          modelClass: this.modelClass
        })
      }

      return argsArg
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
      if (this.args.newIfNoId && !this.getModelId()) {
        return await this.loadNewModel()
      } else if (!this.args.optional || this.getModelId()) {
        return await this.loadExistingModel()
      }
    }

    getModelId() {
      if (this.args.loadByQueryParam)
        return this.args.loadByQueryParam({props: this.props})

      return this.props.match.params[this.paramsVariableName] || this.props.match.params.id
    }

    loadExistingModel = async () => {
      const modelId = this.getModelId()
      const ModelClass = digg(this, "modelClass")
      const query = await ModelClass.ransack({id_eq: modelId})

      if (!modelId) throw new Error(`No model ID was given: ${modelId} by '${this.paramsVariableName}' in query params: ${Object.keys(this.props.match.params).join(", ")}`)
      if (this.args.abilities) query.abilities(this.args.abilities)
      if (this.args.preload) query.preload(this.args.preload)
      if (this.args.select) query.select(this.args.select)

      const model = await query.first()

      this.setState({
        model,
        notFound: !model
      })
    }

    async loadNewModel() {
      const params = Params.parse()
      const ModelClass = digg(this, "modelClass")
      const paramKey = ModelClass.modelName().paramKey()
      const modelDataFromParams = params[paramKey] || {}

      let defaults = {}

      if (this.args.newIfNoId?.defaults) {
        defaults = await this.args.newIfNoId.defaults()
      }

      const modelData = Object.assign(defaults, this.args.newAttributes, modelDataFromParams)
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

      wrappedComponentProps[this.modelVariableName] = model
      wrappedComponentProps[`${this.modelVariableName}Id`] = modelId
      wrappedComponentProps[`${this.modelVariableName}NotFound`] = notFound

      return (
        <>
          {this.args.events &&
            <EventEmitterListener event="reloadModel" events={this.args.events} onCalled={reloadModel} />
          }
          {model && this.args.eventUpdated &&
            <EventUpdated model={model} onUpdated={onUpdated} />
          }
          {model && this.args.onDestroyed &&
            <EventDestroyed model={model} onDestroyed={this.args.onDestroyed} />
          }
          <WrappedComponent {...wrappedComponentProps} {...this.props} />
        </>
      )
    }

    reloadModel = () => this.loadModel()
    onUpdated = this.loadExistingModel
  }

  return withQueryParams(ApiMakerWithModel)
}
