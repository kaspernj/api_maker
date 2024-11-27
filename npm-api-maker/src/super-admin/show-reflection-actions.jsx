import BaseComponent from "../base-component"
import {digg} from "diggerize"
import memo from "set-state-compare/src/memo"
import {useMemo} from "react"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"

export default memo(shapeComponent(class SuperAdminShowReflectionActions extends BaseComponent {
  static propTypes = propTypesExact({
    model: PropTypes.object,
    modelClass: PropTypes.func,
    reflectionName: PropTypes.string
  })

  setup() {
    const {modelClass, reflectionName} = this.p

    this.reflection = useMemo(() => modelClass.reflections().find((reflection) => reflection.name() == reflectionName), [modelClass, reflectionName])
    this.canCan = useCanCan(() => [[this.reflection.modelClass(), ["new"]]])
  }

  render() {
    const {canCan, reflection} = this.tt
    const {model} = this.p
    const modelClassName = digg(reflection, "reflectionData", "className")
    const modelData = {}
    const dataParamName = inflection.singularize(reflection.reflectionData.collectionName)

    modelData[reflection.foreignKey()] = model?.id()

    const linkParams = {
      model: modelClassName,
      mode: "new"
    }

    linkParams[dataParamName] = modelData

    return (
      <>
        {canCan?.can("new", reflection.modelClass()) &&
          <Link dataSet={{class: "create-new-model-link"}} to={Params.withParams(linkParams)}>
            Create new
          </Link>
        }
      </>
    )
  }
}))
