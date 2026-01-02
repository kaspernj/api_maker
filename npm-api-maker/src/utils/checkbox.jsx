import {CheckBox, Pressable, View} from "react-native"
import React, {useMemo} from "react"
import BaseComponent from "../base-component"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "./text"

export default memo(shapeComponent(class ApiMakerUtilsCheckbox extends BaseComponent {
  static defaultProps = {
    dataSet: null,
    label: undefined,
    style: null
  }

  static propTypes = propTypesExact({
    checked: PropTypes.bool,
    dataSet: PropTypes.object,
    defaultChecked: PropTypes.bool,
    label: PropTypes.string,
    onCheckedChange: PropTypes.func,
    style: PropTypes.object
  })

  setup() {
    this.useStates({
      checked: this.props.defaultChecked
    })
    this.isChecked = this.calculateChecked()
  }

  calculateChecked() {
    if ("checked" in this.props) {
      return this.p.checked
    } else {
      return this.s.checked
    }
  }

  render() {
    const {isChecked} = this.tt
    const {dataSet, label, style} = this.p
    const actualStyle = useMemo(() => Object.assign({flexDirection: "row", alignItems: "center"}, style), [style])
    const actualDataSet = useMemo(() => Object.assign({checked: isChecked}, dataSet), [dataSet, isChecked])

    return (
      <View
        dataSet={this.cache("viewContainerDataSet", {component: "api-maker/utils/checkbox"})}
        style={actualStyle}
      >
        <CheckBox dataSet={actualDataSet} onValueChange={this.tt.onValueChange} value={isChecked} />
        {label &&
          <Pressable onPress={this.tt.onLabelPressed}>
            <Text style={this.cache("textStyle", {marginLeft: 3})}>
              {label}
            </Text>
          </Pressable>
        }
      </View>
    )
  }

  onLabelPressed = () => this.p.onCheckedChange(!this.tt.isChecked)

  onValueChange = (e) => {
    if (this.props.onCheckedChange) {
      this.p.onCheckedChange(e)
    }

    this.setState({checked: !this.tt.isChecked})
  }
}))
