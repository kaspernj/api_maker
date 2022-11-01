import Attribute from "../../base-model/attribute"
import {digg, digs} from "diggerize"
import inflection from "inflection"
import Input from "../../inputs/input"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"
import Reflection from "../../base-model/reflection"
import Select from "../../inputs/select"
import Services from "../../services.mjs"
import Shape from "set-state-compare/src/shape"

class AttributeElement extends React.PureComponent {
  static propTypes = PropTypesExact({
    active: PropTypes.bool.isRequired,
    attribute: PropTypes.instanceOf(Attribute).isRequired,
    currentModelClass: PropTypes.func.isRequired,
    fikter: PropTypes.object,
    onClick: PropTypes.func.isRequired
  })

  render() {
    const {active, attribute, currentModelClass} = digs(this.props, "active", "attribute", "currentModelClass")
    const style = {}

    if (active) style.fontWeight = "bold"

    return (
      <div
        className="attribute-element"
        data-attribute-name={attribute.name()}
        data-model-class={currentModelClass.modelClassData().name}
        onClick={digg(this, "onAttributeClicked")}
        style={style}
      >
        {currentModelClass.humanAttributeName(inflection.camelize(attribute.name(), true))}
      </div>
    )
  }

  onAttributeClicked = (e) => {
    e.preventDefault()

    this.props.onClick({attribute: digg(this, "props", "attribute")})
  }
}

class ReflectionElement extends React.PureComponent {
  static propTypes = PropTypesExact({
    currentModelClass: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    reflection: PropTypes.instanceOf(Reflection).isRequired
  })

  render() {
    const {currentModelClass, reflection} = digs(this.props, "currentModelClass", "reflection")

    return (
      <div
        className="reflection-element"
        data-model-class={currentModelClass.modelClassData().name}
        data-reflection-name={reflection.name()}
        key={reflection.name()}
        onClick={digg(this, "onReflectionClicked")}
      >
        {currentModelClass.humanAttributeName(reflection.name())}
      </div>
    )
  }

  onReflectionClicked = (e) => {
    e.preventDefault()

    this.props.onClick({reflection: digg(this, "props", "reflection")})
  }
}

export default class ApiMakerTableFiltersFilterForm extends React.PureComponent {
  static propTypes = PropTypesExact({
    filter: PropTypes.object,
    modelClass: PropTypes.func.isRequired,
    onApplyClicked: PropTypes.func.isRequired,
    querySearchName: PropTypes.string.isRequired
  })

  shape = new Shape(this, {
    attribute: this.currentModelClassFromPath(this.props.filter.p || []).ransackableAttributes().find((attribute) => attribute.name() == this.props.filter.a),
    path: this.props.filter.p || [],
    predicate: undefined,
    predicates: undefined,
    value: this.props.filter.v
  })
  valueInputRef = React.createRef()

  componentDidMount() {
    this.loadRansackPredicates()
  }

  async loadRansackPredicates() {
    const response = await Services.current().sendRequest("Ransack::Predicates")
    const predicates = digg(response, "predicates")
    let currentPredicate

    if (this.props.filter.pre) {
      currentPredicate = predicates.find((predicate) => predicate.name == this.props.filter.pre)
    }

    this.shape.set({
      predicate: currentPredicate,
      predicates
    })
  }

  render() {
    const {valueInputRef} = digs(this, "valueInputRef")
    const currentModelClass = this.currentModelClass()
    const {attribute, predicate, predicates, value} = digs(this.shape, "attribute", "predicate", "predicates", "value")

    return (
      <div className="api-maker--table--filters--filter-form">
        <form onSubmit={digg(this, "onSubmit")}>
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
                  onClick={digg(this, "onReflectionClicked")}
                  reflection={reflection}
                />
              )}
            </div>
            <div>
              {this.sortedByName(currentModelClass.ransackableAttributes(), currentModelClass).map((attribute) =>
                <AttributeElement
                  active={attribute.name() == this.shape.attribute?.name()}
                  attribute={attribute}
                  currentModelClass={currentModelClass}
                  key={attribute.name()}
                  onClick={digg(this, "onAttributeClicked")}
                />
              )}
              {currentModelClass.ransackableScopes().map((scope) =>
                <div key={scope.name()}>
                  {scope.name()}
                </div>
              )}
            </div>
            <div>
              {predicates &&
                <Select
                  className="predicate-select"
                  defaultValue={predicate?.name}
                  includeBlank
                  onChange={digg(this, "onPredicateChanged")}
                  options={predicates.map((predicate) => digg(predicate, "name"))}
                />
              }
            </div>
            <div>
              {attribute && predicate &&
                <Input className="value-input" defaultValue={value} inputRef={valueInputRef} />
              }
            </div>
          </div>
          <div>
            <button className="apply-filter-button" disabled={!attribute || !predicate}>
              {I18n.t("js.api_maker.table.filters.relationship_select.apply", {defaultValue: "Apply"})}
            </button>
          </div>
        </form>
      </div>
    )
  }

  currentModelClass() {
    const {path} = digs(this.shape, "path")

    return this.currentModelClassFromPath(path)
  }

  currentModelClassFromPath(path) {
    const {modelClass} = digs(this.props, "modelClass")
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
    const {modelClass} = digs(this.props, "modelClass")
    const {path} = digs(this.shape, "path")
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
    this.shape.set({attribute})
  }

  onPredicateChanged = (e) => {
    const chosenPredicateName = digg(e, "target", "value")
    const predicate = this.shape.predicates.find((predicate) => predicate.name == chosenPredicateName)

    this.shape.set({predicate})
  }

  onReflectionClicked = ({reflection}) => {
    const newPath = this.shape.path.concat([inflection.underscore(reflection.name())])

    this.shape.set({
      attribute: undefined,
      path: newPath
    })

    this.props.onPathChanged
  }

  onSubmit = (e) => {
    e.preventDefault()

    const {filter, querySearchName} = digs(this.props, "filter", "querySearchName")
    const {attribute, path, predicate} = digs(this.shape, "attribute", "path", "predicate")
    const {filterIndex} = digs(filter, "filterIndex")
    const searchParams = Params.parse()[querySearchName] || {}
    const value = digg(this, "valueInputRef", "current", "value")

    searchParams[filterIndex] = JSON.stringify({
      a: attribute.name(),
      p: path,
      pre: digg(predicate, "name"),
      v: value
    })

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
}
