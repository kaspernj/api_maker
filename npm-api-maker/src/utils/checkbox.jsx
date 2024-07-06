import BaseComponent from "../base-component"
import {CheckBox, Text, View} from "react-native"
import {memo} from "react"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"

export default memo(shapeComponent(class ApiMakerUtilsCheckbox extends BaseComponent {
  static defaultProps = {
    label: undefined
  }

  static propTypes = propTypesExact({
    checked: PropTypes.bool.isRequired,
    label: PropTypes.string,
    onValueChange: PropTypes.func.isRequired
  })

  render() {
    const {checked, label, onValueChange} = this.p

    return (
      <View dataSet={{component: "api-maker--utils--checkbox"}} style={{flexDirection: "row", alignItems: "center"}}>
        <CheckBox onValueChange={onValueChange} value={checked} />
        {label &&
          <Text style={{marginLeft: 3}}>
            {label}
          </Text>
        }
      </View>
    )
  }
}))
