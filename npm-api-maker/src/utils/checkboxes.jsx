import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import React, {useMemo} from "react"
import Checkbox from "./checkbox"
import {digs} from "diggerize"
import {useForm} from "../form"
import * as inflection from "inflection"
import InvalidFeedback from "./invalid-feedback.js"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import Text from "./text"
import useInput from "../use-input.js"
import {View} from "react-native"

const OptionElement = memo(shapeComponent(class OptionElement extends ShapeComponent {
  static propTypes = propTypesExact({
    checked: PropTypes.bool.isRequired,
    inputName: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    option: PropTypes.array.isRequired
  })

  render() {
    const {checked, inputName, option} = this.p
    const dataSet = useMemo(() => ({
      component: "api-maker/utils/checkboxes/option",
      name: inputName,
      value: option[1]
    }), [inputName, option[1]])

    return (
      <View >
        <Checkbox
          checked={checked}
          dataSet={dataSet}
          label={option[0]}
          onCheckedChange={this.tt.onChange}
        />
      </View>
    )
  }

  onChange = (checked) => this.p.onChange({checked, option: this.p.option})
}))

export default memo(shapeComponent(class ApiMakerUtilsCheckboxes extends ShapeComponent {
  static propTypes = propTypesExact({
    attribute: PropTypes.string,
    defaultValue: PropTypes.array,
    label: PropTypes.string,
    labelClassName: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.array.isRequired
  })

  setup() {
    const {inputProps, wrapperOpts} = useInput({props: this.props})

    this.generatedId = useMemo(
      () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      []
    )

    this.setInstance({
      form: useForm(),
      inputProps,
      wrapperOpts
    })
    this.useStates({
      checkedOptions: () => {
        if (Array.isArray(this.props.defaultValue)) return this.props.defaultValue
        if (this.props.defaultValue) return [this.props.defaultValue]

        return []
      }
    })

    useMemo(() => {
      if (this.form && inputProps.name) {
        this.form.setValue(inputProps.name, this.s.checkedOptions)
      }
    }, [])
  }

  render () {
    const {wrapperOpts} = this.tt
    const {errors} = digs(wrapperOpts, "errors")

    return (
      <View dataSet={this.cache("rootViewDataSet", {component: "api-maker/utils/checkboxes"})}>
        <Text style={this.cache("textStyle", {fontWeight: "bold"})}>
          {this.tt.wrapperOpts.label}
        </Text>
        {this.props.options.map((option) =>
          <OptionElement
            checked={this.isChecked(option)}
            inputName={this.inputName()}
            key={option[1]}
            onChange={this.tt.onOptionChecked}
            option={option}
          />
        )}
        {errors.length > 0 &&
          <InvalidFeedback errors={errors} />
        }
      </View>
    )
  }

  inputDefaultValue () {
    const {attribute, defaultValue, model} = this.props

    if (defaultValue) {
      return defaultValue
    } else if (attribute && model) {
      if (!model[attribute]) throw `No such attribute: ${attribute}`

      return this.props.model[attribute]()
    }
  }

  inputName () {
    if (this.props.name) {
      return `${this.props.name}[]`
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}[${inflection.underscore(this.props.attribute)}]`
    }
  }

  isChecked = (option) => this.s.checkedOptions.includes(option[1])

  onOptionChecked = ({checked, option}) => {
    const {inputProps, form} = this.tt
    const {name} = inputProps
    let newOptions

    if (checked) {
      newOptions = this.s.checkedOptions.concat([option[1]])

      this.setState({checkedOptions: newOptions})
    } else {
      newOptions = this.s.checkedOptions.filter((value) => value != option[1])

      this.setState({checkedOptions: newOptions})
    }

    if (this.props.onChange) {
      this.p.onChange({checked, option})
    }

    if (form && name) {
      form.setValue(name, newOptions)
    }
  }
}))
