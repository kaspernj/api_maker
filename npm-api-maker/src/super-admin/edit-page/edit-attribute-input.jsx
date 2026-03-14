/* eslint-disable sort-imports */
import React, {useEffect} from "react"
import BaseComponent from "../../base-component"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "../../utils/text"
import {useForm} from "../../form"
import {View} from "react-native"

export default memo(shapeComponent(class EditAttributeInput extends BaseComponent {
  static propTypes = propTypesExact({
    attributeName: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired
  })

  setup() {
    this.form = useForm()
    this.initialValue = this.defaultValue()

    useEffect(() => {
      if (this.form) {
        this.form.setValue(this.p.name, this.initialValue)
      }
    }, [])
  }

  defaultValue = () => this.p.model[this.p.attributeName]() || ""

  render() {
    const {attributeName, label, model, name} = this.p
    const inputTestId = this.inputTestId()

    if (!(attributeName in model)) {
      throw new Error(`${attributeName} isn't set on the resource ${model.modelClassData().name}`)
    }

    return (
      <View testID="api-maker/super-admin/edit-page/edit-attribute-input">
        <Text>
          {label}
        </Text>
        <View>
          <input
            data-attribute={attributeName}
            data-testid={inputTestId}
            defaultValue={this.initialValue}
            name={name}
            onChange={this.tt.onChange}
            style={this.cache("textInputStyle", {
              paddingTop: 9,
              paddingRight: 13,
              paddingBottom: 9,
              paddingLeft: 13,
              borderRadius: 5,
              backgroundColor: "#fff",
              border: "1px solid #cecece"
            })}
          />
        </View>
      </View>
    )
  }

  onChange = (event) => {
    if (this.form) {
      this.form.setValue(this.p.name, event.target.value)
    }
  }

  inputTestId = () => `api-maker/super-admin/edit-page/input-${this.p.id}`
}))
