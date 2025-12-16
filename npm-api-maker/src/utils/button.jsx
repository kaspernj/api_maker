import {Pressable, View} from "react-native"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component.js"
import Icon from "./icon"
import memo from "set-state-compare/src/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"
import Text from "./text"
import {useForm} from "../form"

export default memo(shapeComponent(class ApiMakerUtilsButton extends ShapeComponent {
  static defaultProps = {
    children: null,
    danger: false,
    disabled: false,
    icon: null,
    label: null,
    onPress: null,
    pressableProps: {},
    submit: false,
    textProps: {}
  }

  static propTypes = propTypesExact({
    children: PropTypes.any,
    danger: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    icon: PropTypes.string,
    label: PropTypes.string,
    onPress: PropTypes.func,
    pressableProps: PropTypes.object.isRequired,
    submit: PropTypes.bool.isRequired,
    textProps: PropTypes.object.isRequired
  })

  setup() {
    this.form = useForm()
    this.useStates({hover: false})
  }

  render() {
    const {children, danger, disabled, icon, label, pressableProps, textProps} = this.p
    const {hover} = this.s
    const {style, ...restPressableProps} = pressableProps
    const {style: textStyle, ...restTextProps} = textProps

    const pressableStyle = React.useMemo(() => {
      let backgroundColor

      if (danger) {
        if (hover) {
          backgroundColor = "#ff8a8a"
        } else {
          backgroundColor = "#ff6767"
        }
      } else {
        if (hover) {
          backgroundColor = "#e8e4ff"
        } else {
          backgroundColor = "#fff"
        }
      }

      return Object.assign(
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 14,
          paddingVertical: 8,
          backgroundColor,
          border: `1px solid ${danger ? "red" : "steelblue"}`,
          borderRadius: 5
        },
        pressableProps?.style
      )
    }, [danger, hover, pressableProps?.style])

    const actualTextStyle = React.useMemo(() => {
      return Object.assign(
        {
          color: disabled ? "grey" : undefined
        },
        textStyle
      )
    }, [disabled])

    return (
      <Pressable
        onPointerEnter={this.tt.onPointerEnter}
        onPointerLeave={this.tt.onPointerLeave}
        onPress={this.tt.onPress}
        style={pressableStyle}
        {...restPressableProps}
      >
        {icon &&
          <View style={this.iconViewStyle ||= {marginRight: 4}}>
            <Icon name={icon} />
          </View>
        }
        {children}
        {label &&
          <Text style={actualTextStyle} {...restTextProps}>
            {label}
          </Text>
        }
      </Pressable>
    )
  }

  onPointerEnter = () => this.setState({hover: true})
  onPointerLeave = () => this.setState({hover: false})

  onPress = () => {
    if (this.p.disabled) {
      return
    }

    if (this.p.onPress) {
      this.p.onPress()
    }

    if (this.p.submit && this.tt.form) {
      this.tt.form.submit()
    }
  }
}))
