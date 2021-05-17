import ApiMakerEventEmitterListener from "./event-emitter-listener"

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

    await canCan.loadAbilities(this.props.abilities)

    this.props.component.shape.set({canCan})
  }

  render() {
    return (
      <ApiMakerEventEmitterListener events={CanCan.current().events} event="onResetAbilities" onCalled={() => this.onResetAbilities()} />
    )
  }

  onResetAbilities() {
    this.props.component.shape.set({canCan: undefined})

    setTimeout(() => this.loadAbilities(), 0)
  }
}
