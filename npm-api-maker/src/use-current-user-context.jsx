// @ts-check
import * as inflection from "inflection"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import Devise from "./devise.js"
import Logger from "./logger.js"
import PropTypes from "prop-types"
import React from "react"
import Services from "./services.js"
import {digg} from "diggerize"
import {events} from "./use-current-user.js"
import memo from "set-state-compare/build/memo.js"
import propTypesExact from "prop-types-exact"
import useEventEmitter from "ya-use-event-emitter"
import useNow from "set-state-compare/build/use-now.js"

const logger = new Logger({name: "ApiMaker / UseCurrentUserContext"})

/**
 * @typedef {import("./use-current-user.js").CurrentUserModel} CurrentUserModel
 */
/**
 * @typedef {object} Result
 * @property {boolean} loaded
 * @property {CurrentUserModel | undefined} model
 */
/**
 * @typedef {object} Props
 * @property {import("react").ReactNode} children
 * @property {string} [scope]
 */
/**
 * @typedef {object} State
 * @property {Result} result
 */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerUseCurrentUserContext extends ShapeComponent {
  static propTypes = propTypesExact({
    children: PropTypes.node,
    scope: PropTypes.string
  })

  static defaultProps = {
    scope: "user"
  }

  state = {
    result: /** @type {Result} */ ({
      loaded: false,
      model: undefined
    })
  }

  loadCurrentUserRequestId = 0

  setup() {
    const scope = this.p.scope ?? "user"
    const scopeName = `current${inflection.camelize(scope)}`
    const scopeInstance = Devise.getScope(scope)

    this.scope = scope
    this.scopeName = scopeName
    this.ScopeContext = scopeInstance.getContext()

    useNow(() => {
      if (Devise.current().hasCurrentScope(this.scope) || Devise.current().hasGlobalCurrentScope(this.scope)) {
        this.s.result = {loaded: false, model: this.defaultCurrentUser() ?? null}
      }
    }, [])

    React.useEffect(() => {
      if (!Devise.current().hasGlobalCurrentScope(this.scope) && !Devise.current().hasCurrentScope(this.scope)) {
        logger.debug(() => `Devise hasn't got current scope ${this.scope} so loading from request`)
        this.loadCurrentUserFromRequest()
      }

      // Discard any in-flight current-user load when this instance tears down.
      return () => {
        this.loadCurrentUserRequestId += 1
      }
    }, [])

    useEventEmitter(Devise.events(), "onDeviseSignIn", this.tt.onDeviseSignIn)
    useEventEmitter(Devise.events(), "onDeviseSignOut", this.tt.onDeviseSignOut)
  }

  render() {
    const {ScopeContext} = this

    return (
      <ScopeContext.Provider value={this.s.result}>
        {this.p.children}
      </ScopeContext.Provider>
    )
  }

  loadCurrentUserFromRequest = async () => {
    // Ignore late current-user responses so the live provider controls session state.
    const requestId = this.loadCurrentUserRequestId + 1

    this.loadCurrentUserRequestId = requestId

    const getArgsMethodName = `get${inflection.camelize(this.scope)}Args`
    const args = Devise[getArgsMethodName]()

    logger.debug(() => `Loading ${this.scope} with request`)

    const result = await Services.current().sendRequest("Devise::Current", {query: args.query, scope: this.scope})
    const current = digg(result, "current")[0]

    if (requestId != this.loadCurrentUserRequestId) return

    if (current) Devise.updateSession(current)

    this.setState({result: {loaded: true, model: current}})

    events.emit("currentUserLoaded", {current})
  }

  defaultCurrentUser = () => {
    let current

    if (Devise.current().hasCurrentScope(this.scope)) {
      current = Devise.current().getCurrentScope(this.scope)
      logger.debug(() => `Setting ${this.scope} from current scope: ${current?.id()}`)
    } else if (Devise.current().hasGlobalCurrentScope(this.scope)) {
      current = Devise[this.scopeName]()
      logger.debug(() => `Setting ${this.scope} from global current scope: ${current?.id()}`)
    }

    if (current) events.emit("currentUserLoaded", {current})

    return current
  }

  updateCurrentUser = () => {
    this.setState({result: {loaded: true, model: Devise[this.scopeName]()}})
  }

  onDeviseSignIn = () => {
    // Invalidate any in-flight loadCurrentUserFromRequest — it was dispatched
    // against the pre-sign-in session and will resolve with current: null,
    // flipping the context back to signed-out and re-mounting the sign-in
    // component after we've already applied the signed-in state here.
    this.loadCurrentUserRequestId += 1
    this.updateCurrentUser()
  }

  onDeviseSignOut = () => {
    // Symmetric to onDeviseSignIn: a late response from a request dispatched
    // before sign-out could otherwise overwrite the signed-out state with a
    // stale signed-in model.
    this.loadCurrentUserRequestId += 1
    this.updateCurrentUser()
  }
}))
