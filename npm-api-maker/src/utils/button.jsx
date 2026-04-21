/* eslint-disable arrow-body-style, prefer-object-spread, sort-imports */
import {Pressable, View} from "react-native"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import Icon from "./icon"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"
import Text from "./text"
import {useForm} from "../form"

/**
 * @typedef {object} Props
 * @property {any=} children
 * @property {boolean=} danger
 * @property {boolean=} disabled
 * @property {string=} icon
 * @property {string=} label
 * @property {Function=} onPress
 * @property {object=} pressableProps
 * @property {boolean=} submit
 * @property {object=} textProps
 */
/**
 * @typedef {object} State
 * @property {boolean} hover
 */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerUtilsButton extends ShapeComponent {
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
    danger: PropTypes.bool,
    disabled: PropTypes.bool,
    icon: PropTypes.string,
    label: PropTypes.string,
    onPress: PropTypes.func,
    pressableProps: PropTypes.object,
    submit: PropTypes.bool,
    textProps: PropTypes.object
  })

  state = {
    hover: false
  }

  setup() {
    this.form = useForm()
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
          <View style={this.cache("iconViewStyle", {marginRight: 4})}>
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
