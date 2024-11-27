import classNames from "classnames"
import {digg} from "diggerize"
import * as inflection from "inflection"
import memo from "set-state-compare/src/memo"
import MoneyFormatter from "../../money-formatter"
import PropTypes from "prop-types"
import {useMemo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component.js"
import strftime from "strftime"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"

export default memo(shapeComponent(class ApiMakerBootstrapAttributeRow extends ShapeComponent {
  static defaultProps = {
    checkIfAttributeLoaded: false
  }

  static propTypes = {
    attribute: PropTypes.string,
    checkIfAttributeLoaded: PropTypes.bool.isRequired,
    children: PropTypes.node,
    identifier: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    model: PropTypes.object,
    value: PropTypes.node
  }

  setup() {
    const {t} = useI18n({namespace: "js.api_maker.attribute_row"})

    this.t = t
    this.attribute = useMemo(
      () => {
        if (this.props.attribute) {
          return this.props.model?.constructor?.attributes()?.find((attribute) => attribute.name() == inflection.underscore(this.props.attribute))
        }
      },
      [this.props.attribute, this.props.model]
    )
  }

  render () {
    const {attribute, checkIfAttributeLoaded, children, className, identifier, label, model, value, ...restProps} = this.props

    return (
      <div
        className={classNames(className, "component-api-maker-attribute-row")}
        data-attribute={attribute}
        data-identifier={identifier}
        {...restProps}
      >
        <div className="attribute-row-label">
          {this.label()}
        </div>
        <div className="attribute-row-value">
          {this.value()}
        </div>
      </div>
    )
  }

  label() {
    const {attribute, label, model} = this.props

    if ("label" in this.props) return label
    if (attribute && model) return model.constructor.humanAttributeName(attribute)

    throw new Error("Couldn't figure out label")
  }

  value() {
    const {attribute, checkIfAttributeLoaded, children, model} = this.props

    if (children) return children

    if (attribute && !(attribute in model))
      throw new Error(`Attribute not found: ${digg(model.modelClassData(), "name")}#${attribute}`)

    if (attribute && checkIfAttributeLoaded && !model.isAttributeLoaded(attribute))
      return null

    if (attribute && model) {
      const value = model[attribute]()

      return this.valueContent(value)
    }
  }

  valueContent(value) {
    const columnType = this.attribute?.getColumn()?.getType()

    if (columnType == "date") {
      return I18n.l("date.formats.default", value)
    } else if (value instanceof Date) {
      return strftime("%Y-%m-%d %H:%M", value)
    } else if (typeof value === "boolean") {
      if (value) return this.t("js.shared.yes", {defaultValue: "Yes"})

      return this.t("js.shared.no", {defaultValue: "No"})
    } else if (MoneyFormatter.isMoney(value)) {
      return MoneyFormatter.format(value)
    } else {
      return value
    }
  }
}))
