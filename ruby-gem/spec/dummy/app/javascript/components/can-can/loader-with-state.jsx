import classNames from "classnames"
import PropTypes from "prop-types"
import useCanCan from "@kaspernj/api-maker/src/use-can-can"

const CanCanWithState = ({className, ...restProps}) => {
  const canCan = useCanCan(() => [[Account, ["sum"]]])

  return (
    <div className={classNames("components-can-can-loader-with-state", className)} {...restProps}>
      {!canCan &&
        "can can not loaded"
      }

      {canCan && canCan.can("sum", Account) &&
        <div className="can-access-admin">
          can access admin
        </div>
      }
      {canCan && !canCan.can("sum", Account) &&
        <div className="cannot-access-admin">
          can not access admin
        </div>
      }
    </div>
  )
}

CanCanWithState.propTypes = {
  className: PropTypes.string
}

export default CanCanWithState
