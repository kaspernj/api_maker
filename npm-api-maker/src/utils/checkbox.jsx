import BaseComponent from "../base-component"
import {CheckBox, Pressable, View} from "react-native"
import memo from "set-state-compare/src/memo"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import Text from "./text"

export default memo(shapeComponent(class ApiMakerUtilsCheckbox extends BaseComponent {
  static defaultProps = {
    label: undefined
  }

  static propTypes = propTypesExact({
    checked: PropTypes.bool.isRequired,
    dataSet: PropTypes.object,
    label: PropTypes.string,
    onCheckedChange: PropTypes.func.isRequired,
    style: PropTypes.object
  })

  render() {
    const {checked, label, onCheckedChange} = this.p
    const actualStyle = Object.assign(
      {flexDirection: "row", alignItems: "center"},
      this.props.style
    )

    return (
      <View dataSet={{component: "api-maker--utils--checkbox"}} style={actualStyle}>
        <CheckBox dataSet={this.props.dataSet} onValueChange={onCheckedChange} value={checked} />
        {label &&
          <Pressable onPress={this.tt.onLabelPressed}>
            <Text style={{marginLeft: 3}}>
              {label}
            </Text>
          </Pressable>
        }
      </View>
    )
  }

  onLabelPressed = () => this.p.onCheckedChange(!this.p.checked)
}))
