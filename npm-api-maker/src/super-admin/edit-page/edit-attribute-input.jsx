import BaseComponent from "../../base-component"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import {Text, TextInput, View} from "react-native"
import {memo, useCallback, useMemo, useState} from "react"

export default memo(shapeComponent(class EditAttributeInput extends BaseComponent {
  render() {
    const {attributeName, id, inputs, label, model, name} = this.props

    if (!(attributeName in model)) {
      throw new Error(`${attributeName} isn't set on the resource ${model.modelClassData().name}`)
    }

    const defaultValue = useCallback(() => model[attributeName]() || "")
    const [value, setValue] = useState(() => defaultValue())

    useMemo(() => {
      inputs[name] = value
    }, [])

    const onChangeText = useCallback((newValue) => {
      inputs[name] = newValue
      setValue(newValue)
    }, [])

    return (
      <View style={{marginBottom: 12}}>
        <Text>{label}</Text>
        <View>
          <TextInput
            dataSet={{
              attribute: attributeName,
              id,
              name
            }}
            onChangeText={onChangeText}
            style={{paddingTop: 9, paddingRight: 13, paddingBottom: 9, paddingLeft: 13, borderRadius: 5, backgroundColor: "#fff", border: "1px solid #cecece"}}
            value={value}
          />
        </View>
      </View>
    )
  }
}))