import "./style"

export default class ApiMakerSuperAdminLayoutHeader extends BaseComponent {
  static propTypes = PropTypesExact({
    actions: PropTypes.node,
    onTriggerMenu: PropTypes.func.isRequired,
    title: PropTypes.string
  })

  headerActionsRef = React.createRef()
  shape = new Shape(this, {headerActionsActive: false})

  render() {
    const {headerActionsRef} = digs(this, "headerActionsRef")
    const {onGearsClicked} = digs(this, "onGearsClicked")
    const {actions, onTriggerMenu, title} = this.props
    const {headerActionsActive} = digs(this.shape, "headerActionsActive")

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
    this.shape.set({
      headerActionsActive: !this.shape.headerActionsActive
    })
  }

  onWindowMouseUp = (e) => {
    const {headerActionsRef} = digs(this, "headerActionsRef")
    const {headerActionsActive} = digs(this.shape, "headerActionsActive")

    // Close the header actions menu if clicked happened outside
    if (headerActionsActive && headerActionsRef.current && !headerActionsRef.current.contains(e.target)) this.shape.set({headerActionsActive: false})
  }
}
