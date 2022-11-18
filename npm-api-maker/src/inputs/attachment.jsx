import {Input as ApiMakerInput} from "@kaspernj/api-maker/src/inputs/input"
import {Checkbox} from "./checkbox"

export default class ApiMakerInputsAttachment extends BaseComponent {
  static propTypes = {
    className: PropTypes.string,
    model: PropTypes.object.isRequired
  }

  render() {
    const {checkboxComponent, className, inputProps, model, wrapperOpts, ...restProps} = this.props
    const CheckboxComponent = checkboxComponent || Checkbox

    inputProps.type = "file"

    return (
      <div className={classNames("api-maker--inputs--attachment", "components--inputs--input", className)} {...restProps}>
        {this.isImage() &&
          <a href={this.getUrl()} target="_blank">
            <img src={this.getUrl()} style={{maxWidth: "200px", maxHeight: "200px"}} />
          </a>
        }
        {this.getUrl() &&
          <div className="input-checkbox" style={{paddingTop: "15px", paddingBottom: "15px"}}>
            <CheckboxComponent inputProps={{id: this.getPurgeInputId(), name: this.getPurgeInputName()}} />
            <label className="checkbox-label" htmlFor={this.getPurgeInputId()}>
              {I18n.t("js.shared.delete")}
            </label>
          </div>
        }
        <ApiMakerInput
          defaultValue={null}
          inputProps={inputProps}
          model={model}
        />
      </div>
    )
  }

  getContentType() {
    const {attribute, model} = digs(this.props, "attribute", "model")
    const attributeName = `${attribute}ContentType`

    if (!(attributeName in model)) throw new Error(`No such method on ${model.modelClassData().name}: ${attributeName}`)

    return model[attributeName]()
  }

  getPurgeInputId() {
    const {inputProps} = digs(this.props, "inputProps")

    return `${inputProps.id}_purge`
  }

  getPurgeInputName() {
    const {inputProps} = digs(this.props, "inputProps")
    const match = inputProps.name.match(/^(.+)\[(.+?)\]$/)
    const purgeInputName = `${match[1]}[${match[2]}_purge]`

    return purgeInputName
  }

  getUrl() {
    const {attribute, model} = digs(this.props, "attribute", "model")
    const attributeName = `${attribute}Url`

    if (!(attributeName in model)) throw new Error(`No such method on ${model.modelClassData().name}: ${attributeName}`)

    return model[attributeName]()
  }

  isImage() {
    return this.getContentType()?.startsWith("image/")
  }
}
