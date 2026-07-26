// @ts-check
/* eslint-disable sort-imports */
import React, {useRef} from "react"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "../../utils/text"
import {useFieldRegistration} from "formmeld"
import {TextInput, View} from "react-native"

/**
 * @typedef {object} Props
 * @property {string} attributeName
 * @property {string} id
 * @property {string} label
 * @property {object} model
 * @property {string} name
 */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class EditAttributeInput extends ShapeComponent {
  static propTypes = propTypesExact({
    attributeName: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired
  })

  setup() {
    const {name} = this.p

    this.initialValue = this.defaultValue()
    this.inputRef = useRef(null)
    this.fieldRegistration = useFieldRegistration(name, {
      applyValue: (value) => this.inputRef.current?.setNativeProps({
        text: value === null || value === undefined ? "" : String(value)
      }),
      initialValue: this.initialValue
    })
  }

  defaultValue = () => this.p.model[this.p.attributeName]() || ""

  render() {
    const {attributeName, id, label, model, name} = this.p

    if (!(attributeName in model)) {
      throw new Error(`${attributeName} isn't set on the resource ${model.modelClassData().name}`)
    }

    return (
      <View testID="api-maker/super-admin/edit-page/edit-attribute-input">
        <Text>
          {label}
        </Text>
        <View>
          <TextInput
            dataSet={this.cache("textInputDataSet", {
              attribute: attributeName,
              id,
              name
            }, [attributeName, id, name])}
            defaultValue={this.initialValue}
            onChangeText={this.tt.onChangeText}
            ref={this.tt.inputRef}
            style={this.cache("textInputStyle", {
              paddingTop: 9,
              paddingRight: 13,
              paddingBottom: 9,
              paddingLeft: 13,
              borderRadius: 5,
              backgroundColor: "#fff",
              border: "1px solid #cecece"
            })}
            testID={`api-maker/super-admin/edit-page/input-${id}`}
          />
        </View>
      </View>
    )
  }

  onChangeText = (newValue) => {
    this.fieldRegistration.setValue(newValue)
  }
}))
