import BaseComponent from "../base-component"
import classNames from "classnames"
import {digg} from "diggerize"
import modelClassRequire from "../model-class-require.mjs"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {memo, useMemo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"
import useModelEvent from "../use-model-event.js"

const Workplace = modelClassRequire("Workplace")

export default memo(shapeComponent(class ApiMakerTableWorkerPluginsCheckbox extends BaseComponent {
  static propTypes = PropTypesExact({
    currentWorkplace: PropTypes.object,
    model: PropTypes.object.isRequired,
    style: PropTypes.object
  })

  setup() {
    this.useStates({
      checked: false,
      linkLoaded: false
    })

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
    const {checked, linkLoaded} = this.state

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
}))
