import React, {useMemo} from "react"
import {TextInput, View} from "react-native"
import BaseComponent from "../../base-component.js"
import memo from ""set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from ""set-state-compare/build/shape-component.js"
import Text from "../../utils/text"
import {useForm} from "../../form"

export default memo(shapeComponent(class EditAttributeInput extends BaseComponent {
  static propTypes = propTypesExact({
    attributeName: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired
  })

  setup() {
    const {name} = this.p

    this.form = useForm()
    this.useStates({
      value: this.defaultValue()
    })

    useMemo(() => {
      if (this.form) {
        this.form.setValue(name, this.s.value)
      }
    }, [])
  }

  defaultValue = () => this.p.model[this.p.attributeName]() || ""

  render() {
    const {attributeName, id, label, model, name} = this.p
    const {value} = this.s

    if (!(attributeName in model)) {
      throw new Error(`${attributeName} isn't set on the resource ${model.modelClassData().name}`)
    }

    return (
      <View testID="api-maker/super-admin/edit-page/edit-attribute-input">
        <Text>{label}</Text>
        <View>
          <TextInput
            dataSet={this.cache("textInputDataSet", {
              attribute: attributeName,
              id,
              name
            }, [attributeName, id, name])}
            onChangeText={this.tt.onChangeText}
            style={this.textInputStyle ||= {
              paddingTop: 9,
              paddingRight: 13,
              paddingBottom: 9,
              paddingLeft: 13,
              borderRadius: 5,
              backgroundColor: "#fff",
              border: "1px solid #cecece"
            }}
            value={value}
          />
        </View>
      </View>
    )
  }

  onChangeText = (newValue) => {
    if (this.form) {
      this.form.setValue(this.p.name, newValue)
    }

    this.setState({value: newValue})
  }
}))
