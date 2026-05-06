// @ts-check
/* eslint-disable prefer-object-spread, sort-imports */
// @ts-expect-error CheckBox removed from react-native core in newer versions
import {CheckBox, Pressable, View} from "react-native"
import React, {useEffect, useMemo} from "react"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "./text"
import {useForm} from "../form"
import useInput from "../use-input.js"

/**
 * @typedef {object} Props
 * @property {string} [attribute]
 * @property {boolean} [checked]
 * @property {object} [dataSet]
 * @property {boolean} [defaultChecked]
 * @property {string} [id]
 * @property {object} [inputRef]
 * @property {string} [label]
 * @property {object} [model]
 * @property {string} [name]
 * @property {Function} [onCheckedChange]
 * @property {object} [style]
 * @property {string} [testID]
 */
/**
 * @typedef {object} State
 * @property {boolean} checked
 */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerUtilsCheckbox extends ShapeComponent {
  static defaultProps = {
    dataSet: null,
    style: null,
    testID: undefined
  }

  static propTypes = propTypesExact({
    attribute: PropTypes.string,
    checked: PropTypes.bool,
    dataSet: PropTypes.object,
    defaultChecked: PropTypes.bool,
    id: PropTypes.string,
    inputRef: PropTypes.object,
    label: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    onCheckedChange: PropTypes.func,
    style: PropTypes.object,
    testID: PropTypes.string
  })

  state = {
    checked: this.defaultChecked()
  }

  setup() {
    const {inputProps, restProps: useInputRestProps, wrapperOpts} = useInput({props: this.props, wrapperOptions: {type: "checkbox"}})
    const isChecked = this.calculateChecked()

    this.form = useForm()
    this.inputProps = inputProps
    this.useInputRestProps = useInputRestProps
    this.wrapperOpts = wrapperOpts

    useEffect(() => {
      if (this.tt.form && inputProps.name) {
        this.tt.form.setValue(inputProps.name, isChecked)
      }
    }, [inputProps.name, isChecked])
  }

  calculateChecked() {
    if ("checked" in this.props) {
      return Boolean(this.p.checked)
    } else {
      return this.s.checked
    }
  }

  render() {
    const {inputProps, useInputRestProps, wrapperOpts} = this.tt
    const {
      attribute,
      checked,
      dataSet,
      defaultChecked,
      id,
      inputRef,
      label,
      model,
      name,
      onCheckedChange,
      style,
      testID,
      ...restProps
    } = useInputRestProps
    const isChecked = this.calculateChecked()
    const actualLabel = typeof label == "undefined" ? wrapperOpts.label : label
    const actualStyle = useMemo(() => Object.assign({flexDirection: "row", alignItems: "center"}, style), [style])
    const actualDataSet = useMemo(() => Object.assign({checked: isChecked}, dataSet), [dataSet, isChecked])

    return (
      <View
        dataSet={this.cache("viewContainerDataSet", {component: "api-maker/utils/checkbox"})}
        style={actualStyle}
      >
        <CheckBox
          {...restProps}
          dataSet={actualDataSet}
          onValueChange={this.tt.onValueChange}
          ref={inputProps.ref}
          testID={testID}
          value={isChecked}
        />
        {actualLabel &&
          <Pressable onPress={this.tt.onLabelPressed}>
            <Text style={this.cache("textStyle", {marginLeft: 3})}>
              {actualLabel}
            </Text>
          </Pressable>
        }
      </View>
    )
  }

  defaultChecked() {
    if ("defaultChecked" in this.props) {
      return Boolean(this.props.defaultChecked)
    } else if (this.props.attribute && this.props.model) {
      if (!this.props.model[this.props.attribute]) {
        throw new Error(`No such attribute: ${this.props.attribute}`)
      }

      return Boolean(this.props.model[this.props.attribute]())
    } else {
      return false
    }
  }

  onLabelPressed = () => {
    const newChecked = !this.calculateChecked()

    this.setChecked(newChecked)
  }

  onValueChange = (newChecked) => {
    this.setChecked(newChecked)
  }

  setChecked(newChecked) {
    const {form, inputProps} = this.tt

    if (form && inputProps.name) {
      form.setValue(inputProps.name, newChecked)
    }

    if (this.props.onCheckedChange) {
      this.p.onCheckedChange(newChecked)
    }

    if (!("checked" in this.props)) {
      this.s.checked = newChecked
    }
  }
}))
