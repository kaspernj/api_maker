// @ts-check
/* eslint-disable sort-imports */
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import {useFieldRegistration} from "formmeld"
import {useMemo} from "react"

/**
 * @typedef {object} Props
 * @property {object} attribute
 * @property {string} id
 * @property {object} model
 * @property {string} name
 */
/**
 * @typedef {object} State
 * @property {boolean | Date | number | string | null | undefined} value
 */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class EditAttributeContent extends ShapeComponent {
  static propTypes = propTypesExact({
    attribute: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired
  })

  state = {
    value: undefined
  }

  setup() {
    const rawValue = this.rawValue()
    this.initialValue = rawValue === null || rawValue === undefined ? "" : rawValue
    this.hasInitialValue = rawValue !== null && rawValue !== undefined
    this.fieldRegistration = useFieldRegistration(this.p.name, {
      applyValue: (value) => {
        this.s.value = /** @type {boolean | Date | number | string | null | undefined} */ (value)
      },
      initialValue: this.hasInitialValue ? this.initialValue : undefined
    })
  }

  render() {
    const {attribute, id, model} = this.props

    if (!(attribute.attribute in model)) {
      throw new Error(`${attribute.attribute} isn't set on the resource ${model.modelClassData().name}`)
    }

    const contentArgs = useMemo(() => ({
      defaultValue: this.initialValue,
      inputProps: {
        attribute: attribute.attribute,
        defaultValue: this.initialValue,
        id,
        model,
        name: this.p.name
      },
      onChangeValue: this.tt.onChangeValue,
      value: this.s.value === undefined ? this.initialValue : this.s.value
    }), [attribute.attribute, id, model, this.initialValue, this.p.name, this.s.value])

    return attribute.content(contentArgs)
  }

  defaultValue = () => this.initialValue

  rawValue = () => {
    if (!(this.p.attribute.attribute in this.p.model)) {
      throw new Error(`No attribute called ${this.p.attribute.attribute} in model ${this.p.model.modelClassData().name}`)
    }

    return this.p.model[this.p.attribute.attribute]()
  }

  onChangeValue = (newValue) => {
    this.s.value = newValue
    this.tt.fieldRegistration.setValue(newValue)
  }
}))
