import { EventCreated, EventDestroyed, EventUpdated, Params } from "@kaspernj/api-maker"
import { Card, Paginate } from "@kaspernj/api-maker-bootstrap"
import Collection from "api-maker/collection"
import { debounce } from "debounce"
import { digg } from "@kaspernj/object-digger"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

const inflection = require("inflection")

export default class ApiMakerBootstrapLiveTable extends React.Component {
  static defaultProps = {
    destroyEnabled: true,
    preloads: [],
    select: {}
  }

  static propTypes = PropTypesExact({
    abilities: PropTypes.object,
    actionsContent: PropTypes.func,
    className: PropTypes.string,
    collection: PropTypes.instanceOf(Collection),
    columnsContent: PropTypes.func.isRequired,
    controls: PropTypes.func,
    defaultParams: PropTypes.object,
    destroyEnabled: PropTypes.bool.isRequired,
    destroyMessage: PropTypes.string,
    editModelPath: PropTypes.func,
    filterContent: PropTypes.func,
    filterSubmitLabel: PropTypes.node,
    headersContent: PropTypes.func.isRequired,
    header: PropTypes.func,
    modelClass: PropTypes.func.isRequired,
    onModelsLoaded: PropTypes.func,
    preloads: PropTypes.array.isRequired,
    queryName: PropTypes.string,
    select: PropTypes.object
  })

  constructor(props) {
    super(props)

    let queryName = props.queryName

    if (!queryName) {
      queryName = digg(props.modelClass.modelClassData(), "collectionKey")
    }

    this.state = {
      currentHref: location.href,
      queryName,
      queryQName: `${queryName}_q`,
      queryPageName: `${queryName}_page`
    }
  }

  componentDidMount() {
    this.loadQParams().then(() => this.loadModels())
  }

  componentDidUpdate() {
    if (this.state.currentHref != location.href) {
      const { queryQName } = this.state
      const params = Params.parse()
      const qParams = params[queryQName] || {}
      this.setState({currentHref: location.href, qParams}, () => this.loadModels())
    }
  }

  abilitiesToLoad() {
    const abilitiesToLoad = {}
    const {abilities, modelClass} = this.props
    const ownAbilities = []

    if (this.props.destroyEnabled) {
      ownAbilities.push("destroy")
    }

    if (this.props.editModelPath) {
      ownAbilities.push("edit")
    }

    if (this.props.viewModelPath) {
      ownAbilities.push("show")
    }

    if (ownAbilities.length > 0) {
      const modelClassName = modelClass.modelClassData().name

      abilitiesToLoad[modelClassName] = ownAbilities
    }

    if (abilities) {
      for (const modelName in abilities) {
        if (!(modelName in abilitiesToLoad)) {
          abilitiesToLoad[modelName] = []
        }

        for (const ability of abilities[modelName]) {
          abilitiesToLoad[modelName].push(ability)
        }
      }
    }

    return abilitiesToLoad
  }

  async loadQParams() {
    const { queryQName } = this.state
    const params = Params.parse()
    const qParams = params[queryQName] || this.props.defaultParams || {}
    return this.setState({qParams})
  }

  loadModelsDebounce = debounce(() => this.loadModels())

  async loadModels() {
    const params = Params.parse()
    const { abilities, modelClass, onModelsLoaded, preloads, select } = this.props
    const { qParams, queryPageName, queryQName } = this.state
    let query

    if (this.props.collection) {
      query = this.props.collection
    } else {
      query = modelClass
    }

    query = query
      .ransack(qParams)
      .searchKey(queryQName)
      .page(params[queryPageName])
      .pageKey(queryPageName)
      .preload(preloads)
      .select(select)

    const abilitiesToLoad = this.abilitiesToLoad()

    if (Object.keys(abilitiesToLoad).length > 0) {
      query = query.abilities(abilitiesToLoad)
    }

    const result = await query.result()

    if (onModelsLoaded) {
      onModelsLoaded({
        models: result.models(),
        qParams,
        query,
        result
      })
    }

    this.setState({query, result, models: result.models()})
  }

  render() {
    const { qParams, query, result, models } = this.state

    return (
      <div className={this.className()}>
        {qParams && query && result && models && this.content()}
      </div>
    )
  }

  content() {
    const { actionsContent, controls, destroyEnabled, editModelPath, filterContent, filterSubmitLabel, header, modelClass } = this.props
    const { qParams, query, result, models } = this.state

    let controlsContent, headerContent

    if (controls) {
      controlsContent = controls({models, qParams, query, result})
    }

    if (header) {
      headerContent = header({models, qParams, query, result})
    }

    return (
      <div className="content-container">
        <EventCreated modelClass={modelClass} onCreated={() => this.onModelCreated()} />

        {filterContent &&
          <Card className="mb-4">
            <form onSubmit={(e) => this.onFilterFormSubmit(e)} ref="filterForm">
              {filterContent({qParams})}
              <input className="btn btn-primary" label={filterSubmitLabel} type="submit" />
            </form>
          </Card>
        }

        {models.map(model =>
          <React.Fragment key={`events-${model.id()}`}>
            <EventDestroyed model={model} onDestroyed={(args) => this.onModelDestroyed(args)} />
            <EventUpdated model={model} onUpdated={(args) => this.onModelUpdated(args)} />
          </React.Fragment>
        )}

        <Card className="mb-4" controls={controlsContent} header={headerContent} table>
          <thead>
            <tr>
              {this.props.headersContent({query})}
              <th />
            </tr>
          </thead>
          <tbody>
            {models.map(model =>
              <tr className={`${inflection.singularize(modelClass.modelClassData().collectionName)}-row`} data-model-id={model.id()} key={model.cacheKey()}>
                {this.props.columnsContent({model})}
                <td className="actions-column text-nowrap text-right">
                  {actionsContent && actionsContent({model})}
                  {editModelPath && model.can("edit") &&
                    <Link className="edit-button" to={editModelPath({model})}>
                      <i className="la la-edit" />
                    </Link>
                  }
                  {destroyEnabled && model.can("destroy") &&
                    <a className="destroy-button" href="#" onClick={(e) => this.onDestroyClicked(e, model)}>
                      <i className="la la-remove" />
                    </a>
                  }
                </td>
              </tr>
            )}
          </tbody>
        </Card>

        <Paginate result={result} />
      </div>
    )
  }

  className() {
    const classNames = ["component-api-maker-live-table"]

    if (this.props.className)
      classNames.push(this.props.className)

    return classNames.join(" ")
  }

  async onDestroyClicked(e, model) {
    e.preventDefault()

    const {destroyMessage} = this.props

    if (!confirm(I18n.t("js.shared.are_you_sure"))) {
      return
    }

    try {
      model.destroy()

      if (destroyMessage) {
        Notification.success(destroyMessage)
      }
    } catch (error) {
      Notification.errorResponse(error)
    }
  }

  onFilterFormSubmit(e) {
    e.preventDefault()

    const qParams = Params.serializeForm(this.refs.filterForm)
    const { queryQName } = this.state

    const changeParamsParams = {}
    changeParamsParams[queryQName] = qParams

    Params.changeParams(changeParamsParams)

    this.setState({currentHref: location.href, qParams}, () => this.loadModels())
  }

  onModelCreated() {
    this.loadModels()
  }

  onModelDestroyed(args) {
    this.setState({
      models: this.state.models.filter(model => model.id() != args.model.id())
    })
  }

  onModelUpdated(args) {
    const updatedModel = digg(args, "model")
    const foundModel = this.state.models.find((model) => model.id() == updatedModel.id())

    if (foundModel) {
      this.loadModelsDebounce()
    }
  }
}
