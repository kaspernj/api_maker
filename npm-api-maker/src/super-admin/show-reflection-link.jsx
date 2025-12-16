import BaseComponent from "../base-component.js"
import {digg} from "diggerize"
import Link from "../link"
import memo from "set-state-compare/src/memo.js"
import Params from "../params.js"
import React from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import Text from "../utils/text"
import {useMemo} from "react"

export default memo(shapeComponent(class ApiMakerSuperAdminShowReflectionLink extends BaseComponent {
  setup() {
    this.useStates({count: undefined})

    useMemo(() => {
      this.countRelationship()
    }, [])
  }

  countRelationship = async () => {
    const {model, reflection} = this.p
    const query = model[reflection.name()]()
    const count = await query.ransack().count()

    this.setState({count})
  }

  render() {
    const {model, modelClass, reflection} = this.p
    const {count} = this.s

    return (
      <Link to={Params.withParams({model: digg(modelClass.modelClassData(), "name"), model_id: model.primaryKey(), model_reflection: reflection.name()})}>
        <Text>
          {modelClass.humanAttributeName(reflection.name())} ({count})
        </Text>
      </Link>
    )
  }
}))
