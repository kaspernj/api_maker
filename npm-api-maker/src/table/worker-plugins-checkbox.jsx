import classNames from "classnames"
import {digg} from "diggerize"
import EventConnection from "../event-connection"
import modelClassRequire from "../model-class-require.mjs"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React, {useEffect} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"

const Workplace = modelClassRequire("Workplace")

export default shapeComponent(class ApiMakerTableWorkerPluginsCheckbox extends ShapeComponent {
  static propTypes = PropTypesExact({
    currentWorkplace: PropTypes.object,
    model: PropTypes.object.isRequired
  })

  setup() {
    this.useStates({
      checked: false,
      linkLoaded: false
    })

    useEffect(() => {
      this.loadCurrentLink()
    }, [])
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
    const {className, currentWorkplace, model} = this.props
    const {checked, linkLoaded} = this.state

    if (!linkLoaded) {
      return null
    }

    return (
      <>
        {currentWorkplace &&
          <>
            <EventConnection event="workplace_links_created" model={currentWorkplace} onCall={this.onLinksCreated} />
            <EventConnection event="workplace_links_destroyed" model={currentWorkplace} onCall={this.onLinksDestroyed} />
          </>
        }
        <input
          checked={checked}
          className={classNames("api-maker--table--worker-plugins-checkbox", className)}
          data-checked={checked}
          data-model-id={model.id()}
          onChange={this.onCheckedChanged}
          type="checkbox"
        />
      </>
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
    const {model} = digs(this.props, "model")
    const id = model.id()
    const modelClassName = model.modelClassData().name

    if (args.created[modelClassName] && args.created[modelClassName].includes(id)) {
      this.setState({checked: true})
    }
  }

  onLinksDestroyed = ({args}) => {
    const {model} = digs(this.props, "model")
    const id = model.id()
    const modelClassName = model.modelClassData().name

    if (args.destroyed[modelClassName] && args.destroyed[modelClassName].includes(id)) {
      this.setState({checked: false})
    }
  }
})
