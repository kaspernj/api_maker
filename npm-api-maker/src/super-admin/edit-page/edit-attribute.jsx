import BaseComponent from "../../base-component"
import EditAttributeContent from "./edit-attribute-content"
import EditAttributeInput from "./edit-attribute-input"
import {shapeComponent} from "set-state-compare/src/shape-component.js"

export default memo(shapeComponent(class EditAttribute extends BaseComponent {
  render() {
    const {attribute, inputs, model, modelClass} = this.props
    const availableLocales = Locales.availableLocales()
    const camelizedLower = digg(modelClass.modelClassData(), "camelizedLower")

    return (
      <>
        {attribute.content &&
          <EditAttributeContent
            attribute={attribute}
            id={`${inflection.underscore(camelizedLower)}_${inflection.underscore(attribute.attribute)}`}
            inputs={inputs}
            model={model}
            name={inflection.underscore(attribute.attribute)}
          />
        }
        {!attribute.content && attribute.translated && availableLocales.map((locale) =>
          <EditAttributeInput
            attributeName={`${attribute.attribute}${inflection.camelize(locale)}`}
            id={`${inflection.underscore(camelizedLower)}_${inflection.underscore(attribute.attribute)}_${locale}`}
            inputs={inputs}
            label={`${modelClass.humanAttributeName(attribute.attribute)} (${locale})`}
            model={model}
            name={`${inflection.underscore(attribute.attribute)}_${locale}`}
            key={locale}
          />
        )}
        {!attribute.content && !attribute.translated &&
          <EditAttributeInput
            attributeName={attribute.attribute}
            id={`${inflection.underscore(camelizedLower)}_${inflection.underscore(attribute.attribute)}`}
            inputs={inputs}
            label={modelClass.humanAttributeName(attribute.attribute)}
            model={model}
            name={inflection.underscore(attribute.attribute)}
          />
        }
      </>
    )
  }
}))
