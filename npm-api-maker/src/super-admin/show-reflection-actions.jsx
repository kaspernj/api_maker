import BaseComponent from "../base-component.js"
import {digg} from "diggerize"
import * as inflection from "inflection"
import Link from "../link.jsx"
import memo from "set-state-compare/src/memo.js"
import React, {useMemo} from "react"
import Params from "../params.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import useCanCan from "../use-can-can.js"

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

    const dataSet = useMemo(() => ({class: "create-new-model-link"}), [])

    return (
      <>
        {canCan?.can("new", reflection.modelClass()) &&
          <Link dataSet={dataSet} to={Params.withParams(linkParams)}>
            Create new
          </Link>
        }
      </>
    )
  }
}))
