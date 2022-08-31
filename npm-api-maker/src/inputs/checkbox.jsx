import AutoSubmit from "./auto-submit.mjs"
import {digg, digs} from "diggerize"
import EventUpdated from "../event-updated"
import inputWrapper from "./input-wrapper"
import PropTypes from "prop-types"
import React from "react"

class ApiMakerInputsCheckbox extends React.PureComponent {
  static defaultProps = {
    autoRefresh: false,
    autoSubmit: false,
    defaultValue: 1,
    zeroInput: true
  }

  static propTypes = {
    attribute: PropTypes.string,
    autoRefresh: PropTypes.bool.isRequired,
    autoSubmit: PropTypes.bool.isRequired,
    defaultChecked: PropTypes.bool,
    defaultValue: PropTypes.node,
    id: PropTypes.string,
    inputRef: PropTypes.object,
    model: PropTypes.object,
    name: PropTypes.string,
    onErrors: PropTypes.func,
    onMatchValidationError: PropTypes.func,
    zeroInput: PropTypes.bool
  }

  render () {
    const {
      attribute,
      autoRefresh,
      autoSubmit,
      defaultChecked,
      defaultValue,
      id,
      inputProps,
      inputRef,
      model,
      name,
      onChange,
      zeroInput,
      wrapperOpts,
      ...restProps
    } = this.props

    return (
      <>
        {autoRefresh && model &&
          <EventUpdated model={model} onUpdated={digg(this, "onModelUpdated")} />
        }
        {zeroInput && inputProps.name &&
          <input defaultValue="0" name={inputProps.name} type="hidden" />
        }
        <input
          {...inputProps}
          data-auto-refresh={autoRefresh}
          data-auto-submit={autoSubmit}
          defaultValue={defaultValue}
          onChange={digg(this, "onChanged")}
          type="checkbox"
          {...restProps}
        />
      </>
    )
  }

  onChanged = (...args) => {
    const {attribute, autoSubmit, model, onChange} = this.props

    if (attribute && autoSubmit && model) new AutoSubmit({component: this}).autoSubmit()
    if (onChange) onChange(...args)
  }

  onModelUpdated = (args) => {
    const inputRef = digg(this, "props", "inputProps", "ref")

    if (!inputRef.current) {
      // This can happen if the component is being unmounted
      return
    }

    const {attribute} = digs(this.props, "attribute")
    const newModel = digg(args, "model")
    const currentChecked = digg(inputRef, "current", "checked")
    const newValue = newModel.readAttribute(attribute)

    if (currentChecked != newValue) {
      inputRef.current.checked = newValue
    }
  }
}

export {ApiMakerInputsCheckbox as Checkbox}
export default inputWrapper(ApiMakerInputsCheckbox, {type: "checkbox"})
