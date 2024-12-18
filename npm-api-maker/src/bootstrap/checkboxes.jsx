import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component.js"
import {digs} from "diggerize"
import {useForm} from "../form"
import * as inflection from "inflection"
import InvalidFeedback from "./invalid-feedback"
import memo from "set-state-compare/src/memo"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import useInput from "../use-input"
import {useMemo} from "react"

const OptionElement = memo(shapeComponent(class OptionElement extends ShapeComponent {
  render() {
    const {generatedId, inputCheckboxClassName, isDefaultSelected, inputName, option, optionIndex, options, wrapperOpts} = this.p
    const {errors} = digs(wrapperOpts, "errors")
    const id = `${generatedId}-${optionIndex}`

    return (
      <div className="checkboxes-option" key={`option-${option[1]}`}>
        <input
          className={inputCheckboxClassName}
          data-option-value={option[1]}
          defaultChecked={isDefaultSelected}
          id={id}
          name={inputName}
          onChange={this.tt.onChange}
          type="checkbox"
          value={option[1]}
        />

        <label className="ml-1" htmlFor={id}>
          {option[0]}
        </label>

        {(optionIndex + 1) == options.length && errors.length > 0 &&
          <InvalidFeedback errors={errors} />
        }
      </div>
    )
  }

  onChange = (event, ...restProps) => {
    this.p.onOptionChecked({event, option: this.p.option})

    if (this.props.onChange) this.props.onChange(event, ...restProps)
  }
}))

export default memo(shapeComponent(class ApiMakerBootstrapCheckboxes extends ShapeComponent {
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
    return (
      <div className="component-bootstrap-checkboxes form-group">
        <label className={this.labelClassName()}>
          {this.tt.wrapperOpts.label}
        </label>

        <input name={this.inputName()} ref={this.tt.inputProps.ref} type="hidden" value="" />
        {this.props.options.map((option, index) =>
          <OptionElement
            inputCheckboxClassName={this.tt.inputCheckboxClassName()}
            inputName={this.inputName()}
            isDefaultSelected={this.isDefaultSelected(option[1])}
            generatedId={this.tt.generatedId}
            key={option[1]}
            onChange={this.props.onChange}
            onOptionChecked={this.tt.onOptionChecked}
            option={option}
            optionIndex={index}
            options={this.props.options}
            wrapperOpts={this.tt.wrapperOpts}
          />
        )}
      </div>
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

  inputCheckboxClassName () {
    const classNames = []

    if (this.tt.wrapperOpts.errors.length > 0) classNames.push("is-invalid")

    return classNames.join(" ")
  }

  inputName () {
    if (this.props.name) {
      return `${this.props.name}[]`
    } else if (this.props.model) {
      return `${this.props.model.modelClassData().paramKey}[${inflection.underscore(this.props.attribute)}]`
    }
  }

  isDefaultSelected (option) {
    let defaultValue = this.inputDefaultValue()

    if (!defaultValue) return false

    if (defaultValue.constructor === Array) {
      return defaultValue.includes(option)
    } else {
      return defaultValue == option
    }
  }

  labelClassName () {
    const classNames = []

    if (this.props.labelClassName) classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }

  onOptionChecked = ({event, option}) => {
    const {inputProps, form} = this.tt
    const {name} = inputProps
    const checked = event.target.checked
    let newOptions

    if (checked) {
      newOptions = this.s.checkedOptions.concat([option[1]])

      this.setState({checkedOptions: newOptions})
    } else {
      newOptions = this.s.checkedOptions.filter((value) => value != option[1])

      this.setState({checkedOptions: newOptions})
    }

    if (form && name) {
      form.setValue(name, newOptions)
    }
  }
}))
