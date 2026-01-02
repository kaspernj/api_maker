import BaseComponent from "../base-component"
import classNames from "classnames"
import {Input as ApiMakerInput} from "@kaspernj/api-maker/build/inputs/input"
import Checkbox from "./checkbox"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import React from "react"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"
import useInput from "../use-input.js"

export default memo(shapeComponent(class ApiMakerInputsAttachment extends BaseComponent {
  static propTypes = {
    className: PropTypes.string,
    model: PropTypes.object.isRequired,
    onPurgeChanged: PropTypes.func,
    purgeName: PropTypes.string
  }

  setup() {
    const {t} = useI18n({namespace: "js.api_maker.inputs.attachment"})
    const {inputProps} = useInput({props: this.props})

    this.setInstance({inputProps, t})
    this.useStates({
      purgeChecked: false
    })
  }

  render() {
    const {inputProps, t} = this.tt
    const {attribute, checkboxComponent, className, label, model, name, onPurgeChanged, purgeName, wrapperOpts, ...restProps} = this.props
    const CheckboxComponent = checkboxComponent || Checkbox
    const newInputProps = Object.assign({}, inputProps, {type: "file"})

    return (
      <div className={classNames("api-maker--inputs--attachment", "components--inputs--input", className)} {...restProps}>
        {this.isImage() &&
          <a href={this.getUrl()} target="_blank">
            <img src={this.getUrl()} style={{maxWidth: "200px", maxHeight: "200px"}} />
          </a>
        }
        {this.getUrl() &&
          <div className="input-checkbox" style={{paddingTop: "15px", paddingBottom: "15px"}}>
            <CheckboxComponent id={this.getPurgeInputId()} name={this.getPurgeInputName()} onChange={this.props.onPurgeChanged} />
            <label className="checkbox-label" htmlFor={this.getPurgeInputId()}>
              {t("js.shared.delete")}
            </label>
          </div>
        }
        {!this.s.purgeChecked &&
          <ApiMakerInput
            defaultValue={null}
            inputProps={newInputProps}
            model={model}
          />
        }
      </div>
    )
  }

  getContentType() {
    const {attribute, model} = this.p
    const attributeName = `${attribute}ContentType`

    if (!(attributeName in model)) throw new Error(`No such method on ${model.modelClassData().name}: ${attributeName}`)

    return model[attributeName]()
  }

  getPurgeInputId() {
    const {inputProps} = this.tt

    return `${inputProps.id}_purge`
  }

  getPurgeInputName() {
    if ("purgeName" in this.props) return this.props.purgeName

    const {inputProps} = this.tt

    if (!inputProps.name) return null

    const match = inputProps.name.match(/^(.+)\[(.+?)\]$/)
    const purgeInputName = `${match[1]}[${match[2]}_purge]`

    return purgeInputName
  }

  getUrl() {
    const {attribute, model} = this.p
    const attributeName = `${attribute}Url`

    if (!(attributeName in model)) throw new Error(`No such method on ${model.modelClassData().name}: ${attributeName}`)

    return model[attributeName]()
  }

  isImage() {
    return this.getContentType()?.startsWith("image/")
  }

  onPurgeChanged = (e) => {
    this.setState({purgeChecked: digg(e, "target", "checked")})

    if (this.props.onPurgeChanged) this.props.onPurgeChanged(e)
  }
}))
