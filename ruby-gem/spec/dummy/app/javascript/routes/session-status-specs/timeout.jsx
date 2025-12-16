import React, {memo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import Devise from "@kaspernj/api-maker/dist/devise"
import Layout from "components/layout"
import useEventEmitter from "@kaspernj/api-maker/dist/use-event-emitter"
import SessionStatusUpdater from "@kaspernj/api-maker/dist/session-status-updater"

export default memo(shapeComponent(class SessionStatusSpecsTimeout extends ShapeComponent {
  setup() {
    this.useStates({
      isUserSignedIn: () => Devise.isUserSignedIn()
    })

    useEventEmitter(Devise.events(), "onDeviseSignOut", this.tt.onDeviseSignOut)
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
        <div className="status-text">
          isUserSignedIn: {this.state.isUserSignedIn ? "Yes" : "No"}
        </div>
      </Layout>
    )
  }

  onDeviseSignOut = () => this.setState({isUserSignedIn: false})
}))
