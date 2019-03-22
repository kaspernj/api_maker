import React from "react"
import { Switch } from "react-router-dom"
import { withRouter } from "react-router"

class ScrollToTop extends React.Component {
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location)
      window.scrollTo(0, 0)
  }

  render() {
    return (<Switch>{this.props.children}</Switch>)
  }
}

export default withRouter(ScrollToTop)
