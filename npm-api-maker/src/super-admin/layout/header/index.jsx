import "./style"
import BaseComponent from "../../../base-component"
import EventListener from "../../../event-listener"
import {memo, useRef} from "react"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"

export default memo(shapeComponent(class ApiMakerSuperAdminLayoutHeader extends BaseComponent {
  static propTypes = PropTypesExact({
    actions: PropTypes.node,
    onTriggerMenu: PropTypes.func.isRequired,
    title: PropTypes.string
  })

  setup() {
    this.headerActionsRef = useRef()
    this.useStates({
      headerActionsActive: false
    })
  }

  render() {
    const {actions, onTriggerMenu, title} = this.props

    return (
      <div className="components--admin--layout--header">
        <EventListener event="mouseup" onCalled={this.tt.onWindowMouseUp} target={window} />
        <div className="header-title-container">
          {title}
        </div>
        {actions &&
          <div className="header-actions-container" data-active={this.s.headerActionsActive}>
            <div className="header-actions" ref={this.tt.headerActionsRef}>
              {actions}
            </div>
          </div>
        }
        <div className="burger-menu-container">
          {actions &&
            <a className="actions-link" href="#" onClick={this.tt.onGearsClicked}>
              <i className="fa fa-gear" />
            </a>
          }
          <a className="burger-menu-link" href="#" onClick={onTriggerMenu}>
            <i className="fa fa-bars" />
          </a>
        </div>
      </div>
    )
  }

  onGearsClicked = (e) => {
    e.preventDefault()
    this.setState({headerActionsActive: !this.s.headerActionsActive})
  }

  onWindowMouseUp = (e) => {
    // Close the header actions menu if clicked happened outside
    if (this.s.headerActionsActive && this.tt.headerActionsRef.current && !this.tt.headerActionsRef.current.contains(e.target)) {
      this.setState({headerActionsActive: false})
    }
  }
}))
