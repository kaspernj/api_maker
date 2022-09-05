import "./style"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import React from "react"

export default class ApiMakerSuperAdminLayoutHeader extends React.PureComponent {
  static propTypes = PropTypesExact({
    actions: PropTypes.node,
    onTriggerMenu: PropTypes.func.isRequired,
    title: PropTypes.string
  })

  headerActionsRef = React.createRef()
  state = {headerActionsActive: false}

  render() {
    const {headerActionsRef} = digs(this, "headerActionsRef")
    const {onGearsClicked} = digs(this, "onGearsClicked")
    const {actions, onTriggerMenu, title} = this.props
    const {headerActionsActive} = digs(this.state, "headerActionsActive")

    return (
      <div className="components--admin--layout--header">
        <EventListener event="mouseup" onCalled={digg(this, "onWindowMouseUp")} target={window} />
        <div className="header-title-container">
          {title}
        </div>
        {actions &&
          <div className="header-actions-container" data-active={headerActionsActive}>
            <div className="header-actions" ref={headerActionsRef}>
              {actions}
            </div>
          </div>
        }
        <div className="burger-menu-container">
          {actions &&
            <a className="actions-link" href="#" onClick={onGearsClicked}>
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
    this.setState({
      headerActionsActive: !this.state.headerActionsActive
    })
  }

  onWindowMouseUp = (e) => {
    const {headerActionsRef} = digs(this, "headerActionsRef")
    const {headerActionsActive} = digs(this.state, "headerActionsActive")

    // Close the header actions menu if clicked happened outside
    if (headerActionsActive && headerActionsRef.current && !headerActionsRef.current.contains(e.target)) this.state.set({headerActionsActive: false})
  }
}
