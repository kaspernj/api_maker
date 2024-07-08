import BaseComponent from "../../base-component"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import {Text, TextInput, View} from "react-native"
import {memo, useMemo} from "react"

export default memo(shapeComponent(class EditAttributeInput extends BaseComponent {
  static propTypes = propTypesExact({
    inputs: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired
  })

  setup() {
    const {inputs, name} = this.p

    this.useStates({
      value: this.defaultValue()
    })

    useMemo(() => {
      inputs[name] = this.s.value
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
      <View style={{marginBottom: 12}}>
        <Text>{label}</Text>
        <View>
          <TextInput
            dataSet={{
              attribute: attributeName,
              id,
              name
            }}
            onChangeText={this.tt.onChangeText}
            style={{paddingTop: 9, paddingRight: 13, paddingBottom: 9, paddingLeft: 13, borderRadius: 5, backgroundColor: "#fff", border: "1px solid #cecece"}}
            value={value}
          />
        </View>
      </View>
    )
  }

  onChangeText = (newValue) => {
    inputs[this.p.name] = newValue
    this.setState({value: newValue})
  }
}))
