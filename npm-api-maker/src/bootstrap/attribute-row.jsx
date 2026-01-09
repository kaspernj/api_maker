/* eslint-disable no-return-assign */
import * as inflection from "inflection"
import React, {useMemo} from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import {View} from "react-native"
import {digg} from "diggerize"
import MoneyFormatter from "../money-formatter.js" // eslint-disable-line sort-imports
import PropTypes from "prop-types"
import Text from "../utils/text"
import memo from "set-state-compare/build/memo.js"
import strftime from "strftime"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"

const dataSets = {}

export default memo(shapeComponent(class ApiMakerBootstrapAttributeRow extends ShapeComponent {
  static defaultProps = {
    checkIfAttributeLoaded: false
  }

  static propTypes = {
    attribute: PropTypes.string,
    checkIfAttributeLoaded: PropTypes.bool.isRequired,
    children: PropTypes.any,
    identifier: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.any, PropTypes.string]),
    model: PropTypes.object,
    value: PropTypes.any
  }

  setup() {
    const {l, t} = useI18n({namespace: "js.api_maker.attribute_row"})

    this.l = l
    this.t = t
    this.attribute = useMemo(
      () => {
        if (this.props.attribute) {
          return this.props.model?.constructor?.attributes()?.find((attribute) => attribute.name() == inflection.underscore(this.props.attribute))
        }
      },
      [this.props.attribute, this.props.model]
    )
  }

  render () {
    const {attribute, checkIfAttributeLoaded, children, className, identifier, label, model, style, value, ...restProps} = this.props
    const actualStyle = {
      paddingVertical: 8,
      ...style
    }

    return (
      <View
        dataSet={dataSets[`attributeRow-${attribute}-${className}-${identifier}`] ||= {
          attribute,
          class: className,
          component: "api-maker/attribute-row",
          identifier
        }}
        style={actualStyle}
        {...restProps}
      >
        <Text dataSet={this.cache("labelTextDataSet", {class: "attribute-row-label"})} style={this.cache("labelTextStyle", {fontWeight: "bold"})}>
          {this.label()}
        </Text>
        <View dataSet={this.cache("valueViewDataSet", {class: "attribute-row-value"})} style={this.cache("valueViewStyle", {marginTop: 3})}>
          {this.value()}
        </View>
      </View>
    )
  }

  label() {
    const {attribute, label, model} = this.props

    if ("label" in this.props) return label
    if (attribute && model) return model.constructor.humanAttributeName(attribute)

    throw new Error("Couldn't figure out label")
  }

  value() {
    const {attribute, checkIfAttributeLoaded, children, model} = this.props

    if (children) return children

    if (attribute && !(attribute in model))
      throw new Error(`Attribute not found: ${digg(model.modelClassData(), "name")}#${attribute}`)

    if (attribute && checkIfAttributeLoaded && !model.isAttributeLoaded(attribute))
      return null

    if (attribute && model) {
      const value = model[attribute]()

      return this.valueContent(value)
    }
  }

  valueContent(value) {
    const {l, t} = this.tt
    const columnType = this.attribute?.getColumn()?.getType()

    if (columnType == "date") {
      return (
        <Text>
          {l("date.formats.default", value)}
        </Text>
      )
    } else if (value instanceof Date) {
      return (
        <Text>
          {strftime("%Y-%m-%d %H:%M", value)}
        </Text>
      )
    } else if (typeof value === "boolean") {
      if (value) {
        return (
          <Text>
            {t("js.shared.yes", {defaultValue: "Yes"})}
          </Text>
        )
      }

      return (
        <Text>
          {t("js.shared.no", {defaultValue: "No"})}
        </Text>
      )
    } else if (MoneyFormatter.isMoney(value)) {
      return (
        <Text>
          {MoneyFormatter.format(value)}
        </Text>
      )
    } else if (typeof value == "string") {
      return (
        <Text>
          {value}
        </Text>
      )
    } else {
      return value
    }
  }
}))
