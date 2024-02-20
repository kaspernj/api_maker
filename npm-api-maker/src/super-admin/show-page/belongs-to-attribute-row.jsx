import AttributeRow from "../../bootstrap/attribute-row"
import * as inflection from "inflection"
import Link from "../../link"
import Params from "../../params"
import {memo} from "react"

const ApiMakerSuperAdminShowPageBelongsToAttributeRow = ({model, modelClass, reflection}) => {
  const reflectionMethodName = inflection.camelize(reflection.name(), true)
  const subModel = model[reflectionMethodName]()

  return (
    <AttributeRow label={modelClass.humanAttributeName(inflection.camelize(reflection.name(), true))}>
      {subModel &&
        <Link to={Params.withParams({model: subModel.modelClassData().name, model_id: subModel.primaryKey()})}>
          {subModel && "name" in subModel && subModel.name()}
          {subModel && !("name" in subModel) && subModel?.id()}
        </Link>
      }
    </AttributeRow>
  )
}

export default memo(ApiMakerSuperAdminShowPageBelongsToAttributeRow)
