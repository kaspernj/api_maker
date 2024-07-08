import BaseComponent from "../../base-component"
import {shapeComponent} from "set-state-compare/src/shape-component.js"

export default memo(shapeComponent(class EditAttributeContent extends BaseComponent {
  render() {
    const {attribute, id, inputs, model, name} = this.props

    if (!(attribute.attribute in model)) {
      throw new Error(`${attribute.attribute} isn't set on the resource ${model.modelClassData().name}`)
    }

    const defaultValue = useCallback(() => model[attribute.attribute]() || "")
    const [value, setValue] = useState(() => defaultValue())
    const onChangeValue = useCallback((newValue) => {
      inputs[name] = newValue
      setValue(newValue)
    })
    useMemo(() => {
      inputs[name] = value
    }, [])

    const contentArgs = () => ({
      inputProps: {
        attribute: attribute.attribute,
        defaultValue: defaultValue(),
        id,
        model
      },
      onChangeValue
    })

    return attribute.content(contentArgs())
  }
}))
