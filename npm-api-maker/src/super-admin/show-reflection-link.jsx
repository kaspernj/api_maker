// @ts-check
/* eslint-disable react/jsx-curly-brace-presence, sort-imports */
import {digg} from "diggerize"
import Link from "../link"
import memo from "set-state-compare/build/memo.js"
import Params from "../params.js"
import React, {useMemo} from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "../utils/text"

/** @typedef {Record<string, never>} Props */
/**
 * @typedef {object} State
 * @property {number | undefined} count
 */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerSuperAdminShowReflectionLink extends ShapeComponent {
  state = {
    count: undefined
  }

  setup() {
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
          {modelClass.humanAttributeName(reflection.name())}
          {" ("}
          {count}
          {")"}
        </Text>
      </Link>
    )
  }
}))
