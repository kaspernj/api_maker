import React, {memo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import classNames from "classnames"
import models from "@kaspernj/api-maker/build/models"
import PropTypes from "prop-types"
import useCanCan from "@kaspernj/api-maker/build/use-can-can"

const {Account} = models

export default memo(shapeComponent(class CanCanWithState extends ShapeComponent {
  static propTypes = {
    className: PropTypes.string
  }

  render() {
    const {className, ...restProps} = this.props
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
}))
