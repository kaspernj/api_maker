import React, {memo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import Devise from "@kaspernj/api-maker/build/devise.js"
import Layout from "components/layout"
import useEventEmitter from "ya-use-event-emitter"
import SessionStatusUpdater from "@kaspernj/api-maker/build/session-status-updater.js"

/** @typedef {Record<string, never>} SessionStatusSpecsTimeoutProps */

/**
 * @typedef {object} SessionStatusSpecsTimeoutState
 * @property {boolean} isUserSignedIn
 */

/** @augments {ShapeComponent<SessionStatusSpecsTimeoutProps, SessionStatusSpecsTimeoutState>} */
class SessionStatusSpecsTimeout extends ShapeComponent {
  state = /** @type {SessionStatusSpecsTimeoutState} */ ({
    isUserSignedIn: Devise.isUserSignedIn()
  })

  setup() {
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
}

export default memo(shapeComponent(SessionStatusSpecsTimeout))
