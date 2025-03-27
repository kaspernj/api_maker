import {CheckBox, Pressable, View} from "react-native"
import React, {useMemo} from "react"
import BaseComponent from "../base-component"
import memo from "set-state-compare/src/memo"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component"
import Text from "./text"

export default memo(shapeComponent(class ApiMakerUtilsCheckbox extends BaseComponent {
  static defaultProps = {
    label: undefined
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
    const {label} = this.p
    const {dataSet} = this.props

    const actualStyle = useMemo(() =>
      Object.assign(
        {flexDirection: "row", alignItems: "center"},
        this.props.style
      )
    , [this.props.style])

    const actualDataSet = useMemo(() =>
      Object.assign(
        {checked: isChecked},
        dataSet
      )
    , [dataSet, isChecked])

    return (
      <View
        dataSet={this.rootViewDataSet ||= {component: "api-maker/utils/checkbox"}}
        style={actualStyle}
      >
        <CheckBox dataSet={actualDataSet} onValueChange={this.tt.onValueChange} value={isChecked} />
        {label &&
          <Pressable onPress={this.tt.onLabelPressed}>
            <Text style={this.labelTextStyle ||= {marginLeft: 3}}>
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
