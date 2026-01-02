import React, {memo} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import {Account} from "models.js"
import classNames from "classnames"
import Devise from "@kaspernj/api-maker/build/devise.js"
import {FlashNotifications} from "flash-notifications"
import {Pressable} from "react-native"
import PropTypes from "prop-types"
import Text from "@kaspernj/api-maker/build/utils/text"
import useCanCan from "@kaspernj/api-maker/build/use-can-can.js"
import useCurrentUser from "@kaspernj/api-maker/build/use-current-user.js"

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
          <Pressable testID="sign-in-as-admin" data-testid="sign-in-as-admin" onPress={this.tt.onSignInAsAdminPress}>
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
      FlashNotifications.errorResponse(error)
    }
  }
}))
