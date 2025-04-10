import React, {memo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import {Account} from "models"
import classNames from "classnames"
import Devise from "@kaspernj/api-maker/build/devise"
import FlashMessage from "@kaspernj/api-maker/build/flash-message"
import {Pressable} from "react-native"
import PropTypes from "prop-types"
import Text from "@kaspernj/api-maker/build/utils/text"
import useCanCan from "@kaspernj/api-maker/build/use-can-can"
import useCurrentUser from "@kaspernj/api-maker/build/use-current-user"

export default memo(shapeComponent(class CanCanWithState extends ShapeComponent {
  static propTypes = {
    className: PropTypes.string
  }

  render() {
    const {className, ...restProps} = this.props
    const canCan = useCanCan(() => [[Account, ["sum"]]])
    const currentUser = useCurrentUser()

    return (
      <div className={classNames("components-can-can-loader-with-state", className)} {...restProps}>
        {!currentUser &&
          <Pressable onPress={this.tt.onSignInAsAdminPress}>
            <Text>Sign in as admin</Text>
          </Pressable>
        }
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

  onSignInAsAdminPress = async () => {
    try {
      await Devise.signIn("admin@example.com", "password", {rememberMe: true})
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  }
}))
