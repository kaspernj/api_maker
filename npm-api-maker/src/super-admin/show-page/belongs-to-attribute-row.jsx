import AttributeRow from "../../bootstrap/attribute-row.jsx"
import BaseComponent from "../../base-component.js"
import * as inflection from "inflection"
import Link from "../../link.jsx"
import memo from "set-state-compare/src/memo.js"
import Params from "../../params.js"
import React from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import Text from "../../utils/text.jsx"

export default memo(shapeComponent(class ApiMakerSuperAdminShowPageBelongsToAttributeRow extends BaseComponent {
  render() {
    const {model, modelClass, reflection} = this.props
    const reflectionMethodName = inflection.camelize(reflection.name(), true)
    const subModel = model[reflectionMethodName]()

    return (
      <AttributeRow label={modelClass.humanAttributeName(inflection.camelize(reflection.name(), true))}>
        {subModel &&
          <Link to={Params.withParams({model: subModel.modelClassData().name, model_id: subModel.primaryKey()})}>
            <Text>
              {subModel && "name" in subModel && subModel.name()}
              {subModel && !("name" in subModel) && subModel?.id()}
            </Text>
          </Link>
        }
      </AttributeRow>
    )
  }
}))
