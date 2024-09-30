import AttributeElement from "./attribute-element"
import BaseComponent from "../../base-component"
import {digg, digs} from "diggerize"
import * as inflection from "inflection"
import {Form} from "../../form"
import Input from "../../inputs/input"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {memo, useMemo, useRef} from "react"
import {Text, View} from "react-native"
import ReflectionElement from "./reflection-element"
import ScopeElement from "./scope-element"
import Select from "../../inputs/select"
import Services from "../../services.mjs"
import {shapeComponent} from "set-state-compare/src/shape-component"

export default memo(shapeComponent(class ApiMakerTableFiltersFilterForm extends BaseComponent {
  static propTypes = PropTypesExact({
    filter: PropTypes.object,
    modelClass: PropTypes.func.isRequired,
    onApplyClicked: PropTypes.func.isRequired,
    querySearchName: PropTypes.string.isRequired
  })

  setup() {
    this.useStates({
      associations: null,
      attribute: undefined,
      actualCurrentModelClass: () => ({modelClass: this.p.modelClass}),
      modelClassName: digg(this.p.modelClass.modelClassData(), "className"),
      path: [],
      predicate: undefined,
      predicates: undefined,
      ransackableAttributes: undefined,
      ransackableScopes: undefined,
      scope: this.props.filter.sc,
      value: this.props.filter.v
    })

    this.setInstance({valueInputRef: useRef()})

    useMemo(() => {
      this.loadRansackPredicates()

      if (this.props.filter.v) {
        this.loadInitialValues()
      }
    }, [])

    useMemo(() => {
      this.loadAssociations()
    }, [this.s.modelClassName])
  }

  currentModelClass = () => digg(this.s.actualCurrentModelClass, "modelClass")

  parseAssociationData(result) {
    const associations = result.associations.map(({human_name, model_class_name, reflection_name, resource}) => ({
      humanName: human_name,
      modelClassName: model_class_name,
      reflectionName: inflection.camelize(reflection_name, true),
      resource
    }))
    const ransackableAttributes = digg(result, "ransackable_attributes").map(({attribute_name: attributeName, human_name: humanName}) => ({
      attributeName, humanName
    }))
    const ransackableScopes = digg(result, "ransackable_scopes")

    return {associations, ransackableAttributes, ransackableScopes}
  }

  async loadAssociations() {
    const result = await Services.current().sendRequest("Models::Associations", {model_class_name: this.s.modelClassName})
    const {associations, ransackableAttributes, ransackableScopes} = this.parseAssociationData(result)

    this.setState({associations, ransackableAttributes, ransackableScopes})
  }

  async loadInitialValues() {
    let result = await Services.current().sendRequest("Models::Associations", {model_class_name: this.s.modelClassName})
    let data = this.parseAssociationData(result)
    let modelClassName
    const path = []

    for (const pathPart of this.props.filter.p) {
      const reflection = data.associations.find((association) => digg(association, "reflectionName") == inflection.camelize(pathPart, true))

      if (!reflection) throw new Error(`Couldn't find association by that name ${this.s.modelClassName}#${pathPart}`)

      modelClassName = digg(reflection, "modelClassName")

      result = await Services.current().sendRequest("Models::Associations", {model_class_name: modelClassName})
      data = this.parseAssociationData(result)

      path.push(reflection)
    }

    const {ransackableAttributes} = data
    const attribute = this.p.filter.a
    const ransackableAttribute = ransackableAttributes.find((ransackableAttribute) => digg(ransackableAttribute, "attributeName") == attribute)

    this.setState({attribute: ransackableAttribute, modelClassName, path})
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
    const {attribute, path, predicate, predicates, scope, value} = this.s
    let submitEnabled = false

    if (attribute && predicate) {
      submitEnabled = true
    } else if (scope) {
      submitEnabled = true
    }

    return (
      <View dataSet={{class: "api-maker--table--filters--filter-form"}}>
        <Form onSubmit={this.tt.onSubmit}>
          <View style={{flexDirection: "row"}}>
            {path.map(({humanName, reflectionName}, pathPartIndex) =>
              <View key={`${pathPartIndex}-${reflectionName}`} style={{flexDirection: "row"}}>
                {pathPartIndex > 0 &&
                  <Text style={{marginRight: 5, marginLeft: 5}}>
                    -
                  </Text>
                }
                <Text>
                  {humanName}
                </Text>
              </View>
            )}
          </View>
          <View style={{flexDirection: "row"}}>
            <View>
              {this.s.associations?.map((reflection) =>
                <ReflectionElement
                  key={reflection.reflectionName}
                  modelClassName={this.s.modelClassName}
                  onClick={this.tt.onReflectionClicked}
                  reflection={reflection}
                />
              )}
            </View>
            <View>
              {this.s.ransackableAttributes?.map((attribute) =>
                <AttributeElement
                  active={attribute.attributeName == this.s.attribute?.attributeName}
                  attribute={attribute}
                  key={attribute.attributeName}
                  modelClassName={this.s.modelClassName}
                  onClick={this.tt.onAttributeClicked}
                />
              )}
              {this.s.ransackableScopes?.map((scope) =>
                <ScopeElement
                  active={scope == this.s.scope}
                  key={scope}
                  scope={scope}
                  onScopeClicked={this.tt.onScopeClicked}
                />
              )}
            </View>
            <View>
              {predicates && !this.state.scope &&
                <Select
                  className="predicate-select"
                  defaultValue={predicate?.name}
                  includeBlank
                  onChange={this.tt.onPredicateChanged}
                  options={predicates.map((predicate) => digg(predicate, "name"))}
                />
              }
            </View>
            <View>
              {((attribute && predicate) || scope) &&
                <Input className="value-input" defaultValue={value} inputRef={valueInputRef} />
              }
            </View>
          </View>
          <View>
            <button className="apply-filter-button" disabled={!submitEnabled}>
              {I18n.t("js.api_maker.table.filters.relationship_select.apply", {defaultValue: "Apply"})}
            </button>
          </View>
        </Form>
      </View>
    )
  }

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
    const newPath = this.state.path.concat([reflection])

    this.setState({
      associations: null,
      attribute: undefined,
      actualCurrentModelClass: {modelClass: digg(reflection, "resource")},
      modelClassName: digg(reflection, "modelClassName"),
      path: newPath,
      predicate: undefined
    })
  }

  onScopeClicked = ({scope}) => {
    this.setState({
      attribute: undefined,
      scope
    })
  }

  onSubmit = () => {
    const {filter, querySearchName} = this.p
    const {attribute, path, predicate, scope} = this.s
    const {filterIndex} = digs(filter, "filterIndex")
    const searchParams = Params.parse()[querySearchName] || {}
    const value = digg(this.tt.valueInputRef, "current", "value")
    const p = path.map((reflection) => inflection.underscore(reflection.reflectionName))
    const newSearchParams = {
      p,
      v: value
    }

    if (attribute) {
      newSearchParams.a = digg(attribute, "attributeName")
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
