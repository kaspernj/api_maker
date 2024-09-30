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
      attribute: () => this.currentModelClassFromPath(this.props.filter.p || [])
        .ransackableAttributes()
        .find((attribute) => attribute.name() == this.props.filter.a),
      actualCurrentModelClass: () => ({modelClass: this.p.modelClass}),
      path: this.props.filter.p || [],
      predicate: undefined,
      predicates: undefined,
      scope: this.props.filter.sc,
      value: this.props.filter.v
    })

    this.setInstance({valueInputRef: useRef()})

    useMemo(() => {
      this.loadRansackPredicates()
    }, [])
    useMemo(() => {
      this.loadAssociations()
    }, [this.currentModelClass().modelClassData().name])
  }

  currentModelClass = () => digg(this.s.actualCurrentModelClass, "modelClass")

  async loadAssociations() {
    const result = await Services.current().sendRequest("Models::Associations", {resource_name: this.currentModelClass().modelClassData().name})
    const associations = result.associations.map(({human_name, reflection_name, resource}) => ({
      humanName: human_name,
      reflectionName: inflection.camelize(reflection_name, true),
      resource
    }))

    this.setState({associations})
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
    const currentModelClass = this.currentModelClass()
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
                  currentModelClass={currentModelClass}
                  key={reflection.reflectionName}
                  onClick={this.tt.onReflectionClicked}
                  reflection={reflection}
                />
              )}
            </View>
            <View>
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
