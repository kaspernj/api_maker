// @ts-check
/* eslint-disable sort-imports */
import AttributeRow from "../../bootstrap/attribute-row"
import * as inflection from "inflection"
import Link from "../../link"
import memo from "set-state-compare/build/memo.js"
import Params from "../../params.js"
import React from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "../../utils/text"

/**
 * @typedef {object} Props
 * @property {any} model
 * @property {any} modelClass
 * @property {any} reflection
 */
/** @typedef {Record<string, never>} State */
/** @augments {ShapeComponent<Props, State>} */
class ApiMakerSuperAdminShowPageBelongsToAttributeRow extends ShapeComponent {
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
}

export default memo(shapeComponent(ApiMakerSuperAdminShowPageBelongsToAttributeRow))
