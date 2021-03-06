import ApiMakerEventEmitterListener from "./event-emitter-listener"
import {digg, digs} from "@kaspernj/object-digger"
const CanCan = require("./can-can.cjs")
const PropTypes = require("prop-types")
const PropTypesExact = require("prop-types-exact")
const React = require("react")

export default class ApiMakerCanCanLoader extends React.Component {
  static propTypes = PropTypesExact({
    abilities: PropTypes.array.isRequired,
    component: PropTypes.object.isRequired
  })

  componentDidMount() {
    this.loadAbilities()
  }

  async loadAbilities() {
    const canCan = CanCan.current()
    const {abilities} = digs(this.props, "abilities")

    await canCan.loadAbilities(abilities)

    this.updateComponent({canCan})
  }

  render() {
    const canCan = CanCan.current()
    const events = digg(canCan, "events")

    return (
      <ApiMakerEventEmitterListener
        events={events}
        event="onResetAbilities"
        onCalled={() => this.onResetAbilities()}
      />
    )
  }

  onResetAbilities() {
    this.updateComponent({canCan: undefined})
    this.loadAbilities()
  }

  updateComponent(updatedState) {
    const {component} = digs(this.props, "component")

    if (component.shape) {
      component.shape.set(updatedState)
    } else {
      component.setState(updatedState)
    }
  }
}
