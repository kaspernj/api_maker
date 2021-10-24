import {Devise, EventEmitterListener, SessionStatusUpdater} from "@kaspernj/api-maker"
import Layout from "components/layout"
import React from "react"

export default class SessionStatusSpecsTimeout extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isUserSignedIn: Devise.isUserSignedIn()
    }
  }

  componentDidMount() {
    this.sessionStatusUpdater = new SessionStatusUpdater({debug: false, timeout: 2000})
    this.sessionStatusUpdater.startTimeout()
  }

  componentWillUnmount() {
    this.sessionStatusUpdater.stopTimeout()
  }

  render() {
    return (
      <Layout className="component-session-status-specs-timeout">
        <EventEmitterListener events={Devise.events()} event="onDeviseSignOut" onCalled={this.onDeviseSignOut} />

        <div className="status-text">
          isUserSignedIn: {this.state.isUserSignedIn ? "Yes" : "No"}
        </div>
      </Layout>
    )
  }

  onDeviseSignOut = () => this.setState({isUserSignedIn: false})
}
