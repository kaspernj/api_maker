import BaseComponent from "../../base-component"
import {memo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"

export default memo(shapeComponent(class EditAttributeContent extends BaseComponent {
  setup() {
    const {inputs, name} = this.p

    this.useStates({
      value: () => this.defaultValue()
    })

    useMemo(() => {
      inputs[name] = this.s.value
    }, [])
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
      onChangeValue: this.tt.onChangeValue
    }), [attribute.attribute, id, model])

    return attribute.content(contentArgs)
  }

  defaultValue = () => this.p.model[this.p.attribute.attribute]() || ""

  onChangeValue = (newValue) => {
    const {inputs, name} = this.p

    inputs[name] = newValue

    this.setState({value: newValue})
  }
}))
