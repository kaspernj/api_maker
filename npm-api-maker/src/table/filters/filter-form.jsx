import {useMemo, useRef} from "react"
import {ActivityIndicator, View} from "react-native"
import AttributeElement from "./attribute-element.jsx"
import BaseComponent from "../../base-component.js"
import Button from "../../utils/button.jsx"
import Card from "../../utils/card.jsx"
import {digg, digs} from "diggerize"
import * as inflection from "inflection"
import {Form} from "../../form.jsx"
import Header from "../../utils/header.jsx"
import Input from "../../inputs/input.jsx"
import memo from "set-state-compare/src/memo.js"
import Params from "../../params.js"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"
import ReflectionElement from "./reflection-element.jsx"
import ScopeElement from "./scope-element.jsx"
import Select from "../../inputs/select.jsx"
import Services from "../../services.js"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import Text from "../../utils/text.jsx"
import useBreakpoint from "../../use-breakpoint.js"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"

export default memo(shapeComponent(class ApiMakerTableFiltersFilterForm extends BaseComponent {
  static propTypes = PropTypesExact({
    filter: PropTypes.object,
    modelClass: PropTypes.func.isRequired,
    onApplyClicked: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    querySearchName: PropTypes.string.isRequired
  })

  setup() {
    const {t} = useI18n({namespace: "js.api_maker.table.filters.filter_form"})

    this.useStates({
      associations: null,
      attribute: undefined,
      actualCurrentModelClass: () => ({modelClass: this.p.modelClass}),
      loading: 0,
      modelClassName: digg(this.p.modelClass.modelClassData(), "className"),
      path: [],
      predicate: undefined,
      predicates: undefined,
      ransackableAttributes: undefined,
      ransackableScopes: undefined,
      scope: this.props.filter.sc,
      value: this.props.filter.v
    })

    this.setInstance({
      breakpoint: useBreakpoint(),
      t,
      valueInputRef: useRef(),
    })

    useMemo(() => {
      this.loadRansackPredicates()

      if (this.props.filter.v) {
        this.loadInitialValuesWithLoadingIndicator()
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
    this.increaseLoading()

    try {
      if (!this.s.modelClassName) throw new Error("'modelClassName' not set in state")

      const result = await Services.current().sendRequest("Models::Associations", {model_class_name: this.s.modelClassName})
      const {associations, ransackableAttributes, ransackableScopes} = this.parseAssociationData(result)

      this.setState({associations, ransackableAttributes, ransackableScopes})
    } finally {
      this.decreaseLoading()
    }
  }

  decreaseLoading = () => this.setState((prevState) => ({loading: prevState.loading - 1}))
  increaseLoading = () => this.setState((prevState) => ({loading: prevState.loading + 1}))

  async loadInitialValuesWithLoadingIndicator() {
    try {
      this.increaseLoading()
      await this.loadInitialValues()
    } finally {
      this.decreaseLoading()
    }
  }

  async loadInitialValues() {
    if (!this.s.modelClassName) throw new Error("'modelClassName' not set in state")

    let result = await Services.current().sendRequest("Models::Associations", {model_class_name: this.s.modelClassName})
    let data = this.parseAssociationData(result)
    let modelClassName = this.s.modelClassName
    const path = []

    for (const pathPart of this.props.filter.p) {
      const reflection = data.associations.find((association) => digg(association, "reflectionName") == inflection.camelize(pathPart, true))

      if (!reflection) throw new Error(`Couldn't find association by that name ${this.s.modelClassName}#${pathPart}`)

      modelClassName = digg(reflection, "modelClassName")

      if (!modelClassName) {
        const pathNames = path.map((pathPart) => pathPart.name()).join(".")

        throw new Error(`No model class name from ${pathNames}.${reflection.name()}`)
      }

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
    this.increaseLoading()

    try {
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
    } finally {
      this.decreaseLoading()
    }
  }

  render() {
    const {breakpoint, t, valueInputRef} = this.tt
    const {attribute, path, predicate, predicates, scope, value} = this.s
    const {mdUp} = breakpoint
    let submitEnabled = false

    if (attribute && predicate) {
      submitEnabled = true
    } else if (scope) {
      submitEnabled = true
    }

    return (
      <Card
        testID="api-maker/table/filters/filter-form.jsx"
        style={this.cache("cardStyle", {
          width: mdUp ? undefined : "100%",
          minWidth: 50,
          minHeight: 50
        }, [mdUp])}
      >
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
          <View style={{flexDirection: mdUp ? "row" : "column"}}>
            <View style={{marginTop: mdUp ? undefined : 25}}>
              <Header>
                {t(".relationships", {defaultValue: "Relationships"})}
              </Header>
              {this.s.associations && this.sortedReflectionsByName(this.s.associations).map((reflection) =>
                <ReflectionElement
                  key={reflection.reflectionName}
                  modelClassName={this.s.modelClassName}
                  onClick={this.tt.onReflectionClicked}
                  reflection={reflection}
                />
              )}
            </View>
            <View style={{marginTop: mdUp ? undefined : 25}}>
              <Header>
                {t(".attributes", {defaultValue: "Attributes"})}
              </Header>
              {this.s.ransackableAttributes && this.sortedAttributesByName(this.s.ransackableAttributes)?.map((attribute) =>
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
            <View style={{marginTop: mdUp ? undefined : 25}}>
              <Header>
                {t(".search", {defaultValue: "Search"})}
              </Header>
              <View>
                {predicates && !this.s.scope &&
                  <Select
                    className="predicate-select"
                    defaultValue={predicate?.name}
                    includeBlank
                    onChange={this.tt.onPredicateChanged}
                    options={predicates.map((predicate) => digg(predicate, "name"))}
                  />
                }
              </View>
              <View style={{marginTop: 10}}>
                {((attribute && predicate) || scope) &&
                  <Input className="value-input" defaultValue={value} inputRef={valueInputRef} />
                }
              </View>
            </View>
          </View>
          <View style={{flexDirection: "row", justifyContent: "end", marginTop: 10}}>
            <Button
              danger
              icon="remove"
              label={t(".cancel", {defaultValue: "Cancel"})}
              onPress={this.p.onRequestClose}
              pressableProps={this.cancelButtonPressableProps ||= {
                marginRight: 5
              }}
            />
            <Button
              disabled={!submitEnabled}
              icon="check"
              label={t(".apply", {defaultValue: "Apply"})}
              pressableProps={this.appleButtonPressableProps ||= {
                style: {marginLeft: 5},
                testID: "apply-filter-button"
              }}
              submit
            />
          </View>
        </Form>
        {this.s.loading > 0 &&
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              width: "100%",
              height: "100%"
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        }
      </Card>
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
      scope: undefined
    })
  }

  onPredicateChanged = (e) => {
    const chosenPredicateName = digg(e, "target", "value")
    const predicate = this.s.predicates.find((predicate) => predicate.name == chosenPredicateName)

    this.setState({predicate})
  }

  onReflectionClicked = ({reflection}) => {
    const newPath = this.s.path.concat([reflection])

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
      predicate: undefined,
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
      newSearchParams.sc = scope
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

  sortedAttributesByName(attributes) {
    return attributes.sort((a, b) =>
      digg(a, "humanName")
        .toLowerCase()
        .localeCompare(
          digg(b, "humanName").toLowerCase()
        )
    )
  }

  sortedReflectionsByName(reflections) {
    return reflections.sort((a, b) =>
      digg(a, "humanName")
        .toLowerCase()
        .localeCompare(
          digg(b, "humanName").toLowerCase()
        )
    )
  }
}))
