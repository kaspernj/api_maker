import BaseComponent from "../../base-component"
import {digg} from "diggerize"
import EditAttributeContent from "./edit-attribute-content"
import EditAttributeInput from "./edit-attribute-input"
import * as inflection from "inflection"
import Locales from "shared/locales"
import {memo} from "react"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {View} from "react-native"
import {shapeComponent} from "set-state-compare/src/shape-component.js"

export default memo(shapeComponent(class EditAttribute extends BaseComponent {
  static propTypes = propTypesExact({
    attribute: PropTypes.object.isRequired,
    model: PropTypes.object,
    modelClass: PropTypes.func
  })

  render() {
    const {attribute, model, modelClass} = this.props
    const availableLocales = Locales.availableLocales()
    const camelizedLower = digg(modelClass.modelClassData(), "camelizedLower")

    return (
      <View dataSet={{component: "api-maker/super-admin/edit-page/edit-attribute"}} style={{marginBottom: attribute.translated ? undefined : 12}}>
        {attribute.content &&
          <EditAttributeContent
            attribute={attribute}
            id={`${inflection.underscore(camelizedLower)}_${inflection.underscore(attribute.attribute)}`}
            model={model}
            name={inflection.underscore(attribute.attribute)}
          />
        }
        {!attribute.content && attribute.translated && availableLocales.map((locale) =>
          <View key={locale} style={{marginBottom: 12}}>
            <EditAttributeInput
              attributeName={`${attribute.attribute}${inflection.camelize(locale)}`}
              id={`${inflection.underscore(camelizedLower)}_${inflection.underscore(attribute.attribute)}_${locale}`}
              label={`${modelClass.humanAttributeName(attribute.attribute)} (${locale})`}
              model={model}
              name={`${inflection.underscore(attribute.attribute)}_${locale}`}
            />
          </View>
        )}
        {!attribute.content && !attribute.translated &&
          <EditAttributeInput
            attributeName={attribute.attribute}
            id={`${inflection.underscore(camelizedLower)}_${inflection.underscore(attribute.attribute)}`}
            label={modelClass.humanAttributeName(attribute.attribute)}
            model={model}
            name={inflection.underscore(attribute.attribute)}
          />
        }
      </View>
    )
  }
}))
