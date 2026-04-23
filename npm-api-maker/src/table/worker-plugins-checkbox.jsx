// @ts-check
/* eslint-disable import/no-unresolved, new-cap, sort-imports */
import React, {useMemo} from "react"
import classNames from "classnames"
import {digg} from "diggerize"
import memo from "set-state-compare/build/memo.js"
import modelClassRequire from "../model-class-require.js"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import useModelEvent from "../use-model-event.js"

const Workplace = modelClassRequire("Workplace")

/** @typedef {Record<string, never>} Props */
/**
 * @typedef {object} State
 * @property {boolean} checked
 * @property {boolean} linkLoaded
 */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerTableWorkerPluginsCheckbox extends ShapeComponent {
  static propTypes = PropTypesExact({
    currentWorkplace: PropTypes.object,
    model: PropTypes.object.isRequired,
    style: PropTypes.object
  })

  state = {
    checked: false,
    linkLoaded: false
  }

  setup() {
    useMemo(() => {
      this.loadCurrentLink()
    }, [])

    useModelEvent(this.p.currentWorkplace, "workplace_links_created", this.tt.onLinksCreated)
    useModelEvent(this.p.currentWorkplace, "workplace_links_destroyed", this.tt.onLinksDestroyed)
  }

  async loadCurrentLink() {
    const {model} = this.props
    const response = await Workplace.linkFor({model_class: model.modelClassData().name, model_id: model.id()})
    const link = digg(response, "link")

    this.setState({
      checked: Boolean(link),
      linkLoaded: true
    })
  }

  render() {
    const {className, model, style} = this.props
    const {checked, linkLoaded} = this.s

    if (!linkLoaded) {
      return null
    }

    return (
      <input
        checked={checked}
        className={classNames("api-maker--table--worker-plugins-checkbox", className)}
        data-checked={checked}
        data-model-id={model.id()}
        onChange={this.tt.onCheckedChanged}
        style={style}
        type="checkbox"
      />
    )
  }

  onCheckedChanged = (e) => {
    e.preventDefault()

    const {model} = this.props
    const checked = e.target.checked

    if (checked) {
      Workplace.createLink({model_class: model.modelClassData().name, model_id: model.id()})
    } else {
      const modelClassName = model.modelClassData().name
      const params = {models: {}}

      params.models[modelClassName] = [model.id()]

      Workplace.destroyLinks(params)
    }
  }

  onLinksCreated = ({args}) => {
    if (args.resource_types?.includes(this.p.model.modelClassData().name)) {
      this.loadCurrentLink()
    }
  }

  onLinksDestroyed = ({args}) => {
    if (args.resource_types?.includes(this.p.model.modelClassData().name)) {
      this.loadCurrentLink()
    }
  }
}))
