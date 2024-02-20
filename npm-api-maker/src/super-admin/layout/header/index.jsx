import "./style"
import EventListener from "../../../event-listener"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {memo, useRef} from "react"

const ApiMakerSuperAdminLayoutHeader = ({actions, onTriggerMenu, title}) => {
  const headerActionsRef = useRef()
  const [headerActionsActive, setHeaderActionsActive] = useState(false)
  const onGearsClicked = useCallback((e) => {
    e.preventDefault()
    setHeaderActionsActive(!headerActionsActive)
  }, [headerActionsActive])

  const onWindowMouseUp = useCallback((e) => {
    // Close the header actions menu if clicked happened outside
    if (headerActionsActive && headerActionsRef.current && !headerActionsRef.current.contains(e.target)) setHeaderActionsActive(false)
  }, [headerActionsActive, headerActionsRef])

  return (
    <div className="components--admin--layout--header">
      <EventListener event="mouseup" onCalled={onWindowMouseUp} target={window} />
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

ApiMakerSuperAdminLayoutHeader.propTypes = PropTypesExact({
  actions: PropTypes.node,
  onTriggerMenu: PropTypes.func.isRequired,
  title: PropTypes.string
})

export default memo(ApiMakerSuperAdminLayoutHeader)
