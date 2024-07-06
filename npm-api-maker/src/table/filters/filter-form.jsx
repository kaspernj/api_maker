import AttributeElement from "./attribute-element"
import {digg, digs} from "diggerize"
import * as inflection from "inflection"
import Input from "../../inputs/input"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {memo, useMemo, useRef} from "react"
import ReflectionElement from "./reflection-element"
import ScopeElement from "./scope-element"
import Select from "../../inputs/select"
import Services from "../../services.mjs"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"

export default memo(shapeComponent(class ApiMakerTableFiltersFilterForm extends ShapeComponent {
  static propTypes = PropTypesExact({
    filter: PropTypes.object,
    modelClass: PropTypes.func.isRequired,
    onApplyClicked: PropTypes.func.isRequired,
    querySearchName: PropTypes.string.isRequired
  })

  setup() {
    this.useStates({
      attribute: () => this.currentModelClassFromPath(this.props.filter.p || [])
        .ransackableAttributes()
        .find((attribute) => attribute.name() == this.props.filter.a),
      path: this.props.filter.p || [],
      predicate: undefined,
      predicates: undefined,
      scope: this.props.filter.sc,
      value: this.props.filter.v
    })
    this.valueInputRef = useRef()

    useMemo(() => {
      this.loadRansackPredicates()
    }, [])
  }

  async loadRansackPredicates() {
    const response = await Services.current().sendRequest("Ransack::Predicates")
    const predicates = digg(response, "predicates")
    let currentPredicate

    if (this.props.filter.pre) {
      currentPredicate = predicates.find((predicate) => predicate.name == this.props.filter.pre)
    }

    this.setState({
      predicate: currentPredicate,
      predicates
    })
  }

  render() {
    const {valueInputRef} = digs(this, "valueInputRef")
    const currentModelClass = this.currentModelClass()
    const {attribute, predicate, predicates, scope, value} = this.s
    let submitEnabled = false

    if (attribute && predicate) {
      submitEnabled = true
    } else if (scope) {
      submitEnabled = true
    }

    return (
      <div className="api-maker--table--filters--filter-form">
        <form onSubmit={this.tt.onSubmit}>
          <div>
            {this.currentPathParts().map(({translation}, pathPartIndex) =>
              <span key={`${pathPartIndex}-${translation}`}>
                {pathPartIndex > 0 &&
                  <span style={{marginRight: "5px", marginLeft: "5px"}}>
                    -
                  </span>
                }
                {translation}
              </span>
            )}
          </div>
          <div style={{display: "flex"}}>
            <div>
              {this.sortedByName(this.reflectionsWithModelClass(currentModelClass.ransackableAssociations()), currentModelClass).map((reflection) =>
                <ReflectionElement
                  currentModelClass={currentModelClass}
                  key={reflection.name()}
                  onClick={this.tt.onReflectionClicked}
                  reflection={reflection}
                />
              )}
            </div>
            <div>
              {this.sortedByName(currentModelClass.ransackableAttributes(), currentModelClass).map((attribute) =>
                <AttributeElement
                  active={attribute.name() == this.state.attribute?.name()}
                  attribute={attribute}
                  currentModelClass={currentModelClass}
                  key={attribute.name()}
                  onClick={this.tt.onAttributeClicked}
                />
              )}
              {currentModelClass.ransackableScopes().map((scope) =>
                <ScopeElement
                  active={scope.name() == this.state.scope?.name()}
                  key={scope.name()}
                  scope={scope}
                  onScopeClicked={this.tt.onScopeClicked}
                />
              )}
            </div>
            <div>
              {predicates && !this.state.scope &&
                <Select
                  className="predicate-select"
                  defaultValue={predicate?.name}
                  includeBlank
                  onChange={this.tt.onPredicateChanged}
                  options={predicates.map((predicate) => digg(predicate, "name"))}
                />
              }
            </div>
            <div>
              {((attribute && predicate) || scope) &&
                <Input className="value-input" defaultValue={value} inputRef={valueInputRef} />
              }
            </div>
          </div>
          <div>
            <button className="apply-filter-button" disabled={!submitEnabled}>
              {I18n.t("js.api_maker.table.filters.relationship_select.apply", {defaultValue: "Apply"})}
            </button>
          </div>
        </form>
      </div>
    )
  }

  currentModelClass = () => this.currentModelClassFromPath(this.s.path)

  currentModelClassFromPath(path) {
    const {modelClass} = this.p
    let currentModelClass = modelClass

    for (const pathPart of path) {
      const camelizedPathPart = inflection.camelize(pathPart, true)
      const association = currentModelClass.ransackableAssociations().find((reflection) => reflection.name() == camelizedPathPart)

      if (!association) {
        const ransackableAssociationNames = currentModelClass.ransackableAssociations().map((reflection) => reflection.name()).join(", ")

        throw new Error(`Could not find a Ransackable association by that name: ${camelizedPathPart} in ${ransackableAssociationNames}`)
      }

      currentModelClass = association.modelClass()
    }

    return currentModelClass
  }

  currentPathParts() {
    const {modelClass} = this.p
    const {path} = this.s
    const result = []
    let currentModelClass = modelClass

    result.push({
      modelClass,
      translation: modelClass.modelName().human({count: 2})
    })

    for (const pathPart of path) {
      const camelizedPathPart = inflection.camelize(pathPart, true)
      const pathPartTranslation = currentModelClass.humanAttributeName(camelizedPathPart)

      currentModelClass = currentModelClass.ransackableAssociations().find((reflection) => reflection.name() == camelizedPathPart).modelClass()

      result.push({
        modelClass: currentModelClass,
        translation: pathPartTranslation
      })
    }

    return result
  }

  onAttributeClicked = ({attribute}) => {
    this.setState({
      attribute,
      predicate: undefined,
      scope: undefined
    })
  }

  onPredicateChanged = (e) => {
    const chosenPredicateName = digg(e, "target", "value")
    const predicate = this.state.predicates.find((predicate) => predicate.name == chosenPredicateName)

    this.setState({predicate})
  }

  onReflectionClicked = ({reflection}) => {
    const newPath = this.state.path.concat([inflection.underscore(reflection.name())])

    this.setState({
      attribute: undefined,
      path: newPath,
      predicate: undefined
    })

    this.props.onPathChanged
  }

  onScopeClicked = ({scope}) => {
    this.setState({
      attribute: undefined,
      scope
    })
  }

  onSubmit = (e) => {
    e.preventDefault()

    const {filter, querySearchName} = this.p
    const {attribute, path, predicate, scope} = this.s
    const {filterIndex} = digs(filter, "filterIndex")
    const searchParams = Params.parse()[querySearchName] || {}
    const value = digg(this.tt.valueInputRef, "current", "value")
    const newSearchParams = {
      p: path,
      v: value
    }

    if (attribute) {
      newSearchParams.a = attribute.name()
      newSearchParams.pre = digg(predicate, "name")
    } else if (scope) {
      newSearchParams.sc = inflection.underscore(scope.name())
    } else {
      throw new Error("Dont know if should search for attribute or scope?")
    }

    searchParams[filterIndex] = JSON.stringify(newSearchParams)

    const newParams = {}

    newParams[querySearchName] = searchParams

    Params.changeParams(newParams)

    this.props.onApplyClicked()
  }

  reflectionsWithModelClass(reflections) {
    return reflections.filter((reflection) => {
      try {
        reflection.modelClass()

        return true
      } catch (error) {
        return false
      }
    })
  }

  sortedByName(reflections, currentModelClass) {
    return reflections.sort((a, b) =>
      currentModelClass.humanAttributeName(a.name()).toLowerCase().localeCompare(currentModelClass.humanAttributeName(b.name()).toLowerCase())
    )
  }
}))
