import CanCanLoader from "./can-can-loader"

export default (WrappedComponent, abilities) => class WithCanCan extends React.PureComponent {
  state = {
    canCan: undefined
  }

  render() {
    return (
      <>
        <CanCanLoader abilities={abilities} component={this} />
        <WrappedComponent canCan={this.state.canCan} {...this.props} />
      </>
    )
  }
}
