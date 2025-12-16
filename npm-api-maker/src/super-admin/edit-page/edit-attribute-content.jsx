import BaseComponent from "../../base-component.js"
import memo from "set-state-compare/src/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import {useForm} from "../../form"
import {useMemo} from "react"

export default memo(shapeComponent(class EditAttributeContent extends BaseComponent {
  static propTypes = propTypesExact({
    attribute: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired
  })

  setup() {
    this.form = useForm()
    this.useStates({
      value: () => this.defaultValue()
    })
  }

  render() {
    const {attribute, id, model} = this.props

    if (!(attribute.attribute in model)) {
      throw new Error(`${attribute.attribute} isn't set on the resource ${model.modelClassData().name}`)
    }

    const contentArgs = useMemo(() => ({
      inputProps: {
        attribute: attribute.attribute,
        defaultValue: this.defaultValue(),
        id,
        model
      },
      onChangeValue: this.tt.onChangeValue,
      value: this.s.value
    }), [attribute.attribute, id, model, this.s.value])

    return attribute.content(contentArgs)
  }

  defaultValue = () => {
    if (!(this.p.attribute.attribute in this.p.model)) {
      throw new Error(`No attribute called ${this.p.attribute.attribute} in model ${this.p.model.modelClassData().name}`)
    }

    return this.p.model[this.p.attribute.attribute]() || ""
  }

  onChangeValue = (newValue) => {
    this.setState({value: newValue})
    this.tt.form.setValue(this.p.name, newValue)
  }
}))
