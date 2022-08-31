import apiMakerConfig from "@kaspernj/api-maker/src/config.mjs"
import React from "react"

export default (WrappedComponent) => class WithBreakPoint extends React.Component {
  state = {
    breakPoint: this.calculateBreakPoint()
  }

  calculateBreakPoint() {
    const windowWidth = window.innerWidth

    for (const breakPointData of apiMakerConfig.getBreakPoints()) {
      const breakPoint = breakPointData[0]
      const width = breakPointData[1]

      if (windowWidth >= width) return breakPoint
    }

    throw new Error(`Couldn't not find breakPoint from window width: ${windowWidth}`)
  }

  constructor(props) {
    super(props)
    this.onCalled = this.onCalled.bind(this)
  }

  componentDidMount () {
    window.addEventListener("resize", this.onCalled)
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.onCalled)
  }

  render() {
    return (
      <WrappedComponent breakPoint={this.state.breakPoint} {...this.props} />
    )
  }

  onCalled = () => {
    const breakPoint = this.calculateBreakPoint()

    if (breakPoint != this.state.breakPoint) {
      this.setState({breakPoint})
    }
  }
}
