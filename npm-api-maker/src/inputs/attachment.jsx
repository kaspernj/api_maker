/* eslint-disable sort-imports */
import ApiMakerInput from "./input"
import {digg} from "diggerize"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import BaseComponent from "../base-component"
import Checkbox from "./checkbox"
import PropTypes from "prop-types"
import React from "react"
import classNames from "classnames" // eslint-disable-line import/no-unresolved
import memo from "set-state-compare/build/memo.js"
import useI18n from "i18n-on-steroids/src/use-i18n.js"
import useInput from "../use-input.js"

export default memo(shapeComponent(class ApiMakerInputsAttachment extends BaseComponent {
  static propTypes = {
    className: PropTypes.string,
    contentType: PropTypes.string,
    model: PropTypes.object,
    onPurgeChanged: PropTypes.func,
    purgeName: PropTypes.string,
    url: PropTypes.string
  }

  setup() {
    const {t} = useI18n({namespace: "js.api_maker.inputs.attachment"})
    const {inputProps} = useInput({
      props: {
        inputProps: {name: ""},
        inputRef: undefined,
        type: "file",
        ...this.props
      },
      wrapperOptions: {type: "file"}
    })

    this.setInstance({inputProps, t})
    this.useStates({
      purgeChecked: false
    })
  }

  render() {
    const {inputProps, t} = this.tt
    const {attribute, checkboxComponent, className, contentType, id, label, model, name, onPurgeChanged, purgeName, url, wrapperOpts, ...restProps} = this.props
    const CheckboxComponent = checkboxComponent || Checkbox
    const newInputProps = Object.assign({}, inputProps, {type: "file"}) // eslint-disable-line prefer-object-spread

    return (
      <div className={classNames("api-maker--inputs--attachment", "components--inputs--input", className)} {...restProps}>
        {this.isImage() &&
          <a href={this.getUrl()} target="_blank">
            <img src={this.getUrl()} style={{maxWidth: "200px", maxHeight: "200px"}} />
          </a>
        }
        {this.getUrl() &&
          <div className="input-checkbox" style={{paddingTop: "15px", paddingBottom: "15px"}}>
            <CheckboxComponent id={this.getPurgeInputId()} name={this.getPurgeInputName()} onChange={this.tt.onPurgeChanged} />
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
            type="file"
          />
        }
      </div>
    )
  }

  getContentType() {
    if ("contentType" in this.props) return this.props.contentType

    const {attribute, model} = this.p
    const attributeName = `${attribute}ContentType`
    const modelClassName = model ? model.modelClassData().name : "Attachment"

    if (!model) return null

    if (!(attributeName in model)) throw new Error(`No such method on ${modelClassName}: ${attributeName}`)

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
    if ("url" in this.props) return this.props.url

    const {attribute, model} = this.p
    const attributeName = `${attribute}Url`
    const modelClassName = model ? model.modelClassData().name : "Attachment"

    if (!model) return null

    if (!(attributeName in model)) throw new Error(`No such method on ${modelClassName}: ${attributeName}`)

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
